import { browser, expect } from "@wdio/globals";
import { after, describe, it } from "mocha";
import { LOCALES } from "../../src/i18n/locales";
import { en } from "../../src/i18n/locales/en";
import {
	PLUGIN_ID,
	isMobile,
	openEmptyVault,
	updateOwnSettings,
	writeConfigJson,
} from "../helpers";

// Every language the plugin ships, as Obsidian names them. LAYOUT_LANGUAGES
// narrows the list, e.g. on slow emulators.
const LANGUAGES = (
	process.env.LAYOUT_LANGUAGES ??
	"en de es fr it ja ko pl pt-BR ru tr uk zh zh-TW"
).split(/\s+/);

const LONG_ID = "obsidian-excalidraw-plugin-with-a-long-id";
const PACK_PATH = "shared/team-setup-packs-for-the-whole-department/setup-pack.json";

// Realistic, deliberately long values for placeholders.
const SAMPLE: Record<string, string> = {
	count: "12",
	current: "3",
	total: "12",
	done: "11",
	file: "community-plugins-settings.json",
	listFile: "community-plugins-list.json",
	settingsFile: "community-plugins-settings.json",
	id: LONG_ID,
	ids: `${LONG_ID}, dataview, templater-obsidian`,
	label: `${LONG_ID}@2.10.3`,
	detail: LONG_ID,
	error: "ENOENT: no such file or directory, open '.obsidian/plugins/x/data.json'",
	source:
		"https://gist.githubusercontent.com/someone/0123456789abcdef0123456789abcdef/raw/setup-pack.json",
	path: ".obsidian/community-install-manager-backups/2026-11-03T12-30-00.json",
	dir: ".obsidian/community-install-manager-backups",
	repo: "zsviczian/obsidian-excalidraw-plugin",
	version: "2.10.3",
	minApp: "1.15.2",
	date: "03.11.2026, 12:30",
};

function fill(text: string): string {
	return text.replace(/\{(\w+)\}/g, (_, name: string) => SAMPLE[name] ?? "12");
}

// Every text of a language with its placeholders filled in.
function texts(language: string): string[] {
	const messages = LOCALES[language] ?? en;
	return Object.values(messages).flatMap((message) =>
		(typeof message === "string" ? [message] : Object.values(message)).map(fill),
	);
}

// Finds elements under the roots that stick out of the screen or of their
// window, and texts wider than their box (cut off or spilling over).
async function overflow(
	where: "settings" | string,
): Promise<string[]> {
	return browser.executeObsidian(({ app }, where) => {
		const roots: HTMLElement[] =
			where === "settings"
				? // eslint-disable-next-line @typescript-eslint/no-explicit-any
					[(app as any).setting.activeTab.containerEl]
				: [...document.querySelectorAll<HTMLElement>(where)];
		const problems: string[] = [];
		// Glyphs may poke a pixel or two past a tight line height; nobody
		// can see that.
		const SLACK = 2;
		const name = (el: Element) => {
			const text = (el.textContent ?? "").trim().slice(0, 50);
			const cls = [...el.classList].slice(0, 2).join(".");
			return `${el.tagName.toLowerCase()}${cls ? "." + cls : ""} "${text}"`;
		};
		for (const root of roots) {
			const win = root.ownerDocument.defaultView ?? window;
			const box = root.getBoundingClientRect();
			for (const el of [root, ...root.querySelectorAll<HTMLElement>("*")]) {
				if (el.closest("svg")) {
					continue;
				}
				const r = el.getBoundingClientRect();
				if (r.width === 0 && r.height === 0) {
					continue;
				}
				if (r.left < -1 || r.right > win.innerWidth + 1) {
					problems.push(`${name(el)} goes off screen`);
				} else if (r.left < box.left - 1 || r.right > box.right + 1) {
					problems.push(`${name(el)} sticks out of its window`);
				}
				if (el instanceof HTMLInputElement) {
					// A placeholder that does not fit is cut off.
					const style = win.getComputedStyle(el);
					const ctx = document.createElement("canvas").getContext("2d");
					if (ctx && el.placeholder) {
						ctx.font = style.font;
						const room =
							el.clientWidth -
							parseFloat(style.paddingLeft) -
							parseFloat(style.paddingRight);
						if (ctx.measureText(el.placeholder).width > room + 1) {
							problems.push(`input placeholder "${el.placeholder}" is cut off`);
						}
					}
					continue;
				}
				if (el.clientWidth > 0 && el.scrollWidth > el.clientWidth + SLACK) {
					problems.push(
						`${name(el)} text is wider than its box (${el.scrollWidth} > ${el.clientWidth})`,
					);
				}
				// Taller than its box: cut off, or running into what follows.
				// Boxes meant to scroll are fine.
				const overflowY = win.getComputedStyle(el).overflowY;
				if (
					el.clientHeight > 0 &&
					el.scrollHeight > el.clientHeight + SLACK &&
					overflowY !== "auto" &&
					overflowY !== "scroll"
				) {
					problems.push(
						`${name(el)} text is taller than its box (${el.scrollHeight} > ${el.clientHeight})`,
					);
				}
			}
		}
		return problems;
	}, where);
}

// Closes every open window, so the next check sees only its own.
async function closeModals(): Promise<void> {
	await browser.executeObsidian(({ app }) => {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		(app as any).setting.close();
	});
	// The close button is gone in newer versions; Escape works everywhere
	// but now and then lands before the window has focus, so keep trying.
	await browser.waitUntil(async () => {
		const open = await browser.executeObsidian(() => {
			document
				.querySelectorAll<HTMLElement>(".modal-container .modal-close-button")
				.forEach((b) => b.click());
			document.querySelector<HTMLElement>(".modal-container .modal")?.focus();
			return document.querySelectorAll(".modal-container").length;
		});
		if (open > 0) {
			await browser.keys("Escape");
		}
		return open === 0;
	}, { timeoutMsg: "a window did not close" });
}

async function writeVaultFile(path: string, text: string): Promise<void> {
	await browser.executeObsidian(
		async ({ app }, path, text) => {
			const dir = path.split("/").slice(0, -1).join("/");
			if (dir && !(await app.vault.adapter.exists(dir))) {
				await app.vault.adapter.mkdir(dir);
			}
			await app.vault.adapter.write(path, text);
		},
		path,
		text,
	);
}

// Installed-looking plugins, so the preview shows every kind of row
// without downloading anything.
async function prepareVault(): Promise<void> {
	const other = (await isMobile()) ? "desktop" : "mobile";
	for (const [id, version] of [
		["dataview", "0.5.67"],
		["templater-obsidian", "2.9.1"],
		[LONG_ID, "2.10.3"],
	]) {
		const dir = `.obsidian/plugins/${id}`;
		await writeVaultFile(
			`${dir}/manifest.json`,
			JSON.stringify({ id, name: id, version, minAppVersion: "0.15.0" }),
		);
		await writeVaultFile(`${dir}/main.js`, "module.exports = {};");
		await writeVaultFile(
			`${dir}/data.json`,
			JSON.stringify({ enableInlineQueries: true, refreshInterval: 2500 }),
		);
	}
	await writeConfigJson("community-plugins-list.json", [
		{ id: "dataview", version: "0.5.67" },
		{ id: "templater-obsidian", version: "2.10.0" },
		LONG_ID,
		{ id: "obsidian-git", version: "2.31.0" },
		{ id: "obsidian-tasks-plugin", devices: [other] },
	]);
	await writeConfigJson("community-plugins-settings.json", {
		dataview: { enableInlineQueries: false, refreshInterval: 5000, newKey: "x" },
		"templater-obsidian": { trigger_on_file_creation: true },
		"obsidian-git": { autoSaveInterval: 10 },
	});
	await writeConfigJson("vault-setup.json", {
		theme: "Minimal",
		snippets: { "wide-tables-and-callouts": { css: "body {}" } },
	});
	await updateOwnSettings({ loadSettingsOnInstall: true, syncVaultSetup: true });
	await writeVaultFile(
		PACK_PATH,
		JSON.stringify({
			format: "community-install-manager/setup-pack",
			version: 1,
			name: "Research team setup",
			description: "Plugins and settings we use for notes and literature reviews.",
			plugins: [
				{ id: "dataview", version: "0.5.67" },
				{ id: LONG_ID, devices: ["desktop"], enabled: false },
				{ id: "obsidian-tasks-plugin", devices: ["mobile", "desktop"] },
			],
			settings: { dataview: { refreshInterval: 5000 } },
			vaultSetup: { snippets: { "wide-tables": { css: "body {}" } } },
		}),
	);
}

async function checkLanguage(language: string): Promise<string[]> {
	const found: string[] = [];
	const note = async (surface: string, problems: string[]) => {
		found.push(...[...new Set(problems)].map((p) => `[${language}] ${surface}: ${p}`));
		// SHOT_DIR=... keeps a screenshot of every window for a look by eye.
		if (process.env.SHOT_DIR) {
			const where = (await isMobile()) ? "mobile" : "desktop";
			await browser.saveScreenshot(
				`${process.env.SHOT_DIR}/${language}-${where}-${surface.replace(" ", "-")}.png`,
			);
		}
	};

	await openEmptyVault(language);
	await prepareVault();

	// Settings tab
	await browser.executeObsidian(({ app }, id) => {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const setting = (app as any).setting;
		setting.open();
		setting.openTabById(id);
	}, PLUGIN_ID);
	await browser.pause(500);
	await note("settings", await overflow("settings"));
	await closeModals();

	// Import preview, with the settings changes unfolded
	await browser.executeObsidian(async ({ app }, id) => {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		await (app as any).plugins.plugins[id].previewPluginSetup();
	}, PLUGIN_ID);
	await browser.$(".community-install-manager-preview-modal").waitForExist();
	await browser.executeObsidian(() =>
		document
			.querySelectorAll<HTMLDetailsElement>(".community-install-manager-preview-changes")
			.forEach((d) => (d.open = true)),
	);
	await browser.pause(300);
	await note("preview", await overflow(".modal"));
	await closeModals();

	// Pack link and pack confirmation
	await browser.executeObsidian(({ app }, id) => {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		(app as any).commands.executeCommandById(`${id}:import-setup-pack`);
	}, PLUGIN_ID);
	await browser.pause(300);
	await note("pack link", await overflow(".modal"));
	await closeModals();
	await browser.executeObsidian(
		async ({ app }, id, path) => {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			await (app as any).plugins.plugins[id].loadSetupPack(path);
		},
		PLUGIN_ID,
		PACK_PATH,
	);
	await browser.$(".community-install-manager-pack-modal").waitForExist();
	await browser.pause(300);
	await note("pack", await overflow(".modal"));
	await closeModals();

	// Updates: the check itself is faked, the window is real.
	await browser.executeObsidian(
		async ({ app }, id, longId) => {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			const plugin = (app as any).plugins.plugins[id];
			plugin.updateChecker.check = async (
				progress: (current: number, total: number, id: string) => void,
			) => {
				progress(1, 3, longId);
				return [
					{ pluginId: longId, name: "Excalidraw", installed: "2.10.3", available: "2.11.0", pinned: "2.10.3" },
					{ pluginId: "dataview", name: "Dataview", installed: "0.5.67", available: "0.5.68" },
					{
						pluginId: "templater-obsidian",
						name: "Templater",
						installed: "2.9.1",
						available: null,
						newerNeedsApp: { version: "2.10.0", minAppVersion: "1.15.2" },
					},
				];
			};
			await plugin.checkForUpdates();
		},
		PLUGIN_ID,
		LONG_ID,
	);
	await browser.$(".community-install-manager-updates-modal").waitForExist();
	await browser.pause(300);
	await note("updates", await overflow(".modal"));
	await note("notice", await overflow(".notice"));
	await closeModals();

	// Every text as a notice in the plugin's progress style, as title and
	// as detail.
	const all = texts(language);
	for (let start = 0; start < all.length; start += 40) {
		await browser.executeObsidian(({ obsidian }, batch) => {
			document.querySelectorAll(".notice").forEach((n) => n.remove());
			for (const text of batch) {
				const fragment = createFragment();
				const root = fragment.createDiv({ cls: "community-install-manager-progress" });
				root.createDiv({ cls: "community-install-manager-progress-title", text });
				root.createDiv({ cls: "community-install-manager-progress-detail", text });
				new obsidian.Notice(fragment, 0);
			}
		}, all.slice(start, start + 40));
		await browser.pause(400);
		await note("notice", await overflow(".notice"));
	}
	await browser.executeObsidian(() =>
		document.querySelectorAll(".notice").forEach((n) => n.remove()),
	);
	return found;
}

describe("Layout in every language", () => {
	after(async () => {
		await browser.executeObsidian(() => window.localStorage.removeItem("language"));
		await browser.reloadObsidian({ vault: "test-e2e/vaults/empty" });
	});

	for (const language of LANGUAGES) {
		it(`keeps every text inside its window: ${language}`, async () => {
			expect(await checkLanguage(language)).toEqual([]);
		});
	}
});
