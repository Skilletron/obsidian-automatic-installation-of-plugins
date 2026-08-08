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
			this.app,
			this.fileManager,
			this.networkManager,
			this.settingsManager,
			this.settings.loadSettingsOnInstall
		);
		this.pluginEnabler = new PluginEnabler(this.app, this.fileManager);

		// Add command for manual installation
		this.addCommand({
			id: "install-plugins",
			name: "Install plugins from list",
			callback: async () => {
				new Notice("Starting manual plugin installation...");
				await this.runInstallPipeline();
				new Notice("Manual installation finished.");
			},
		});

		this.addSettingTab(
			new InstallCommunityPluginsSettingTab(this.app, this)
		);

		// Wait for workspace layout — enabling plugins like Recent Files needs side leaves.
		this.app.workspace.onLayoutReady(() => {
			void this.onWorkspaceReady();
		});
	}

	/**
	 * Startup work that touches other plugins / the workspace.
	 */
	private async onWorkspaceReady(): Promise<void> {
		try {
			if (this.settings.loadSettingsOnStartup) {
				this.applySettingsToInstalledPlugins();
			}

			if (this.settings.autoInstallPlugins) {
				new Notice("Starting community plugins installation...");
				await this.runInstallPipeline();
				new Notice("Installation process finished.");
			}
		} catch (error) {
			logger.error("Startup install pipeline failed:", error);
			new Notice(
				"[Installer] Startup install failed. See console for details."
			);
		}
	}

	/**
	 * Install from list, then enable (shared by startup + command).
	 */
	private async runInstallPipeline(): Promise<void> {
		await this.installPluginsFromFile();
	}

	async loadSettings() {
		const data = (await this.loadData()) as
			| Partial<InstallCommunityPluginsSettings>
			| null
			| undefined;
		this.settings = Object.assign({}, DEFAULT_SETTINGS, data ?? {});
		
		// Set log level from settings
		const logLevelMap: Record<string, LogLevel> = {
			debug: LogLevel.DEBUG,
			info: LogLevel.INFO,
			warn: LogLevel.WARN,
			error: LogLevel.ERROR,
			none: LogLevel.NONE,
		};
		const level = logLevelMap[this.settings.logLevel || "error"] || LogLevel.ERROR;
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
 * Settings tab for Community Install Manager.
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

		const warningDiv = containerEl.createDiv({
			cls: "community-install-manager-warning setting-item-description",
		});
		warningDiv.createEl("strong", {
			text: "Security warning: ",
		});
		warningDiv.appendText(
			"This downloads and installs community plugins from the Obsidian registry and GitHub releases. Only use it with trusted vaults, and review community-plugins-list.json before enabling."
		);

		new Setting(containerEl)
			.setName("Auto-install plugins on startup")
			.setDesc(
				"Install missing plugins listed in community-plugins-list.json when Obsidian starts."
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
			.setName("Auto-enable plugins after installation")
			.setDesc(
				"Enable installed plugins after installation. The plugin list is refreshed first so newly installed plugins are recognized."
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
			.setName("Apply settings on installation")
			.setDesc(
				"After installing a plugin, apply its configuration from community-plugins-settings.json."
			)
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.loadSettingsOnInstall)
					.onChange(async (value) => {
						this.plugin.settings.loadSettingsOnInstall = value;
						this.plugin.pluginInstaller = new PluginInstaller(
							this.plugin.app,
							this.plugin.fileManager,
							this.plugin.networkManager,
							this.plugin.settingsManager,
							value
						);
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName("Sync settings on every startup")
			.setDesc(
				"On each startup, re-apply settings from community-plugins-settings.json to installed plugins."
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
			.setName("Logging level")
			.setDesc(
				"How much to log to the developer console (Ctrl/Cmd+Shift+I). Use Debug only while troubleshooting."
			)
			.addDropdown((dropdown) => {
				dropdown
					.addOption("debug", "Debug (most verbose)")
					.addOption("info", "Info")
					.addOption("warn", "Warn")
					.addOption("error", "Error (recommended)")
					.addOption("none", "None")
					.setValue(this.plugin.settings.logLevel || "error")
					.onChange(async (value: "debug" | "info" | "warn" | "error" | "none") => {
						this.plugin.settings.logLevel = value;
						await this.plugin.saveSettings();

						const logLevelMap: Record<string, LogLevel> = {
							debug: LogLevel.DEBUG,
							info: LogLevel.INFO,
							warn: LogLevel.WARN,
							error: LogLevel.ERROR,
							none: LogLevel.NONE,
						};
						logger.setLevel(logLevelMap[value] || LogLevel.ERROR);
					});
			});
	}
}
