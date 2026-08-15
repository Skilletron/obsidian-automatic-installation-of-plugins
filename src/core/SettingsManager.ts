import { Notice } from "obsidian";
import { FileManager } from "../utils/FileManager";
import { PLUGINS_SETTINGS_FILE } from "../types";
import { logger } from "../utils/Logger";

/**
 * Deep-merge source onto target. Plain objects recurse; arrays and scalars
 * from source replace. Does not mutate inputs.
 */
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
		result[key] = mergeSettingsObjects(result[key], value);
	}
	return result;
}

/**
 * Manages plugin settings synchronization.
 */
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

	/**
	 * Applies settings from community-plugins-settings.json to installed plugins.
	 */
	async applySettingsToInstalledPlugins(): Promise<void> {
		const settingsFile = this.fileManager.configPath(PLUGINS_SETTINGS_FILE);

		if (!(await this.fileManager.exists(settingsFile))) {
			new Notice(
				`[Installer] No ${PLUGINS_SETTINGS_FILE} file found, skipping applying settings on startup`,
			);
			return;
		}

		const rawSettings = await this.fileManager.readFile(settingsFile);
		if (!rawSettings) {
			return;
		}

		const allSettings = this.fileManager.parseJsonWithValidation<
			Record<string, unknown>
		>(rawSettings, PLUGINS_SETTINGS_FILE);

		if (!allSettings) {
			return;
		}

		for (const pluginId of Object.keys(allSettings)) {
			const manifestPath = this.fileManager.pluginsPath(
				pluginId,
				"manifest.json",
			);
			const dataJsonPath = this.fileManager.pluginsPath(
				pluginId,
				"data.json",
			);

			if (
				(await this.fileManager.exists(manifestPath)) &&
				allSettings[pluginId]
			) {
				try {
					const payload = await this.resolvePayload(
						dataJsonPath,
						allSettings[pluginId],
					);
					const written = await this.fileManager.writeFile(
						dataJsonPath,
						JSON.stringify(payload, null, 2),
					);
					if (!written) {
						new Notice(
							`[Installer] Cannot write settings for plugin ${pluginId}. Check file permissions.`,
						);
					}
				} catch (err: unknown) {
					const errorMessage =
						err instanceof Error ? err.message : "Unknown error";
					new Notice(
						`[Installer] Failed to write data.json for plugin ${pluginId}: ${errorMessage}`,
					);
					logger.error(
						`Failed to write settings for ${pluginId}:`,
						err,
					);
				}
			}
		}
	}

	/**
	 * Applies settings for a specific plugin after installation.
	 */
	async applySettingsForPlugin(
		pluginId: string,
		pluginFolderId: string,
	): Promise<void> {
		const settingsFile = this.fileManager.configPath(PLUGINS_SETTINGS_FILE);

		if (!(await this.fileManager.exists(settingsFile))) {
			return;
		}

		try {
			const rawSettings = await this.fileManager.readFile(settingsFile);
			if (!rawSettings) {
				return;
			}

			const allSettings = this.fileManager.parseJsonWithValidation<
				Record<string, unknown>
			>(rawSettings, PLUGINS_SETTINGS_FILE);

			if (allSettings && allSettings[pluginId]) {
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

				const dataJsonPath = this.fileManager.pluginsPath(
					pluginFolderId,
					"data.json",
				);
				const payload = await this.resolvePayload(
					dataJsonPath,
					allSettings[pluginId],
				);
				await this.fileManager.writeFile(
					dataJsonPath,
					JSON.stringify(payload, null, 2),
				);
			}
		} catch (err: unknown) {
			const errorMessage =
				err instanceof Error ? err.message : "Unknown error";
			new Notice(
				`[Installer] Failed to apply settings for plugin ${pluginId}: ${errorMessage}`,
			);
			logger.error(`Settings apply error for ${pluginId}:`, err);
		}
	}
}
