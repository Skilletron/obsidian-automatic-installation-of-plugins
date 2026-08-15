export interface InstallCommunityPluginsSettings {
	loadSettingsOnInstall: boolean;
	loadSettingsOnStartup: boolean;
	autoInstallPlugins: boolean;
	autoEnablePlugins: boolean;
	mergePluginSettings: boolean;
	logLevel?: "debug" | "info" | "warn" | "error" | "none";
}

export interface PluginListEntry {
	id: string;
	version?: string;
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
	loadSettingsOnInstall: false,
	loadSettingsOnStartup: false,
	autoInstallPlugins: false,
	autoEnablePlugins: false,
	mergePluginSettings: true,
	logLevel: "error",
};

export const PLUGIN_REGISTRY_URL =
	"https://raw.githubusercontent.com/obsidianmd/obsidian-releases/master/community-plugins.json";
export const PLUGIN_ID = "automatic-installation-of-plugins";
export const PLUGINS_LIST_FILE = "community-plugins-list.json";
export const PLUGINS_SETTINGS_FILE = "community-plugins-settings.json";
export const USER_AGENT = "obsidian-community-install-manager";
