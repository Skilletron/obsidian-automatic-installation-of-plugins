import { App, Platform, PluginManifest } from "obsidian";
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

// "installed": files were written (fresh install or version change)
// "unchanged": already installed at the wanted version
// "skipped": desktop-only plugin on a mobile device
export type InstallResult = "installed" | "unchanged" | "skipped" | "failed";

export class PluginInstaller {
	private registryCache: PluginRegistryEntry[] | null = null;
	// Why the last installPlugin() call returned "failed", for the import
	// summary.
	lastFailure = "";

	constructor(
		private app: App,
		private fileManager: FileManager,
		private networkManager: NetworkManager,
		private settingsManager: SettingsManager,
		private shouldLoadSettingsOnInstall: () => boolean,
		private isMobile: () => boolean = () => Platform.isMobile,
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

	private fail(message: string): void {
		this.lastFailure = message.replace(/^\[Installer\] /, "");
		logger.warn(this.lastFailure);
	}

	// applySettings: false skips the settings file, for updates that should
	// keep the settings the plugin has.
	async installPlugin(
		entry: PluginListEntry,
		options: { applySettings?: boolean } = {},
	): Promise<InstallResult> {
		this.lastFailure = "";
		if (
			!entry?.id ||
			typeof entry.id !== "string" ||
			entry.id.trim() === ""
		) {
			this.fail("Invalid plugin ID provided.");
			return "failed";
		}

		const normalizedId = entry.id.trim();
		if (!isSafePluginId(normalizedId)) {
			this.fail(`Invalid plugin ID: "${normalizedId}".`);
			return "failed";
		}

		const pinnedVersion = entry.version
			? normalizeVersion(entry.version)
			: undefined;
		const pluginsApi = this.getPluginsApi();

		const fullyInstalled = await this.isFullyInstalled(normalizedId);

		if (fullyInstalled && !pinnedVersion) {
			logger.info(`Plugin "${normalizedId}" already installed.`);
			return "unchanged";
		}

		if (fullyInstalled && pinnedVersion) {
			const localVersion =
				await this.getLocalInstalledVersion(normalizedId);
			if (localVersion && localVersion === pinnedVersion) {
				logger.info(
					`Plugin "${normalizedId}" already at pinned version ${pinnedVersion}.`,
				);
				return "unchanged";
			}
			logger.info(
				`Plugin "${normalizedId}" installed at ${localVersion ?? "unknown"}; pinning to ${pinnedVersion}.`,
			);
		}

		if (!pluginsApi?.installPlugin) {
			this.fail(
				"[Installer] Obsidian installPlugin API is unavailable. Update Obsidian and try again.",
			);
			return "failed";
		}

		const pluginFolder = this.fileManager.pluginsPath(normalizedId);
		const mainPath = this.fileManager.pluginsPath(normalizedId, "main.js");

		try {
			const pluginRegistry = await this.getPluginRegistry();

			const pluginMeta = pluginRegistry.find(
				(p) => p.id.trim().toLowerCase() === normalizedId.toLowerCase(),
			);

			if (!pluginMeta) {
				this.fail(
					`Plugin "${normalizedId}" not found in Obsidian Community Plugins registry.`,
				);
				return "failed";
			}

			if (!pluginMeta.repo || typeof pluginMeta.repo !== "string") {
				this.fail(
					`Plugin "${normalizedId}" has invalid repository information in registry.`,
				);
				return "failed";
			}

			const repoParts = pluginMeta.repo.split("/");
			if (repoParts.length !== 2) {
				this.fail(
					`Plugin "${normalizedId}" has invalid repository format: ${pluginMeta.repo}`,
				);
				return "failed";
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
					this.fail(
						`[Installer] Could not fetch manifest for "${normalizedId}" ${pinnedVersion}. GitHub may be rate-limiting requests.`,
					);
				} else {
					this.fail(
						`No suitable release found for plugin "${normalizedId}".`,
					);
				}
				return "failed";
			}

			const { manifest, version } = resolved;
			if (!manifest?.id || !version) {
				this.fail(
					`[Installer] Invalid manifest.json for "${normalizedId}".`,
				);
				return "failed";
			}

			if (manifest.isDesktopOnly && this.isMobile()) {
				logger.info(
					`Plugin "${normalizedId}" is desktop-only; skipped on this device.`,
				);
				return "skipped";
			}

			logger.debug(
				`Installing "${normalizedId}" via Obsidian installPlugin (${pluginMeta.repo}@${version})`,
			);

			// The import shows its own progress, so hide the "installing" and
			// "installed" notices Obsidian shows for each plugin. Failures
			// still get a notice from this plugin below.
			const stopHiding = hideNoticesMentioning(manifest.name);
			try {
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
			} finally {
				stopHiding();
			}

			if (typeof pluginsApi.loadManifests === "function") {
				try {
					await pluginsApi.loadManifests();
				} catch (err: unknown) {
					logger.debug("loadManifests after install failed:", err);
				}
			}

			if (options.applySettings !== false && this.shouldLoadSettingsOnInstall()) {
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

			logger.info(
				pinnedVersion
					? `Plugin "${normalizedId}" installed at ${version}.`
					: `Plugin "${normalizedId}" installed successfully.`,
			);
			return "installed";
		} catch (err: unknown) {
			const errorMessage = NetworkManager.describeError(err);
			this.fail(
				`[Installer] Failed to install plugin "${normalizedId}": ${errorMessage}`,
			);
			logger.error(`Installation error for ${normalizedId}:`, err);
			if (
				(await this.fileManager.exists(pluginFolder)) &&
				!(await this.fileManager.exists(mainPath))
			) {
				await this.fileManager.removeRecursive(pluginFolder);
			}
			return "failed";
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

// Until the returned function is called, removes new notices whose text
// contains `name`. Notices already on screen (the import progress) stay.
function hideNoticesMentioning(name: string): () => void {
	if (
		!name ||
		typeof MutationObserver === "undefined" ||
		typeof document.querySelectorAll !== "function"
	) {
		return () => {};
	}
	const before = new Set(Array.from(document.querySelectorAll(".notice")));
	const sweep = () => {
		for (const notice of Array.from(document.querySelectorAll(".notice"))) {
			if (!before.has(notice) && notice.textContent?.includes(name)) {
				notice.remove();
			}
		}
	};
	const observer = new MutationObserver(sweep);
	observer.observe(document.body, {
		childList: true,
		subtree: true,
		characterData: true,
	});
	return () => {
		sweep();
		observer.disconnect();
	};
}
