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
	assets: Array<{
		name: string;
		browser_download_url: string;
	}>;
}

export interface PathInfo {
	basePath: string;
	configDir: string;
}

export const DEFAULT_SETTINGS: InstallCommunityPluginsSettings = {
	loadSettingsOnInstall: true,
	loadSettingsOnStartup: true,
	autoInstallPlugins: true,
	autoEnablePlugins: true,
	logLevel: "info",
};

// Constants
export const PLUGIN_REGISTRY_URL =
	"https://raw.githubusercontent.com/obsidianmd/obsidian-releases/master/community-plugins.json";
export const PLUGINS_LIST_FILE = "community-plugins-list.json";
export const PLUGINS_SETTINGS_FILE = "community-plugins-settings.json";
export const MAX_REDIRECTS = 5;
export const USER_AGENT = "obsidian-plugin-installer";
export const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100 MB
export const NETWORK_TIMEOUT = 30000; // 30 seconds
export const DOWNLOAD_TIMEOUT = 60000; // 60 seconds

