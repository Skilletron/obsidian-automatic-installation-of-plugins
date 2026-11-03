import {
	App,
	Platform,
	Plugin,
	PluginSettingTab,
	Setting,
	Notice,
} from "obsidian";
import { FileManager } from "./src/utils/FileManager";
import { NetworkManager } from "./src/utils/NetworkManager";
import { SettingsManager } from "./src/core/SettingsManager";
import { PluginInstaller } from "./src/core/PluginInstaller";
import { PluginEnabler } from "./src/core/PluginEnabler";
import { SetupExporter } from "./src/core/SetupExporter";
import { SetupPreview, SetupPreviewModal } from "./src/core/SetupPreview";
import { SettingsBackup } from "./src/core/SettingsBackup";
import { ProgressNotice } from "./src/utils/ProgressNotice";
import {
	PluginUpdate,
	UpdateChecker,
	updatePinsInList,
} from "./src/core/UpdateChecker";
import { UpdatesModal } from "./src/core/UpdatesModal";
import {
	AppearanceApplier,
	liveAppearance,
	parseAppearance,
} from "./src/core/Appearance";
import { parseSecretKeys } from "./src/utils/secrets";
import {
	InstallCommunityPluginsSettings,
	DEFAULT_SETTINGS,
	PLUGINS_LIST_FILE,
	APPEARANCE_FILE,
} from "./src/types";
import {
	isForThisDevice,
	parsePluginList,
} from "./src/utils/parsePluginList";
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
	settingsBackup!: SettingsBackup;
	updateChecker!: UpdateChecker;
	appearanceApplier!: AppearanceApplier;
	private busy = false;

	async onload() {
		await this.loadSettings();

		this.fileManager = new FileManager(this.app);
		this.networkManager = new NetworkManager();
		this.settingsBackup = new SettingsBackup(this.fileManager);
		this.settingsManager = new SettingsManager(
			this.fileManager,
			() => this.settings.mergePluginSettings,
			this.settingsBackup,
		);
		this.pluginInstaller = new PluginInstaller(
			this.app,
			this.fileManager,
			this.networkManager,
			this.settingsManager,
			() => this.settings.loadSettingsOnInstall,
		);
		this.pluginEnabler = new PluginEnabler(this.app, this.fileManager);
		this.setupExporter = new SetupExporter(
			this.fileManager,
			undefined,
			() => ({
				redact: this.settings.redactSecretsOnExport,
				extraKeys: parseSecretKeys(this.settings.extraSecretKeys),
			}),
			this.settingsBackup,
			() => this.settings.syncAppearance,
			() => liveAppearance(this.app),
		);
		this.appearanceApplier = new AppearanceApplier(
			this.app,
			this.fileManager,
			this.networkManager,
			this.settingsBackup,
		);
		this.setupPreview = new SetupPreview(this.fileManager, undefined, () =>
			liveAppearance(this.app),
		);
		this.updateChecker = new UpdateChecker(
			this.fileManager,
			this.networkManager,
		);

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
				await this.runImportPipeline();
			},
		});

		this.addCommand({
			id: "apply-plugin-settings",
			name: "Apply settings from JSON",
			callback: async () => {
				await this.applySettingsToInstalledPlugins();
			},
		});

		this.addCommand({
			id: "check-plugin-updates",
			name: "Check for plugin updates",
			callback: async () => {
				await this.checkForUpdates();
			},
		});

		this.addCommand({
			id: "undo-last-change",
			name: "Undo last import, export or settings change",
			callback: async () => {
				await this.undoLastChange();
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
		const wantsAutoActions =
			this.settings.loadSettingsOnStartup ||
			this.settings.autoInstallPlugins;
		// These settings often reach phones through a synced config folder;
		// do not install plugins or rewrite their settings there unless the
		// user allowed it on mobile.
		if (
			wantsAutoActions &&
			Platform.isMobile &&
			!this.settings.allowAutoActionsOnMobile
		) {
			logger.info(
				"Skipping startup auto-install and settings sync on mobile (not allowed in settings).",
			);
			return;
		}

		try {
			if (this.settings.loadSettingsOnStartup) {
				await this.applySettingsToInstalledPlugins();
			}

			if (this.settings.autoInstallPlugins) {
				await this.runImportPipeline();
			}
		} catch (err: unknown) {
			logger.error("Startup install pipeline failed:", err);
			new Notice(
				"Startup install failed. See console for details.",
			);
		}
	}

	async runImportPipeline(): Promise<void> {
		await this.runExclusive(() =>
			this.withBackup("Import", () => this.installPluginsFromFile()),
		);
	}

	// Applies community-appearance.json if syncing it is on. Returns notes
	// for the import summary.
	private async applyAppearanceFile(
		progress: ProgressNotice,
	): Promise<string[]> {
		const path = this.fileManager.configPath(APPEARANCE_FILE);
		if (!this.settings.syncAppearance || !(await this.fileManager.exists(path))) {
			return [];
		}
		let setup = null;
		try {
			setup = parseAppearance(
				JSON.parse((await this.fileManager.readFile(path)) ?? ""),
			);
		} catch (err: unknown) {
			logger.warn(`Invalid JSON in ${APPEARANCE_FILE}:`, err);
		}
		if (!setup) {
			return [`${APPEARANCE_FILE} is not valid, so the theme and snippets were skipped.`];
		}

		progress.setDetail("Applying theme and CSS snippets");
		const result = await this.appearanceApplier.apply(setup);
		const notes: string[] = [];
		if (result.theme) {
			notes.push(`${result.theme}.`);
		}
		if (result.snippetsWritten > 0) {
			notes.push(
				`Added or updated ${result.snippetsWritten} CSS snippet${result.snippetsWritten === 1 ? "" : "s"}.`,
			);
		}
		return [...notes, ...result.problems];
	}

	async exportPluginSetup(): Promise<void> {
		await this.runExclusive(() =>
			this.withBackup("Export", async () => {
				try {
					const { message } = await this.setupExporter.exportSetup();
					ProgressNotice.show("Export finished", message);
				} catch (err: unknown) {
					const errorMessage =
						err instanceof Error ? err.message : "Unknown error";
					logger.error("Export failed:", err);
					ProgressNotice.show("Export failed", errorMessage, 12000);
				}
			}),
		);
	}

	// Everything the task overwrites goes into one backup snapshot, which
	// "Undo last change" restores.
	private async withBackup(
		reason: string,
		task: () => Promise<void>,
	): Promise<void> {
		this.settingsBackup.begin(reason);
		try {
			await task();
		} finally {
			await this.settingsBackup.end();
		}
	}

	// Looks for newer versions and opens a list to pick from.
	async checkForUpdates(): Promise<void> {
		const updates = await this.findUpdates();
		if (updates) {
			new UpdatesModal(this.app, updates, (picked) =>
				this.updatePlugins(picked),
			).open();
		}
	}

	async findUpdates(): Promise<PluginUpdate[] | null> {
		const progress = new ProgressNotice("Checking for plugin updates");
		try {
			const updates = await this.updateChecker.check((current, total, id) =>
				progress.update(current, total, id),
			);
			const count = updates.filter((u) => u.available).length;
			progress.setTitle("Update check finished");
			progress.finish(
				count > 0
					? `${count} plugin${count === 1 ? " has an update" : "s have updates"}.`
					: "All community plugins are up to date.",
				3000,
			);
			return updates;
		} catch (err: unknown) {
			const errorMessage =
				err instanceof Error ? err.message : "Unknown error";
			logger.error("Update check failed:", err);
			progress.setTitle("Update check failed");
			progress.finish(NetworkManager.describeError(err) || errorMessage, 12000);
			return null;
		}
	}

	// Installs the newer versions, restarting plugins that are running, and
	// moves their pins in the plugin list along so Import does not go back.
	async updatePlugins(updates: PluginUpdate[]): Promise<void> {
		const targets = updates.filter((u) => u.available);
		if (targets.length === 0) {
			return;
		}
		await this.runExclusive(() =>
			this.withBackup("Update plugins", async () => {
				const progress = new ProgressNotice("Updating plugins");
				const updated = new Map<string, string>();
				const failed: string[] = [];
				try {
					this.pluginInstaller.clearCaches();
					for (let i = 0; i < targets.length; i++) {
						const { pluginId, available } = targets[i];
						const version = available as string;
						progress.update(
							i + 1,
							targets.length,
							`Updating ${pluginId} to ${version}`,
						);
						let result = "";
						await this.pluginEnabler.runWithPluginsStopped(
							[pluginId],
							async () => {
								result = await this.pluginInstaller.installPlugin(
									{ id: pluginId, version },
									{ applySettings: false },
								);
							},
						);
						if (result === "installed" || result === "unchanged") {
							updated.set(pluginId, version);
						} else {
							failed.push(this.pluginInstaller.lastFailure || pluginId);
						}
					}

					const pinsMoved = await this.movePins(updated);
					await this.pluginEnabler.refreshPluginsUI();

					const notes = [
						`Updated ${updated.size} of ${targets.length} plugin${targets.length === 1 ? "" : "s"}.`,
					];
					if (pinsMoved > 0) {
						notes.push(
							`Moved ${pinsMoved} pin${pinsMoved === 1 ? "" : "s"} in ${PLUGINS_LIST_FILE}.`,
						);
					}
					notes.push(...failed);
					progress.setTitle(
						failed.length > 0 ? "Update finished with problems" : "Update finished",
					);
					progress.finish(notes.join(" "), failed.length > 0 ? 12000 : 6000);
				} catch (err: unknown) {
					const errorMessage =
						err instanceof Error ? err.message : "Unknown error";
					logger.error("Update failed:", err);
					progress.setTitle("Update failed");
					progress.finish(errorMessage, 12000);
				} finally {
					this.pluginInstaller.clearCaches();
				}
			}),
		);
	}

	private async movePins(versions: Map<string, string>): Promise<number> {
		const listPath = this.fileManager.configPath(PLUGINS_LIST_FILE);
		if (versions.size === 0 || !(await this.fileManager.exists(listPath))) {
			return 0;
		}
		const text = await this.fileManager.readFile(listPath);
		const updated = text ? updatePinsInList(text, versions) : null;
		if (!updated) {
			return 0;
		}
		const before = JSON.parse(text as string) as unknown[];
		const after = JSON.parse(updated) as unknown[];
		const moved = after.filter(
			(item, i) => JSON.stringify(item) !== JSON.stringify(before[i]),
		).length;
		await this.settingsBackup.capture(listPath);
		return (await this.fileManager.writeFile(listPath, updated)) ? moved : 0;
	}

	async undoLastChange(): Promise<void> {
		await this.runExclusive(async () => {
			try {
				const latest = await this.settingsBackup.latest();
				if (!latest) {
					ProgressNotice.show(
						"Nothing to undo",
						"No earlier Import, Apply settings or Export to undo.",
					);
					return;
				}
				const { name, snapshot } = latest;
				const pluginIds = [
					...new Set(
						snapshot.entries
							.map((entry) => entry.pluginId)
							.filter((id): id is string => Boolean(id)),
					),
				];

				let restored: string[] = [];
				const { deferred } =
					await this.pluginEnabler.runWithPluginsStopped(
						pluginIds,
						async () => {
							restored =
								await this.settingsBackup.restore(snapshot);
						},
					);
				await this.pluginEnabler.refreshPluginsUI();

				if (restored.length < snapshot.entries.length) {
					ProgressNotice.show(
						"Undo incomplete",
						`Restored ${restored.length} of ${snapshot.entries.length} files. The backup is kept; see console for details.`,
						12000,
					);
					return;
				}
				await this.settingsBackup.remove(name);

				const files = `${restored.length} file${restored.length === 1 ? "" : "s"}`;
				const reload =
					deferred > 0
						? " Plugins will reload when you close Settings."
						: "";
				ProgressNotice.show(
					`Undid ${snapshot.reason.toLowerCase()}`,
					`From ${new Date(snapshot.createdAt).toLocaleString()}: restored ${files}.${reload}`,
				);
			} catch (err: unknown) {
				const errorMessage =
					err instanceof Error ? err.message : "Unknown error";
				ProgressNotice.show("Undo failed", errorMessage, 12000);
				logger.error("Undo failed:", err);
			}
		});
	}

	async previewPluginSetup(): Promise<void> {
		try {
			const report = await this.setupPreview.buildReport(
				this.settings.loadSettingsOnInstall,
				this.settings.syncAppearance,
			);
			if (!report) {
				return;
			}
			logger.info(
				"Import preview:\n" +
					this.setupPreview.formatReportText(report),
			);
			// The modal shows the summary, so no notice.
			new SetupPreviewModal(this.app, report).open();
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
		// Existing installs keep exporting settings as before until the
		// user turns this on; new installs leave secrets out.
		if (data && data.redactSecretsOnExport === undefined) {
			this.settings.redactSecretsOnExport = false;
		}
		// Same for themes and snippets: existing installs opt in.
		if (data && data.syncAppearance === undefined) {
			this.settings.syncAppearance = false;
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

	// Runs one import/apply operation at a time; a second request while one
	// is in progress is dropped with a notice.
	private async runExclusive(task: () => Promise<void>): Promise<void> {
		if (this.busy) {
			new Notice(
				"Another import, export or settings update is already running.",
			);
			return;
		}
		this.busy = true;
		try {
			await task();
		} finally {
			this.busy = false;
		}
	}

	async applySettingsToInstalledPlugins(): Promise<void> {
		await this.runExclusive(() =>
			this.withBackup("Apply settings", () => this.applySettings()),
		);
	}

	private async applySettings(): Promise<void> {
		const progress = new ProgressNotice("Applying plugin settings");
		try {
			const targets = await this.settingsManager.collectSettingsTargets();
			if (targets.length === 0) {
				// collectSettingsTargets explains why in its own notice.
				progress.hide();
				return;
			}

			let applied: string[] = [];
			const { restarted, deferred } =
				await this.pluginEnabler.runWithPluginsStopped(
					targets.map((t) => t.pluginId),
					async () => {
						applied =
							await this.settingsManager.writeAllSettings(targets);
					},
				);
			if (applied.length === 0) {
				progress.finish("No settings were written.");
				return;
			}
			await this.pluginEnabler.refreshPluginsUI();

			const count = `${applied.length} plugin${applied.length === 1 ? "" : "s"}`;
			progress.setTitle("Settings applied");
			if (deferred > 0) {
				progress.finish(
					`Updated ${count}. ${deferred} running plugin${deferred === 1 ? "" : "s"} will reload when you close Settings.`,
				);
			} else if (restarted > 0) {
				progress.finish(`Updated ${count} (${restarted} reloaded).`);
			} else {
				progress.finish(`Updated ${count}.`);
			}
		} catch (err: unknown) {
			const errorMessage =
				err instanceof Error ? err.message : "Unknown error";
			logger.error("File system access error:", err);
			progress.setTitle("Applying settings failed");
			progress.finish(`Cannot access file system: ${errorMessage}`, 12000);
		}
	}

	async installPluginsFromFile() {
		// One notice for the whole run, updated in place. Problems with a
		// single plugin still get a notice of their own.
		const progress = new ProgressNotice("Importing plugin setup");
		try {
			this.pluginInstaller.clearCaches();
			const pluginsJsonPath =
				this.fileManager.configPath(PLUGINS_LIST_FILE);

			if (!(await this.fileManager.exists(pluginsJsonPath))) {
				const created = await this.fileManager.writeFile(
					pluginsJsonPath,
					"[]",
				);
				progress.finish(
					created
						? `Created an empty ${PLUGINS_LIST_FILE}. Add plugin IDs to it and import again.`
						: `Cannot create ${PLUGINS_LIST_FILE}. Check file permissions.`,
				);
				return;
			}

			const content = await this.fileManager.readFile(pluginsJsonPath);
			if (!content?.trim()) {
				progress.finish(
					`${PLUGINS_LIST_FILE} is empty. Add plugin IDs to it and import again.`,
				);
				return;
			}

			let rawList: unknown;
			try {
				rawList = JSON.parse(content) as unknown;
			} catch (err: unknown) {
				const errorMessage =
					err instanceof Error ? err.message : "Unknown error";
				logger.error(`JSON parse error in ${PLUGINS_LIST_FILE}:`, err);
				progress.finish(
					`Invalid JSON in ${PLUGINS_LIST_FILE}: ${errorMessage}.`,
				);
				return;
			}

			const entries = parsePluginList(rawList);
			if (!entries) {
				progress.hide();
				return;
			}

			if (entries.length === 0) {
				const appearanceNotes = await this.applyAppearanceFile(progress);
				progress.setTitle("Import finished");
				progress.finish(["No plugins to install.", ...appearanceNotes].join(" "));
				return;
			}

			const isMobile = Platform.isMobile;
			const forThisDevice = entries.filter((entry) =>
				isForThisDevice(entry, isMobile),
			);
			const otherDeviceCount = entries.length - forThisDevice.length;
			if (forThisDevice.length === 0) {
				progress.finish(
					`No plugins in the list are meant for this ${isMobile ? "mobile" : "desktop"} device.`,
				);
				return;
			}

			const totalPlugins = forThisDevice.length;
			let installedCount = 0;
			let skippedCount = 0;
			const failed: string[] = [];
			// Plugins whose files changed in this run; only these get enabled.
			const newlyInstalled: string[] = [];
			// Installed in this run but marked "enabled": false in the list.
			const keptOff: string[] = [];

			for (let i = 0; i < forThisDevice.length; i++) {
				const entry = forThisDevice[i];
				const label = entry.version
					? `${entry.id}@${entry.version}`
					: entry.id;
				progress.update(i + 1, totalPlugins, `Installing ${label}`);

				const result = await this.pluginInstaller.installPlugin(entry);

				if (result === "skipped") {
					skippedCount++;
				} else if (result === "failed") {
					failed.push(this.pluginInstaller.lastFailure || entry.id);
				} else {
					installedCount++;
				}
				if (result === "installed") {
					if (entry.enabled === false) {
						keptOff.push(entry.id);
					} else {
						newlyInstalled.push(entry.id);
					}
				}
			}

			const notes: string[] = [];
			if (newlyInstalled.length > 0 && this.settings.autoEnablePlugins) {
				const result = await this.pluginEnabler.enableInstalledPlugins(
					newlyInstalled,
					(current, total, pluginId) => {
						progress.update(current, total, `Turning on ${pluginId}`);
					},
				);
				if (result.failed > 0) {
					logger.warn(
						"Some plugins failed to enable:",
						result.failedPlugins,
					);
					notes.push(
						`Could not turn on: ${result.failedPlugins.join(", ")}.`,
					);
				}
			} else if (newlyInstalled.length > 0) {
				notes.push("Auto-enable is off, so new plugins stay off.");
			}

			await this.pluginEnabler.refreshPluginsUI();

			if (skippedCount > 0) {
				notes.push(
					`Skipped ${skippedCount} desktop-only plugin${skippedCount > 1 ? "s" : ""} on this device.`,
				);
			}
			if (otherDeviceCount > 0) {
				notes.push(
					`${otherDeviceCount} plugin${otherDeviceCount > 1 ? "s are" : " is"} listed for other devices only.`,
				);
			}
			if (keptOff.length > 0) {
				notes.push(
					`Left ${keptOff.length} turned off as set in the list.`,
				);
			}
			notes.push(...failed);
			notes.push(...(await this.applyAppearanceFile(progress)));

			const changed = newlyInstalled.length + keptOff.length;
			const summary =
				changed > 0
					? `Installed or updated ${changed} plugin${changed === 1 ? "" : "s"}`
					: "Everything was already up to date";
			progress.setTitle(
				failed.length > 0 ? "Import finished with problems" : "Import finished",
			);
			progress.finish(
				[`${summary} (${installedCount} of ${totalPlugins} OK).`, ...notes].join(
					" ",
				),
				failed.length > 0 ? 12000 : 6000,
			);
		} catch (err: unknown) {
			const errorMessage =
				err instanceof Error ? err.message : "Unknown error";
			logger.error("Installation error:", err);
			progress.setTitle("Import failed");
			progress.finish(`${errorMessage}. See console for details.`, 12000);
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
						await this.plugin.runImportPipeline();
					} finally {
						button.setDisabled(false);
					}
				}),
			);

		new Setting(target)
			.setName("Check for updates")
			.setDesc(
				"See which installed community plugins have newer versions, and update them. Pins in your plugin list move along.",
			)
			.addButton((button) =>
				button.setButtonText("Check").onClick(async () => {
					button.setDisabled(true);
					try {
						await this.plugin.checkForUpdates();
					} finally {
						button.setDisabled(false);
					}
				}),
			);

		new Setting(target)
			.setName("Undo last change")
			.setDesc(
				"Put back the settings and setup files as they were before the last import, settings update or export. Installed plugins stay installed.",
			)
			.addButton((button) =>
				button.setButtonText("Undo").onClick(async () => {
					button.setDisabled(true);
					try {
						await this.plugin.undoLastChange();
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
							await this.plugin.runImportPipeline();
						}),
					);
					setting.addButton((button) =>
						button
							.setButtonText("Apply settings")
							.onClick(async () => {
								await this.plugin.applySettingsToInstalledPlugins();
							}),
					);
					setting.addButton((button) =>
						button.setButtonText("Check for updates").onClick(async () => {
							await this.plugin.checkForUpdates();
						}),
					);
					setting.addButton((button) =>
						button.setButtonText("Undo").onClick(async () => {
							await this.plugin.undoLastChange();
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
				name: "Run automatic actions on mobile",
				desc: "Let auto-install and settings sync on startup run on phones and tablets. Off by default, so a synced desktop setup does not start downloads on mobile data.",
				render: (setting: Setting) => {
					setting.addToggle((toggle) =>
						toggle
							.setValue(this.plugin.settings.allowAutoActionsOnMobile)
							.onChange(async (value) => {
								this.plugin.settings.allowAutoActionsOnMobile = value;
								await this.plugin.saveSettings();
							}),
					);
				},
			},
			{
				name: "Leave out secrets on export",
				desc: "Replace tokens, passwords and API keys with a placeholder in the exported settings file. Import never writes the placeholder over a real value.",
				render: (setting: Setting) => {
					setting.addToggle((toggle) =>
						toggle
							.setValue(this.plugin.settings.redactSecretsOnExport)
							.onChange(async (value) => {
								this.plugin.settings.redactSecretsOnExport = value;
								await this.plugin.saveSettings();
							}),
					);
				},
			},
			{
				name: "Extra secret setting names",
				desc: "Comma-separated setting names to leave out as well, for example: licenseCode, endpoint",
				render: (setting: Setting) => {
					setting.addText((text) =>
						text
							.setPlaceholder("License code, endpoint")
							.setValue(this.plugin.settings.extraSecretKeys)
							.onChange(async (value) => {
								this.plugin.settings.extraSecretKeys = value;
								await this.plugin.saveSettings();
							}),
					);
				},
			},
			{
				name: "Sync theme and CSS snippets",
				desc: "Export saves your community theme and CSS snippets to community-appearance.json, and import installs and switches to that theme and adds the snippets.",
				render: (setting: Setting) => {
					setting.addToggle((toggle) =>
						toggle
							.setValue(this.plugin.settings.syncAppearance)
							.onChange(async (value) => {
								this.plugin.settings.syncAppearance = value;
								await this.plugin.saveSettings();
							}),
					);
				},
			},
			{
				name: "Logging level",
				desc: "How much detail to show in the console if something goes wrong. Leave on error unless you are troubleshooting.",
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
			.setName("Run automatic actions on mobile")
			.setDesc(
				"Let auto-install and settings sync on startup run on phones and tablets. Off by default, so a synced desktop setup does not start downloads on mobile data.",
			)
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.allowAutoActionsOnMobile)
					.onChange(async (value) => {
						this.plugin.settings.allowAutoActionsOnMobile = value;
						await this.plugin.saveSettings();
					}),
			);

		new Setting(containerEl)
			.setName("Leave out secrets on export")
			.setDesc(
				"Replace tokens, passwords and API keys with a placeholder in the exported settings file. Import never writes the placeholder over a real value.",
			)
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.redactSecretsOnExport)
					.onChange(async (value) => {
						this.plugin.settings.redactSecretsOnExport = value;
						await this.plugin.saveSettings();
					}),
			);

		new Setting(containerEl)
			.setName("Extra secret setting names")
			.setDesc(
				"Comma-separated setting names to leave out as well, for example: licenseCode, endpoint",
			)
			.addText((text) =>
				text
					.setPlaceholder("License code, endpoint")
					.setValue(this.plugin.settings.extraSecretKeys)
					.onChange(async (value) => {
						this.plugin.settings.extraSecretKeys = value;
						await this.plugin.saveSettings();
					}),
			);

		new Setting(containerEl)
			.setName("Sync theme and CSS snippets")
			.setDesc(
				"Export saves your community theme and CSS snippets to community-appearance.json, and import installs and switches to that theme and adds the snippets.",
			)
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.syncAppearance)
					.onChange(async (value) => {
						this.plugin.settings.syncAppearance = value;
						await this.plugin.saveSettings();
					}),
			);

		new Setting(containerEl)
			.setName("Logging level")
			.setDesc(
				"How much detail to show in the console if something goes wrong. Leave on error unless you are troubleshooting.",
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
