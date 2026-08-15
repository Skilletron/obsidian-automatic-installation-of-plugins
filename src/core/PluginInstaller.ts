import { App, Notice, PluginManifest } from "obsidian";
import { FileManager } from "../utils/FileManager";
import { NetworkManager } from "../utils/NetworkManager";
import { SettingsManager } from "./SettingsManager";
import {
	PluginRegistryEntry,
	GitHubRelease,
	PluginListEntry,
	PLUGIN_REGISTRY_URL,
} from "../types";
import { isSafePluginId, normalizeVersion } from "../utils/parsePluginList";
import { logger } from "../utils/Logger";

interface PluginsAPI {
	manifests?: Record<string, PluginManifest>;
	installPlugin?: (
		repo: string,
		version: string,
		manifest: PluginManifest,
	) => Promise<void>;
	loadManifest?: (pluginFolderPath: string) => Promise<void>;
	loadManifests?: () => Promise<void>;
	loadAvailablePlugins?: () => Promise<void>;
	getPluginFolder?: () => string;
}

export class PluginInstaller {
	private registryCache: PluginRegistryEntry[] | null = null;

	constructor(
		private app: App,
		private fileManager: FileManager,
		private networkManager: NetworkManager,
		private settingsManager: SettingsManager,
		private shouldLoadSettingsOnInstall: () => boolean,
	) {}

	private getPluginsApi(): PluginsAPI | undefined {
		return (this.app as App & { plugins?: PluginsAPI }).plugins;
	}

	clearCaches(): void {
		this.registryCache = null;
	}

	private async getPluginRegistry(): Promise<PluginRegistryEntry[]> {
		if (this.registryCache) {
			return this.registryCache;
		}
		const pluginRegistry =
			await this.networkManager.fetchJson<PluginRegistryEntry[]>(
				PLUGIN_REGISTRY_URL,
			);
		if (!Array.isArray(pluginRegistry)) {
			throw new Error("Plugin registry is not an array");
		}
		this.registryCache = pluginRegistry;
		return pluginRegistry;
	}

	private async getLocalInstalledVersion(
		pluginId: string,
	): Promise<string | null> {
		const candidates = [pluginId];
		for (const folder of candidates) {
			const manifestPath = this.fileManager.pluginsPath(
				folder,
				"manifest.json",
			);
			const mainPath = this.fileManager.pluginsPath(folder, "main.js");
			if (
				!(await this.fileManager.exists(manifestPath)) ||
				!(await this.fileManager.exists(mainPath))
			) {
				continue;
			}
			const raw = await this.fileManager.readFile(manifestPath);
			if (!raw) {
				return null;
			}
			try {
				const manifest = JSON.parse(raw) as { version?: string };
				if (
					typeof manifest.version === "string" &&
					manifest.version.trim()
				) {
					return normalizeVersion(manifest.version);
				}
			} catch {
				return null;
			}
			return null;
		}
		return null;
	}

	private async isFullyInstalled(pluginId: string): Promise<boolean> {
		const pluginsApi = this.getPluginsApi();
		if (
			pluginsApi?.manifests &&
			Object.prototype.hasOwnProperty.call(pluginsApi.manifests, pluginId)
		) {
			return true;
		}

		const manifestPath = this.fileManager.pluginsPath(
			pluginId,
			"manifest.json",
		);
		const mainPath = this.fileManager.pluginsPath(pluginId, "main.js");
		return (
			(await this.fileManager.exists(manifestPath)) &&
			(await this.fileManager.exists(mainPath))
		);
	}

	async installPlugin(entry: PluginListEntry): Promise<boolean> {
		if (
			!entry?.id ||
			typeof entry.id !== "string" ||
			entry.id.trim() === ""
		) {
			new Notice("Invalid plugin ID provided.");
			return false;
		}

		const normalizedId = entry.id.trim();
		if (!isSafePluginId(normalizedId)) {
			new Notice(`Invalid plugin ID: "${normalizedId}".`);
			return false;
		}

		const pinnedVersion = entry.version
			? normalizeVersion(entry.version)
			: undefined;
		const pluginsApi = this.getPluginsApi();

		const fullyInstalled = await this.isFullyInstalled(normalizedId);

		if (fullyInstalled && !pinnedVersion) {
			new Notice(`Plugin "${normalizedId}" already installed.`);
			return true;
		}

		if (fullyInstalled && pinnedVersion) {
			const localVersion =
				await this.getLocalInstalledVersion(normalizedId);
			if (localVersion && localVersion === pinnedVersion) {
				new Notice(
					`Plugin "${normalizedId}" already at pinned version ${pinnedVersion}.`,
				);
				return true;
			}
			logger.info(
				`Plugin "${normalizedId}" installed at ${localVersion ?? "unknown"}; pinning to ${pinnedVersion}.`,
			);
		}

		if (!pluginsApi?.installPlugin) {
			new Notice(
				"[Installer] Obsidian installPlugin API is unavailable. Update Obsidian and try again.",
			);
			return false;
		}

		const pluginFolder = this.fileManager.pluginsPath(normalizedId);
		const mainPath = this.fileManager.pluginsPath(normalizedId, "main.js");

		try {
			const pluginRegistry = await this.getPluginRegistry();

			const pluginMeta = pluginRegistry.find(
				(p) => p.id.trim().toLowerCase() === normalizedId.toLowerCase(),
			);

			if (!pluginMeta) {
				new Notice(
					`Plugin "${normalizedId}" not found in Obsidian Community Plugins registry.`,
				);
				return false;
			}

			if (!pluginMeta.repo || typeof pluginMeta.repo !== "string") {
				new Notice(
					`Plugin "${normalizedId}" has invalid repository information in registry.`,
				);
				return false;
			}

			const repoParts = pluginMeta.repo.split("/");
			if (repoParts.length !== 2) {
				new Notice(
					`Plugin "${normalizedId}" has invalid repository format: ${pluginMeta.repo}`,
				);
				return false;
			}

			const [owner, repo] = repoParts;
			const release = await this.selectRelease(
				owner,
				repo,
				normalizedId,
				pinnedVersion,
			);
			if (!release?.tag_name || !release.assets?.length) {
				if (pinnedVersion) {
					new Notice(
						`[Installer] No GitHub release found for "${normalizedId}" version ${pinnedVersion}.`,
					);
				} else {
					new Notice(
						`No suitable release found for plugin "${normalizedId}".`,
					);
				}
				return false;
			}

			const manifestAsset = release.assets.find(
				(a) => a.name === "manifest.json",
			);
			if (!manifestAsset) {
				new Notice(
					`[Installer] Release for "${normalizedId}" has no manifest.json asset.`,
				);
				return false;
			}

			const manifest =
				await this.networkManager.fetchJson<PluginManifest>(
					manifestAsset.browser_download_url,
				);
			if (!manifest?.id) {
				new Notice(
					`[Installer] Invalid manifest.json for "${normalizedId}".`,
				);
				return false;
			}

			const version =
				(typeof manifest.version === "string" &&
					manifest.version.trim()) ||
				normalizeVersion(release.tag_name || "");
			if (!version) {
				new Notice(
					`[Installer] Could not resolve version for "${normalizedId}".`,
				);
				return false;
			}

			logger.debug(
				`Installing "${normalizedId}" via Obsidian installPlugin (${pluginMeta.repo}@${version})`,
			);

			await pluginsApi.installPlugin(pluginMeta.repo, version, manifest);

			const installedFolderId = (await this.fileManager.exists(
				this.fileManager.pluginsPath(manifest.id, "main.js"),
			))
				? manifest.id
				: normalizedId;

			if (
				!(await this.fileManager.exists(
					this.fileManager.pluginsPath(installedFolderId, "main.js"),
				))
			) {
				new Notice(
					`[Installer] Plugin "${normalizedId}" did not land on disk after install.`,
				);
				return false;
			}

			await this.recognizeInstalledPlugin(pluginsApi, [
				installedFolderId,
				manifest.id,
				normalizedId,
			]);

			if (this.shouldLoadSettingsOnInstall()) {
				await this.settingsManager.applySettingsForPlugin(
					normalizedId,
					installedFolderId,
				);
				if (manifest.id !== normalizedId) {
					await this.settingsManager.applySettingsForPlugin(
						manifest.id,
						installedFolderId,
					);
				}
			}

			new Notice(
				pinnedVersion
					? `Plugin "${normalizedId}" installed at ${version}.`
					: `Plugin "${normalizedId}" installed successfully.`,
			);
			return true;
		} catch (err: unknown) {
			const errorMessage = NetworkManager.describeError(err);
			new Notice(
				`[Installer] Failed to install plugin "${normalizedId}": ${errorMessage}`,
			);
			logger.error(`Installation error for ${normalizedId}:`, err);
			if (
				(await this.fileManager.exists(pluginFolder)) &&
				!(await this.fileManager.exists(mainPath))
			) {
				await this.fileManager.removeRecursive(pluginFolder);
			}
			return false;
		}
	}

	private async recognizeInstalledPlugin(
		pluginsApi: PluginsAPI,
		ids: string[],
	): Promise<void> {
		const unique = [...new Set(ids.filter(Boolean))];
		for (const id of unique) {
			if (!isSafePluginId(id)) {
				continue;
			}
			const folderPath = this.fileManager.pluginsPath(id);
			if (typeof pluginsApi.loadManifest === "function") {
				try {
					await pluginsApi.loadManifest(folderPath);
				} catch (err: unknown) {
					logger.debug(
						`loadManifest("${folderPath}") failed:`,
						err,
					);
					try {
						await pluginsApi.loadManifest(id);
					} catch (err2: unknown) {
						logger.debug(`loadManifest("${id}") failed:`, err2);
					}
				}
			}
		}
		if (typeof pluginsApi.loadManifests === "function") {
			try {
				await pluginsApi.loadManifests();
			} catch (err: unknown) {
				logger.debug("loadManifests after install failed:", err);
			}
		}
		if (typeof pluginsApi.loadAvailablePlugins === "function") {
			try {
				await pluginsApi.loadAvailablePlugins();
			} catch (err: unknown) {
				logger.debug(
					"loadAvailablePlugins after install failed:",
					err,
				);
			}
		}
	}

	private releaseMatchesVersion(
		release: GitHubRelease,
		pinnedVersion: string,
	): boolean {
		const tag = release.tag_name || "";
		return normalizeVersion(tag) === pinnedVersion;
	}

	private async fetchReleaseByTag(
		owner: string,
		repo: string,
		tag: string,
	): Promise<GitHubRelease | null> {
		try {
			return await this.networkManager.fetchJson<GitHubRelease>(
				`https://api.github.com/repos/${owner}/${repo}/releases/tags/${encodeURIComponent(tag)}`,
			);
		} catch {
			return null;
		}
	}

	private async selectRelease(
		owner: string,
		repo: string,
		pluginId: string,
		pinnedVersion?: string,
	): Promise<GitHubRelease | null> {
		if (pinnedVersion) {
			const byTag =
				(await this.fetchReleaseByTag(owner, repo, pinnedVersion)) ||
				(await this.fetchReleaseByTag(
					owner,
					repo,
					`v${pinnedVersion}`,
				));

			if (
				byTag &&
				!byTag.draft &&
				(byTag.assets || []).some((a) => a.name === "manifest.json")
			) {
				return byTag;
			}

			try {
				const releases = await this.networkManager.fetchJson<
					GitHubRelease[]
				>(
					`https://api.github.com/repos/${owner}/${repo}/releases?per_page=100`,
				);

				if (Array.isArray(releases)) {
					const match = releases.find(
						(r) =>
							!r.draft &&
							this.releaseMatchesVersion(r, pinnedVersion) &&
							(r.assets || []).some(
								(a) => a.name === "manifest.json",
							),
					);
					if (match) {
						return match;
					}
				}
			} catch (err: unknown) {
				logger.warn(
					`Failed to list releases while resolving pin ${pluginId}@${pinnedVersion}:`,
					err,
				);
			}

			return null;
		}

		try {
			const releases = await this.networkManager.fetchJson<
				GitHubRelease[]
			>(
				`https://api.github.com/repos/${owner}/${repo}/releases?per_page=20`,
			);

			if (!Array.isArray(releases) || releases.length === 0) {
				return await this.networkManager.fetchJson<GitHubRelease>(
					`https://api.github.com/repos/${owner}/${repo}/releases/latest`,
				);
			}

			const isUnstable = (r: GitHubRelease) =>
				!!r.prerelease ||
				/beta|alpha|rc|preview/i.test(r.tag_name || "");

			const hasManifest = (r: GitHubRelease) =>
				(r.assets || []).some((a) => a.name === "manifest.json");

			const candidates = releases.filter(
				(r) => !r.draft && hasManifest(r),
			);

			const stable = candidates.find((r) => !isUnstable(r));
			if (stable) {
				return stable;
			}

			if (candidates[0]) {
				logger.warn(
					`No stable release for ${owner}/${repo}; using newest for "${pluginId}".`,
				);
				return candidates[0];
			}

			return null;
		} catch (err: unknown) {
			logger.warn(
				`Failed to list releases for ${owner}/${repo}, falling back to /latest:`,
				err,
			);
			return await this.networkManager.fetchJson<GitHubRelease>(
				`https://api.github.com/repos/${owner}/${repo}/releases/latest`,
			);
		}
	}
}
