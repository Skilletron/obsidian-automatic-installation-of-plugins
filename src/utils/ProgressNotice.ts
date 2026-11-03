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

		const fragment = createFragment();
		const root = fragment.createDiv({
			cls: "community-install-manager-progress",
		});
		this.titleEl = root.createDiv({
			cls: "community-install-manager-progress-title",
			text: title,
		});
		this.detailEl = root.createDiv({
			cls: "community-install-manager-progress-detail",
		});
		this.barEl = createDiv({ cls: "community-install-manager-progress-bar" });
		this.fillEl = this.barEl.createDiv({
			cls: "community-install-manager-progress-fill",
		});
		if (showBar) {
			root.appendChild(this.barEl);
		}

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
		setWidth(this.fillEl, `${percent}%`);
		this.detailEl.textContent = `${current} of ${total} · ${detail}`;
	}

	// A step without a count, e.g. a final step after the per-plugin ones.
	setDetail(detail: string): void {
		if (!this.done) {
			this.detailEl.textContent = detail;
		}
	}

	// Shows the result in the same notice and closes it after a while.
	finish(message: string, timeoutMs = 6000): void {
		if (this.done) {
			return;
		}
		this.done = true;
		this.setIndeterminate(false);
		setWidth(this.fillEl, "100%");
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

// setCssProps arrived in later Obsidian versions; fall back to the plain
// DOM call on older ones.
function setWidth(el: HTMLElement, width: string): void {
	if (typeof el.setCssProps === "function") {
		el.setCssProps({ width });
	} else {
		el.style.setProperty("width", width);
	}
}
