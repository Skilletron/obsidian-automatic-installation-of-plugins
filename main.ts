import { App, Plugin, PluginSettingTab, Setting, Notice } from "obsidian";
import { FileManager } from "./src/utils/FileManager";
import { NetworkManager } from "./src/utils/NetworkManager";
import { SettingsManager } from "./src/core/SettingsManager";
import { PluginInstaller } from "./src/core/PluginInstaller";
import { PluginEnabler } from "./src/core/PluginEnabler";
import { SetupExporter } from "./src/core/SetupExporter";
import { SetupPreview, SetupPreviewModal } from "./src/core/SetupPreview";
import {
	InstallCommunityPluginsSettings,
	DEFAULT_SETTINGS,
	PLUGINS_LIST_FILE,
} from "./src/types";
import { parsePluginList } from "./src/utils/parsePluginList";
import { logger, LogLevel } from "./src/utils/Logger";

export default class InstallCommunityPlugins extends Plugin {
	settings!: InstallCommunityPluginsSettings;
	fileManager!: FileManager;
	networkManager!: NetworkManager;
	settingsManager!: SettingsManager;
	pluginInstaller!: PluginInstaller;
	pluginEnabler!: PluginEnabler;
	setupExporter!: SetupExporter;
	setupPreview!: SetupPreview;

	async onload() {
		await this.loadSettings();

		this.fileManager = new FileManager(this.app);
		this.networkManager = new NetworkManager();
		this.settingsManager = new SettingsManager(
			this.fileManager,
			() => this.settings.mergePluginSettings,
		);
		this.pluginInstaller = new PluginInstaller(
			this.app,
			this.fileManager,
			this.networkManager,
			this.settingsManager,
			() => this.settings.loadSettingsOnInstall,
		);
		this.pluginEnabler = new PluginEnabler(this.app, this.fileManager);
		this.setupExporter = new SetupExporter(this.fileManager);
		this.setupPreview = new SetupPreview(this.fileManager);

		this.addCommand({
			id: "export-plugin-setup",
			name: "Export plugin setup to JSON",
			callback: async () => {
				await this.exportPluginSetup();
			},
		});

		this.addCommand({
			id: "preview-plugin-setup",
			name: "Preview plugin setup import",
			callback: async () => {
				await this.previewPluginSetup();
			},
		});

		this.addCommand({
			id: "import-plugin-setup",
			name: "Import plugin setup from JSON",
			callback: async () => {
				new Notice("Starting plugin setup import...");
				await this.runImportPipeline();
				new Notice("Plugin setup import finished.");
			},
		});

		this.addCommand({
			id: "apply-plugin-settings",
			name: "Apply settings from JSON",
			callback: async () => {
				new Notice("Applying plugin settings...");
				await this.applySettingsToInstalledPlugins();
			},
		});

		this.addSettingTab(
			new InstallCommunityPluginsSettingTab(this.app, this),
		);

		this.app.workspace.onLayoutReady(() => {
			void this.onWorkspaceReady();
		});
	}

	private async onWorkspaceReady(): Promise<void> {
		try {
			if (this.settings.loadSettingsOnStartup) {
				await this.applySettingsToInstalledPlugins();
			}

			if (this.settings.autoInstallPlugins) {
				new Notice("Starting community plugins installation...");
				await this.runImportPipeline();
				new Notice("Installation process finished.");
			}
		} catch (err: unknown) {
			logger.error("Startup install pipeline failed:", err);
			new Notice(
				"[Installer] Startup install failed. See console for details.",
			);
		}
	}

	async runImportPipeline(): Promise<void> {
		await this.installPluginsFromFile();
	}

	async exportPluginSetup(): Promise<void> {
		try {
			await this.setupExporter.exportSetup();
		} catch (err: unknown) {
			const errorMessage =
				err instanceof Error ? err.message : "Unknown error";
			new Notice(`[Installer] Export failed: ${errorMessage}`);
			logger.error("Export failed:", err);
		}
	}

	async previewPluginSetup(): Promise<void> {
		try {
			const report = await this.setupPreview.buildReport(
				this.settings.loadSettingsOnInstall,
			);
			if (!report) {
				return;
			}
			logger.info(
				"Import preview:\n" +
					this.setupPreview.formatReportText(report),
			);
			new SetupPreviewModal(this.app, report).open();
			new Notice(
				`[Installer] Preview: install ${report.summary.install}, skip ${report.summary.skip}, re-pin ${report.summary.repin}.`,
			);
		} catch (err: unknown) {
			const errorMessage =
				err instanceof Error ? err.message : "Unknown error";
			new Notice(`[Installer] Preview failed: ${errorMessage}`);
			logger.error("Preview failed:", err);
		}
	}

	async loadSettings() {
		const data = (await this.loadData()) as
			| Partial<InstallCommunityPluginsSettings>
			| null
			| undefined;
		this.settings = Object.assign({}, DEFAULT_SETTINGS, data ?? {});

		if (data && data.mergePluginSettings === undefined) {
			this.settings.mergePluginSettings = false;
		}

		this.applyLogLevel(this.settings.logLevel || "error");
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	applyLogLevel(level: InstallCommunityPluginsSettings["logLevel"]): void {
		const logLevelMap: Record<string, LogLevel> = {
			debug: LogLevel.DEBUG,
			info: LogLevel.INFO,
			warn: LogLevel.WARN,
			error: LogLevel.ERROR,
			none: LogLevel.NONE,
		};
		logger.setLevel(logLevelMap[level || "error"] || LogLevel.ERROR);
	}

	async applySettingsToInstalledPlugins(): Promise<void> {
		try {
			this.fileManager.assertDesktopAdapter();
			const applied =
				await this.settingsManager.applySettingsToInstalledPlugins();
			if (applied.length === 0) {
				return;
			}

			const reloaded =
				await this.pluginEnabler.reloadEnabledPlugins(applied);
			await this.pluginEnabler.refreshPluginsUI();

			new Notice(
				reloaded > 0
					? `[Installer] Applied settings to ${applied.length} plugin${applied.length === 1 ? "" : "s"} (${reloaded} reloaded).`
					: `[Installer] Applied settings to ${applied.length} plugin${applied.length === 1 ? "" : "s"}.`,
			);
		} catch (err: unknown) {
			const errorMessage =
				err instanceof Error ? err.message : "Unknown error";
			new Notice(
				`[Installer] Cannot access file system: ${errorMessage}`,
			);
			logger.error("File system access error:", err);
		}
	}

	async installPluginsFromFile() {
		try {
			this.fileManager.assertDesktopAdapter();
			this.pluginInstaller.clearCaches();
			const pluginsJsonPath =
				this.fileManager.configPath(PLUGINS_LIST_FILE);

			if (!(await this.fileManager.exists(pluginsJsonPath))) {
				try {
					const created = await this.fileManager.writeFile(
						pluginsJsonPath,
						"[]",
					);
					if (!created) {
						new Notice(
							`[Installer] Cannot create ${PLUGINS_LIST_FILE}. Check file permissions.`,
						);
						return;
					}
					new Notice(
						`[Installer] Created empty ${PLUGINS_LIST_FILE}`,
					);
				} catch (err: unknown) {
					const errorMessage =
						err instanceof Error ? err.message : "Unknown error";
					new Notice(
						`[Installer] Failed to create ${PLUGINS_LIST_FILE}: ${errorMessage}`,
					);
					logger.error(`Failed to create ${PLUGINS_LIST_FILE}:`, err);
				}
				return;
			}

			const content = await this.fileManager.readFile(pluginsJsonPath);
			if (!content) {
				return;
			}

			let rawList: unknown;
			try {
				rawList = JSON.parse(content) as unknown;
			} catch (err: unknown) {
				const errorMessage =
					err instanceof Error ? err.message : "Unknown error";
				new Notice(
					`[Installer] Invalid JSON in ${PLUGINS_LIST_FILE}: ${errorMessage}.`,
				);
				logger.error(`JSON parse error in ${PLUGINS_LIST_FILE}:`, err);
				return;
			}

			const entries = parsePluginList(rawList);
			if (!entries) {
				return;
			}

			if (entries.length === 0) {
				new Notice("No plugins to install.");
				return;
			}

			const totalPlugins = entries.length;
			let installedCount = 0;

			for (let i = 0; i < entries.length; i++) {
				const entry = entries[i];
				const current = i + 1;
				const label = entry.version
					? `${entry.id}@${entry.version}`
					: entry.id;

				new Notice(
					`[Installer] Installing plugin ${current} of ${totalPlugins}: ${label}...`,
				);

				const success = await this.pluginInstaller.installPlugin(entry);

				if (success) {
					installedCount++;
				}
			}

			if (this.settings.autoEnablePlugins) {
				const result = await this.pluginEnabler.enableInstalledPlugins(
					entries.map((e) => e.id),
					(current, total, pluginId) => {
						new Notice(
							`[Installer] Enabling plugin ${current} of ${total}: ${pluginId}...`,
						);
					},
				);
				if (result.failed > 0) {
					logger.warn(
						"Some plugins failed to enable:",
						result.failedPlugins,
					);
				}
			} else {
				new Notice(
					"[Installer] Auto-enable is off; plugins were installed but not turned on.",
				);
			}

			await this.pluginEnabler.refreshPluginsUI();

			if (installedCount === totalPlugins) {
				new Notice(
					`[Installer] Successfully installed ${installedCount} plugin${installedCount > 1 ? "s" : ""}.`,
				);
			} else {
				new Notice(
					`[Installer] Installed ${installedCount} of ${totalPlugins} plugin${totalPlugins > 1 ? "s" : ""}.`,
				);
			}
		} catch (err: unknown) {
			const errorMessage =
				err instanceof Error ? err.message : "Unknown error";
			new Notice(
				`[Installer] Error during installation: ${errorMessage}. See console for details.`,
			);
			logger.error("Installation error:", err);
		} finally {
			this.pluginInstaller.clearCaches();
		}
	}
}

class InstallCommunityPluginsSettingTab extends PluginSettingTab {
	plugin: InstallCommunityPlugins;

	constructor(app: App, plugin: InstallCommunityPlugins) {
		super(app, plugin);
		this.plugin = plugin;
	}

	private addExportImportButtons(containerEl?: HTMLElement): void {
		const target = containerEl ?? this.containerEl;

		new Setting(target)
			.setName("Preview import")
			.setDesc(
				"See which plugins would be installed, skipped, or updated, and which settings would change — without changing your vault.",
			)
			.addButton((button) =>
				button.setButtonText("Preview").onClick(async () => {
					button.setDisabled(true);
					try {
						await this.plugin.previewPluginSetup();
					} finally {
						button.setDisabled(false);
					}
				}),
			);

		new Setting(target)
			.setName("Export plugin setup")
			.setDesc(
				`Save your installed community plugins and their settings into the JSON files in ${this.app.vault.configDir}.`,
			)
			.addButton((button) =>
				button.setButtonText("Export").onClick(async () => {
					button.setDisabled(true);
					try {
						await this.plugin.exportPluginSetup();
					} finally {
						button.setDisabled(false);
					}
				}),
			);

		new Setting(target)
			.setName("Import plugin setup")
			.setDesc(
				"Install plugins from the list file. Enabling and applying settings follow the options below.",
			)
			.addButton((button) =>
				button.setButtonText("Import").onClick(async () => {
					button.setDisabled(true);
					try {
						new Notice("Starting plugin setup import...");
						await this.plugin.runImportPipeline();
						new Notice("Plugin setup import finished.");
					} finally {
						button.setDisabled(false);
					}
				}),
			);

		new Setting(target)
			.setName("Apply settings")
			.setDesc(
				"Update installed plugins from the settings file without reinstalling them.",
			)
			.addButton((button) =>
				button.setButtonText("Apply").onClick(async () => {
					button.setDisabled(true);
					try {
						new Notice("Applying plugin settings...");
						await this.plugin.applySettingsToInstalledPlugins();
					} finally {
						button.setDisabled(false);
					}
				}),
			);
	}

	getSettingDefinitions() {
		return [
			{
				name: "Security warning",
				desc: "This can download and install community plugins. Only use it with trusted vaults, and review your plugin list before enabling auto-install.",
			},
			{
				name: "Export / Import",
				desc: `Manage the plugin list and settings files in ${this.app.vault.configDir}.`,
				render: (setting: Setting) => {
					setting.addButton((button) =>
						button.setButtonText("Preview").onClick(async () => {
							await this.plugin.previewPluginSetup();
						}),
					);
					setting.addButton((button) =>
						button.setButtonText("Export").onClick(async () => {
							await this.plugin.exportPluginSetup();
						}),
					);
					setting.addButton((button) =>
						button.setButtonText("Import").onClick(async () => {
							new Notice("Starting plugin setup import...");
							await this.plugin.runImportPipeline();
							new Notice("Plugin setup import finished.");
						}),
					);
					setting.addButton((button) =>
						button
							.setButtonText("Apply settings")
							.onClick(async () => {
								new Notice("Applying plugin settings...");
								await this.plugin.applySettingsToInstalledPlugins();
							}),
					);
				},
			},
			{
				name: "Auto-install plugins on startup",
				desc: "When Obsidian starts, install any plugins from your list that are not installed yet.",
				render: (setting: Setting) => {
					setting.addToggle((toggle) =>
						toggle
							.setValue(this.plugin.settings.autoInstallPlugins)
							.onChange(async (value) => {
								this.plugin.settings.autoInstallPlugins = value;
								await this.plugin.saveSettings();
							}),
					);
				},
			},
			{
				name: "Auto-enable plugins after installation",
				desc: "Turn plugins on after they are installed.",
				render: (setting: Setting) => {
					setting.addToggle((toggle) =>
						toggle
							.setValue(this.plugin.settings.autoEnablePlugins)
							.onChange(async (value) => {
								this.plugin.settings.autoEnablePlugins = value;
								await this.plugin.saveSettings();
							}),
					);
				},
			},
			{
				name: "Apply settings on installation",
				desc: "After installing a plugin, apply its settings from your settings file.",
				render: (setting: Setting) => {
					setting.addToggle((toggle) =>
						toggle
							.setValue(this.plugin.settings.loadSettingsOnInstall)
							.onChange(async (value) => {
								this.plugin.settings.loadSettingsOnInstall = value;
								await this.plugin.saveSettings();
							}),
					);
				},
			},
			{
				name: "Merge settings instead of replace",
				desc: "Update matching settings and keep the rest. When off, the plugin’s saved settings are replaced entirely.",
				render: (setting: Setting) => {
					setting.addToggle((toggle) =>
						toggle
							.setValue(this.plugin.settings.mergePluginSettings)
							.onChange(async (value) => {
								this.plugin.settings.mergePluginSettings = value;
								await this.plugin.saveSettings();
							}),
					);
				},
			},
			{
				name: "Sync settings on every startup",
				desc: "Each time Obsidian starts, apply your settings file to installed plugins.",
				render: (setting: Setting) => {
					setting.addToggle((toggle) =>
						toggle
							.setValue(this.plugin.settings.loadSettingsOnStartup)
							.onChange(async (value) => {
								this.plugin.settings.loadSettingsOnStartup = value;
								await this.plugin.saveSettings();
							}),
					);
				},
			},
			{
				name: "Logging level",
				desc: "How much detail to show in the console if something goes wrong. Leave on Error unless you are troubleshooting.",
				render: (setting: Setting) => {
					setting.addDropdown((dropdown) => {
						dropdown
							.addOption("debug", "Debug (most detail)")
							.addOption("info", "Info")
							.addOption("warn", "Warn")
							.addOption("error", "Error (recommended)")
							.addOption("none", "None")
							.setValue(this.plugin.settings.logLevel || "error")
							.onChange(
								async (
									value:
										| "debug"
										| "info"
										| "warn"
										| "error"
										| "none",
								) => {
									this.plugin.settings.logLevel = value;
									await this.plugin.saveSettings();
									this.plugin.applyLogLevel(value);
								},
							);
					});
				},
			},
		];
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
			"This can download and install community plugins. Only use it with trusted vaults, and review your plugin list before enabling auto-install.",
		);

		this.addExportImportButtons(containerEl);

		new Setting(containerEl)
			.setName("Auto-install plugins on startup")
			.setDesc(
				"When Obsidian starts, install any plugins from your list that are not installed yet.",
			)
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.autoInstallPlugins)
					.onChange(async (value) => {
						this.plugin.settings.autoInstallPlugins = value;
						await this.plugin.saveSettings();
					}),
			);

		new Setting(containerEl)
			.setName("Auto-enable plugins after installation")
			.setDesc("Turn plugins on after they are installed.")
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.autoEnablePlugins)
					.onChange(async (value) => {
						this.plugin.settings.autoEnablePlugins = value;
						await this.plugin.saveSettings();
					}),
			);

		new Setting(containerEl)
			.setName("Apply settings on installation")
			.setDesc(
				"After installing a plugin, apply its settings from your settings file.",
			)
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.loadSettingsOnInstall)
					.onChange(async (value) => {
						this.plugin.settings.loadSettingsOnInstall = value;
						await this.plugin.saveSettings();
					}),
			);

		new Setting(containerEl)
			.setName("Merge settings instead of replace")
			.setDesc(
				"Update matching settings and keep the rest. When off, the plugin’s saved settings are replaced entirely.",
			)
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.mergePluginSettings)
					.onChange(async (value) => {
						this.plugin.settings.mergePluginSettings = value;
						await this.plugin.saveSettings();
					}),
			);

		new Setting(containerEl)
			.setName("Sync settings on every startup")
			.setDesc(
				"Each time Obsidian starts, apply your settings file to installed plugins.",
			)
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.loadSettingsOnStartup)
					.onChange(async (value) => {
						this.plugin.settings.loadSettingsOnStartup = value;
						await this.plugin.saveSettings();
					}),
			);

		new Setting(containerEl)
			.setName("Logging level")
			.setDesc(
				"How much detail to show in the console if something goes wrong. Leave on Error unless you are troubleshooting.",
			)
			.addDropdown((dropdown) => {
				dropdown
					.addOption("debug", "Debug (most detail)")
					.addOption("info", "Info")
					.addOption("warn", "Warn")
					.addOption("error", "Error (recommended)")
					.addOption("none", "None")
					.setValue(this.plugin.settings.logLevel || "error")
					.onChange(
						async (
							value: "debug" | "info" | "warn" | "error" | "none",
						) => {
							this.plugin.settings.logLevel = value;
							await this.plugin.saveSettings();
							this.plugin.applyLogLevel(value);
						},
					);
			});
	}
}
