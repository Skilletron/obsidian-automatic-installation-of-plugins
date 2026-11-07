import {
	App,
	Platform,
	Plugin,
	PluginSettingTab,
	Setting,
	Notice,
	normalizePath,
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
	VaultSetupApplier,
	describeVaultSetupChanges,
	liveVaultState,
	parseVaultSetup,
	readVaultSetup,
} from "./src/core/VaultSetup";
import {
	PACK_FILE,
	ParsedPack,
	buildSetupPack,
	mergePackIntoSetup,
	packUrl,
	parseSetupPack,
	withoutHotkeysOf,
} from "./src/core/SetupPack";
import {
	PackConfirmModal,
	PackExportModal,
	PackLinkModal,
} from "./src/core/SetupPackModals";
import { parseSecretKeys } from "./src/utils/secrets";
import {
	InstallCommunityPluginsSettings,
	DEFAULT_SETTINGS,
	PLUGINS_LIST_FILE,
	VAULT_SETUP_FILE,
} from "./src/types";
import {
	isForThisDevice,
	parsePluginList,
} from "./src/utils/parsePluginList";
import { logger, LogLevel } from "./src/utils/Logger";
import { MessageKey, detectLanguage, setLanguage, t } from "./src/i18n";

// Backups made before translations stored the reason as English text.
const LEGACY_REASONS: Record<string, string> = {
	Import: "import",
	Export: "export",
	"Apply settings": "apply",
	"Update plugins": "update",
	"Import setup pack": "pack",
	"Settings change": "settings",
};

function reasonLabel(reason: string): string {
	const key = `reason.${LEGACY_REASONS[reason] ?? reason}`;
	return key in REASON_KEYS ? t(key as MessageKey) : reason.toLowerCase();
}

const REASON_KEYS: Record<string, true> = {
	"reason.import": true,
	"reason.export": true,
	"reason.apply": true,
	"reason.update": true,
	"reason.pack": true,
	"reason.settings": true,
};

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
	vaultSetupApplier!: VaultSetupApplier;
	private busy = false;

	async onload() {
		setLanguage(detectLanguage());
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
			() => this.settings.syncVaultSetup,
			() => liveVaultState(this.app),
		);
		this.vaultSetupApplier = new VaultSetupApplier(
			this.app,
			this.fileManager,
			this.networkManager,
			this.settingsBackup,
		);
		this.setupPreview = new SetupPreview(
			this.fileManager,
			undefined,
			() => liveVaultState(this.app),
			this.settingsManager,
		);
		this.updateChecker = new UpdateChecker(
			this.fileManager,
			this.networkManager,
		);

		this.addCommand({
			id: "export-plugin-setup",
			name: t("cmd.export"),
			callback: async () => {
				await this.exportPluginSetup();
			},
		});

		this.addCommand({
			id: "preview-plugin-setup",
			name: t("cmd.preview"),
			callback: async () => {
				await this.previewPluginSetup();
			},
		});

		this.addCommand({
			id: "import-plugin-setup",
			name: t("cmd.import"),
			callback: async () => {
				await this.runImportPipeline();
			},
		});

		this.addCommand({
			id: "apply-plugin-settings",
			name: t("cmd.apply"),
			callback: async () => {
				await this.applySettingsToInstalledPlugins();
			},
		});

		this.addCommand({
			id: "export-setup-pack",
			name: t("cmd.exportPack"),
			callback: async () => {
				await this.exportSetupPack();
			},
		});

		this.addCommand({
			id: "import-setup-pack",
			name: t("cmd.importPack"),
			callback: () => {
				new PackLinkModal(this.app, (input) => {
					void this.loadSetupPack(input);
				}).open();
			},
		});

		// obsidian://install-setup-pack?url=<link> opens the same
		// confirmation; nothing is installed without it.
		this.registerObsidianProtocolHandler("install-setup-pack", (params) => {
			if (params.url) {
				void this.loadSetupPack(params.url);
			}
		});

		this.addCommand({
			id: "check-plugin-updates",
			name: t("cmd.checkUpdates"),
			callback: async () => {
				await this.checkForUpdates();
			},
		});

		this.addCommand({
			id: "undo-last-change",
			name: t("cmd.undo"),
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
			new Notice(t("common.startupFailed"));
		}
	}

	async runImportPipeline(): Promise<void> {
		await this.runExclusive(() =>
			this.withBackup("import", () => this.installPluginsFromFile()),
		);
	}

	// Asks which installed plugins to share, then saves them as a pack.
	async exportSetupPack(): Promise<void> {
		try {
			const choices = await this.setupExporter.listPackChoices();
			new PackExportModal(
				this.app,
				choices,
				this.settings.syncVaultSetup,
				(ids) => this.saveSetupPack(ids),
			).open();
		} catch (err: unknown) {
			const errorMessage =
				err instanceof Error ? err.message : t("common.unknownError");
			logger.error("Setup pack export failed:", err);
			ProgressNotice.show(t("pack.notSavedTitle"), errorMessage, 12000);
		}
	}

	// Writes setup-pack.json to the vault root: the given plugins, with
	// secrets always left out, ready to share.
	async saveSetupPack(pluginIds: string[]): Promise<void> {
		try {
			const chosen = new Set(pluginIds);
			const { listEntries, settings, redactedCount } =
				await this.setupExporter.collect(true, chosen);
			const leftOut = (await this.setupExporter.listInstalledPlugins())
				.map((plugin) => plugin.pluginId)
				.filter((id) => !chosen.has(id));
			const vaultSetup = this.settings.syncVaultSetup
				? withoutHotkeysOf(
						await readVaultSetup(this.fileManager, liveVaultState(this.app)),
						leftOut,
					)
				: null;
			const pack = buildSetupPack(
				listEntries,
				settings,
				vaultSetup,
				t("pack.name", { vault: this.app.vault.getName() }),
			);
			const path = normalizePath(PACK_FILE);
			if (
				!(await this.fileManager.writeFile(
					path,
					`${JSON.stringify(pack, null, 2)}\n`,
				))
			) {
				throw new Error(t("pack.writeFailed", { file: PACK_FILE }));
			}
			const secrets =
				redactedCount > 0
					? t("pack.savedSecrets", { count: redactedCount })
					: "";
			ProgressNotice.show(
				t("pack.savedTitle"),
				t("pack.savedBody", {
					file: PACK_FILE,
					count: listEntries.length,
					secrets,
				}),
				10000,
			);
		} catch (err: unknown) {
			const errorMessage =
				err instanceof Error ? err.message : t("common.unknownError");
			logger.error("Setup pack export failed:", err);
			ProgressNotice.show(t("pack.notSavedTitle"), errorMessage, 12000);
		}
	}

	// Loads a pack from a link or a vault path and asks before using it.
	async loadSetupPack(input: string): Promise<void> {
		let raw: unknown;
		let source = input;
		try {
			const url = packUrl(input);
			if (url) {
				source = url;
				raw = await this.networkManager.fetchJson<unknown>(url);
			} else if (/^[a-z]+:/i.test(input)) {
				throw new Error(t("pack.httpsOnly"));
			} else {
				const path = normalizePath(input);
				const text = (await this.fileManager.exists(path))
					? await this.fileManager.readFile(path)
					: null;
				if (text === null) {
					throw new Error(t("pack.notFound", { path }));
				}
				raw = JSON.parse(text) as unknown;
			}
		} catch (err: unknown) {
			const errorMessage =
				err instanceof Error ? err.message : t("common.unknownError");
			ProgressNotice.show(
				t("pack.loadFailedTitle"),
				NetworkManager.describeError(err) || errorMessage,
				12000,
			);
			return;
		}

		const pack = parseSetupPack(raw);
		if (!pack) {
			ProgressNotice.show(
				t("pack.notPackTitle"),
				t("pack.notPackBody"),
				12000,
			);
			return;
		}

		const vaultSetupSummary = pack.vaultSetup
			? describeVaultSetupChanges(
					pack.vaultSetup,
					await readVaultSetup(this.fileManager, liveVaultState(this.app)),
				)
			: "";
		new PackConfirmModal(this.app, pack, source, vaultSetupSummary, () =>
			this.useSetupPack(pack),
		).open();
	}

	private async useSetupPack(pack: ParsedPack): Promise<void> {
		await this.runExclusive(() =>
			this.withBackup("pack", async () => {
				try {
					await mergePackIntoSetup(
						this.fileManager,
						pack,
						this.settingsBackup,
					);
				} catch (err: unknown) {
					const errorMessage =
						err instanceof Error ? err.message : t("common.unknownError");
					logger.error("Merging the setup pack failed:", err);
					ProgressNotice.show(t("pack.notAddedTitle"), errorMessage, 12000);
					return;
				}
				// The user saw and confirmed the pack, theme and snippets included.
				await this.installPluginsFromFile({
					forceVaultSetup: pack.vaultSetup !== undefined,
				});
			}),
		);
	}

	// Applies vault-setup.json if syncing it is on. Returns notes
	// for the import summary.
	private async applyVaultSetupFile(
		progress: ProgressNotice,
		force = false,
	): Promise<string[]> {
		const path = this.fileManager.configPath(VAULT_SETUP_FILE);
		if (
			(!this.settings.syncVaultSetup && !force) ||
			!(await this.fileManager.exists(path))
		) {
			return [];
		}
		let setup = null;
		try {
			setup = parseVaultSetup(
				JSON.parse((await this.fileManager.readFile(path)) ?? ""),
			);
		} catch (err: unknown) {
			logger.warn(`Invalid JSON in ${VAULT_SETUP_FILE}:`, err);
		}
		if (!setup) {
			return [t("vaultSetup.invalid", { file: VAULT_SETUP_FILE })];
		}

		progress.setDetail(t("vaultSetup.applying"));
		const result = await this.vaultSetupApplier.apply(setup);
		const notes: string[] = [];
		if (result.theme) {
			notes.push(`${result.theme}.`);
		}
		if (result.snippetsWritten > 0) {
			notes.push(
				t("vaultSetup.snippetsWritten", { count: result.snippetsWritten }),
			);
		}
		if (result.hotkeysChanged > 0) {
			notes.push(t("vaultSetup.hotkeysSet", { count: result.hotkeysChanged }));
		}
		if (result.corePluginsOn + result.corePluginsOff > 0) {
			notes.push(
				t("vaultSetup.corePlugins", {
					on: result.corePluginsOn,
					off: result.corePluginsOff,
				}),
			);
		}
		return [...notes, ...result.problems];
	}

	async exportPluginSetup(): Promise<void> {
		await this.runExclusive(() =>
			this.withBackup("export", async () => {
				try {
					const { message } = await this.setupExporter.exportSetup();
					ProgressNotice.show(t("export.finished"), message);
				} catch (err: unknown) {
					const errorMessage =
						err instanceof Error ? err.message : t("common.unknownError");
					logger.error("Export failed:", err);
					ProgressNotice.show(t("export.failed"), errorMessage, 12000);
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
		const progress = new ProgressNotice(t("updates.checking"));
		try {
			const updates = await this.updateChecker.check((current, total, id) =>
				progress.update(current, total, id),
			);
			const count = updates.filter((u) => u.available).length;
			progress.setTitle(t("updates.checkFinished"));
			progress.finish(
				count > 0
					? t("updates.found", { count })
					: t("updates.none"),
				3000,
			);
			return updates;
		} catch (err: unknown) {
			const errorMessage =
				err instanceof Error ? err.message : t("common.unknownError");
			logger.error("Update check failed:", err);
			progress.setTitle(t("updates.checkFailed"));
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
			this.withBackup("update", async () => {
				const progress = new ProgressNotice(t("updates.updating"));
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
							t("updates.step", { id: pluginId, version }),
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
						t("updates.updated", {
							done: updated.size,
							count: targets.length,
						}),
					];
					if (pinsMoved > 0) {
						notes.push(
							t("updates.pinsMoved", {
								count: pinsMoved,
								file: PLUGINS_LIST_FILE,
							}),
						);
					}
					notes.push(...failed);
					progress.setTitle(
						failed.length > 0
							? t("updates.finishedProblems")
							: t("updates.finished"),
					);
					progress.finish(notes.join(" "), failed.length > 0 ? 12000 : 6000);
				} catch (err: unknown) {
					const errorMessage =
						err instanceof Error ? err.message : t("common.unknownError");
					logger.error("Update failed:", err);
					progress.setTitle(t("updates.failed"));
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
					ProgressNotice.show(t("undo.nothingTitle"), t("undo.nothingBody"));
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
						t("undo.incompleteTitle"),
						t("undo.incompleteBody", {
							restored: restored.length,
							total: snapshot.entries.length,
						}),
						12000,
					);
					return;
				}
				await this.settingsBackup.remove(name);

				ProgressNotice.show(
					t("undo.doneTitle", { reason: reasonLabel(snapshot.reason) }),
					t("undo.doneBody", {
						date: new Date(snapshot.createdAt).toLocaleString(),
						count: restored.length,
						reload: deferred > 0 ? t("undo.reload") : "",
					}),
				);
			} catch (err: unknown) {
				const errorMessage =
					err instanceof Error ? err.message : t("common.unknownError");
				ProgressNotice.show(t("undo.failed"), errorMessage, 12000);
				logger.error("Undo failed:", err);
			}
		});
	}

	async previewPluginSetup(): Promise<void> {
		try {
			const report = await this.setupPreview.buildReport(
				this.settings.loadSettingsOnInstall,
				this.settings.syncVaultSetup,
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
				err instanceof Error ? err.message : t("common.unknownError");
			new Notice(t("preview.failed", { error: errorMessage }));
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
		if (data && data.syncVaultSetup === undefined) {
			this.settings.syncVaultSetup = false;
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
			new Notice(t("common.busy"));
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
			this.withBackup("apply", () => this.applySettings()),
		);
	}

	private async applySettings(): Promise<void> {
		const progress = new ProgressNotice(t("apply.title"));
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
				progress.finish(t("apply.none"));
				return;
			}
			await this.pluginEnabler.refreshPluginsUI();

			const plugins = t("apply.plugins", { count: applied.length });
			progress.setTitle(t("apply.done"));
			if (deferred > 0) {
				progress.finish(t("apply.deferred", { plugins, count: deferred }));
			} else if (restarted > 0) {
				progress.finish(t("apply.restarted", { plugins, restarted }));
			} else {
				progress.finish(t("apply.updated", { plugins }));
			}
		} catch (err: unknown) {
			const errorMessage =
				err instanceof Error ? err.message : t("common.unknownError");
			logger.error("File system access error:", err);
			progress.setTitle(t("apply.failed"));
			progress.finish(t("apply.fsError", { error: errorMessage }), 12000);
		}
	}

	// forceVaultSetup applies vault-setup.json even when syncing it is off.
	async installPluginsFromFile(options: { forceVaultSetup?: boolean } = {}) {
		// One notice for the whole run, updated in place. Problems with a
		// single plugin still get a notice of their own.
		const progress = new ProgressNotice(t("import.title"));
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
						? t("import.createdEmpty", { file: PLUGINS_LIST_FILE })
						: t("import.cannotCreate", { file: PLUGINS_LIST_FILE }),
				);
				return;
			}

			const content = await this.fileManager.readFile(pluginsJsonPath);
			if (!content?.trim()) {
				progress.finish(t("import.empty", { file: PLUGINS_LIST_FILE }));
				return;
			}

			let rawList: unknown;
			try {
				rawList = JSON.parse(content) as unknown;
			} catch (err: unknown) {
				const errorMessage =
					err instanceof Error ? err.message : t("common.unknownError");
				logger.error(`JSON parse error in ${PLUGINS_LIST_FILE}:`, err);
				progress.finish(
					t("import.invalidJson", {
						file: PLUGINS_LIST_FILE,
						error: errorMessage,
					}),
				);
				return;
			}

			const entries = parsePluginList(rawList);
			if (!entries) {
				progress.hide();
				return;
			}

			if (entries.length === 0) {
				const setupNotes = await this.applyVaultSetupFile(progress, options.forceVaultSetup);
				progress.setTitle(t("import.finished"));
				progress.finish([t("import.noPlugins"), ...setupNotes].join(" "));
				return;
			}

			const isMobile = Platform.isMobile;
			const forThisDevice = entries.filter((entry) =>
				isForThisDevice(entry, isMobile),
			);
			const otherDeviceCount = entries.length - forThisDevice.length;
			if (forThisDevice.length === 0) {
				progress.finish(
					t(isMobile ? "import.notForMobile" : "import.notForDesktop"),
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
				progress.update(i + 1, totalPlugins, t("import.installing", { label }));

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
						progress.update(current, total, t("import.turningOn", { id: pluginId }));
					},
				);
				if (result.failed > 0) {
					logger.warn(
						"Some plugins failed to enable:",
						result.failedPlugins,
					);
					notes.push(
						t("import.couldNotEnable", { ids: result.failedPlugins.join(", ") }),
					);
				}
			} else if (newlyInstalled.length > 0) {
				notes.push(t("import.autoEnableOff"));
			}

			await this.pluginEnabler.refreshPluginsUI();

			if (skippedCount > 0) {
				notes.push(t("import.skippedDesktopOnly", { count: skippedCount }));
			}
			if (otherDeviceCount > 0) {
				notes.push(t("import.otherDevices", { count: otherDeviceCount }));
			}
			if (keptOff.length > 0) {
				notes.push(t("import.keptOff", { count: keptOff.length }));
			}
			notes.push(...failed);
			notes.push(...(await this.applyVaultSetupFile(progress, options.forceVaultSetup)));

			const changed = newlyInstalled.length + keptOff.length;
			const summary =
				changed > 0
					? t("import.changed", { count: changed })
					: t("import.upToDate");
			progress.setTitle(
				failed.length > 0
					? t("import.finishedProblems")
					: t("import.finished"),
			);
			progress.finish(
				[
					t("import.summary", {
						summary,
						ok: installedCount,
						total: totalPlugins,
					}),
					...notes,
				].join(" "),
				failed.length > 0 ? 12000 : 6000,
			);
		} catch (err: unknown) {
			const errorMessage =
				err instanceof Error ? err.message : t("common.unknownError");
			logger.error("Installation error:", err);
			progress.setTitle(t("import.failed"));
			progress.finish(t("import.error", { error: errorMessage }), 12000);
		} finally {
			this.pluginInstaller.clearCaches();
		}
	}
}

type BooleanSetting = {
	[K in keyof InstallCommunityPluginsSettings]-?: InstallCommunityPluginsSettings[K] extends boolean
		? K
		: never;
}[keyof InstallCommunityPluginsSettings];

type LogLevelName = NonNullable<InstallCommunityPluginsSettings["logLevel"]>;

interface Action {
	name: MessageKey;
	desc: string;
	button: MessageKey;
	run: () => Promise<void> | void;
}

class InstallCommunityPluginsSettingTab extends PluginSettingTab {
	plugin: InstallCommunityPlugins;

	constructor(app: App, plugin: InstallCommunityPlugins) {
		super(app, plugin);
		this.plugin = plugin;
	}

	// The actions, one setting each, in the order they appear.
	private actions(): Action[] {
		const dir = this.app.vault.configDir;
		const openPackLink = () => {
			new PackLinkModal(this.app, (input) => {
				void this.plugin.loadSetupPack(input);
			}).open();
		};
		return [
			{
				name: "settings.previewName",
				desc: t("settings.previewDesc"),
				button: "settings.previewButton",
				run: () => this.plugin.previewPluginSetup(),
			},
			{
				name: "settings.exportName",
				desc: t("settings.exportDesc", { dir }),
				button: "settings.exportButton",
				run: () => this.plugin.exportPluginSetup(),
			},
			{
				name: "settings.importName",
				desc: t("settings.importDesc"),
				button: "settings.importButton",
				run: () => this.plugin.runImportPipeline(),
			},
			{
				name: "settings.applyName",
				desc: t("settings.applyDesc"),
				button: "settings.applyButton",
				run: () => this.plugin.applySettingsToInstalledPlugins(),
			},
			{
				name: "settings.updatesName",
				desc: t("settings.updatesDesc"),
				button: "settings.updatesButton",
				run: () => this.plugin.checkForUpdates(),
			},
			{
				name: "settings.shareName",
				desc: t("settings.shareDesc"),
				button: "settings.shareButton",
				run: () => this.plugin.exportSetupPack(),
			},
			{
				name: "settings.importPackName",
				desc: t("settings.importPackDesc"),
				button: "settings.importPackButton",
				run: openPackLink,
			},
			{
				name: "settings.undoName",
				desc: t("settings.undoDesc"),
				button: "settings.undoButton",
				run: () => this.plugin.undoLastChange(),
			},
		];
	}

	private addActionButton(setting: Setting, action: Action): void {
		setting.addButton((button) =>
			button.setButtonText(t(action.button)).onClick(async () => {
				button.setDisabled(true);
				try {
					await action.run();
				} finally {
					button.setDisabled(false);
				}
			}),
		);
	}

	private toggles(): Array<{
		key: BooleanSetting;
		name: MessageKey;
		desc: MessageKey;
	}> {
		return [
			{
				key: "autoInstallPlugins",
				name: "settings.autoInstallName",
				desc: "settings.autoInstallDesc",
			},
			{
				key: "autoEnablePlugins",
				name: "settings.autoEnableName",
				desc: "settings.autoEnableDesc",
			},
			{
				key: "loadSettingsOnInstall",
				name: "settings.applyOnInstallName",
				desc: "settings.applyOnInstallDesc",
			},
			{
				key: "mergePluginSettings",
				name: "settings.mergeName",
				desc: "settings.mergeDesc",
			},
			{
				key: "loadSettingsOnStartup",
				name: "settings.syncOnStartupName",
				desc: "settings.syncOnStartupDesc",
			},
			{
				key: "allowAutoActionsOnMobile",
				name: "settings.mobileName",
				desc: "settings.mobileDesc",
			},
			{
				key: "redactSecretsOnExport",
				name: "settings.redactName",
				desc: "settings.redactDesc",
			},
			{
				key: "syncVaultSetup",
				name: "settings.syncVaultSetupName",
				desc: "settings.syncVaultSetupDesc",
			},
		];
	}

	private addToggle(setting: Setting, key: BooleanSetting): void {
		setting.addToggle((toggle) =>
			toggle.setValue(this.plugin.settings[key]).onChange(async (value) => {
				this.plugin.settings[key] = value;
				await this.plugin.saveSettings();
			}),
		);
	}

	private addExtraSecretsField(setting: Setting): void {
		setting.addText((text) =>
			text
				.setPlaceholder(t("settings.extraSecretsPlaceholder"))
				.setValue(this.plugin.settings.extraSecretKeys)
				.onChange(async (value) => {
					this.plugin.settings.extraSecretKeys = value;
					await this.plugin.saveSettings();
				}),
		);
	}

	private addLogLevelDropdown(setting: Setting): void {
		const options: Array<[LogLevelName, MessageKey]> = [
			["debug", "settings.logDebug"],
			["info", "settings.logInfo"],
			["warn", "settings.logWarn"],
			["error", "settings.logError"],
			["none", "settings.logNone"],
		];
		setting.addDropdown((dropdown) => {
			for (const [value, label] of options) {
				dropdown.addOption(value, t(label));
			}
			dropdown
				.setValue(this.plugin.settings.logLevel || "error")
				.onChange(async (value) => {
					const level = value as LogLevelName;
					this.plugin.settings.logLevel = level;
					await this.plugin.saveSettings();
					this.plugin.applyLogLevel(level);
				});
		});
	}

	// The other settings after the toggles: secret names and logging.
	private extraDefinitions() {
		return [
			{
				name: t("settings.extraSecretsName"),
				desc: t("settings.extraSecretsDesc"),
				render: (setting: Setting) => this.addExtraSecretsField(setting),
			},
			{
				name: t("settings.logLevelName"),
				desc: t("settings.logLevelDesc"),
				render: (setting: Setting) => this.addLogLevelDropdown(setting),
			},
		];
	}

	// Obsidian 1.13+ builds the tab (and settings search) from these.
	getSettingDefinitions() {
		return [
			{
				name: t("settings.warningName"),
				desc: t("settings.warningDesc"),
			},
			...this.actions().map((action) => ({
				name: t(action.name),
				desc: action.desc,
				render: (setting: Setting) => this.addActionButton(setting, action),
			})),
			...this.toggles().map((toggle) => ({
				name: t(toggle.name),
				desc: t(toggle.desc),
				render: (setting: Setting) => this.addToggle(setting, toggle.key),
			})),
			...this.extraDefinitions(),
		];
	}

	// Older Obsidian versions call display().
	display(): void {
		const { containerEl } = this;
		containerEl.empty();

		const warningDiv = containerEl.createDiv({
			cls: "community-install-manager-warning setting-item-description",
		});
		warningDiv.createEl("strong", { text: t("settings.warningPrefix") });
		warningDiv.appendText(t("settings.warningDesc"));

		for (const action of this.actions()) {
			this.addActionButton(
				new Setting(containerEl).setName(t(action.name)).setDesc(action.desc),
				action,
			);
		}

		for (const toggle of this.toggles()) {
			this.addToggle(
				new Setting(containerEl).setName(t(toggle.name)).setDesc(t(toggle.desc)),
				toggle.key,
			);
		}

		for (const definition of this.extraDefinitions()) {
			definition.render(
				new Setting(containerEl)
					.setName(definition.name)
					.setDesc(definition.desc),
			);
		}
	}
}
