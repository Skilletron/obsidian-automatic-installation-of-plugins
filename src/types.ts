export interface InstallCommunityPluginsSettings {
	loadSettingsOnInstall: boolean;
	loadSettingsOnStartup: boolean;
	autoInstallPlugins: boolean;
	autoEnablePlugins: boolean;
	mergePluginSettings: boolean;
	// Lets auto-install and settings sync on startup run on phones and tablets.
	allowAutoActionsOnMobile: boolean;
	// Replace tokens, passwords and similar values on export.
	redactSecretsOnExport: boolean;
	// Comma-separated extra setting names to treat as secrets.
	extraSecretKeys: string;
	// Export and import the theme and CSS snippets too.
	syncAppearance: boolean;
	logLevel?: "debug" | "info" | "warn" | "error" | "none";
}

export type DeviceKind = "desktop" | "mobile";

export interface PluginListEntry {
	id: string;
	version?: string;
	// Only install on these kinds of device; all devices when unset.
	devices?: DeviceKind[];
	// false: Import installs the plugin but leaves it turned off.
	enabled?: boolean;
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
	loadSettingsOnStartup: false,
	autoInstallPlugins: false,
	autoEnablePlugins: true,
	mergePluginSettings: true,
	allowAutoActionsOnMobile: false,
	redactSecretsOnExport: true,
	extraSecretKeys: "",
	syncAppearance: true,
	logLevel: "error",
};

export const PLUGIN_REGISTRY_URL =
	"https://raw.githubusercontent.com/obsidianmd/obsidian-releases/master/community-plugins.json";
export const PLUGIN_ID = "automatic-installation-of-plugins";
export const PLUGINS_LIST_FILE = "community-plugins-list.json";
export const PLUGINS_SETTINGS_FILE = "community-plugins-settings.json";
export const APPEARANCE_FILE = "community-appearance.json";
export const COMMUNITY_THEMES_URL =
	"https://raw.githubusercontent.com/obsidianmd/obsidian-releases/master/community-css-themes.json";
export const USER_AGENT = "obsidian-community-install-manager";
