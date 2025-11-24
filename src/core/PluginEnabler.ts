import * as fs from "fs";
import * as path from "path";
import { App, Notice } from "obsidian";
import { FileManager } from "../utils/FileManager";
import { logger } from "../utils/Logger";

/**
 * Internal Obsidian plugins API interface (not officially documented).
 */
interface PluginsAPI {
	manifests?: Record<string, unknown>;
	enabledPlugins?: Set<string>;
	plugins?: Record<string, unknown>;
	enablePlugin?: (pluginId: string) => Promise<void>;
	loadManifests?: () => Promise<void>;
	loadAvailablePlugins?: () => Promise<void>;
	reload?: () => Promise<void>;
	requestSaveSettings?: () => Promise<void>;
	updatePluginList?: () => void;
}

/**
 * Internal Obsidian commands API interface (not officially documented).
 */
interface CommandsAPI {
	executeCommandById?: (commandId: string) => Promise<void>;
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
	 * Uses internal Obsidian API to manage plugins.
	 * @param pluginIds - Array of plugin IDs to enable
	 * @param onProgress - Optional progress callback
	 */
	async enableInstalledPlugins(
		pluginIds: string[],
		onProgress?: (current: number, total: number, pluginId: string) => void
	): Promise<{ enabled: number; failed: number; failedPlugins: string[] }> {
		if (!pluginIds || pluginIds.length === 0) {
			return { enabled: 0, failed: 0, failedPlugins: [] };
		}

		try {
			new Notice("[Installer] Reloading third-party plugins...");

			// Access internal plugins API
			const pluginsApi = (this.app as { plugins?: PluginsAPI }).plugins;

			if (!pluginsApi) {
				new Notice(
					"[Installer] Cannot access plugins API. Plugins will need to be enabled manually."
				);
				logger.warn("Plugins API not available");
				return { enabled: 0, failed: 0, failedPlugins: [] };
			}

			// First, verify plugins are installed in filesystem
			const { basePath, configDir } = this.fileManager.getBasePathAndConfigDir();
			const pluginsFolder = path.join(basePath, configDir, "plugins");

			const installedPluginIds: string[] = [];
			for (const pluginId of pluginIds) {
				if (typeof pluginId !== "string" || pluginId.trim() === "") {
					continue;
				}
				const normalizedId = pluginId.trim();
				const pluginFolder = path.join(pluginsFolder, normalizedId);
				if (fs.existsSync(pluginFolder)) {
					installedPluginIds.push(normalizedId);
				} else {
					logger.warn(`Plugin folder not found: ${pluginFolder}`);
				}
			}

			if (installedPluginIds.length === 0) {
				new Notice("[Installer] No installed plugins found to enable.");
				return { enabled: 0, failed: 0, failedPlugins: [] };
			}

			// Reload plugins
			await this.reloadPlugins(pluginsApi);

			// Wait for plugins to be loaded
			await new Promise((resolve) => setTimeout(resolve, 5000));

			// Log available manifests for debugging
			const manifests = pluginsApi.manifests || {};
			logger.debug(
				`Available plugins in manifests (${Object.keys(manifests).length}):`,
				Object.keys(manifests)
			);
			logger.debug(`Looking for plugins:`, installedPluginIds);

			let enabledCount = 0;
			let failedCount = 0;
			const failedPlugins: string[] = [];
			const successfullyEnabled = new Set<string>();

			// Try multiple times to enable plugins (in case they're still loading)
			for (let attempt = 0; attempt < 3; attempt++) {
				if (attempt > 0) {
					await new Promise((resolve) => setTimeout(resolve, 1000));
					logger.debug(`Retry attempt ${attempt + 1} to enable plugins...`);
				}

				for (let i = 0; i < installedPluginIds.length; i++) {
					const pluginId = installedPluginIds[i];

					// Skip if already successfully enabled
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
							manifests,
							attempt
						);

						if (result.enabled) {
							enabledCount++;
							successfullyEnabled.add(pluginId);
							if (result.actualId !== pluginId) {
								logger.debug(
									`[Installer] Successfully enabled plugin "${pluginId}" (using ID: "${result.actualId}").`
								);
							}
							// Remove from failed list if it was there
							const index = failedPlugins.indexOf(pluginId);
							if (index > -1) {
								failedPlugins.splice(index, 1);
								failedCount--;
							}
						} else if (result.failed && attempt === 2) {
							if (!failedPlugins.includes(pluginId)) {
								failedPlugins.push(pluginId);
								failedCount++;
							}
						}
					} catch (error) {
						if (attempt === 2) {
							const errorMessage =
								error instanceof Error ? error.message : "Unknown error";
							logger.error(`Failed to enable plugin "${pluginId}":`, error);
							if (!failedPlugins.includes(pluginId)) {
								failedPlugins.push(pluginId);
								failedCount++;
							}
						}
					}
				}

				// If all plugins are enabled, break early
				if (successfullyEnabled.size === installedPluginIds.length) {
					break;
				}
			}

			// Show summary notice
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
					`[Installer] Failed to enable ${failedCount} plugin${failedCount > 1 ? "s" : ""}. You may need to reload plugins manually.`
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
	 * Reloads the plugin list using various methods.
	 */
	private async reloadPlugins(pluginsApi: PluginsAPI | undefined): Promise<void> {
		let reloadSuccess = false;

		// Method 1: Try to execute command through commands API
		try {
			const commands = (this.app as { commands?: CommandsAPI }).commands;
			if (commands && typeof commands.executeCommandById === "function") {
				const commandId = "reload-plugins";
				try {
					await commands.executeCommandById(commandId);
					reloadSuccess = true;
					logger.debug(`Successfully executed reload command: ${commandId}`);

					// After command, also call loadManifests to ensure manifests are updated
					await new Promise((resolve) => setTimeout(resolve, 1000));
					if (
						pluginsApi &&
						pluginsApi.loadManifests &&
						typeof pluginsApi.loadManifests === "function"
					) {
						await pluginsApi.loadManifests();
						logger.debug("Also called loadManifests() after reload command");
					}
				} catch {
					logger.debug(`Command ${commandId} not found, trying direct API methods`);
				}
			}
		} catch (e) {
			logger.warn("Command execution failed:", e);
		}

		// Method 2: Try direct API methods
		if (!reloadSuccess && pluginsApi) {
			try {
				if (
					pluginsApi.loadManifests &&
					typeof pluginsApi.loadManifests === "function"
				) {
					await pluginsApi.loadManifests();
					reloadSuccess = true;
					logger.debug("Successfully reloaded manifests via loadManifests()");
				}

				if (
					pluginsApi.loadAvailablePlugins &&
					typeof pluginsApi.loadAvailablePlugins === "function"
				) {
					await pluginsApi.loadAvailablePlugins();
					reloadSuccess = true;
					logger.debug("Successfully reloaded plugins via loadAvailablePlugins()");
				}

				if (pluginsApi.reload && typeof pluginsApi.reload === "function") {
					await pluginsApi.reload();
					reloadSuccess = true;
					logger.debug("Successfully reloaded via reload()");
				}
			} catch (reloadError) {
				logger.warn("Direct API reload methods failed:", reloadError);
			}
		}

		if (!reloadSuccess) {
			logger.warn(
				"Could not reload plugins automatically. Plugins may not appear until manual reload."
			);
		}
	}

	/**
	 * Enables a single plugin.
	 */
	private async enableSinglePlugin(
		pluginId: string,
		pluginsApi: PluginsAPI | undefined,
		manifests: Record<string, unknown>,
		attempt: number
	): Promise<{ enabled: boolean; failed: boolean; actualId: string }> {
		// Check if plugin is installed by checking manifests
		let isInstalled = Object.prototype.hasOwnProperty.call(manifests, pluginId);
		let actualPluginId = pluginId;

		// Try to find plugin with different ID variations
		if (!isInstalled) {
			for (const manifestId in manifests) {
				if (
					manifestId === pluginId ||
					manifestId.replace(/^obsidian-/, "") ===
						pluginId.replace(/^obsidian-/, "") ||
					manifestId === pluginId.replace(/^obsidian-/, "") ||
					`obsidian-${manifestId}` === pluginId
				) {
					isInstalled = true;
					actualPluginId = manifestId;
					logger.debug(
						`Found plugin "${pluginId}" with different ID in manifests: "${manifestId}"`
					);
					break;
				}
			}
		}

		// Alternative check: look for plugin in plugins list
		if (!isInstalled && pluginsApi && pluginsApi.plugins) {
			const pluginsList = pluginsApi.plugins;
			if (typeof pluginsList === "object" && pluginsList !== null) {
				for (const key in pluginsList) {
					if (key === pluginId) {
						isInstalled = true;
						actualPluginId = key;
						break;
					}
					const plugin = pluginsList[key];
					if (plugin && typeof plugin === "object" && "manifest" in plugin) {
						const manifest = (plugin as { manifest?: { id?: string } }).manifest;
						if (manifest && manifest.id === pluginId) {
							isInstalled = true;
							actualPluginId = key;
							break;
						}
					}
				}
			}
		}

		// Log for debugging
		if (attempt === 0) {
			logger.debug(
				`Checking plugin "${pluginId}": installed=${isInstalled}, actualId="${actualPluginId}", manifests keys:`,
				Object.keys(manifests).slice(0, 10)
			);
		}

		if (!isInstalled) {
			if (attempt === 2) {
				logger.warn(
					`Plugin "${pluginId}" not found in manifests after reload. Available plugins:`,
					Object.keys(manifests)
				);
			}
			return { enabled: false, failed: true, actualId: pluginId };
		}

		// Check if plugin is already enabled
		let enabledPlugins: Set<string> = new Set<string>();
		if (pluginsApi) {
			if (pluginsApi.enabledPlugins instanceof Set) {
				enabledPlugins = pluginsApi.enabledPlugins;
			} else if (
				pluginsApi.plugins &&
				typeof pluginsApi.plugins === "object" &&
				pluginsApi.plugins !== null &&
				"enabledPlugins" in pluginsApi.plugins &&
				pluginsApi.plugins.enabledPlugins instanceof Set
			) {
				enabledPlugins = pluginsApi.plugins.enabledPlugins;
			}
		}

		const isEnabled = enabledPlugins.has(actualPluginId);

		if (isEnabled) {
			if (attempt === 0) {
				logger.debug(
					`Plugin "${pluginId}" (${actualPluginId}) is already enabled.`
				);
			}
			return { enabled: true, failed: false, actualId: actualPluginId };
		}

		// Enable the plugin using actualPluginId
		if (
			pluginsApi &&
			pluginsApi.enablePlugin &&
			typeof pluginsApi.enablePlugin === "function"
		) {
			await pluginsApi.enablePlugin(actualPluginId);
			logger.info(
				`Successfully enabled plugin "${pluginId}" (using ID: "${actualPluginId}").`
			);
			return { enabled: true, failed: false, actualId: actualPluginId };
		} else {
			if (attempt === 2) {
				logger.warn(`enablePlugin method not available.`);
			}
			return { enabled: false, failed: true, actualId: actualPluginId };
		}
	}

	/**
	 * Refreshes the Community plugins settings UI to show updated plugin list and status.
	 */
	async refreshPluginsUI(): Promise<void> {
		try {
			// Small delay to ensure all plugin state changes are processed
			await new Promise((resolve) => setTimeout(resolve, 500));

			// Access internal settings API
			const settings = (this.app as { setting?: SettingsAPI }).setting;
			if (settings) {
				// Try to find and refresh the Community plugins tab
				if (settings.pluginTabs && Array.isArray(settings.pluginTabs)) {
					const pluginTab = settings.pluginTabs.find(
						(tab) =>
							tab &&
							(tab.id === "community-plugins" ||
								tab.name === "Community plugins" ||
								tab.id === "plugins")
					);

					if (pluginTab && typeof pluginTab.display === "function") {
						// Refresh the tab if it's currently open
						if (settings.activeTab === pluginTab) {
							pluginTab.display();
							logger.debug("Refreshed Community plugins UI tab");
						}
					}
				}

				// Alternative: Try to refresh the active tab if it's related to plugins
				if (settings.activeTab && typeof settings.activeTab.display === "function") {
					const activeTabId = (
						settings.activeTab.id || settings.activeTab.name || ""
					).toLowerCase();
					if (activeTabId.includes("community") || activeTabId.includes("plugin")) {
						settings.activeTab.display();
						logger.debug("Refreshed active settings tab");
					}
				}
			}

			// Try to trigger UI update through plugins API
			const pluginsApi = (this.app as { plugins?: PluginsAPI }).plugins;
			if (pluginsApi) {
				// Request settings save which often triggers UI refresh
				if (
					pluginsApi.requestSaveSettings &&
					typeof pluginsApi.requestSaveSettings === "function"
				) {
					await pluginsApi.requestSaveSettings();
				}

				// Try to trigger a manual refresh of the plugin list display
				if (
					pluginsApi.updatePluginList &&
					typeof pluginsApi.updatePluginList === "function"
				) {
					pluginsApi.updatePluginList();
					logger.debug("Called updatePluginList()");
				}
			}

			// Use requestAnimationFrame to ensure UI updates are processed
			requestAnimationFrame(() => {
				// Force a re-render by dispatching a custom event
				if (typeof window !== "undefined") {
					window.dispatchEvent(new Event("resize"));
				}
			});
		} catch (error) {
			logger.warn("Could not refresh UI automatically:", error);
			// UI refresh is not critical, so we don't throw
		}
	}
}

