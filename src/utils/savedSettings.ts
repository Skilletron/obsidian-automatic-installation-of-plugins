import {
	DEFAULT_SETTINGS,
	InstallCommunityPluginsSettings,
	PLUGINS_LIST_FILE,
	PLUGINS_SETTINGS_FILE,
} from "../types";
import { FileManager } from "./FileManager";

// Older versions only saved their settings once one was changed, so a vault
// without saved settings may still have used this plugin. Its export files
// give it away.
export async function usedBefore(fileManager: FileManager): Promise<boolean> {
	for (const file of [PLUGINS_LIST_FILE, PLUGINS_SETTINGS_FILE]) {
		if (await fileManager.exists(fileManager.configPath(file))) {
			return true;
		}
	}
	return false;
}

// The saved settings with defaults for anything missing. An install from
// before an option existed keeps behaving as it did, so updating doesn't
// change what Export and Import do.
export function settingsFromSaved(
	data: Partial<InstallCommunityPluginsSettings> | null | undefined,
	usedBefore: boolean,
): InstallCommunityPluginsSettings {
	const settings = Object.assign({}, DEFAULT_SETTINGS, data ?? {});
	if (data && data.mergePluginSettings === undefined) {
		settings.mergePluginSettings = false;
	}
	if (data || usedBefore) {
		if (data?.redactSecretsOnExport === undefined) {
			settings.redactSecretsOnExport = false;
		}
		if (data?.syncVaultSetup === undefined) {
			settings.syncVaultSetup = false;
		}
	}
	return settings;
}
