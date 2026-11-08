import { browser, expect } from "@wdio/globals";
import { before, describe, it } from "mocha";
import {
	PLUGIN_ID,
	readConfigJson,
	runPluginMethod,
	writeConfigJson,
	openEmptyVault,
} from "../helpers";

const VAULT_SETUP = "vault-setup.json";

interface ThemeState {
	active: string;
	installedVersion: string | null;
	enabledSnippets: string[];
	marker: string;
}

async function themeState(): Promise<ThemeState> {
	return browser.executeObsidian(async ({ app }) => {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const css = (app as any).customCss;
		const manifestPath = `${app.vault.configDir}/themes/Minimal/manifest.json`;
		const installedVersion = (await app.vault.adapter.exists(manifestPath))
			? JSON.parse(await app.vault.adapter.read(manifestPath)).version
			: null;
		// Snippets load asynchronously; give them a moment.
		await new Promise((resolve) => window.setTimeout(resolve, 500));
		return {
			active: css.theme,
			installedVersion,
			enabledSnippets: [...css.enabledSnippets].sort(),
			marker: getComputedStyle(document.body)
				.getPropertyValue("--e2e-marker")
				.trim(),
		};
	});
}

describe("Theme and CSS snippets", () => {
	before(async () => {
		await openEmptyVault();
		await writeConfigJson("community-plugins-list.json", []);
		await writeConfigJson(VAULT_SETUP, {
			theme: { name: "Minimal", version: "9.1.3" },
			snippets: {
				"e2e-tweak": { css: "body { --e2e-marker: 1; }", enabled: true },
				"e2e-off": { css: "body { --e2e-other: 1; }", enabled: false },
			},
		});
		await runPluginMethod("runImportPipeline");
	});

	it("installs the pinned theme, switches to it and loads the snippets", async () => {
		const state = await themeState();
		expect(state.active).toBe("Minimal");
		expect(state.installedVersion).toBe("9.1.3");
		expect(state.enabledSnippets).toEqual(["e2e-tweak"]);
		expect(state.marker).toBe("1");
	});

	it("shows in the preview that nothing is left to do", async () => {
		const vaultSetup = await browser.executeObsidian(async ({ app }, id) => {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			const plugin = (app as any).plugins.plugins[id];
			return (await plugin.setupPreview.buildReport(true, true))?.vaultSetup;
		}, PLUGIN_ID);
		expect(vaultSetup).toContain("already using Minimal");
		expect(vaultSetup).toContain("0 new, 0 changed, 2 unchanged");
	});

	it("exports the theme and snippets", async () => {
		await runPluginMethod("exportPluginSetup");
		expect(await readConfigJson(VAULT_SETUP)).toMatchObject({
			theme: { name: "Minimal", version: "9.1.3" },
			snippets: {
				"e2e-off": { css: "body { --e2e-other: 1; }", enabled: false },
				"e2e-tweak": { css: "body { --e2e-marker: 1; }", enabled: true },
			},
		});
	});

	it("moves to a new pinned theme version", async () => {
		const setup = await readConfigJson<Record<string, unknown>>(VAULT_SETUP);
		await writeConfigJson(VAULT_SETUP, {
			...setup,
			theme: { name: "Minimal", version: "9.1.4" },
		});
		await runPluginMethod("runImportPipeline");
		const state = await themeState();
		expect(state.installedVersion).toBe("9.1.4");
		expect(state.active).toBe("Minimal");
	});
});

describe("Obsidian's own settings", () => {
	async function state() {
		return browser.executeObsidian(async ({ app }) => {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			const a = app as any;
			const plugins = a.internalPlugins.plugins;
			return {
				readableLength: a.vault.getConfig("readableLineLength"),
				newLinkFormat: a.vault.getConfig("newLinkFormat"),
				dark: document.body.classList.contains("theme-dark"),
				dailyFolder: plugins["daily-notes"].instance.options?.folder,
				hasBookmarks: !!plugins.bookmarks,
				bookmarks: plugins.bookmarks?.instance.items ?? [],
			};
		});
	}

	// Which theme a new vault starts with depends on the Obsidian version, so
	// switch to the other one to see the change both ways.
	let startedDark = false;
	let otherTheme = "";

	before(async () => {
		await openEmptyVault();
		startedDark = (await state()).dark;
		otherTheme = startedDark ? "moonstone" : "obsidian";
		await writeConfigJson("community-plugins-list.json", []);
		await writeConfigJson("daily-notes.json", { folder: "Before" });
		await writeConfigJson(VAULT_SETUP, {
			appSettings: {
				readableLineLength: false,
				newLinkFormat: "absolute",
				theme: otherTheme,
			},
			coreSettings: {
				"daily-notes": { folder: "Daily" },
				graph: { showTags: true },
			},
			corePlugins: { "daily-notes": true, bookmarks: true },
			bookmarks: [{ type: "search", ctime: 1, query: "e2e-marker" }],
		});
		await runPluginMethod("runImportPipeline");
	});

	it("applies them to the running Obsidian and to the files", async () => {
		const s = await state();
		expect(s.readableLength).toBe(false);
		expect(s.newLinkFormat).toBe("absolute");
		expect(s.dark).toBe(!startedDark);
		expect(s.dailyFolder).toBe("Daily");
		expect(await readConfigJson("app.json")).toMatchObject({
			readableLineLength: false,
			newLinkFormat: "absolute",
		});
		expect(await readConfigJson("appearance.json")).toMatchObject({
			theme: otherTheme,
		});
		expect(await readConfigJson("daily-notes.json")).toMatchObject({
			folder: "Daily",
		});
		expect(await readConfigJson("graph.json")).toMatchObject({ showTags: true });
		if (s.hasBookmarks) {
			expect(s.bookmarks).toEqual([
				expect.objectContaining({ query: "e2e-marker" }),
			]);
		}
	});

	it("exports them back, without the theme or snippets in them", async () => {
		await runPluginMethod("exportPluginSetup");
		const setup = await readConfigJson<{
			appSettings: Record<string, unknown>;
			coreSettings: Record<string, unknown>;
		}>(VAULT_SETUP);
		expect(setup.appSettings).toMatchObject({
			readableLineLength: false,
			newLinkFormat: "absolute",
			theme: otherTheme,
		});
		expect(setup.appSettings.cssTheme).toBeUndefined();
		expect(setup.appSettings.enabledCssSnippets).toBeUndefined();
		expect(setup.coreSettings["daily-notes"]).toMatchObject({ folder: "Daily" });
	});

	it("takes them back on undo", async () => {
		await runPluginMethod("undoLastChange"); // the export
		await runPluginMethod("undoLastChange"); // the import
		const s = await state();
		expect(s.readableLength).not.toBe(false);
		expect(s.newLinkFormat).not.toBe("absolute");
		expect(s.dark).toBe(startedDark);
		expect(s.dailyFolder).toBe("Before");
		expect(s.bookmarks).toEqual([]);
		// And they stay that way once Obsidian saves its settings again.
		await browser.executeObsidian(({ app }) =>
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			(app as any).vault.saveConfig(),
		);
		expect(
			(await readConfigJson<Record<string, unknown>>("app.json")).newLinkFormat,
		).not.toBe("absolute");
	});
});

describe("Hotkeys and core plugins", () => {
	const bold = { modifiers: ["Mod", "Shift"], key: "B" };

	async function state() {
		return browser.executeObsidian(async ({ app }) => {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			const a = app as any;
			const path = `${app.vault.configDir}/hotkeys.json`;
			return {
				hotkeys: (await app.vault.adapter.exists(path))
					? JSON.parse(await app.vault.adapter.read(path))
					: {},
				dailyNotes: a.internalPlugins.plugins["daily-notes"].enabled,
				graph: a.internalPlugins.plugins.graph.enabled,
			};
		});
	}

	before(async () => {
		await openEmptyVault();
		await writeConfigJson("community-plugins-list.json", []);
		await writeConfigJson(VAULT_SETUP, {
			hotkeys: { "editor:toggle-bold": [bold] },
			corePlugins: { "daily-notes": true, graph: false },
		});
		await runPluginMethod("runImportPipeline");
	});

	it("sets the hotkeys and turns core plugins on and off", async () => {
		const s = await state();
		expect(s.hotkeys["editor:toggle-bold"]).toEqual([bold]);
		expect(s.dailyNotes).toBe(true);
		expect(s.graph).toBe(false);
	});

	it("exports them back", async () => {
		await runPluginMethod("exportPluginSetup");
		const setup = await readConfigJson<{
			hotkeys: Record<string, unknown>;
			corePlugins: Record<string, boolean>;
		}>(VAULT_SETUP);
		expect(setup?.hotkeys["editor:toggle-bold"]).toEqual([bold]);
		expect(setup?.corePlugins["daily-notes"]).toBe(true);
		expect(setup?.corePlugins.graph).toBe(false);
	});
});
