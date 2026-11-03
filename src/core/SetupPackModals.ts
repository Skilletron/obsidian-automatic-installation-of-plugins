import { App, Modal, Setting } from "obsidian";
import { ParsedPack } from "./SetupPack";

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
		contentEl.createEl("h2", { text: "Import a setup pack" });
		contentEl.createEl("p", {
			cls: "setting-item-description",
			text: "Paste a web link to a setup pack (a GitHub gist or a file on GitHub works too), or the path of a pack file in this vault. Nothing is installed until you confirm on the next screen.",
		});

		new Setting(contentEl).setName("Link or path").addText((text) => {
			text
				.setPlaceholder("Link or vault path")
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
					.setButtonText("Load")
					.setCta()
					.onClick(() => this.submit()),
			)
			.addButton((button) =>
				button.setButtonText("Cancel").onClick(() => this.close()),
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
		contentEl.createEl("h2", { text: pack.name || "Setup pack" });
		if (pack.description) {
			contentEl.createEl("p", { text: pack.description });
		}
		contentEl.createDiv({
			cls: "community-install-manager-pack-source setting-item-description",
			text: `From: ${this.source}`,
		});
		contentEl.createDiv({
			cls: "community-install-manager-warning setting-item-description",
			text: "Community plugins can read and change your notes. Only continue if you trust whoever made this pack.",
		});

		const settingsCount = Object.keys(pack.settings).length;
		contentEl.createEl("h3", {
			text: `${pack.plugins.length} plugin${pack.plugins.length === 1 ? "" : "s"} (${settingsCount} with settings)`,
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
				parts.push(` (${plugin.devices.join(", ")} only)`);
			}
			if (plugin.enabled === false) {
				parts.push(" (stays off)");
			}
			if (plugin.id in pack.settings) {
				parts.push(" · settings");
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
			text: "The pack is added to your own plugin list and settings files (it wins where both have something), then the import runs. Undo last change puts the files back.",
		});

		new Setting(contentEl)
			.addButton((button) =>
				button
					.setButtonText("Add to my setup and import")
					.setCta()
					.onClick(async () => {
						this.close();
						await this.onConfirm();
					}),
			)
			.addButton((button) =>
				button.setButtonText("Cancel").onClick(() => this.close()),
			);
	}

	onClose(): void {
		this.contentEl.empty();
	}
}
