import { Notice } from "obsidian";
import { FileManager } from "../utils/FileManager";
import { PLUGINS_SETTINGS_FILE } from "../types";
import { isSafePluginId } from "../utils/parsePluginList";
import { logger } from "../utils/Logger";
import { findPluginFolder, scanInstalledPlugins } from "./InstalledPlugins";

// Assigning "__proto__" would replace the result's prototype instead of
// copying the value.
const UNSAFE_MERGE_KEYS = new Set(["__proto__"]);

export function mergeSettingsObjects(
	target: unknown,
	source: unknown,
): unknown {
	if (
		source === null ||
		typeof source !== "object" ||
		Array.isArray(source)
	) {
		return source;
	}

	if (
		target === null ||
		typeof target !== "object" ||
		Array.isArray(target)
	) {
		return { ...(source as Record<string, unknown>) };
	}

	const result: Record<string, unknown> = {
		...(target as Record<string, unknown>),
	};
	for (const [key, value] of Object.entries(
		source as Record<string, unknown>,
	)) {
		if (UNSAFE_MERGE_KEYS.has(key)) {
			continue;
		}
		result[key] = mergeSettingsObjects(result[key], value);
	}
	return result;
}

export interface SettingsTarget {
	// Key in the settings file (the plugin id)
	pluginId: string;
	// Folder under .obsidian/plugins that holds the plugin
	folderName: string;
	settings: unknown;
}

export class SettingsManager {
	constructor(
		private fileManager: FileManager,
		private shouldMergeSettings: () => boolean = () => false,
	) {}

	private async resolvePayload(
		dataJsonPath: string,
		incoming: unknown,
	): Promise<unknown> {
		if (!this.shouldMergeSettings()) {
			return incoming;
		}

		if (!(await this.fileManager.exists(dataJsonPath))) {
			return incoming;
		}

		const rawExisting = await this.fileManager.readFile(dataJsonPath);
		if (!rawExisting) {
			return incoming;
		}

		try {
			const existing: unknown = JSON.parse(rawExisting);
			return mergeSettingsObjects(existing, incoming);
		} catch (err: unknown) {
			logger.warn(
				`Merge skipped for ${dataJsonPath}: invalid existing data.json, replacing.`,
				err,
			);
			return incoming;
		}
	}

	// Reads the settings file and pairs each entry with an installed plugin
	// folder. Entries for plugins that are not installed are skipped.
	async collectSettingsTargets(): Promise<SettingsTarget[]> {
		const settingsFile = this.fileManager.configPath(PLUGINS_SETTINGS_FILE);

		if (!(await this.fileManager.exists(settingsFile))) {
			new Notice(
				`[Installer] No ${PLUGINS_SETTINGS_FILE} file found, skipping applying settings.`,
			);
			return [];
		}

		const rawSettings = await this.fileManager.readFile(settingsFile);
		if (!rawSettings) {
			return [];
		}

		const allSettings = this.fileManager.parseJsonWithValidation<
			Record<string, unknown>
		>(rawSettings, PLUGINS_SETTINGS_FILE);

		if (!allSettings) {
			return [];
		}

		const installed = await scanInstalledPlugins(this.fileManager);
		const targets: SettingsTarget[] = [];

		for (const pluginId of Object.keys(allSettings)) {
			if (!isSafePluginId(pluginId)) {
				logger.warn(
					`Skipping settings for unsafe plugin id: ${pluginId}`,
				);
				continue;
			}
			if (!allSettings[pluginId]) {
				continue;
			}

			const folder = findPluginFolder(installed, pluginId);
			if (!folder) {
				logger.debug(
					`Skipping settings for "${pluginId}": plugin is not installed.`,
				);
				continue;
			}

			targets.push({
				pluginId,
				folderName: folder.folderName,
				settings: allSettings[pluginId],
			});
		}

		return targets;
	}

	async writeSettings(target: SettingsTarget): Promise<boolean> {
		try {
			const dataJsonPath = this.fileManager.pluginsPath(
				target.folderName,
				"data.json",
			);
			const payload = await this.resolvePayload(
				dataJsonPath,
				target.settings,
			);
			const written = await this.fileManager.writeFile(
				dataJsonPath,
				JSON.stringify(payload, null, 2),
			);
			if (!written) {
				new Notice(
					`[Installer] Cannot write settings for plugin ${target.pluginId}. Check file permissions.`,
				);
			}
			return written;
		} catch (err: unknown) {
			const errorMessage =
				err instanceof Error ? err.message : "Unknown error";
			new Notice(
				`[Installer] Failed to write data.json for plugin ${target.pluginId}: ${errorMessage}`,
			);
			logger.error(`Failed to write settings for ${target.pluginId}:`, err);
			return false;
		}
	}

	async writeAllSettings(targets: SettingsTarget[]): Promise<string[]> {
		const applied: string[] = [];
		for (const target of targets) {
			if (await this.writeSettings(target)) {
				applied.push(target.pluginId);
			}
		}
		return applied;
	}

	async applySettingsToInstalledPlugins(): Promise<string[]> {
		return this.writeAllSettings(await this.collectSettingsTargets());
	}

	async applySettingsForPlugin(
		pluginId: string,
		pluginFolderId: string,
	): Promise<void> {
		if (!isSafePluginId(pluginId) || !isSafePluginId(pluginFolderId)) {
			logger.warn(
				`Skipping settings apply for unsafe id: ${pluginId} / ${pluginFolderId}`,
			);
			return;
		}

		const settingsFile = this.fileManager.configPath(PLUGINS_SETTINGS_FILE);

		if (!(await this.fileManager.exists(settingsFile))) {
			return;
		}

		const rawSettings = await this.fileManager.readFile(settingsFile);
		if (!rawSettings) {
			return;
		}

		const allSettings = this.fileManager.parseJsonWithValidation<
			Record<string, unknown>
		>(rawSettings, PLUGINS_SETTINGS_FILE);

		if (!allSettings || !allSettings[pluginId]) {
			return;
		}

		const manifestPath = this.fileManager.pluginsPath(
			pluginFolderId,
			"manifest.json",
		);
		if (!(await this.fileManager.exists(manifestPath))) {
			logger.warn(
				`Skipping settings for "${pluginId}": plugin is not fully installed.`,
			);
			return;
		}

		await this.writeSettings({
			pluginId,
			folderName: pluginFolderId,
			settings: allSettings[pluginId],
		});
	}
}
