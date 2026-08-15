export interface InstallCommunityPluginsSettings {
	loadSettingsOnInstall: boolean;
	loadSettingsOnStartup: boolean;
	autoInstallPlugins: boolean;
	autoEnablePlugins: boolean;
	logLevel?: "debug" | "info" | "warn" | "error" | "none";
}

export interface PluginRegistryEntry {
	id: string;
	repo: string;
	name?: string;
	description?: string;
}

export interface GitHubRelease {
	tag_name?: string;
	prerelease?: boolean;
	draft?: boolean;
	assets: Array<{
		name: string;
		browser_download_url: string;
	}>;
}

export const DEFAULT_SETTINGS: InstallCommunityPluginsSettings = {
	loadSettingsOnInstall: true,
	loadSettingsOnStartup: true,
	autoInstallPlugins: true,
	autoEnablePlugins: true,
	logLevel: "error",
};

// Constants
export const PLUGIN_REGISTRY_URL =
	"https://raw.githubusercontent.com/obsidianmd/obsidian-releases/master/community-plugins.json";
export const PLUGINS_LIST_FILE = "community-plugins-list.json";
export const PLUGINS_SETTINGS_FILE = "community-plugins-settings.json";
export const USER_AGENT = "obsidian-plugin-installer";

