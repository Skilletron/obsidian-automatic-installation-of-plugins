import { App, Modal, Setting } from "obsidian";
import { PluginUpdate } from "./UpdateChecker";

// Lists plugins with newer versions and lets the user update some or all.
export class UpdatesModal extends Modal {
	constructor(
		app: App,
		private updates: PluginUpdate[],
		private onUpdate: (updates: PluginUpdate[]) => Promise<void>,
	) {
		super(app);
	}

	onOpen(): void {
		const { contentEl } = this;
		contentEl.empty();
		contentEl.addClass("community-install-manager-updates-modal");
		contentEl.createEl("h2", { text: "Plugin updates" });

		const updatable = this.updates.filter((u) => u.available);
		if (this.updates.length === 0) {
			contentEl.createEl("p", {
				text: "All community plugins are up to date.",
			});
		}

		for (const update of this.updates) {
			const setting = new Setting(contentEl)
				.setName(update.name)
				.setDesc(describe(update));
			if (update.available) {
				setting.addButton((button) =>
					button.setButtonText("Update").onClick(async () => {
						this.close();
						await this.onUpdate([update]);
					}),
				);
			}
		}

		const footer = new Setting(contentEl);
		if (updatable.length > 1) {
			footer.addButton((button) =>
				button
					.setButtonText(`Update all (${updatable.length})`)
					.setCta()
					.onClick(async () => {
						this.close();
						await this.onUpdate(updatable);
					}),
			);
		}
		footer.addButton((button) =>
			button.setButtonText("Close").onClick(() => this.close()),
		);
	}
}

function describe(update: PluginUpdate): string {
	const parts: string[] = [];
	if (update.available) {
		parts.push(`${update.installed} → ${update.available}`);
	} else {
		parts.push(`Installed ${update.installed}`);
	}
	if (update.newerNeedsApp) {
		parts.push(
			`${update.newerNeedsApp.version} needs Obsidian ${update.newerNeedsApp.minAppVersion}`,
		);
	}
	if (update.pinned && update.available) {
		parts.push(`the pin in your plugin list (${update.pinned}) will be updated too`);
	}
	return parts.join(" · ");
}
