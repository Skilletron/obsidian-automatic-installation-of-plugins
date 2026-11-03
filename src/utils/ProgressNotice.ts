import { Notice } from "obsidian";

// The plugin's single notice. A long task updates it in place, with a
// progress bar, instead of showing a new notice for every step. Starting a
// new one closes the previous one, so results never stack up.
export class ProgressNotice {
	private static current: ProgressNotice | null = null;

	private notice: Notice;
	private titleEl: HTMLElement;
	private detailEl: HTMLElement;
	private barEl: HTMLElement;
	private fillEl: HTMLElement;
	private done = false;

	constructor(title: string, showBar = true) {
		ProgressNotice.current?.hide();
		ProgressNotice.current = this;

		const fragment = document.createDocumentFragment();
		const root = el("div", "community-install-manager-progress");
		this.titleEl = el("div", "community-install-manager-progress-title");
		this.titleEl.textContent = title;
		this.detailEl = el("div", "community-install-manager-progress-detail");
		this.barEl = el("div", "community-install-manager-progress-bar");
		this.fillEl = el("div", "community-install-manager-progress-fill");
		this.barEl.appendChild(this.fillEl);
		root.append(this.titleEl, this.detailEl);
		if (showBar) {
			root.appendChild(this.barEl);
		}
		fragment.appendChild(root);

		// Duration 0 keeps the notice open until finish() closes it.
		this.notice = new Notice(fragment, 0);
		this.setIndeterminate(true);
	}

	// A one-off result in the same style, without a progress bar.
	static show(title: string, message: string, timeoutMs = 6000): void {
		new ProgressNotice(title, false).finish(message, timeoutMs);
	}

	setTitle(title: string): void {
		this.titleEl.textContent = title;
	}

	// Step `current` of `total` (1-based); detail is the item being worked on.
	update(current: number, total: number, detail: string): void {
		if (this.done) {
			return;
		}
		this.setIndeterminate(false);
		const percent = total > 0 ? Math.round(((current - 1) / total) * 100) : 0;
		this.fillEl.style.width = `${percent}%`;
		this.detailEl.textContent = `${current} of ${total} · ${detail}`;
	}

	// Shows the result in the same notice and closes it after a while.
	finish(message: string, timeoutMs = 6000): void {
		if (this.done) {
			return;
		}
		this.done = true;
		this.setIndeterminate(false);
		this.fillEl.style.width = "100%";
		this.detailEl.textContent = message;
		window.setTimeout(() => this.hide(), timeoutMs);
	}

	hide(): void {
		this.done = true;
		this.notice.hide();
		if (ProgressNotice.current === this) {
			ProgressNotice.current = null;
		}
	}

	private setIndeterminate(on: boolean): void {
		this.barEl.classList.toggle("is-indeterminate", on);
	}
}

function el(tag: string, cls: string): HTMLElement {
	const node = document.createElement(tag);
	node.className = cls;
	return node;
}
