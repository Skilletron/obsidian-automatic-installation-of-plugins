import { App, ButtonComponent, Modal, Setting, ToggleComponent } from "obsidian";
import { PackPluginChoice } from "./SetupExporter";
import { ParsedPack } from "./SetupPack";
import { t } from "../i18n";

// Lets the user pick which installed plugins go into a pack. Everything
// starts ticked, and nothing is saved until they press the button.
export class PackExportModal extends Modal {
	private chosen: Set<string>;
	private toggles = new Map<string, ToggleComponent>();
	private saveButton: ButtonComponent | null = null;

	constructor(
		app: App,
		private plugins: PackPluginChoice[],
		// A pack without plugins is still useful if it carries a theme or snippets.
		private allowNoPlugins: boolean,
		private onSave: (ids: string[]) => Promise<void>,
	) {
		super(app);
		this.chosen = new Set(plugins.map((plugin) => plugin.id));
	}

	onOpen(): void {
		const { contentEl } = this;
		contentEl.empty();
		contentEl.addClass("community-install-manager-pack-export-modal");
		contentEl.createEl("h2", { text: t("pack.pickTitle") });
		contentEl.createEl("p", {
			cls: "setting-item-description",
			text: this.plugins.length > 0 ? t("pack.pickDesc") : t("pack.pickEmpty"),
		});

		if (this.plugins.length > 1) {
			new Setting(contentEl)
				.addButton((button) =>
					button
						.setButtonText(t("pack.pickAll"))
						.onClick(() => this.setAll(true)),
				)
				.addButton((button) =>
					button
						.setButtonText(t("pack.pickNone"))
						.onClick(() => this.setAll(false)),
				);
		}

		const list = contentEl.createDiv({
			cls: "community-install-manager-pack-export-list",
		});
		for (const plugin of this.plugins) {
			new Setting(list)
				.setName(plugin.name)
				.setDesc(describeChoice(plugin))
				.addToggle((toggle) => {
					this.toggles.set(plugin.id, toggle);
					toggle.setValue(true).onChange((value) => {
						this.setChosen(plugin.id, value);
						this.refreshSaveButton();
					});
				});
		}

		new Setting(contentEl)
			.addButton((button) => {
				this.saveButton = button;
				button.setCta().onClick(async () => {
					const ids = this.plugins
						.map((plugin) => plugin.id)
						.filter((id) => this.chosen.has(id));
					this.close();
					await this.onSave(ids);
				});
			})
			.addButton((button) =>
				button.setButtonText(t("common.cancel")).onClick(() => this.close()),
			);
		this.refreshSaveButton();
	}

	private setChosen(id: string, value: boolean): void {
		if (value) {
			this.chosen.add(id);
		} else {
			this.chosen.delete(id);
		}
	}

	private setAll(value: boolean): void {
		for (const plugin of this.plugins) {
			this.setChosen(plugin.id, value);
			this.toggles.get(plugin.id)?.setValue(value);
		}
		this.refreshSaveButton();
	}

	private refreshSaveButton(): void {
		this.saveButton
			?.setButtonText(t("pack.pickSave", { count: this.chosen.size }))
			.setDisabled(this.chosen.size === 0 && !this.allowNoPlugins);
	}

	onClose(): void {
		this.contentEl.empty();
	}
}

function describeChoice(plugin: PackPluginChoice): string {
	const parts = [plugin.id];
	if (plugin.version) {
		parts.push(plugin.version);
	}
	if (plugin.off) {
		parts.push(t("pack.pickOff"));
	}
	return parts.join(" · ");
}

// Asks for a link to a setup pack (or a path to one in the vault).
export class PackLinkModal extends Modal {
	private value = "";

	constructor(
		app: App,
		private onSubmit: (input: string) => void,
	) {
		super(app);
	}

	onOpen(): void {
		const { contentEl } = this;
		contentEl.empty();
		contentEl.addClass("community-install-manager-pack-link-modal");
		contentEl.createEl("h2", { text: t("pack.linkTitle") });
		contentEl.createEl("p", {
			cls: "setting-item-description",
			text: t("pack.linkDesc"),
		});

		const link = new Setting(contentEl).setName(t("pack.linkName"));
		// The input gets a row of its own so the whole link stays readable.
		link.settingEl.addClass("community-install-manager-pack-link");
		link.addText((text) => {
			text
				.setPlaceholder(t("pack.linkPlaceholder"))
				.onChange((value) => {
					this.value = value;
				});
			text.inputEl.addClass("community-install-manager-pack-input");
			text.inputEl.addEventListener("keydown", (event) => {
				if (event.key === "Enter") {
					this.submit();
				}
			});
		});

		new Setting(contentEl)
			.addButton((button) =>
				button
					.setButtonText(t("pack.load"))
					.setCta()
					.onClick(() => this.submit()),
			)
			.addButton((button) =>
				button.setButtonText(t("common.cancel")).onClick(() => this.close()),
			);
	}

	private submit(): void {
		if (!this.value.trim()) {
			return;
		}
		this.close();
		this.onSubmit(this.value.trim());
	}

	onClose(): void {
		this.contentEl.empty();
	}
}

// Shows what a pack would add before anything is changed.
export class PackConfirmModal extends Modal {
	constructor(
		app: App,
		private pack: ParsedPack,
		private source: string,
		private vaultSetupSummary: string,
		private onConfirm: () => Promise<void>,
	) {
		super(app);
	}

	onOpen(): void {
		const { contentEl } = this;
		const { pack } = this;
		contentEl.empty();
		contentEl.addClass("community-install-manager-pack-modal");
		contentEl.createEl("h2", { text: pack.name || t("pack.defaultName") });
		if (pack.description) {
			contentEl.createEl("p", { text: pack.description });
		}
		contentEl.createDiv({
			cls: "community-install-manager-pack-source setting-item-description",
			text: t("pack.from", { source: this.source }),
		});
		contentEl.createDiv({
			cls: "community-install-manager-warning setting-item-description",
			text: t("pack.warning"),
		});

		const settingsCount = Object.keys(pack.settings).length;
		contentEl.createEl("h3", {
			text: t("pack.pluginCount", {
				count: pack.plugins.length,
				withSettings: settingsCount,
			}),
		});
		const list = contentEl.createEl("ul", {
			cls: "community-install-manager-pack-plugins",
		});
		for (const plugin of pack.plugins) {
			const parts = [plugin.id];
			if (plugin.version) {
				parts.push(`@${plugin.version}`);
			}
			if (plugin.devices) {
				parts.push(
					t("pack.devicesOnly", {
						devices: plugin.devices
							.map((d) => t(d === "mobile" ? "device.mobile" : "device.desktop"))
							.join(", "),
					}),
				);
			}
			if (plugin.enabled === false) {
				parts.push(t("pack.staysOff"));
			}
			if (plugin.id in pack.settings) {
				parts.push(t("pack.hasSettings"));
			}
			list.createEl("li", { text: parts.join("") });
		}

		if (this.vaultSetupSummary) {
			contentEl.createEl("p", {
				cls: "setting-item-description",
				text: this.vaultSetupSummary,
			});
		}
		contentEl.createEl("p", {
			cls: "setting-item-description",
			text: t("pack.explain"),
		});

		new Setting(contentEl)
			.addButton((button) =>
				button
					.setButtonText(t("pack.confirm"))
					.setCta()
					.onClick(async () => {
						this.close();
						await this.onConfirm();
					}),
			)
			.addButton((button) =>
				button.setButtonText(t("common.cancel")).onClick(() => this.close()),
			);
	}

	onClose(): void {
		this.contentEl.empty();
	}
}
