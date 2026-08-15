import { App, Notice } from "obsidian";
import { FileManager } from "../utils/FileManager";
import { PLUGIN_ID } from "../types";
import { isSafePluginId } from "../utils/parsePluginList";
import { logger } from "../utils/Logger";

interface PluginsAPI {
	manifests?: Record<string, { id?: string }>;
	enabledPlugins?: Set<string>;
	plugins?: Record<string, unknown>;
	enablePlugin?: (pluginId: string) => Promise<void>;
	enablePluginAndSave?: (pluginId: string) => Promise<void>;
	disablePlugin?: (pluginId: string) => Promise<void>;
	disablePluginAndSave?: (pluginId: string) => Promise<void>;
	loadManifests?: () => Promise<void>;
	loadManifest?: (pluginId: string) => Promise<void>;
	loadPlugin?: (pluginId: string) => Promise<void>;
	loadAvailablePlugins?: () => Promise<void>;
	reload?: () => Promise<void>;
	saveEnabledPlugins?: () => Promise<void>;
	requestSaveSettings?: () => Promise<void>;
	updatePluginList?: () => void;
}

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

export class PluginEnabler {
	constructor(
		private app: App,
		private fileManager: FileManager,
	) {}

	private getPluginsApi(): PluginsAPI | undefined {
		return (this.app as App & { plugins?: PluginsAPI }).plugins;
	}

	async enablePluginById(pluginId: string): Promise<boolean> {
		if (!isSafePluginId(pluginId)) {
			return false;
		}
		const pluginsApi = this.getPluginsApi();
		if (!pluginsApi) {
			return false;
		}

		await this.waitForLayoutReady();

		const folderPath = this.fileManager.pluginsPath(pluginId);
		if (typeof pluginsApi.loadManifest === "function") {
			try {
				await pluginsApi.loadManifest(folderPath);
			} catch {
				try {
					await pluginsApi.loadManifest(pluginId);
				} catch {
					/* ignore */
				}
			}
		}
		if (typeof pluginsApi.loadManifests === "function") {
			try {
				await pluginsApi.loadManifests();
			} catch {
				/* ignore */
			}
		}

		const actualId =
			(await this.resolvePluginId(pluginId, pluginsApi)) || pluginId;

		try {
			await this.forceEnable(pluginsApi, actualId);
			await this.saveEnabledSet(pluginsApi);
			return true;
		} catch (err: unknown) {
			logger.warn(`enablePluginById("${actualId}") failed:`, err);
			return false;
		}
	}

	async enableInstalledPlugins(
		pluginIds: string[],
		onProgress?: (current: number, total: number, pluginId: string) => void,
	): Promise<{ enabled: number; failed: number; failedPlugins: string[] }> {
		if (!pluginIds || pluginIds.length === 0) {
			return { enabled: 0, failed: 0, failedPlugins: [] };
		}

		try {
			const pluginsApi = this.getPluginsApi();

			if (!pluginsApi) {
				new Notice(
					"Cannot access plugins API. Plugins will need to be enabled manually.",
				);
				logger.warn("Plugins API not available");
				return { enabled: 0, failed: 0, failedPlugins: pluginIds };
			}

			const installedPluginIds: string[] = [];
			for (const pluginId of pluginIds) {
				if (
					typeof pluginId !== "string" ||
					pluginId.trim() === "" ||
					!isSafePluginId(pluginId.trim())
				) {
					continue;
				}
				const normalizedId = pluginId.trim();
				const manifestPath = this.fileManager.pluginsPath(
					normalizedId,
					"manifest.json",
				);
				if (await this.fileManager.exists(manifestPath)) {
					installedPluginIds.push(normalizedId);
				}
			}

			if (installedPluginIds.length === 0) {
				new Notice("No installed plugins found to enable.");
				return { enabled: 0, failed: 0, failedPlugins: [] };
			}

			await this.waitForLayoutReady();
			await this.reloadPlugins(pluginsApi);

			const enabledIds: string[] = [];
			const failedPlugins: string[] = [];

			for (let i = 0; i < installedPluginIds.length; i++) {
				const pluginId = installedPluginIds[i];
				if (onProgress) {
					onProgress(i + 1, installedPluginIds.length, pluginId);
				}

				const actualId =
					(await this.resolvePluginId(pluginId, pluginsApi)) ||
					pluginId;

				try {
					await this.forceEnable(pluginsApi, actualId);
					enabledIds.push(actualId);
				} catch (err: unknown) {
					logger.error(`Failed to enable plugin "${pluginId}":`, err);
					failedPlugins.push(pluginId);
				}
			}

			await this.saveEnabledSet(pluginsApi);

			const enabledCount = enabledIds.length;
			const failedCount = failedPlugins.length;

			if (enabledCount > 0 && failedCount === 0) {
				new Notice(
					`[Installer] Successfully enabled ${enabledCount} plugin${enabledCount > 1 ? "s" : ""}.`,
				);
			} else if (enabledCount > 0 && failedCount > 0) {
				new Notice(
					`[Installer] Enabled ${enabledCount} plugin${enabledCount > 1 ? "s" : ""}, failed to enable ${failedCount}. See console for details.`,
				);
			} else if (failedCount > 0) {
				new Notice(
					`[Installer] Failed to enable ${failedCount} plugin${failedCount > 1 ? "s" : ""}. Enable them manually or reload Obsidian.`,
				);
			}

			return {
				enabled: enabledCount,
				failed: failedCount,
				failedPlugins,
			};
		} catch (err: unknown) {
			const errorMessage =
				err instanceof Error ? err.message : "Unknown error";
			new Notice(
				`[Installer] Error while enabling plugins: ${errorMessage}. See console for details.`,
			);
			logger.error("Error enabling plugins:", err);
			return {
				enabled: 0,
				failed: pluginIds.length,
				failedPlugins: pluginIds,
			};
		}
	}

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

	private async reloadPlugins(pluginsApi: PluginsAPI): Promise<void> {
		try {
			if (typeof pluginsApi.loadManifests === "function") {
				await pluginsApi.loadManifests();
				logger.debug("Reloaded manifests via loadManifests()");
			}
		} catch (err: unknown) {
			logger.warn("loadManifests failed:", err);
		}

		try {
			if (typeof pluginsApi.loadAvailablePlugins === "function") {
				await pluginsApi.loadAvailablePlugins();
				logger.debug("Reloaded plugins via loadAvailablePlugins()");
			}
		} catch (err: unknown) {
			logger.warn("loadAvailablePlugins failed:", err);
		}
	}

	private async getCandidateIds(pluginId: string): Promise<string[]> {
		const candidates = [pluginId];
		try {
			const manifestPath = this.fileManager.pluginsPath(
				pluginId,
				"manifest.json",
			);
			if (await this.fileManager.exists(manifestPath)) {
				const raw = await this.fileManager.readFile(manifestPath);
				if (raw) {
					const manifest = JSON.parse(raw) as { id?: string };
					if (
						typeof manifest.id === "string" &&
						manifest.id &&
						!candidates.includes(manifest.id)
					) {
						candidates.push(manifest.id);
					}
				}
			}
		} catch (err: unknown) {
			logger.debug(
				`Could not read local manifest for "${pluginId}":`,
				err,
			);
		}
		return candidates;
	}

	private async resolvePluginId(
		pluginId: string,
		pluginsApi: PluginsAPI,
	): Promise<string | null> {
		const manifests = pluginsApi.manifests || {};
		const candidates = await this.getCandidateIds(pluginId);

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

	private async forceEnable(
		pluginsApi: PluginsAPI,
		pluginId: string,
	): Promise<void> {
		if (pluginsApi.enabledPlugins instanceof Set) {
			pluginsApi.enabledPlugins.add(pluginId);
		}

		if (typeof pluginsApi.enablePlugin === "function") {
			try {
				await pluginsApi.enablePlugin(pluginId);
			} catch (err: unknown) {
				logger.debug(`enablePlugin("${pluginId}") failed:`, err);
			}
		} else if (typeof pluginsApi.enablePluginAndSave === "function") {
			try {
				await pluginsApi.enablePluginAndSave(pluginId);
			} catch (err: unknown) {
				logger.debug(
					`enablePluginAndSave("${pluginId}") failed:`,
					err,
				);
			}
		}
	}

	private async saveEnabledSet(pluginsApi: PluginsAPI): Promise<void> {
		if (typeof pluginsApi.saveEnabledPlugins === "function") {
			try {
				await pluginsApi.saveEnabledPlugins();
				return;
			} catch (err: unknown) {
				logger.debug("saveEnabledPlugins failed:", err);
			}
		}
		if (pluginsApi.enabledPlugins instanceof Set) {
			await this.persistEnabledIds([...pluginsApi.enabledPlugins]);
		}
	}

	private async callEnable(
		pluginsApi: PluginsAPI,
		pluginId: string,
	): Promise<void> {
		if (typeof pluginsApi.enablePluginAndSave === "function") {
			try {
				await pluginsApi.enablePluginAndSave(pluginId);
				return;
			} catch (err: unknown) {
				logger.debug(
					`enablePluginAndSave("${pluginId}") failed, trying enablePlugin:`,
					err,
				);
			}
		}
		if (typeof pluginsApi.enablePlugin === "function") {
			await pluginsApi.enablePlugin(pluginId);
			return;
		}
		throw new Error("enablePluginAndSave/enablePlugin not available");
	}

	private async persistEnabledIds(pluginIds: string[]): Promise<void> {
		const enabledPath = this.fileManager.configPath("community-plugins.json");
		let current: string[] = [];
		if (await this.fileManager.exists(enabledPath)) {
			const raw = await this.fileManager.readFile(enabledPath);
			if (raw) {
				try {
					const parsed: unknown = JSON.parse(raw);
					if (Array.isArray(parsed)) {
						current = parsed.filter(
							(id): id is string =>
								typeof id === "string" && id.trim() !== "",
						);
					}
				} catch (err: unknown) {
					logger.warn("Could not parse community-plugins.json:", err);
				}
			}
		}

		const merged = [...new Set([...current, ...pluginIds, PLUGIN_ID])];
		await this.fileManager.writeFile(
			enabledPath,
			JSON.stringify(merged, null, 2),
		);
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

	private async enableSinglePlugin(
		pluginId: string,
		pluginsApi: PluginsAPI,
		attempt: number,
	): Promise<{
		enabled: boolean;
		failed: boolean;
		actualId: string;
		reason?: string;
	}> {
		let actualPluginId = await this.resolvePluginId(pluginId, pluginsApi);

		if (!actualPluginId && typeof pluginsApi.loadManifest === "function") {
			for (const candidate of await this.getCandidateIds(pluginId)) {
				try {
					await pluginsApi.loadManifest(
						this.fileManager.pluginsPath(candidate),
					);
				} catch (err: unknown) {
					logger.debug(
						`loadManifest("${candidate}") path failed:`,
						err,
					);
					try {
						await pluginsApi.loadManifest(candidate);
					} catch (err2: unknown) {
						logger.debug(
							`loadManifest("${candidate}") failed:`,
							err2,
						);
					}
				}
			}
			actualPluginId = await this.resolvePluginId(pluginId, pluginsApi);
		}

		if (!actualPluginId) {
			const candidates = await this.getCandidateIds(pluginId);
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
			new Set([
				actualPluginId,
				...(await this.getCandidateIds(pluginId)),
			]),
		);
		let lastError = "";

		for (const enableId of enableIds) {
			try {
				await this.callEnable(pluginsApi, enableId);

				if (this.isPluginEnabled(pluginsApi, enableId)) {
					logger.debug(
						`Enabled plugin "${pluginId}" as "${enableId}".`,
					);
					return { enabled: true, failed: false, actualId: enableId };
				}

				return { enabled: true, failed: false, actualId: enableId };
			} catch (err: unknown) {
				lastError = err instanceof Error ? err.message : String(err);
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

	async reloadEnabledPlugins(pluginIds: string[]): Promise<number> {
		const pluginsApi = this.getPluginsApi();
		if (!pluginsApi || pluginIds.length === 0) {
			return 0;
		}

		let reloaded = 0;
		for (const pluginId of pluginIds) {
			if (
				!isSafePluginId(pluginId) ||
				pluginId === PLUGIN_ID
			) {
				continue;
			}

			const actualId =
				(await this.resolvePluginId(pluginId, pluginsApi)) || pluginId;

			if (!this.isPluginEnabled(pluginsApi, actualId)) {
				continue;
			}

			try {
				if (typeof pluginsApi.disablePluginAndSave === "function") {
					await pluginsApi.disablePluginAndSave(actualId);
				} else if (typeof pluginsApi.disablePlugin === "function") {
					await pluginsApi.disablePlugin(actualId);
				} else {
					continue;
				}

				await new Promise((resolve) =>
					window.setTimeout(resolve, 50),
				);

				if (typeof pluginsApi.enablePluginAndSave === "function") {
					await pluginsApi.enablePluginAndSave(actualId);
				} else if (typeof pluginsApi.enablePlugin === "function") {
					await pluginsApi.enablePlugin(actualId);
				} else {
					continue;
				}

				reloaded++;
			} catch (err: unknown) {
				logger.warn(`Failed to reload plugin "${pluginId}":`, err);
			}
		}

		return reloaded;
	}

	async reloadManifests(): Promise<void> {
		const pluginsApi = this.getPluginsApi();
		if (!pluginsApi) {
			return;
		}
		await this.reloadPlugins(pluginsApi);
	}

	async refreshPluginsUI(): Promise<void> {
		try {
			await new Promise((resolve) => window.setTimeout(resolve, 300));

			const pluginsApi = this.getPluginsApi();
			if (pluginsApi && typeof pluginsApi.updatePluginList === "function") {
				pluginsApi.updatePluginList();
			}

			const settings = (this.app as App & { setting?: SettingsAPI })
				.setting;
			if (settings?.pluginTabs && Array.isArray(settings.pluginTabs)) {
				const pluginTab = settings.pluginTabs.find(
					(tab) =>
						tab &&
						(tab.id === "community-plugins" ||
							tab.name === "Community plugins" ||
							tab.id === "plugins"),
				);
				if (pluginTab && typeof pluginTab.display === "function") {
					pluginTab.display();
				}
			}
			if (
				settings?.activeTab &&
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
		} catch (err: unknown) {
			logger.warn("Could not refresh UI automatically:", err);
		}
	}
}
