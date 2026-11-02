import { Notice } from "obsidian";
import { FileManager } from "../utils/FileManager";
import {
	PLUGIN_ID,
	PLUGINS_LIST_FILE,
	PLUGINS_SETTINGS_FILE,
	PluginListEntry,
} from "../types";
import { scanInstalledPlugins } from "./InstalledPlugins";
import { logger } from "../utils/Logger";

interface ExportedPlugin {
	folderName: string;
	pluginId: string;
	version?: string;
}

export class SetupExporter {
	constructor(private fileManager: FileManager) {}

	async listInstalledPlugins(): Promise<ExportedPlugin[]> {
		const scanned = await scanInstalledPlugins(this.fileManager);
		const installed: ExportedPlugin[] = [];
		const seenIds = new Set<string>();

		for (const { folderName, pluginId, version, complete } of scanned) {
			if (
				!complete ||
				folderName === PLUGIN_ID ||
				pluginId === PLUGIN_ID ||
				seenIds.has(pluginId)
			) {
				continue;
			}
			seenIds.add(pluginId);
			installed.push({ folderName, pluginId, version });
		}

		installed.sort((a, b) => a.pluginId.localeCompare(b.pluginId));

		return installed;
	}

	async exportSetup(): Promise<{
		pluginCount: number;
		settingsCount: number;
	}> {
		this.fileManager.assertDesktopAdapter();

		const installed = await this.listInstalledPlugins();
		const listEntries: PluginListEntry[] = installed.map((p) => {
			const entry: PluginListEntry = { id: p.pluginId };
			if (p.version) {
				entry.version = p.version;
			}
			return entry;
		});
		const settings: Record<string, unknown> = {};

		for (const { folderName, pluginId } of installed) {
			const dataPath = this.fileManager.pluginsPath(
				folderName,
				"data.json",
			);
			if (!(await this.fileManager.exists(dataPath))) {
				continue;
			}

			const raw = await this.fileManager.readFile(dataPath);
			if (!raw) {
				continue;
			}

			try {
				const parsed: unknown = JSON.parse(raw);
				if (
					parsed !== null &&
					typeof parsed === "object" &&
					!Array.isArray(parsed)
				) {
					settings[pluginId] = parsed;
				} else {
					logger.warn(
						`Skipping settings for "${pluginId}": data.json is not an object.`,
					);
				}
			} catch (err: unknown) {
				logger.warn(
					`Skipping settings for "${pluginId}": invalid data.json.`,
					err,
				);
			}
		}

		const listPath = this.fileManager.configPath(PLUGINS_LIST_FILE);
		const settingsPath = this.fileManager.configPath(PLUGINS_SETTINGS_FILE);

		const listWritten = await this.fileManager.writeFile(
			listPath,
			`${JSON.stringify(listEntries, null, 2)}\n`,
		);
		const settingsWritten = await this.fileManager.writeFile(
			settingsPath,
			`${JSON.stringify(settings, null, 2)}\n`,
		);

		if (!listWritten || !settingsWritten) {
			new Notice(
				"[Installer] Export failed: could not write setup JSON files.",
			);
			return { pluginCount: 0, settingsCount: 0 };
		}

		const settingsCount = Object.keys(settings).length;
		const pinnedCount = listEntries.filter((e) => e.version).length;
		new Notice(
			`[Installer] Exported ${listEntries.length} plugin${listEntries.length === 1 ? "" : "s"} (${pinnedCount} pinned, ${settingsCount} with settings) to ${PLUGINS_LIST_FILE} and ${PLUGINS_SETTINGS_FILE}.`,
		);
		logger.info(
			`Exported ${listEntries.length} plugins (${pinnedCount} pinned), ${settingsCount} with settings.`,
		);

		return {
			pluginCount: listEntries.length,
			settingsCount,
		};
	}
}
