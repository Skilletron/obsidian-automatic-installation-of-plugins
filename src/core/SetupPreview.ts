import { App, Modal, Notice, Platform, Setting } from "obsidian";
import { FileManager } from "../utils/FileManager";
import {
	PLUGINS_LIST_FILE,
	PLUGINS_SETTINGS_FILE,
	PluginListEntry,
} from "../types";
import {
	isForThisDevice,
	normalizeVersion,
	parsePluginList,
} from "../utils/parsePluginList";
import { logger } from "../utils/Logger";
import {
	LiveVaultState,
	describeVaultSetupChanges,
	parseVaultSetup,
	readVaultSetup,
} from "./VaultSetup";
import { VAULT_SETUP_FILE } from "../types";
import { SettingsManager } from "./SettingsManager";
import { SettingChange, formatChange } from "../utils/settingsDiff";
import { t } from "../i18n";

export type InstallPreviewAction =
	| "install"
	| "skip"
	| "repin"
	| "ok-pinned"
	| "other-device";

export type SettingsPreviewAction =
	| "would-apply"
	| "no-settings-entry"
	| "plugin-not-installed"
	| "settings-file-missing"
	| "other-device";

export interface PluginPreviewRow {
	id: string;
	pinnedVersion?: string;
	localVersion: string | null;
	installed: boolean;
	installAction: InstallPreviewAction;
	installNote: string;
	settingsAction: SettingsPreviewAction;
	settingsNote: string;
	// What applying the settings entry would change in data.json.
	settingsChanges?: SettingChange[];
}

export interface SetupPreviewReport {
	rows: PluginPreviewRow[];
	summary: {
		install: number;
		skip: number;
		repin: number;
		okPinned: number;
		wouldApplySettings: number;
		otherDevice: number;
	};
	listMissing: boolean;
	settingsMissing: boolean;
	// Theme and snippet changes, when vault-setup.json is used.
	vaultSetup?: string;
}

export class SetupPreview {
	constructor(
		private fileManager: FileManager,
		private isMobile: () => boolean = () => Platform.isMobile,
		private liveVaultState: () => LiveVaultState | null = () => null,
		private settingsManager?: SettingsManager,
	) {}

	private async isFullyInstalled(pluginId: string): Promise<boolean> {
		const manifestPath = this.fileManager
			.pluginsPath(pluginId, "manifest.json");
		const mainPath = this.fileManager
			.pluginsPath(pluginId, "main.js");
			
		return (
			(await this.fileManager.exists(manifestPath)) &&
			(await this.fileManager.exists(mainPath))
		);
	}

	private async getLocalVersion(pluginId: string): Promise<string | null> {
		const manifestPath = this.fileManager.pluginsPath(
			pluginId,
			"manifest.json"
		);
		if (!(await this.fileManager.exists(manifestPath))) {
			return null;
		}

		const raw = await this.fileManager.readFile(manifestPath);
		if (!raw) {
			return null;
		}
		
		try {
			const manifest = JSON.parse(raw) as { version?: string };
			if (typeof manifest.version === "string" && manifest.version.trim()) {
				return normalizeVersion(manifest.version);
			}
		} catch {
			return null;
		}

		return null;
	}

	async buildReport(
		loadSettingsOnInstall: boolean,
		includeVaultSetup = false
	): Promise<SetupPreviewReport | null> {
		const report = await this.buildPluginReport(loadSettingsOnInstall);
		if (report && includeVaultSetup) {
			const vaultSetup = await this.describeVaultSetup();
			if (vaultSetup) {
				report.vaultSetup = vaultSetup;
			}
		}
		return report;
	}

	private async describeVaultSetup(): Promise<string | null> {
		const path = this.fileManager.configPath(VAULT_SETUP_FILE);
		if (!(await this.fileManager.exists(path))) {
			return null;
		}
		try {
			const wanted = parseVaultSetup(
				JSON.parse((await this.fileManager.readFile(path)) ?? "")
			);
			if (!wanted) {
				return t("preview.vaultSetupInvalid", { file: VAULT_SETUP_FILE });
			}
			return describeVaultSetupChanges(
				wanted,
				await readVaultSetup(this.fileManager, this.liveVaultState())
			);
		} catch {
			return t("preview.vaultSetupInvalidJson", { file: VAULT_SETUP_FILE });
		}
	}

	private async buildPluginReport(
		loadSettingsOnInstall: boolean
	): Promise<SetupPreviewReport | null> {
		const listPath = this.fileManager.configPath(PLUGINS_LIST_FILE);
		const settingsPath = this.fileManager.configPath(PLUGINS_SETTINGS_FILE);

		const listMissing = !(await this.fileManager.exists(listPath));
		const settingsMissing = !(await this.fileManager.exists(settingsPath));

		if (listMissing) {
			new Notice(t("preview.listNotFound", { file: PLUGINS_LIST_FILE }));
			return {
				rows: [],
				summary: {
					install: 0,
					skip: 0,
					repin: 0,
					okPinned: 0,
					wouldApplySettings: 0,
					otherDevice: 0,
				},
				listMissing: true,
				settingsMissing,
			};
		}

		const listRaw = await this.fileManager.readFile(listPath);
		if (!listRaw) {
			return null;
		}

		let parsedList: unknown;
		try {
			parsedList = JSON.parse(listRaw) as unknown;
		} catch (err: unknown) {
			new Notice(t("preview.listInvalidJson", { file: PLUGINS_LIST_FILE }));
			logger.error("Preview list parse failed:", err);
			return null;
		}

		const entries = parsePluginList(parsedList);
		if (!entries) {
			return null;
		}

		let settingsMap: Record<string, unknown> = {};
		if (!settingsMissing) {
			const settingsRaw = await this.fileManager.readFile(settingsPath);
			if (settingsRaw) {
				try {
					const parsed = JSON.parse(settingsRaw) as unknown;
					if (
						parsed !== null &&
						typeof parsed === "object" &&
						!Array.isArray(parsed)
					) {
						settingsMap = parsed as Record<string, unknown>;
					}
				} catch (err: unknown) {
					logger.warn("Preview: could not parse settings JSON:", err);
				}
			}
		}

		const rows: PluginPreviewRow[] = [];
		const summary = {
			install: 0,
			skip: 0,
			repin: 0,
			okPinned: 0,
			wouldApplySettings: 0,
			otherDevice: 0,
		};

		for (const entry of entries) {
			const row = await this.previewEntry(
				entry,
				settingsMap,
				settingsMissing,
				loadSettingsOnInstall,
				summary
			);
			rows.push(row);
		}

		return {
			rows,
			summary,
			listMissing: false,
			settingsMissing,
		};
	}

	private async previewEntry(
		entry: PluginListEntry,
		settingsMap: Record<string, unknown>,
		settingsMissing: boolean,
		loadSettingsOnInstall: boolean,
		summary: SetupPreviewReport["summary"]
	): Promise<PluginPreviewRow> {
		const id = entry.id;
		const pinnedVersion = entry.version;
		const installed = await this.isFullyInstalled(id);

		if (!isForThisDevice(entry, this.isMobile())) {
			summary.otherDevice++;
			const devices = (entry.devices ?? [])
				.map((d) => t(d === "mobile" ? "device.mobile" : "device.desktop"))
				.join(t("common.and"));
			return {
				id,
				pinnedVersion,
				localVersion: installed ? await this.getLocalVersion(id) : null,
				installed,
				installAction: "other-device",
				installNote: t("preview.otherDevice", { devices }),
				settingsAction: "other-device",
				settingsNote: t("preview.notOnDevice"),
			};
		}
		const localVersion = installed ? await this.getLocalVersion(id) : null;

		let installAction: InstallPreviewAction;
		let installNote: string;

		if (!installed) {
			installAction = "install";
			installNote = pinnedVersion
				? t("preview.installPinned", { version: pinnedVersion })
				: t("preview.installLatest");
			if (entry.enabled === false) {
				installNote += t("preview.leftOff");
			}
			summary.install++;
		} 
		else if (pinnedVersion) {
			if (localVersion && localVersion === pinnedVersion) {
				installAction = "ok-pinned";
				installNote = t("preview.alreadyPinned", { version: pinnedVersion });
				summary.okPinned++;
			} 
			else {
				installAction = "repin";
				installNote = t("preview.wouldChange", {
					from: localVersion ?? t("preview.unknownVersion"),
					to: pinnedVersion,
				});
				summary.repin++;
			}
		} 
		else {
			installAction = "skip";
			installNote = localVersion
				? t("preview.installedSkip", { version: localVersion })
				: t("preview.installedSkipNoVersion");
			summary.skip++;
		}

		let settingsAction: SettingsPreviewAction;
		let settingsNote: string;

		if (settingsMissing) {
			settingsAction = "settings-file-missing";
			settingsNote = t("preview.settingsMissing", { file: PLUGINS_SETTINGS_FILE });
		} 
		else if (!Object.prototype.hasOwnProperty.call(settingsMap, id)) {
			settingsAction = "no-settings-entry";
			settingsNote = t("preview.noEntry");
		} 
		else if (!installed && !loadSettingsOnInstall) {
			settingsAction = "plugin-not-installed";
			settingsNote = t("preview.blocked");
		} 
		else if (!installed && loadSettingsOnInstall) {
			settingsAction = "would-apply";
			settingsNote = t("preview.afterInstall");
			summary.wouldApplySettings++;
		} 
		else {
			settingsAction = "would-apply";
			// Import writes settings only for plugins it installs or re-pins;
			// for the rest it takes Apply settings (or sync on startup).
			settingsNote =
				loadSettingsOnInstall && installAction === "repin"
					? t("preview.afterRepin")
					: t("preview.viaApply");
			summary.wouldApplySettings++;
		}

		let settingsChanges: SettingChange[] | undefined;
		if (settingsAction === "would-apply" && this.settingsManager) {
			settingsChanges = await this.settingsManager.previewSettings({
				pluginId: id,
				folderName: id,
				settings: settingsMap[id],
			});
			const count = settingsChanges.length;
			settingsNote +=
				count > 0
					? t("preview.changes", { count })
					: t("preview.matches");
		}

		return {
			id,
			pinnedVersion,
			localVersion,
			installed,
			installAction,
			installNote,
			settingsAction,
			settingsNote,
			...(settingsChanges ? { settingsChanges } : {}),
		};
	}

	formatReportText(report: SetupPreviewReport): string {
		const lines: string[] = [];
		lines.push(
			`Summary: install ${report.summary.install}, skip ${report.summary.skip}, re-pin ${report.summary.repin}, ok pinned ${report.summary.okPinned}, settings touch ${report.summary.wouldApplySettings}, other devices ${report.summary.otherDevice}`
		);

		if (report.settingsMissing) {
			lines.push(`Note: ${PLUGINS_SETTINGS_FILE} not found.`);
		}
		if (report.vaultSetup) {
			lines.push(report.vaultSetup);
		}

		lines.push("");

		for (const row of report.rows) {
			const pin = row.pinnedVersion ? `@${row.pinnedVersion}` : "";
			lines.push(`• ${row.id}${pin}`);
			lines.push(`    install:  ${row.installNote}`);
			lines.push(`    settings: ${row.settingsNote}`);
			for (const change of row.settingsChanges ?? []) {
				lines.push(`      ${formatChange(change)}`);
			}
		}

		if (report.rows.length === 0) {
			lines.push("(empty list)");
		}

		return lines.join("\n");
	}
}

function installBadgeLabel(action: InstallPreviewAction): string {
	switch (action) {
		case "install":
			return t("preview.badgeInstall");
		case "repin":
			return t("preview.badgeRepin");
		case "ok-pinned":
			return t("preview.badgeOkPinned");
		case "other-device":
			return t("preview.badgeOtherDevice");
		case "skip":
		default:
			return t("preview.badgeSkip");
	}
}

function settingsBadgeLabel(action: SettingsPreviewAction): string {
	switch (action) {
		case "would-apply":
			return t("preview.badgeSettings");
		case "no-settings-entry":
			return t("preview.badgeNoSettings");
		case "plugin-not-installed":
			return t("preview.badgeBlocked");
		case "settings-file-missing":
			return t("preview.badgeNoFile");
		case "other-device":
			return t("preview.badgeNotHere");
		default:
			return t("preview.badgeSettings");
	}
}

export class SetupPreviewModal extends Modal {
	constructor(
		app: App,
		private report: SetupPreviewReport
	) {
		super(app);
	}

	onOpen(): void {
		const { contentEl } = this;

		contentEl.empty();
		contentEl.addClass("community-install-manager-preview-modal");
		contentEl.createEl("h2", { text: t("preview.title") });

		const summary = contentEl.createDiv({
			cls: "community-install-manager-preview-summary",
		});

		this.addStat(summary, t("preview.badgeInstall"), this.report.summary.install, "install");
		this.addStat(summary, t("preview.badgeSkip"), this.report.summary.skip, "skip");
		this.addStat(summary, t("preview.badgeRepin"), this.report.summary.repin, "repin");
		this.addStat(
			summary,
			t("preview.badgeOkPinned"),
			this.report.summary.okPinned,
			"ok"
		);
		this.addStat(
			summary,
			t("preview.badgeSettings"),
			this.report.summary.wouldApplySettings,
			"settings"
		);
		if (this.report.summary.otherDevice > 0) {
			this.addStat(
				summary,
				t("preview.statOtherDevices"),
				this.report.summary.otherDevice,
				"skip"
			);
		}

		if (this.report.settingsMissing) {
			contentEl.createDiv({
				cls: "community-install-manager-preview-note",
				text: t("preview.fileNotFound", { file: PLUGINS_SETTINGS_FILE }),
			});
		}
		if (this.report.vaultSetup) {
			contentEl.createDiv({
				cls: "community-install-manager-preview-note",
				text: this.report.vaultSetup,
			});
		}

		const list = contentEl.createDiv({
			cls: "community-install-manager-preview-list",
		});

		if (this.report.rows.length === 0) {
			list.createDiv({
				cls: "community-install-manager-preview-empty",
				text: t("preview.empty"),
			});
		} else {
			for (const row of this.report.rows) {
				this.renderRow(list, row);
			}
		}

		new Setting(contentEl).addButton((button) =>
			button.setButtonText(t("common.close")).setCta().onClick(() => this.close())
		);
	}

	private addStat(
		parent: HTMLElement,
		label: string,
		value: number,
		kind: string
	): void {
		const el = parent.createDiv({
			cls: `community-install-manager-preview-stat is-${kind}`,
		});

		el.createSpan({
			cls: "community-install-manager-preview-stat-value",
			text: String(value),
		});
		el.createSpan({
			cls: "community-install-manager-preview-stat-label",
			text: label,
		});
	}

	private renderRow(parent: HTMLElement, row: PluginPreviewRow): void {
		const item = parent.createDiv({
			cls: `community-install-manager-preview-row is-${row.installAction}`,
		});
		const head = item.createDiv({
			cls: "community-install-manager-preview-row-head",
		});
		const title = head.createDiv({
			cls: "community-install-manager-preview-row-title",
		});
		
		title.createSpan({
			cls: "community-install-manager-preview-id",
			text: row.id,
		});

		if (row.pinnedVersion) {
			title.createSpan({
				cls: "community-install-manager-preview-version",
				text: `@${row.pinnedVersion}`,
			});
		} else if (row.localVersion) {
			title.createSpan({
				cls: "community-install-manager-preview-version is-local",
				text: `@${row.localVersion}`,
			});
		}

		const badges = head.createDiv({
			cls: "community-install-manager-preview-badges",
		});

		badges.createSpan({
			cls: `community-install-manager-preview-badge is-${row.installAction}`,
			text: installBadgeLabel(row.installAction),
		});
		badges.createSpan({
			cls: `community-install-manager-preview-badge is-settings-${row.settingsAction}`,
			text: settingsBadgeLabel(row.settingsAction),
		});

		item.createDiv({
			cls: "community-install-manager-preview-row-meta",
			text: row.installNote,
		});
		item.createDiv({
			cls: "community-install-manager-preview-row-meta is-settings",
			text: row.settingsNote,
		});

		const changes = row.settingsChanges ?? [];
		if (changes.length > 0) {
			const details = item.createEl("details", {
				cls: "community-install-manager-preview-changes",
			});
			details.createEl("summary", {
				text: t("preview.showChanges", { count: changes.length }),
			});
			const list = details.createEl("ul");
			for (const change of changes) {
				list.createEl("li", {
					cls: `is-${change.kind}`,
					text: formatChange(change),
				});
			}
		}
	}

	onClose(): void {
		this.contentEl.empty();
	}
}
