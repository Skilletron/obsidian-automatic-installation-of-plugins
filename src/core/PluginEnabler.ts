import * as fs from "fs";
import * as path from "path";
import { App, Notice } from "obsidian";
import { FileManager } from "../utils/FileManager";
import { logger } from "../utils/Logger";

/**
 * Internal Obsidian plugins API interface (not officially documented).
 */
interface PluginsAPI {
	manifests?: Record<string, { id?: string }>;
	enabledPlugins?: Set<string>;
	plugins?: Record<string, unknown>;
	enablePlugin?: (pluginId: string) => Promise<void>;
	enablePluginAndSave?: (pluginId: string) => Promise<void>;
	loadManifests?: () => Promise<void>;
	loadManifest?: (pluginId: string) => Promise<void>;
	loadPlugin?: (pluginId: string) => Promise<void>;
	loadAvailablePlugins?: () => Promise<void>;
	reload?: () => Promise<void>;
	requestSaveSettings?: () => Promise<void>;
	updatePluginList?: () => void;
}

/**
 * Internal Obsidian settings API interface (not officially documented).
 */
interface SettingsAPI {
	pluginTabs?: Array<{
		id?: string;
		name?: string;
		display?: () => void;
	}>;
	activeTab?: {
		id?: string;
		name?: string;
		display?: () => void;
	};
}

/**
 * Manages enabling of installed plugins.
 */
export class PluginEnabler {
	constructor(
		private app: App,
		private fileManager: FileManager
	) {}

	/**
	 * Updates the plugin list and enables all plugins from the provided list.
	 */
	async enableInstalledPlugins(
		pluginIds: string[],
		onProgress?: (current: number, total: number, pluginId: string) => void
	): Promise<{ enabled: number; failed: number; failedPlugins: string[] }> {
		if (!pluginIds || pluginIds.length === 0) {
			return { enabled: 0, failed: 0, failedPlugins: [] };
		}

		try {
			const pluginsApi = (this.app as { plugins?: PluginsAPI }).plugins;

			if (!pluginsApi) {
				new Notice(
					"Cannot access plugins API. Plugins will need to be enabled manually."
				);
				logger.warn("Plugins API not available");
				return { enabled: 0, failed: 0, failedPlugins: pluginIds };
			}

			const { basePath, configDir } = this.fileManager.getBasePathAndConfigDir();
			const pluginsFolder = path.join(basePath, configDir, "plugins");

			const installedPluginIds: string[] = [];
			for (const pluginId of pluginIds) {
				if (typeof pluginId !== "string" || pluginId.trim() === "") {
					continue;
				}
				const normalizedId = pluginId.trim();
				const pluginFolder = path.join(pluginsFolder, normalizedId);
				const manifestPath = path.join(pluginFolder, "manifest.json");
				if (fs.existsSync(manifestPath)) {
					installedPluginIds.push(normalizedId);
				} else if (fs.existsSync(pluginFolder)) {
					logger.warn(
						`Plugin folder exists but manifest.json is missing: ${pluginFolder}`
					);
				} else {
					logger.warn(`Plugin folder not found: ${pluginFolder}`);
				}
			}

			if (installedPluginIds.length === 0) {
				new Notice("No installed plugins found to enable.");
				return { enabled: 0, failed: 0, failedPlugins: [] };
			}

			await this.waitForLayoutReady();
			await this.reloadPlugins(pluginsApi);

			const successfullyEnabled = new Set<string>();
			const failedPlugins: string[] = [];

			for (let attempt = 0; attempt < 3; attempt++) {
				if (attempt > 0) {
					await this.reloadPlugins(pluginsApi);
					await new Promise((resolve) => setTimeout(resolve, 1000));
					logger.debug(`Retry attempt ${attempt + 1} to enable plugins...`);
				}

				for (let i = 0; i < installedPluginIds.length; i++) {
					const pluginId = installedPluginIds[i];
					if (successfullyEnabled.has(pluginId)) {
						continue;
					}

					if (onProgress) {
						onProgress(i + 1, installedPluginIds.length, pluginId);
					}

					try {
						const result = await this.enableSinglePlugin(
							pluginId,
							pluginsApi,
							attempt
						);

						if (result.enabled) {
							successfullyEnabled.add(pluginId);
							const failIndex = failedPlugins.indexOf(pluginId);
							if (failIndex > -1) {
								failedPlugins.splice(failIndex, 1);
							}
							// Let plugins that open side leaves settle before the next enable.
							await new Promise((resolve) => setTimeout(resolve, 350));
						} else if (result.failed && attempt === 2) {
							if (!failedPlugins.includes(pluginId)) {
								failedPlugins.push(pluginId);
							}
							logger.error(
								`Could not enable "${pluginId}": ${result.reason || "unknown reason"}`
							);
						}
					} catch (error) {
						if (attempt === 2) {
							logger.error(`Failed to enable plugin "${pluginId}":`, error);
							if (!failedPlugins.includes(pluginId)) {
								failedPlugins.push(pluginId);
							}
						}
					}
				}

				if (successfullyEnabled.size === installedPluginIds.length) {
					break;
				}
			}

			const enabledCount = successfullyEnabled.size;
			const failedCount = failedPlugins.length;

			if (enabledCount > 0 && failedCount === 0) {
				new Notice(
					`[Installer] Successfully enabled ${enabledCount} plugin${enabledCount > 1 ? "s" : ""}.`
				);
			} else if (enabledCount > 0 && failedCount > 0) {
				new Notice(
					`[Installer] Enabled ${enabledCount} plugin${enabledCount > 1 ? "s" : ""}, failed to enable ${failedCount}. See console for details.`
				);
			} else if (failedCount > 0) {
				new Notice(
					`[Installer] Failed to enable ${failedCount} plugin${failedCount > 1 ? "s" : ""}. Enable them manually or reload Obsidian.`
				);
			}

			if (failedPlugins.length > 0) {
				logger.error("Failed to enable plugins:", failedPlugins);
			}

			return { enabled: enabledCount, failed: failedCount, failedPlugins };
		} catch (error) {
			const errorMessage =
				error instanceof Error ? error.message : "Unknown error";
			new Notice(
				`[Installer] Error while enabling plugins: ${errorMessage}. See console for details.`
			);
			logger.error("Error enabling plugins:", error);
			return { enabled: 0, failed: pluginIds.length, failedPlugins: pluginIds };
		}
	}

	/**
	 * Workspace must be ready before enabling plugins that open side leaves
	 * (e.g. Recent Files calls ensureSideLeaf in onUserEnable).
	 */
	private waitForLayoutReady(): Promise<void> {
		return new Promise((resolve) => {
			const workspace = this.app.workspace;
			if (workspace.layoutReady) {
				resolve();
				return;
			}
			workspace.onLayoutReady(() => resolve());
		});
	}

	/**
	 * Reloads plugin manifests so newly installed folders are recognized.
	 */
	private async reloadPlugins(pluginsApi: PluginsAPI): Promise<void> {
		try {
			if (typeof pluginsApi.loadManifests === "function") {
				await pluginsApi.loadManifests();
				logger.debug("Reloaded manifests via loadManifests()");
				return;
			}
		} catch (error) {
			logger.warn("loadManifests failed:", error);
		}

		try {
			if (typeof pluginsApi.loadAvailablePlugins === "function") {
				await pluginsApi.loadAvailablePlugins();
				logger.debug("Reloaded plugins via loadAvailablePlugins()");
			}
		} catch (error) {
			logger.warn("loadAvailablePlugins failed:", error);
		}
	}

	/**
	 * Candidate IDs for a plugin folder: folder name + id from local manifest.json.
	 */
	private getCandidateIds(pluginId: string): string[] {
		const candidates = [pluginId];
		try {
			const { basePath, configDir } = this.fileManager.getBasePathAndConfigDir();
			const manifestPath = path.join(
				basePath,
				configDir,
				"plugins",
				pluginId,
				"manifest.json"
			);
			if (fs.existsSync(manifestPath)) {
				const raw = fs.readFileSync(manifestPath, "utf-8");
				const manifest = JSON.parse(raw) as { id?: string };
				if (
					typeof manifest.id === "string" &&
					manifest.id &&
					!candidates.includes(manifest.id)
				) {
					candidates.push(manifest.id);
				}
			}
		} catch (error) {
			logger.debug(`Could not read local manifest for "${pluginId}":`, error);
		}
		return candidates;
	}

	/**
	 * Resolves the registry/manifest ID for a folder plugin ID.
	 */
	private resolvePluginId(
		pluginId: string,
		pluginsApi: PluginsAPI
	): string | null {
		const manifests = pluginsApi.manifests || {};
		const candidates = this.getCandidateIds(pluginId);

		for (const candidate of candidates) {
			if (Object.prototype.hasOwnProperty.call(manifests, candidate)) {
				return candidate;
			}
		}

		for (const manifestId of Object.keys(manifests)) {
			for (const candidate of candidates) {
				if (
					manifestId === candidate ||
					manifestId.replace(/^obsidian-/, "") ===
						candidate.replace(/^obsidian-/, "") ||
					manifestId === candidate.replace(/^obsidian-/, "") ||
					`obsidian-${manifestId}` === candidate
				) {
					return manifestId;
				}
			}
		}

		return null;
	}

	private isPluginEnabled(pluginsApi: PluginsAPI, pluginId: string): boolean {
		if (pluginsApi.enabledPlugins instanceof Set) {
			return pluginsApi.enabledPlugins.has(pluginId);
		}
		if (pluginsApi.plugins && pluginId in pluginsApi.plugins) {
			return true;
		}
		return false;
	}

	/**
	 * Enables a single plugin using Obsidian's internal API.
	 */
	private async enableSinglePlugin(
		pluginId: string,
		pluginsApi: PluginsAPI,
		attempt: number
	): Promise<{
		enabled: boolean;
		failed: boolean;
		actualId: string;
		reason?: string;
	}> {
		let actualPluginId = this.resolvePluginId(pluginId, pluginsApi);

		if (!actualPluginId && typeof pluginsApi.loadManifest === "function") {
			for (const candidate of this.getCandidateIds(pluginId)) {
				try {
					await pluginsApi.loadManifest(candidate);
				} catch (error) {
					logger.debug(`loadManifest("${candidate}") failed:`, error);
				}
			}
			actualPluginId = this.resolvePluginId(pluginId, pluginsApi);
		}

		// Folder exists with a valid manifest — try enabling even if manifests map lags.
		if (!actualPluginId) {
			const candidates = this.getCandidateIds(pluginId);
			if (candidates.length > 0) {
				actualPluginId = candidates[0];
			}
		}

		if (!actualPluginId) {
			const available = Object.keys(pluginsApi.manifests || {});
			return {
				enabled: false,
				failed: true,
				actualId: pluginId,
				reason:
					attempt === 2
						? `not found in manifests after reload. Available: ${available.join(", ") || "(none)"}`
						: "not in manifests yet",
			};
		}

		if (this.isPluginEnabled(pluginsApi, actualPluginId)) {
			return { enabled: true, failed: false, actualId: actualPluginId };
		}

		const enableIds = Array.from(
			new Set([actualPluginId, ...this.getCandidateIds(pluginId)])
		);
		let lastError = "";

		for (const enableId of enableIds) {
			try {
				if (typeof pluginsApi.enablePluginAndSave === "function") {
					await pluginsApi.enablePluginAndSave(enableId);
				} else if (typeof pluginsApi.enablePlugin === "function") {
					await pluginsApi.enablePlugin(enableId);
				} else {
					return {
						enabled: false,
						failed: true,
						actualId: actualPluginId,
						reason: "enablePluginAndSave/enablePlugin not available",
					};
				}

				if (this.isPluginEnabled(pluginsApi, enableId)) {
					logger.debug(`Enabled plugin "${pluginId}" as "${enableId}".`);
					return { enabled: true, failed: false, actualId: enableId };
				}

				// API call did not throw — treat as success even if Set lags.
				return { enabled: true, failed: false, actualId: enableId };
			} catch (error) {
				lastError = error instanceof Error ? error.message : String(error);
				logger.debug(`Enable "${enableId}" failed: ${lastError}`);
			}
		}

		return {
			enabled: false,
			failed: true,
			actualId: actualPluginId,
			reason: `enable threw: ${lastError || "unknown error"}`,
		};

	}

	/**
	 * Refreshes the Community plugins settings UI to show updated plugin list and status.
	 */
	async refreshPluginsUI(): Promise<void> {
		try {
			await new Promise((resolve) => setTimeout(resolve, 300));

			const settings = (this.app as { setting?: SettingsAPI }).setting;
			if (settings) {
				if (settings.pluginTabs && Array.isArray(settings.pluginTabs)) {
					const pluginTab = settings.pluginTabs.find(
						(tab) =>
							tab &&
							(tab.id === "community-plugins" ||
								tab.name === "Community plugins" ||
								tab.id === "plugins")
					);

					if (
						pluginTab &&
						typeof pluginTab.display === "function" &&
						settings.activeTab === pluginTab
					) {
						pluginTab.display();
					}
				}

				if (
					settings.activeTab &&
					typeof settings.activeTab.display === "function"
				) {
					const activeTabId = (
						settings.activeTab.id ||
						settings.activeTab.name ||
						""
					).toLowerCase();
					if (
						activeTabId.includes("community") ||
						activeTabId.includes("plugin")
					) {
						settings.activeTab.display();
					}
				}
			}

			const pluginsApi = (this.app as { plugins?: PluginsAPI }).plugins;
			if (pluginsApi) {
				if (typeof pluginsApi.requestSaveSettings === "function") {
					await pluginsApi.requestSaveSettings();
				}
				if (typeof pluginsApi.updatePluginList === "function") {
					pluginsApi.updatePluginList();
				}
			}
		} catch (error) {
			logger.warn("Could not refresh UI automatically:", error);
		}
	}
}
