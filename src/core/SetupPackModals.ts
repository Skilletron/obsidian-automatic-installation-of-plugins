import { App, Modal, Setting } from "obsidian";
import { ParsedPack } from "./SetupPack";
import { t } from "../i18n";

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
