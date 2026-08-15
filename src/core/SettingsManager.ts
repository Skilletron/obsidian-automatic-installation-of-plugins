import { Notice } from "obsidian";
import { FileManager } from "../utils/FileManager";
import { PLUGINS_SETTINGS_FILE } from "../types";
import { isSafePluginId } from "../utils/parsePluginList";
import { logger } from "../utils/Logger";

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

	async applySettingsToInstalledPlugins(): Promise<string[]> {
		const settingsFile = this.fileManager.configPath(PLUGINS_SETTINGS_FILE);

		if (!(await this.fileManager.exists(settingsFile))) {
			new Notice(
				`[Installer] No ${PLUGINS_SETTINGS_FILE} file found, skipping applying settings on startup`,
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

		const applied: string[] = [];

		for (const pluginId of Object.keys(allSettings)) {
			if (!isSafePluginId(pluginId)) {
				logger.warn(
					`Skipping settings for unsafe plugin id: ${pluginId}`,
				);
				continue;
			}

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
					} else {
						applied.push(pluginId);
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

		return applied;
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
