import { App, Notice, normalizePath } from "obsidian";
import { FileManager } from "../utils/FileManager";
import { PLUGIN_ID } from "../types";
import { isSafePluginId } from "../utils/parsePluginList";
import { logger } from "../utils/Logger";

interface PluginsAPI {
	manifests?: Record<string, { id?: string }>;
	enabledPlugins?: Set<string> | string[];
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
	saveConfig?: () => Promise<void>;
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
	private pendingLoadIds: string[] = [];
	private waitingForSettingsClose = false;

	constructor(
		private app: App,
		private fileManager: FileManager,
	) {}

	private getPluginsApi(): PluginsAPI | undefined {
		return (this.app as App & { plugins?: PluginsAPI }).plugins;
	}

	private isSettingsOpen(): boolean {
		return !!document.querySelector(".mod-settings");
	}

	async enableInstalledPlugins(
		pluginIds: string[],
		onProgress?: (current: number, total: number, pluginId: string) => void,
	): Promise<{ enabled: number; failed: number; failedPlugins: string[] }> {
		if (!pluginIds || pluginIds.length === 0) {
			return { enabled: 0, failed: 0, failedPlugins: [] };
		}

		const pluginsApi = this.getPluginsApi();
		if (!pluginsApi) {
			new Notice(
				"Cannot access plugins API. Plugins will need to be enabled manually.",
			);
			return { enabled: 0, failed: 0, failedPlugins: pluginIds };
		}

		const ids = pluginIds
			.filter(
				(id): id is string =>
					typeof id === "string" && isSafePluginId(id.trim()),
			)
			.map((id) => id.trim());

		if (ids.length === 0) {
			return { enabled: 0, failed: 0, failedPlugins: [] };
		}

		await this.waitForLayoutReady();
		await this.reloadPlugins(pluginsApi);

		const enabledIds: string[] = [];
		const failedPlugins: string[] = [];

		for (let i = 0; i < ids.length; i++) {
			const pluginId = ids[i];
			if (onProgress) {
				onProgress(i + 1, ids.length, pluginId);
			}

			const actualId =
				(await this.resolvePluginId(pluginId, pluginsApi)) || pluginId;

			await this.loadPluginManifest(pluginsApi, actualId);

			try {
				if (typeof pluginsApi.enablePluginAndSave === "function") {
					await pluginsApi.enablePluginAndSave(actualId);
				} else if (typeof pluginsApi.enablePlugin === "function") {
					await pluginsApi.enablePlugin(actualId);
				}
			} catch (err: unknown) {
				logger.warn(`enablePlugin("${actualId}") failed:`, err);
				failedPlugins.push(pluginId);
			}

			this.markEnabled(pluginsApi, actualId);
			enabledIds.push(actualId);

			await new Promise((resolve) => window.setTimeout(resolve, 200));
		}

		await this.saveEnabledSet(pluginsApi);
		await this.showCommunityPluginsTab();

		new Notice(
			`[Installer] Enabled ${enabledIds.length} plugin${enabledIds.length > 1 ? "s" : ""}.`,
		);

		return {
			enabled: enabledIds.length,
			failed: failedPlugins.length,
			failedPlugins,
		};
	}

	private async loadPluginManifest(
		pluginsApi: PluginsAPI,
		pluginId: string,
	): Promise<void> {
		if (typeof pluginsApi.loadManifest !== "function") {
			return;
		}
		const folderPath = normalizePath(
			`${this.app.vault.configDir}/plugins/${pluginId}`,
		);
		try {
			await pluginsApi.loadManifest(folderPath);
			return;
		} catch (err: unknown) {
			logger.debug(`loadManifest("${folderPath}") failed:`, err);
		}
		try {
			await pluginsApi.loadManifest(pluginId);
		} catch (err: unknown) {
			logger.debug(`loadManifest("${pluginId}") failed:`, err);
		}
	}

	private markEnabled(pluginsApi: PluginsAPI, pluginId: string): void {
		if (pluginsApi.enabledPlugins instanceof Set) {
			pluginsApi.enabledPlugins.add(pluginId);
			return;
		}
		if (Array.isArray(pluginsApi.enabledPlugins)) {
			if (!pluginsApi.enabledPlugins.includes(pluginId)) {
				pluginsApi.enabledPlugins.push(pluginId);
			}
		}
	}

	private queuePluginStart(pluginIds: string[]): void {
		this.pendingLoadIds = [
			...new Set([...this.pendingLoadIds, ...pluginIds]),
		];
		if (this.waitingForSettingsClose) {
			return;
		}
		this.waitingForSettingsClose = true;
		const poll = () => {
			if (this.isSettingsOpen()) {
				window.setTimeout(poll, 400);
				return;
			}
			this.waitingForSettingsClose = false;
			const ids = this.pendingLoadIds;
			this.pendingLoadIds = [];
			void this.startPlugins(ids);
		};
		window.setTimeout(poll, 400);
	}

	private async startPlugins(pluginIds: string[]): Promise<void> {
		const pluginsApi = this.getPluginsApi();
		if (!pluginsApi || typeof pluginsApi.enablePlugin !== "function") {
			return;
		}
		await this.waitForLayoutReady();
		for (const pluginId of pluginIds) {
			if (pluginId === PLUGIN_ID) {
				continue;
			}
			try {
				await pluginsApi.enablePlugin(pluginId);
			} catch (err: unknown) {
				logger.debug(`enablePlugin("${pluginId}") failed:`, err);
			}
			await new Promise((resolve) => window.setTimeout(resolve, 350));
		}
	}

	async reloadEnabledPlugins(pluginIds: string[]): Promise<number> {
		const pluginsApi = this.getPluginsApi();
		if (!pluginsApi || pluginIds.length === 0) {
			return 0;
		}

		if (this.isSettingsOpen()) {
			this.queuePluginStart(pluginIds.filter((id) => id !== PLUGIN_ID));
			return 0;
		}

		let reloaded = 0;
		for (const pluginId of pluginIds) {
			if (!isSafePluginId(pluginId) || pluginId === PLUGIN_ID) {
				continue;
			}
			const actualId =
				(await this.resolvePluginId(pluginId, pluginsApi)) || pluginId;
			try {
				if (typeof pluginsApi.disablePlugin === "function") {
					await pluginsApi.disablePlugin(actualId);
				}
				await new Promise((resolve) => window.setTimeout(resolve, 50));
				if (typeof pluginsApi.enablePlugin === "function") {
					await pluginsApi.enablePlugin(actualId);
				}
				reloaded++;
			} catch (err: unknown) {
				logger.warn(`Failed to reload plugin "${pluginId}":`, err);
			}
		}
		return reloaded;
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
			}
		} catch (err: unknown) {
			logger.warn("loadManifests failed:", err);
		}
		try {
			if (typeof pluginsApi.loadAvailablePlugins === "function") {
				await pluginsApi.loadAvailablePlugins();
			}
		} catch (err: unknown) {
			logger.warn("loadAvailablePlugins failed:", err);
		}
	}

	async reloadManifests(): Promise<void> {
		const pluginsApi = this.getPluginsApi();
		if (!pluginsApi) {
			return;
		}
		await this.reloadPlugins(pluginsApi);
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

	private async saveEnabledSet(pluginsApi: PluginsAPI): Promise<void> {
		if (typeof pluginsApi.saveConfig === "function") {
			try {
				await pluginsApi.saveConfig();
				return;
			} catch (err: unknown) {
				logger.debug("saveConfig failed:", err);
			}
		}
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
		} else if (Array.isArray(pluginsApi.enabledPlugins)) {
			await this.persistEnabledIds(pluginsApi.enabledPlugins);
		}
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

	async refreshPluginsUI(): Promise<void> {
		await this.showCommunityPluginsTab();
	}

	private async showCommunityPluginsTab(): Promise<void> {
		try {
			await new Promise((resolve) => window.setTimeout(resolve, 150));

			const pluginsApi = this.getPluginsApi();
			if (pluginsApi && typeof pluginsApi.updatePluginList === "function") {
				pluginsApi.updatePluginList();
			}

			const settings = this.app as App & {
				setting?: SettingsAPI & {
					openTabById?: (id: string) => void;
				};
			};

			if (typeof settings.setting?.openTabById === "function") {
				settings.setting.openTabById("community-plugins");
			}

			const pluginTab = settings.setting?.pluginTabs?.find(
				(tab) =>
					tab &&
					(tab.id === "community-plugins" ||
						tab.name === "Community plugins"),
			);
			if (pluginTab && typeof pluginTab.display === "function") {
				pluginTab.display();
			}
		} catch (err: unknown) {
			logger.warn("Could not refresh Community plugins tab:", err);
		}
	}
}
