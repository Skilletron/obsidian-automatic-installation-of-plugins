import {
	App,
	Plugin,
	PluginSettingTab,
	Setting,
	Notice,
} from "obsidian";
import * as path from "path";
import { FileManager } from "./src/utils/FileManager";
import { NetworkManager } from "./src/utils/NetworkManager";
import { SettingsManager } from "./src/core/SettingsManager";
import { PluginInstaller } from "./src/core/PluginInstaller";
import { PluginEnabler } from "./src/core/PluginEnabler";
import {
	InstallCommunityPluginsSettings,
	DEFAULT_SETTINGS,
	PLUGINS_LIST_FILE,
	PLUGINS_SETTINGS_FILE,
} from "./src/types";
import { logger, LogLevel } from "./src/utils/Logger";

/**
 * Plugin that automatically installs and configures community plugins
 * based on configuration files in the vault.
 */
export default class InstallCommunityPlugins extends Plugin {
	settings: InstallCommunityPluginsSettings;
	fileManager: FileManager;
	networkManager: NetworkManager;
	settingsManager: SettingsManager;
	pluginInstaller: PluginInstaller;
	pluginEnabler: PluginEnabler;

	async onload() {
		await this.loadSettings();

		// Initialize managers
		this.fileManager = new FileManager(this.app);
		this.networkManager = new NetworkManager();
		this.settingsManager = new SettingsManager(this.fileManager);
		this.pluginInstaller = new PluginInstaller(
			this.fileManager,
			this.networkManager,
			this.settingsManager,
			this.settings.loadSettingsOnInstall
		);
		this.pluginEnabler = new PluginEnabler(this.app, this.fileManager);

		if (this.settings.loadSettingsOnStartup) {
			this.applySettingsToInstalledPlugins();
		}

		if (this.settings.autoInstallPlugins) {
			new Notice("Starting community plugins installation...");
			await this.installPluginsFromFile();
			new Notice("Installation process finished.");
		}

		// Add command for manual installation
		this.addCommand({
			id: "install-plugins",
			name: "Install plugins from list",
			callback: async () => {
				new Notice("Starting manual plugin installation...");
				await this.installPluginsFromFile();
				new Notice("Manual installation finished.");
			},
		});

		this.addSettingTab(
			new InstallCommunityPluginsSettingTab(this.app, this)
		);
	}

	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			await this.loadData()
		);
		
		// Set log level from settings
		const logLevelMap: Record<string, LogLevel> = {
			debug: LogLevel.DEBUG,
			info: LogLevel.INFO,
			warn: LogLevel.WARN,
			error: LogLevel.ERROR,
			none: LogLevel.NONE,
		};
		const level = logLevelMap[this.settings.logLevel || "info"] || LogLevel.INFO;
		logger.setLevel(level);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	/**
	 * Applies settings from community-plugins-settings.json to installed plugins.
	 */
	applySettingsToInstalledPlugins() {
		try {
			const { basePath, configDir } = this.fileManager.getBasePathAndConfigDir();
			const pluginsFolder = path.join(basePath, configDir, "plugins");
			const settingsFile = path.join(basePath, configDir, PLUGINS_SETTINGS_FILE);

		this.settingsManager.applySettingsToInstalledPlugins(
			pluginsFolder,
			settingsFile
		);
		} catch (error) {
			const errorMessage =
				error instanceof Error ? error.message : "Unknown error";
			new Notice(
				`[Installer] Cannot access file system: ${errorMessage}`
			);
			logger.error("File system access error:", error);
		}
	}

	/**
	 * Installs plugins listed in community-plugins-list.json.
	 */
	async installPluginsFromFile() {
		try {
			const { basePath, configDir } = this.fileManager.getBasePathAndConfigDir();
			const pluginsJsonPath = path.join(
				basePath,
				configDir,
				PLUGINS_LIST_FILE
			);
			const pluginsFolder = path.join(basePath, configDir, "plugins");
			const settingsFile = path.join(basePath, configDir, PLUGINS_SETTINGS_FILE);

			if (!this.fileManager.fileExists(pluginsJsonPath)) {
				try {
					if (!this.fileManager.isFileSystemAccessible(pluginsJsonPath)) {
						new Notice(
							`[Installer] Cannot create ${PLUGINS_LIST_FILE}. Check file permissions.`
						);
						return;
					}
					this.fileManager.writeFile(pluginsJsonPath, "[]");
					new Notice(`[Installer] Created empty ${PLUGINS_LIST_FILE}`);
				} catch (error) {
					const errorMessage =
						error instanceof Error ? error.message : "Unknown error";
					new Notice(
						`[Installer] Failed to create ${PLUGINS_LIST_FILE}: ${errorMessage}`
					);
				logger.error(`Failed to create ${PLUGINS_LIST_FILE}:`, error);
				}
				return;
			}

			const content = this.fileManager.readFile(pluginsJsonPath);
			if (!content) {
				return;
			}

			const pluginIds = this.fileManager.parseJsonWithValidation<string[]>(
				content,
				PLUGINS_LIST_FILE
			);

			if (!pluginIds) {
				return;
			}

			if (!Array.isArray(pluginIds)) {
				new Notice(
					`[Installer] ${PLUGINS_LIST_FILE} must contain an array of plugin IDs.`
				);
				return;
			}

			if (pluginIds.length === 0) {
				new Notice("No plugins to install.");
				return;
			}

			// Validate plugin IDs are strings
			const invalidIds = pluginIds.filter(
				(id) => typeof id !== "string" || id.trim() === ""
			);
			if (invalidIds.length > 0) {
				new Notice(
					`[Installer] Invalid plugin IDs found in ${PLUGINS_LIST_FILE}. All entries must be non-empty strings.`
				);
				logger.warn("Invalid plugin IDs:", invalidIds);
			}

			// Install plugins with progress tracking
			const validPluginIds = pluginIds.filter(
				(id) => typeof id === "string" && id.trim() !== ""
			);
			const totalPlugins = validPluginIds.length;
			let installedCount = 0;

			for (let i = 0; i < validPluginIds.length; i++) {
				const pluginId = validPluginIds[i].trim();
				const current = i + 1;

				new Notice(
					`[Installer] Installing plugin ${current} of ${totalPlugins}: ${pluginId}...`
				);

				const success = await this.pluginInstaller.installPluginById(
					pluginId,
					pluginsFolder,
					settingsFile,
					(bytesDownloaded) => {
						// Progress callback for download
						const mb = (bytesDownloaded / 1024 / 1024).toFixed(2);
						logger.debug(`Downloaded ${mb} MB for ${pluginId}`);
					}
				);

				if (success) {
					installedCount++;
				}
			}

			// Auto-enable plugins if setting is enabled
			if (this.settings.autoEnablePlugins) {
				const result = await this.pluginEnabler.enableInstalledPlugins(
					validPluginIds,
					(current, total, pluginId) => {
						new Notice(
							`[Installer] Enabling plugin ${current} of ${total}: ${pluginId}...`
						);
					}
				);

				if (result.enabled > 0) {
					await this.pluginEnabler.refreshPluginsUI();
				}
			} else {
				// Even if auto-enable is off, refresh UI after installation
				await this.pluginEnabler.refreshPluginsUI();
			}

			// Show final summary
			if (installedCount === totalPlugins) {
				new Notice(
					`[Installer] Successfully installed ${installedCount} plugin${installedCount > 1 ? "s" : ""}.`
				);
			} else {
				new Notice(
					`[Installer] Installed ${installedCount} of ${totalPlugins} plugin${totalPlugins > 1 ? "s" : ""}.`
				);
			}
		} catch (error) {
			const errorMessage =
				error instanceof Error ? error.message : "Unknown error";
			new Notice(
				`[Installer] Error during installation: ${errorMessage}. See console for details.`
			);
			logger.error("Installation error:", error);
		}
	}
}

/**
 * Settings tab for the Automatic Plugin Manager plugin.
 */
class InstallCommunityPluginsSettingTab extends PluginSettingTab {
	plugin: InstallCommunityPlugins;

	constructor(app: App, plugin: InstallCommunityPlugins) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();

		new Setting(containerEl).setHeading().setName("Automatic plugin manager settings");

		// Security warning
		const warningDiv = containerEl.createDiv("setting-item-description");
		warningDiv.createEl("strong", {
			text: "⚠️ security warning: ",
		});
		warningDiv.appendText(
			"This plugin automatically downloads and installs plugins from the Obsidian Community Plugins registry. Only use this plugin with trusted vaults and review the community-plugins-list.json file before enabling."
		);
		warningDiv.setCssProps({
			color: "var(--text-warning)",
			marginBottom: "1.5em",
			padding: "0.75em",
			backgroundColor: "var(--background-modifier-border)",
			borderRadius: "4px",
		});

		new Setting(containerEl)
			.setName("🚀 auto-install plugins on startup")
			.setDesc(
				"Automatically install missing plugins from your `community-plugins-list.json` file when Obsidian starts. Perfect for keeping your vault's plugin setup synchronized across devices."
			)
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.autoInstallPlugins)
					.onChange(async (value) => {
						this.plugin.settings.autoInstallPlugins = value;
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName("⚡ auto-enable plugins after installation")
			.setDesc(
				"Automatically enable all installed plugins right after installation. The plugin list will be refreshed first to ensure newly installed plugins are recognized. This gives you a fully automated setup experience."
			)
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.autoEnablePlugins)
					.onChange(async (value) => {
						this.plugin.settings.autoEnablePlugins = value;
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName("⚙️ apply settings on installation")
			.setDesc(
				"When a plugin is installed, automatically apply its configuration from `community-plugins-settings.json`. This ensures your plugins are configured exactly as you want them from the moment they're installed."
			)
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.loadSettingsOnInstall)
					.onChange(async (value) => {
						this.plugin.settings.loadSettingsOnInstall = value;
						// Update pluginInstaller with new setting
						this.plugin.pluginInstaller = new PluginInstaller(
							this.plugin.fileManager,
							this.plugin.networkManager,
							this.plugin.settingsManager,
							value
						);
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName("🔄 sync settings on every startup")
			.setDesc(
				"On each Obsidian startup, re-apply plugin settings from `community-plugins-settings.json` to all installed plugins. This keeps your plugin configurations in sync even if you've made manual changes. Useful for maintaining consistent settings across multiple devices."
			)
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.loadSettingsOnStartup)
					.onChange(async (value) => {
						this.plugin.settings.loadSettingsOnStartup = value;
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName("📝 logging level")
			.setDesc(
				"Control how much information is logged to the console. Use Debug for troubleshooting, Info for normal operation, or Error to see only problems. Open the developer console (Ctrl+Shift+I) to view logs."
			)
			.addDropdown((dropdown) => {
				dropdown
					.addOption("debug", "🐛 debug (most verbose)")
					.addOption("info", "ℹ️ info (recommended)")
					.addOption("warn", "⚠️ warn (warnings only)")
					.addOption("error", "❌ error (errors only)")
					.addOption("none", "🔇 none (no logging)")
					.setValue(this.plugin.settings.logLevel || "info")
					.onChange(async (value: "debug" | "info" | "warn" | "error" | "none") => {
						this.plugin.settings.logLevel = value;
						await this.plugin.saveSettings();
						
						// Update logger level immediately
						const logLevelMap: Record<string, LogLevel> = {
							debug: LogLevel.DEBUG,
							info: LogLevel.INFO,
							warn: LogLevel.WARN,
							error: LogLevel.ERROR,
							none: LogLevel.NONE,
						};
						logger.setLevel(logLevelMap[value] || LogLevel.INFO);
					});
			});
	}
}
