import { Notice, Platform } from "obsidian";
import { FileManager } from "../utils/FileManager";
import {
	PLUGIN_ID,
	PLUGINS_LIST_FILE,
	PLUGINS_SETTINGS_FILE,
	PluginListEntry,
} from "../types";
import { scanInstalledPlugins } from "./InstalledPlugins";
import { SettingsBackup } from "./SettingsBackup";
import { redactSecrets } from "../utils/secrets";
import { logger } from "../utils/Logger";

export interface SecretOptions {
	redact: boolean;
	// Extra key names to treat as secrets (normalized, see parseSecretKeys).
	extraKeys: string[];
}

interface ExportedPlugin {
	folderName: string;
	pluginId: string;
	version?: string;
}

export class SetupExporter {
	constructor(
		private fileManager: FileManager,
		private isMobile: () => boolean = () => Platform.isMobile,
		private secretOptions: () => SecretOptions = () => ({
			redact: false,
			extraKeys: [],
		}),
		private backup?: SettingsBackup,
	) {}

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
		redactedCount: number;
	}> {
		const installed = await this.listInstalledPlugins();
		const listEntries: unknown[] = installed.map((p) => {
			const entry: PluginListEntry = { id: p.pluginId };
			if (p.version) {
				entry.version = p.version;
			}
			return entry;
		});
		const settings: Record<string, unknown> = {};
		const { redact, extraKeys } = this.secretOptions();
		let redactedCount = 0;

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
					if (redact) {
						const result = redactSecrets(parsed, extraKeys);
						settings[pluginId] = result.value;
						redactedCount += result.redacted;
					} else {
						settings[pluginId] = parsed;
					}
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

		// A phone usually has fewer plugins than the desktop it syncs with
		// (desktop-only ones cannot be installed there). Exporting on mobile
		// keeps list and settings entries for plugins missing on this device
		// instead of dropping them for every synced device.
		let keptCount = 0;
		if (this.isMobile()) {
			const installedIds = new Set(installed.map((p) => p.pluginId));
			const kept = await this.readEntriesNotInstalled(
				listPath,
				settingsPath,
				installedIds,
			);
			listEntries.push(...kept.listEntries);
			for (const [id, value] of Object.entries(kept.settings)) {
				if (!(id in settings)) {
					settings[id] = value;
				}
			}
			keptCount = kept.listEntries.length;
		}

		await this.backup?.capture(listPath);
		await this.backup?.capture(settingsPath);

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
			return { pluginCount: 0, settingsCount: 0, redactedCount: 0 };
		}

		const settingsCount = Object.keys(settings).length;
		const pinnedCount = installed.filter((p) => p.version).length;
		const keptNote =
			keptCount > 0
				? ` Kept ${keptCount} entr${keptCount === 1 ? "y" : "ies"} for plugins not installed on this device.`
				: "";
		const redactedNote =
			redactedCount > 0
				? ` Left out ${redactedCount} secret value${redactedCount === 1 ? "" : "s"} (tokens, passwords).`
				: "";
		new Notice(
			`[Installer] Exported ${installed.length} plugin${installed.length === 1 ? "" : "s"} (${pinnedCount} pinned, ${settingsCount} with settings) to ${PLUGINS_LIST_FILE} and ${PLUGINS_SETTINGS_FILE}.${keptNote}${redactedNote}`,
		);
		logger.info(
			`Exported ${listEntries.length} plugins (${pinnedCount} pinned), ${settingsCount} with settings.`,
		);

		return {
			pluginCount: listEntries.length,
			settingsCount,
			redactedCount,
		};
	}

	// Entries from the current files whose plugin is not installed here.
	// List items are kept as written, including fields this version does
	// not know about.
	private async readEntriesNotInstalled(
		listPath: string,
		settingsPath: string,
		installedIds: Set<string>,
	): Promise<{
		listEntries: unknown[];
		settings: Record<string, unknown>;
	}> {
		const listEntries: unknown[] = [];
		const settings: Record<string, unknown> = {};

		const rawList = await this.readJson(listPath);
		if (Array.isArray(rawList)) {
			const seen = new Set<string>();
			for (const item of rawList) {
				const id = listItemId(item);
				if (
					!id ||
					installedIds.has(id) ||
					id === PLUGIN_ID ||
					seen.has(id)
				) {
					continue;
				}
				seen.add(id);
				listEntries.push(item);
			}
		}

		const rawSettings = await this.readJson(settingsPath);
		if (
			rawSettings !== null &&
			typeof rawSettings === "object" &&
			!Array.isArray(rawSettings)
		) {
			for (const [id, value] of Object.entries(rawSettings)) {
				if (!installedIds.has(id) && id !== PLUGIN_ID) {
					settings[id] = value;
				}
			}
		}

		return { listEntries, settings };
	}

	private async readJson(path: string): Promise<unknown> {
		if (!(await this.fileManager.exists(path))) {
			return null;
		}
		const raw = await this.fileManager.readFile(path);
		if (!raw) {
			return null;
		}
		try {
			return JSON.parse(raw) as unknown;
		} catch {
			logger.warn(`Ignoring invalid JSON in ${path} while exporting.`);
			return null;
		}
	}
}

function listItemId(item: unknown): string | null {
	if (typeof item === "string") {
		return item.trim() || null;
	}
	if (item !== null && typeof item === "object" && !Array.isArray(item)) {
		const id = (item as { id?: unknown }).id;
		return typeof id === "string" && id.trim() ? id.trim() : null;
	}
	return null;
}
