import { App, Modal, Notice, Setting } from "obsidian";
import { FileManager } from "../utils/FileManager";
import {
	PLUGINS_LIST_FILE,
	PLUGINS_SETTINGS_FILE,
	PluginListEntry,
} from "../types";
import { normalizeVersion, parsePluginList } from "../utils/parsePluginList";
import { logger } from "../utils/Logger";

export type InstallPreviewAction =
	| "install"
	| "skip"
	| "repin"
	| "ok-pinned";

export type SettingsPreviewAction =
	| "would-apply"
	| "no-settings-entry"
	| "plugin-not-installed"
	| "settings-file-missing";

export interface PluginPreviewRow {
	id: string;
	pinnedVersion?: string;
	localVersion: string | null;
	installed: boolean;
	installAction: InstallPreviewAction;
	installNote: string;
	settingsAction: SettingsPreviewAction;
	settingsNote: string;
}

export interface SetupPreviewReport {
	rows: PluginPreviewRow[];
	summary: {
		install: number;
		skip: number;
		repin: number;
		okPinned: number;
		wouldApplySettings: number;
	};
	listMissing: boolean;
	settingsMissing: boolean;
}

export class SetupPreview {
	constructor(private fileManager: FileManager) {}

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
		loadSettingsOnInstall: boolean
	): Promise<SetupPreviewReport | null> {
		this.fileManager.assertDesktopAdapter();

		const listPath = this.fileManager.configPath(PLUGINS_LIST_FILE);
		const settingsPath = this.fileManager.configPath(PLUGINS_SETTINGS_FILE);

		const listMissing = !(await this.fileManager.exists(listPath));
		const settingsMissing = !(await this.fileManager.exists(settingsPath));

		if (listMissing) {
			new Notice(
				`[Installer] Preview: ${PLUGINS_LIST_FILE} not found.`
			);
			return {
				rows: [],
				summary: {
					install: 0,
					skip: 0,
					repin: 0,
					okPinned: 0,
					wouldApplySettings: 0,
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
			new Notice(`[Installer] Preview: invalid JSON in ${PLUGINS_LIST_FILE}.`);
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
		const localVersion = installed ? await this.getLocalVersion(id) : null;

		let installAction: InstallPreviewAction;
		let installNote: string;

		if (!installed) {
			installAction = "install";
			installNote = pinnedVersion
				? `Would install @${pinnedVersion}`
				: "Would install (latest stable)";
			summary.install++;
		} 
		else if (pinnedVersion) {
			if (localVersion && localVersion === pinnedVersion) {
				installAction = "ok-pinned";
				installNote = `Already at pinned ${pinnedVersion}`;
				summary.okPinned++;
			} 
			else {
				installAction = "repin";
				installNote = `Would change ${localVersion ?? "unknown"} → ${pinnedVersion}`;
				summary.repin++;
			}
		} 
		else {
			installAction = "skip";
			installNote = localVersion
				? `Already installed @${localVersion} (unpinned, skip)`
				: "Already installed (unpinned, skip)";
			summary.skip++;
		}

		let settingsAction: SettingsPreviewAction;
		let settingsNote: string;

		if (settingsMissing) {
			settingsAction = "settings-file-missing";
			settingsNote = `${PLUGINS_SETTINGS_FILE} missing`;
		} 
		else if (!Object.prototype.hasOwnProperty.call(settingsMap, id)) {
			settingsAction = "no-settings-entry";
			settingsNote = "No settings entry";
		} 
		else if (!installed && !loadSettingsOnInstall) {
			settingsAction = "plugin-not-installed";
			settingsNote =
				"Settings exist, but Apply on install is off and plugin missing";
		} 
		else if (!installed && loadSettingsOnInstall) {
			settingsAction = "would-apply";
			settingsNote = "Would apply settings after install";
			summary.wouldApplySettings++;
		} 
		else {
			settingsAction = "would-apply";
			settingsNote = loadSettingsOnInstall
				? "Would apply settings on import/install"
				: "Would apply only via Apply settings / startup sync";
			summary.wouldApplySettings++;
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
		};
	}

	formatReportText(report: SetupPreviewReport): string {
		const lines: string[] = [];
		lines.push(
			`Summary: install ${report.summary.install}, skip ${report.summary.skip}, re-pin ${report.summary.repin}, ok pinned ${report.summary.okPinned}, settings touch ${report.summary.wouldApplySettings}`
		);

		if (report.settingsMissing) {
			lines.push(`Note: ${PLUGINS_SETTINGS_FILE} not found.`);
		}

		lines.push("");

		for (const row of report.rows) {
			const pin = row.pinnedVersion ? `@${row.pinnedVersion}` : "";
			lines.push(`• ${row.id}${pin}`);
			lines.push(`    install:  ${row.installNote}`);
			lines.push(`    settings: ${row.settingsNote}`);
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
			return "Install";
		case "repin":
			return "Re-pin";
		case "ok-pinned":
			return "Pinned OK";
		case "skip":
		default:
			return "Skip";
	}
}

function settingsBadgeLabel(action: SettingsPreviewAction): string {
	switch (action) {
		case "would-apply":
			return "Settings";
		case "no-settings-entry":
			return "No settings";
		case "plugin-not-installed":
			return "Settings blocked";
		case "settings-file-missing":
			return "No settings file";
		default:
			return "Settings";
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
		contentEl.createEl("h2", { text: "Import preview" });

		const summary = contentEl.createDiv({
			cls: "community-install-manager-preview-summary",
		});

		this.addStat(summary, "Install", this.report.summary.install, "install");
		this.addStat(summary, "Skip", this.report.summary.skip, "skip");
		this.addStat(summary, "Re-pin", this.report.summary.repin, "repin");
		this.addStat(
			summary,
			"Pinned OK",
			this.report.summary.okPinned,
			"ok"
		);
		this.addStat(
			summary,
			"Settings",
			this.report.summary.wouldApplySettings,
			"settings"
		);

		if (this.report.settingsMissing) {
			contentEl.createDiv({
				cls: "community-install-manager-preview-note",
				text: `${PLUGINS_SETTINGS_FILE} was not found.`,
			});
		}

		const list = contentEl.createDiv({
			cls: "community-install-manager-preview-list",
		});

		if (this.report.rows.length === 0) {
			list.createDiv({
				cls: "community-install-manager-preview-empty",
				text: "No plugins in the list.",
			});
		} else {
			for (const row of this.report.rows) {
				this.renderRow(list, row);
			}
		}

		new Setting(contentEl).addButton((button) =>
			button.setButtonText("Close").setCta().onClick(() => this.close())
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
	}

	onClose(): void {
		this.contentEl.empty();
	}
}
