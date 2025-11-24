import * as path from "path";
import { Notice } from "obsidian";
import { FileManager } from "../utils/FileManager";
import { PLUGINS_SETTINGS_FILE } from "../types";
import { logger } from "../utils/Logger";

/**
 * Manages plugin settings synchronization.
 */
export class SettingsManager {
	constructor(private fileManager: FileManager) {}

	/**
	 * Applies settings from community-plugins-settings.json to installed plugins.
	 * @param pluginsFolder - Path to the plugins folder
	 * @param settingsFile - Path to the settings file
	 */
	applySettingsToInstalledPlugins(
		pluginsFolder: string,
		settingsFile: string
	): void {
		if (!this.fileManager.fileExists(settingsFile)) {
			new Notice(
				`[Installer] No ${PLUGINS_SETTINGS_FILE} file found, skipping applying settings on startup`
			);
			return;
		}

		if (!this.fileManager.isFileSystemAccessible(settingsFile)) {
			new Notice(
				`[Installer] Cannot access ${PLUGINS_SETTINGS_FILE}. Check file permissions.`
			);
			return;
		}

		const rawSettings = this.fileManager.readFile(settingsFile);
		if (!rawSettings) {
			return;
		}

		const allSettings = this.fileManager.parseJsonWithValidation<Record<string, unknown>>(
			rawSettings,
			PLUGINS_SETTINGS_FILE
		);

		if (!allSettings) {
			return;
		}

		for (const pluginId of Object.keys(allSettings)) {
			const pluginFolder = path.join(pluginsFolder, pluginId);
			const dataJsonPath = path.join(pluginFolder, "data.json");

			if (this.fileManager.fileExists(pluginFolder) && allSettings[pluginId]) {
				try {
					if (!this.fileManager.isFileSystemAccessible(dataJsonPath)) {
						new Notice(
							`[Installer] Cannot write settings for plugin ${pluginId}. Check file permissions.`
						);
						continue;
					}

					this.fileManager.writeFile(
						dataJsonPath,
						JSON.stringify(allSettings[pluginId], null, 2)
					);
				} catch (error) {
					const errorMessage =
						error instanceof Error ? error.message : "Unknown error";
					new Notice(
						`[Installer] Failed to write data.json for plugin ${pluginId}: ${errorMessage}`
					);
					logger.error(`Failed to write settings for ${pluginId}:`, error);
				}
			}
		}
	}

	/**
	 * Applies settings for a specific plugin after installation.
	 * @param pluginId - Plugin ID
	 * @param pluginFolder - Path to the plugin folder
	 * @param settingsFile - Path to the settings file
	 */
	applySettingsForPlugin(
		pluginId: string,
		pluginFolder: string,
		settingsFile: string
	): void {
		if (!this.fileManager.fileExists(settingsFile)) {
			return;
		}

		try {
			const rawSettings = this.fileManager.readFile(settingsFile);
			if (!rawSettings) {
				return;
			}

			const allSettings = this.fileManager.parseJsonWithValidation<Record<string, unknown>>(
				rawSettings,
				PLUGINS_SETTINGS_FILE
			);

			if (allSettings && allSettings[pluginId]) {
				const dataJsonPath = path.join(pluginFolder, "data.json");
				if (this.fileManager.isFileSystemAccessible(dataJsonPath)) {
					this.fileManager.writeFile(
						dataJsonPath,
						JSON.stringify(allSettings[pluginId], null, 2)
					);
				}
			}
		} catch (error) {
			const errorMessage =
				error instanceof Error ? error.message : "Unknown error";
			new Notice(
				`[Installer] Failed to apply settings for plugin ${pluginId}: ${errorMessage}`
			);
			logger.error(`Settings apply error for ${pluginId}:`, error);
		}
	}
}

