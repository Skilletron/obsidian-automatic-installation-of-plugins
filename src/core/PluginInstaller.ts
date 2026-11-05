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
import { t } from "../i18n";

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
			(await this.fileManager.exists(mainPath)) &&
			!(await this.hasEmptyFiles(pluginId))
		);
	}

	// Obsidian writes the plugin's files itself, and on Android version 1.5.8
	// a new file can end up with 0 bytes even though the write succeeded.
	private async hasEmptyFiles(pluginId: string): Promise<boolean> {
		return (
			(await this.fileManager.isEmptyFile(
				this.fileManager.pluginsPath(pluginId, "manifest.json"),
			)) ||
			(await this.fileManager.isEmptyFile(
				this.fileManager.pluginsPath(pluginId, "main.js"),
			))
		);
	}

	private fail(message: string): void {
		this.lastFailure = message;
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
			this.fail(t("install.invalidId"));
			return "failed";
		}

		const normalizedId = entry.id.trim();
		if (!isSafePluginId(normalizedId)) {
			this.fail(t("install.invalidIdNamed", { id: normalizedId }));
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
			this.fail(t("install.noApi"));
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
				this.fail(t("install.notInRegistry", { id: normalizedId }));
				return "failed";
			}

			if (!pluginMeta.repo || typeof pluginMeta.repo !== "string") {
				this.fail(t("install.badRepoInfo", { id: normalizedId }));
				return "failed";
			}

			const repoParts = pluginMeta.repo.split("/");
			if (repoParts.length !== 2) {
				this.fail(
					t("install.badRepoFormat", { id: normalizedId, repo: pluginMeta.repo }),
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
						t("install.noPinnedManifest", {
							id: normalizedId,
							version: pinnedVersion,
						}),
					);
				} else {
					this.fail(t("install.noRelease", { id: normalizedId }));
				}
				return "failed";
			}

			const { manifest, version } = resolved;
			if (!manifest?.id || !version) {
				this.fail(t("install.badManifest", { id: normalizedId }));
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

			// A second round only if the first left empty files behind.
			for (let round = 1; ; round++) {
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
				if (!(await this.hasEmptyFiles(manifest.id))) {
					break;
				}
				if (round === 2) {
					throw new Error("the plugin's files stayed empty");
				}
				logger.warn(`"${normalizedId}" was left with empty files; installing again.`);
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
				t("install.failed", { id: normalizedId, error: errorMessage }),
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
		if (!headManifest || !latestVersion) {
			logger.warn(`No version in repo manifest for ${pluginId}`);
			return null;
		}

		const releaseManifest = await this.fetchReleaseManifest(
			owner,
			repo,
			latestVersion,
		);
		return {
			manifest: releaseManifest || headManifest,
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
