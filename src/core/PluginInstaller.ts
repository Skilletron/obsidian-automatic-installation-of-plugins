import { App, Notice, PluginManifest } from "obsidian";
import { FileManager } from "../utils/FileManager";
import { NetworkManager } from "../utils/NetworkManager";
import { SettingsManager } from "./SettingsManager";
import {
	PluginRegistryEntry,
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
			const resolved = await this.resolveManifest(
				owner,
				repo,
				normalizedId,
				pinnedVersion,
			);
			if (!resolved) {
				if (pinnedVersion) {
					new Notice(
						`[Installer] Could not fetch manifest for "${normalizedId}" ${pinnedVersion}. GitHub may be rate-limiting requests.`,
					);
				} else {
					new Notice(
						`No suitable release found for plugin "${normalizedId}".`,
					);
				}
				return false;
			}

			const { manifest, version } = resolved;
			if (!manifest?.id || !version) {
				new Notice(
					`[Installer] Invalid manifest.json for "${normalizedId}".`,
				);
				return false;
			}

			logger.debug(
				`Installing "${normalizedId}" via Obsidian installPlugin (${pluginMeta.repo}@${version})`,
			);

			try {
				await pluginsApi.installPlugin(
					pluginMeta.repo,
					version,
					manifest,
				);
			} catch (firstErr: unknown) {
				const alt = version.startsWith("v")
					? version.slice(1)
					: `v${version}`;
				logger.debug(
					`installPlugin(${version}) failed, retrying with ${alt}`,
					firstErr,
				);
				await pluginsApi.installPlugin(pluginMeta.repo, alt, manifest);
			}

			if (typeof pluginsApi.loadManifests === "function") {
				try {
					await pluginsApi.loadManifests();
				} catch (err: unknown) {
					logger.debug("loadManifests after install failed:", err);
				}
			}

			if (this.shouldLoadSettingsOnInstall()) {
				const installedFolderId = (await this.fileManager.exists(
					this.fileManager.pluginsPath(manifest.id, "main.js"),
				))
					? manifest.id
					: normalizedId;

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

	private async resolveManifest(
		owner: string,
		repo: string,
		pluginId: string,
		pinnedVersion?: string,
	): Promise<{ manifest: PluginManifest; version: string } | null> {
		if (pinnedVersion) {
			const manifest = await this.fetchReleaseManifest(
				owner,
				repo,
				pinnedVersion,
			);
			if (manifest) {
				return { manifest, version: pinnedVersion };
			}
			return null;
		}

		const headManifest = await this.fetchRepoHeadManifest(owner, repo);
		const latestVersion =
			typeof headManifest?.version === "string"
				? normalizeVersion(headManifest.version)
				: "";
		if (!latestVersion) {
			logger.warn(`No version in repo manifest for ${pluginId}`);
			return null;
		}

		const releaseManifest = await this.fetchReleaseManifest(
			owner,
			repo,
			latestVersion,
		);
		return {
			manifest: releaseManifest || headManifest!,
			version: latestVersion,
		};
	}

	private async fetchReleaseManifest(
		owner: string,
		repo: string,
		version: string,
	): Promise<PluginManifest | null> {
		const tags = [...new Set([version, `v${version}`, version.replace(/^v/i, "")])];
		for (const tag of tags) {
			const url = `https://github.com/${owner}/${repo}/releases/download/${encodeURIComponent(tag)}/manifest.json`;
			const manifest =
				await this.networkManager.tryFetchJson<PluginManifest>(url);
			if (manifest?.id) {
				return manifest;
			}
		}
		return null;
	}

	private async fetchRepoHeadManifest(
		owner: string,
		repo: string,
	): Promise<PluginManifest | null> {
		const urls = [
			`https://raw.githubusercontent.com/${owner}/${repo}/HEAD/manifest.json`,
			`https://raw.githubusercontent.com/${owner}/${repo}/master/manifest.json`,
			`https://raw.githubusercontent.com/${owner}/${repo}/main/manifest.json`,
		];
		for (const url of urls) {
			const manifest =
				await this.networkManager.tryFetchJson<PluginManifest>(url);
			if (manifest?.id) {
				return manifest;
			}
		}
		return null;
	}
}
