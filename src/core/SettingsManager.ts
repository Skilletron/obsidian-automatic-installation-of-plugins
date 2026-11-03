import { Notice } from "obsidian";
import { FileManager } from "../utils/FileManager";
import { PLUGINS_SETTINGS_FILE } from "../types";
import { isSafePluginId } from "../utils/parsePluginList";
import { logger } from "../utils/Logger";
import { findPluginFolder, scanInstalledPlugins } from "./InstalledPlugins";
import { SettingsBackup } from "./SettingsBackup";
import { restoreSecrets } from "../utils/secrets";
import { SettingChange, diffSettings } from "../utils/settingsDiff";

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
		private backup?: SettingsBackup,
	) {}

	// The plugin's current settings, or undefined if there are none or the
	// file is not valid JSON.
	private async readExisting(dataJsonPath: string): Promise<unknown> {
		if (!(await this.fileManager.exists(dataJsonPath))) {
			return undefined;
		}
		const raw = await this.fileManager.readFile(dataJsonPath);
		if (!raw) {
			return undefined;
		}
		try {
			return JSON.parse(raw) as unknown;
		} catch (err: unknown) {
			logger.warn(
				`Ignoring invalid existing ${dataJsonPath}; it will be replaced.`,
				err,
			);
			return undefined;
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

	// What data.json would contain after writing `target`, next to what it
	// contains now.
	private async buildPayload(target: SettingsTarget): Promise<{
		dataJsonPath: string;
		existing: unknown;
		payload: unknown;
	}> {
		const dataJsonPath = this.fileManager.pluginsPath(
			target.folderName,
			"data.json",
		);
		const existing = await this.readExisting(dataJsonPath);
		// Values removed on export keep what the plugin has now.
		const incoming = restoreSecrets(target.settings, existing);
		const payload =
			this.shouldMergeSettings() && existing !== undefined
				? mergeSettingsObjects(existing, incoming)
				: incoming;
		return { dataJsonPath, existing, payload };
	}

	// The changes writeSettings would make, without writing anything.
	async previewSettings(target: SettingsTarget): Promise<SettingChange[]> {
		if (!isSafePluginId(target.folderName)) {
			return [];
		}
		const { existing, payload } = await this.buildPayload(target);
		return payload === undefined ? [] : diffSettings(existing ?? {}, payload);
	}

	async writeSettings(target: SettingsTarget): Promise<boolean> {
		try {
			const { dataJsonPath, payload } = await this.buildPayload(target);
			if (payload === undefined) {
				return false;
			}
			await this.backup?.capture(dataJsonPath, target.pluginId);
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
