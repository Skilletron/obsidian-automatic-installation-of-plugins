import { describe, expect, it, vi } from "vitest";
import { setRequestUrlHandler } from "obsidian";
import {
	VaultSetupApplier,
	describeVaultSetupChanges,
	mergeBookmarks,
	parseVaultSetup,
	redactVaultSetup,
	readVaultSetup,
} from "../src/core/VaultSetup";
import { SetupExporter } from "../src/core/SetupExporter";
import { NetworkManager } from "../src/utils/NetworkManager";
import { VAULT_SETUP_FILE, COMMUNITY_THEMES_URL } from "../src/types";
import { SECRET_PLACEHOLDER } from "../src/utils/secrets";
import { createTestVault } from "./helpers";

const SNIPPETS = ".obsidian/snippets";
const APPEARANCE_JSON = ".obsidian/appearance.json";

describe("parseVaultSetup", () => {
	it("reads a theme with or without a version, and snippets", () => {
		expect(
			parseVaultSetup({
				theme: { name: "Minimal", version: "v9.1.3" },
				snippets: { tweaks: { css: "a{}", enabled: false }, other: { css: "" } },
			}),
		).toEqual({
			theme: { name: "Minimal", version: "9.1.3" },
			snippets: { tweaks: { css: "a{}", enabled: false }, other: { css: "" } },
		});
		expect(parseVaultSetup({ theme: "Minimal" })).toEqual({
			theme: { name: "Minimal" },
			snippets: {},
		});
	});

	it("drops unsafe or broken snippets and themes", () => {
		expect(
			parseVaultSetup({
				theme: { name: "../evil" },
				snippets: {
					"../x": { css: "a{}" },
					".hidden": { css: "a{}" },
					nocss: { enabled: true },
					ok: { css: "b{}" },
				},
			}),
		).toEqual({ snippets: { ok: { css: "b{}" } } });
		expect(parseVaultSetup([])).toBeNull();
	});
});

describe("readVaultSetup", () => {
	it("reads the active theme, its version and the snippets", async () => {
		const vault = createTestVault({
			[APPEARANCE_JSON]: JSON.stringify({
				cssTheme: "Minimal",
				enabledCssSnippets: ["on"],
			}),
			".obsidian/themes/Minimal/manifest.json": JSON.stringify({
				name: "Minimal",
				version: "9.1.3",
			}),
			[`${SNIPPETS}/on.css`]: "a{}",
			[`${SNIPPETS}/off.css`]: "b{}",
			[`${SNIPPETS}/notes.txt`]: "x",
		});
		expect(await readVaultSetup(vault.fileManager)).toEqual({
			theme: { name: "Minimal", version: "9.1.3" },
			snippets: {
				off: { css: "b{}", enabled: false },
				on: { css: "a{}", enabled: true },
			},
			hotkeys: {},
			corePlugins: {},
		});
	});

	it("reports the default theme for a fresh vault", async () => {
		const vault = createTestVault();
		expect(await readVaultSetup(vault.fileManager)).toEqual({
			theme: { name: "" },
			snippets: {},
			hotkeys: {},
			corePlugins: {},
		});
	});
});

describe("describeVaultSetupChanges", () => {
	it("summarizes theme and snippet changes", () => {
		expect(
			describeVaultSetupChanges(
				{
					theme: { name: "Minimal", version: "9.1.4" },
					snippets: { a: { css: "1" }, b: { css: "2" }, c: { css: "3" } },
				},
				{
					theme: { name: "Minimal", version: "9.1.3" },
					snippets: { a: { css: "1" }, b: { css: "old" } },
				},
			),
		).toBe(
			"Theme: would switch to Minimal 9.1.4 · Snippets: 3 (1 new, 1 changed, 1 unchanged)",
		);
		expect(
			describeVaultSetupChanges(
				{ theme: { name: "Minimal" }, snippets: {} },
				{ theme: { name: "Minimal", version: "1" }, snippets: {} },
			),
		).toBe("Theme: already using Minimal");
	});
});

function fakeCustomCss(vault: ReturnType<typeof createTestVault>) {
	const css = {
		theme: "",
		themes: {} as Record<string, { version?: string }>,
		enabledSnippets: new Set<string>(),
		setTheme: vi.fn((name: string) => {
			css.theme = name;
		}),
		setCssEnabledStatus: vi.fn((name: string, on: boolean) => {
			if (on) css.enabledSnippets.add(name);
			else css.enabledSnippets.delete(name);
		}),
		readSnippets: vi.fn(async () => {}),
		readThemes: vi.fn(async () => {}),
		installTheme: vi.fn(async (theme: { name: string }, version: string) => {
			const dir = `.obsidian/themes/${theme.name}`;
			await vault.adapter.mkdir(dir);
			await vault.adapter.write(
				`${dir}/manifest.json`,
				JSON.stringify({ name: theme.name, version }),
			);
			css.themes[theme.name] = { version };
		}),
	};
	return css;
}

function setupApplier(files: Record<string, string> = {}) {
	const vault = createTestVault(files);
	const customCss = fakeCustomCss(vault);
	(vault.app as unknown as { customCss: unknown }).customCss = customCss;
	const applier = new VaultSetupApplier(
		vault.app,
		vault.fileManager,
		new NetworkManager(),
	);
	return { vault, customCss, applier };
}

describe("VaultSetupApplier", () => {
	const themes = [{ name: "Minimal", repo: "kepano/obsidian-minimal" }];

	it("writes new snippets and turns on only new ones", async () => {
		const { vault, customCss, applier } = setupApplier({
			[`${SNIPPETS}/mine.css`]: "old",
			[`${SNIPPETS}/same.css`]: "same",
		});
		const result = await applier.apply({
			snippets: {
				fresh: { css: "a{}" },
				off: { css: "b{}", enabled: false },
				mine: { css: "new" },
				same: { css: "same" },
			},
		});

		expect(result).toMatchObject({ snippetsWritten: 3, snippetsEnabled: 1 });
		expect(vault.read(`${SNIPPETS}/fresh.css`)).toBe("a{}");
		expect(vault.read(`${SNIPPETS}/mine.css`)).toBe("new");
		expect([...customCss.enabledSnippets]).toEqual(["fresh"]);
		expect(customCss.readSnippets).toHaveBeenCalled();
	});

	it("installs a pinned theme and switches to it", async () => {
		setRequestUrlHandler(async (req) =>
			req.url === COMMUNITY_THEMES_URL
				? { status: 200, json: themes }
				: { status: 404, json: null },
		);
		const { customCss, applier } = setupApplier();
		const result = await applier.apply({
			theme: { name: "Minimal", version: "9.1.3" },
			snippets: {},
		});

		expect(customCss.installTheme).toHaveBeenCalledWith(themes[0], "9.1.3");
		expect(customCss.theme).toBe("Minimal");
		expect(result.theme).toBe("Installed theme Minimal 9.1.3");
		expect(result.problems).toEqual([]);
	});

	it("installs the newest version when none is pinned", async () => {
		setRequestUrlHandler(async (req) => {
			if (req.url === COMMUNITY_THEMES_URL) {
				return { status: 200, json: themes };
			}
			if (req.url.endsWith("obsidian-minimal/HEAD/manifest.json")) {
				return { status: 200, json: { version: "9.1.4" } };
			}
			return { status: 404, json: null };
		});
		const { customCss, applier } = setupApplier();
		await applier.apply({ theme: { name: "Minimal" }, snippets: {} });
		expect(customCss.installTheme).toHaveBeenCalledWith(themes[0], "9.1.4");
	});

	it("only switches when the theme is already installed", async () => {
		const { customCss, applier } = setupApplier();
		customCss.themes.Minimal = { version: "9.1.3" };
		const result = await applier.apply({
			theme: { name: "Minimal" },
			snippets: {},
		});
		expect(customCss.installTheme).not.toHaveBeenCalled();
		expect(result.theme).toBe("Switched to theme Minimal");
	});

	it("reports themes that cannot be installed", async () => {
		setRequestUrlHandler(async () => ({ status: 200, json: [] }));
		const { customCss, applier } = setupApplier();
		const result = await applier.apply({
			theme: { name: "Nope", version: "1.0.0" },
			snippets: {},
		});
		expect(result.problems).toEqual(['Could not install theme "Nope".']);
		expect(customCss.setTheme).not.toHaveBeenCalled();
	});

	it("switches back to the default theme", async () => {
		const { customCss, applier } = setupApplier();
		customCss.theme = "Minimal";
		const result = await applier.apply({ theme: { name: "" }, snippets: {} });
		expect(customCss.theme).toBe("");
		expect(result.theme).toBe("Switched to the default theme");
	});
});

describe("SetupExporter with vaultSetup", () => {
	const files = {
		[APPEARANCE_JSON]: JSON.stringify({ cssTheme: "", enabledCssSnippets: ["a"] }),
		[`${SNIPPETS}/a.css`]: "a{}",
	};

	it("writes vault-setup.json when asked", async () => {
		const vault = createTestVault(files);
		const result = await new SetupExporter(
			vault.fileManager,
			() => false,
			undefined,
			undefined,
			() => true,
		).exportSetup();
		expect(vault.readJson(`.obsidian/${VAULT_SETUP_FILE}`)).toEqual({
			theme: { name: "" },
			snippets: { a: { css: "a{}", enabled: true } },
			hotkeys: {},
			corePlugins: {},
		});
		expect(result.message).toContain("1 CSS snippet");
	});

	it("leaves it out otherwise", async () => {
		const vault = createTestVault(files);
		await new SetupExporter(vault.fileManager, () => false).exportSetup();
		expect(vault.read(`.obsidian/${VAULT_SETUP_FILE}`)).toBeUndefined();
	});
});

describe("hotkeys and core plugins", () => {
	const bold = { modifiers: ["Mod", "Shift"], key: "B" };

	it("parses hotkeys and core plugins and drops broken entries", () => {
		expect(
			parseVaultSetup({
				hotkeys: {
					"editor:toggle-bold": [bold, { modifiers: ["Hyper"], key: "X" }],
					"app:remove-default": [],
					"bad id": [bold],
				},
				corePlugins: { "daily-notes": true, graph: false, "../x": true, sync: "yes" },
			}),
		).toEqual({
			snippets: {},
			hotkeys: { "editor:toggle-bold": [bold], "app:remove-default": [] },
			corePlugins: { "daily-notes": true, graph: false },
		});
	});

	it("reads hotkeys.json and both core-plugins.json formats", async () => {
		const objectFormat = createTestVault({
			".obsidian/hotkeys.json": JSON.stringify({ "editor:toggle-bold": [bold] }),
			".obsidian/core-plugins.json": JSON.stringify({ graph: true, sync: false }),
		});
		const setup = await readVaultSetup(objectFormat.fileManager);
		expect(setup.hotkeys).toEqual({ "editor:toggle-bold": [bold] });
		expect(setup.corePlugins).toEqual({ graph: true, sync: false });

		const listFormat = createTestVault({
			".obsidian/core-plugins.json": JSON.stringify(["graph", "backlink"]),
		});
		expect((await readVaultSetup(listFormat.fileManager)).corePlugins).toEqual({
			graph: true,
			backlink: true,
		});
	});

	it("prefers the core plugin state Obsidian has in memory", async () => {
		const vault = createTestVault({
			".obsidian/core-plugins.json": JSON.stringify({ graph: true }),
		});
		const setup = await readVaultSetup(vault.fileManager, {
			theme: "",
			enabledSnippets: [],
			corePlugins: { graph: false },
		});
		expect(setup.corePlugins).toEqual({ graph: false });
	});

	it("describes what would change", () => {
		expect(
			describeVaultSetupChanges(
				{
					snippets: {},
					hotkeys: { a: [bold], b: [] },
					corePlugins: { graph: false, "daily-notes": true, sync: false },
				},
				{
					snippets: {},
					hotkeys: { a: [bold] },
					corePlugins: { graph: true, sync: false },
				},
			),
		).toBe(
			"Hotkeys: 2 commands (1 would change) · Core plugins: would turn on 1, turn off 1",
		);
	});

	function setupWithManagers(files: Record<string, string> = {}) {
		const vault = createTestVault(files);
		const hotkeyManager = {
			setHotkeys: vi.fn(),
			save: vi.fn(async () => {}),
		};
		const plugin = (enabled: boolean) => {
			const p = {
				enabled,
				enable: vi.fn(async () => {
					p.enabled = true;
				}),
				disable: vi.fn(async () => {
					p.enabled = false;
				}),
			};
			return p;
		};
		const internalPlugins = {
			plugins: { graph: plugin(true), "daily-notes": plugin(false), sync: plugin(false) },
			saveConfig: vi.fn(async () => {}),
		};
		Object.assign(vault.app as object, {
			hotkeyManager,
			internalPlugins,
			customCss: fakeCustomCss(vault),
		});
		const applier = new VaultSetupApplier(
			vault.app,
			vault.fileManager,
			new NetworkManager(),
		);
		return { hotkeyManager, internalPlugins, applier };
	}

	it("sets only hotkeys that differ and saves once", async () => {
		const { hotkeyManager, applier } = setupWithManagers({
			".obsidian/hotkeys.json": JSON.stringify({ same: [bold] }),
		});
		const result = await applier.apply({
			snippets: {},
			hotkeys: { same: [bold], fresh: [bold], cleared: [] },
		});
		expect(hotkeyManager.setHotkeys.mock.calls).toEqual([
			["fresh", [bold]],
			["cleared", []],
		]);
		expect(hotkeyManager.save).toHaveBeenCalledTimes(1);
		expect(result.hotkeysChanged).toBe(2);
	});

	it("turns core plugins on and off and skips unknown ones", async () => {
		const { internalPlugins, applier } = setupWithManagers();
		const result = await applier.apply({
			snippets: {},
			corePlugins: { graph: false, "daily-notes": true, sync: false, canvas: true },
		});
		expect(internalPlugins.plugins.graph.disable).toHaveBeenCalledWith(true);
		expect(internalPlugins.plugins["daily-notes"].enable).toHaveBeenCalledWith(true);
		expect(internalPlugins.plugins.sync.disable).not.toHaveBeenCalled();
		expect(internalPlugins.saveConfig).toHaveBeenCalled();
		expect(result).toMatchObject({ corePluginsOn: 1, corePluginsOff: 1 });
	});
});

describe("Obsidian's own settings", () => {
	const network = () => new NetworkManager();

	function applierVault(
		files: Record<string, string> = {},
		config: Record<string, unknown> = {},
		plugins: Record<string, unknown> = {},
	) {
		const vault = createTestVault(files);
		const setConfig = vi.fn((key: string, value: unknown) => {
			if (value === undefined) {
				delete config[key];
			} else {
				config[key] = value;
			}
		});
		Object.assign(vault.app.vault, {
			config,
			setConfig,
			saveConfig: vi.fn(async () => {}),
		});
		Object.assign(vault.app, { internalPlugins: { plugins } });
		return {
			...vault,
			setConfig,
			applier: new VaultSetupApplier(vault.app, vault.fileManager, network()),
		};
	}

	it("parses them, dropping what must not travel", () => {
		const setup = parseVaultSetup(
			JSON.parse(`{
				"appSettings": { "vimMode": true, "cssTheme": "Evil", "enabledCssSnippets": [], "__proto__": { "x": 1 } },
				"coreSettings": {
					"daily-notes": { "folder": "Daily", "__proto__": { "x": 1 } },
					"sync": { "vaultId": "abc" },
					"publish": { "siteId": "abc" },
					"workspaces": { "workspaces": {} },
					"../evil": { "a": 1 },
					"graph": "nope"
				},
				"bookmarks": [{ "type": "search", "query": "a" }, { "query": "no type" }, "nope"]
			}`),
		);
		expect(Object.keys(setup?.appSettings ?? {})).toEqual(["vimMode"]);
		expect(Object.keys(setup?.coreSettings ?? {})).toEqual(["daily-notes"]);
		expect(Object.keys(setup?.coreSettings?.["daily-notes"] ?? {})).toEqual(["folder"]);
		expect(setup?.bookmarks).toEqual([{ type: "search", query: "a" }]);
	});

	it("reads them from the config folder", async () => {
		const vault = createTestVault({
			".obsidian/app.json": JSON.stringify({ vimMode: true }),
			[APPEARANCE_JSON]: JSON.stringify({ cssTheme: "Minimal", baseFontSize: 18 }),
			".obsidian/daily-notes.json": JSON.stringify({ folder: "Daily" }),
			".obsidian/graph.json": JSON.stringify({ showTags: true, scale: 1.5, close: true }),
			".obsidian/sync.json": JSON.stringify({ vaultId: "secret" }),
			".obsidian/bookmarks.json": JSON.stringify({
				items: [{ type: "file", path: "a.md" }],
			}),
		});
		const setup = await readVaultSetup(vault.fileManager);
		expect(setup.appSettings).toEqual({ vimMode: true, baseFontSize: 18 });
		expect(setup.coreSettings).toEqual({
			"daily-notes": { folder: "Daily" },
			graph: { showTags: true },
		});
		expect(setup.bookmarks).toEqual([{ type: "file", path: "a.md" }]);
	});

	it("prefers the settings Obsidian has in memory", async () => {
		const vault = createTestVault({
			".obsidian/app.json": JSON.stringify({ vimMode: false }),
		});
		const setup = await readVaultSetup(vault.fileManager, {
			theme: "",
			enabledSnippets: [],
			appSettings: { vimMode: true, cssTheme: "Minimal" },
		});
		expect(setup.appSettings).toEqual({ vimMode: true });
	});

	it("sets only the settings that differ and saves them", async () => {
		const { applier, setConfig, app } = applierVault({}, { vimMode: false, spellcheck: true, tabSize: 2 });
		const result = await applier.apply({
			snippets: {},
			appSettings: { vimMode: true, spellcheck: true },
		});
		expect(setConfig.mock.calls).toEqual([["vimMode", true]]);
		expect(result.appSettingsChanged).toBe(1);
		expect((app.vault as unknown as { config: unknown }).config).toEqual({
			vimMode: true,
			spellcheck: true,
			tabSize: 2,
		});
	});

	it("keeps a local value where the setup holds a secret placeholder", async () => {
		const { applier, setConfig } = applierVault({}, { someToken: "mine" });
		await applier.apply({
			snippets: {},
			appSettings: { someToken: SECRET_PLACEHOLDER, otherToken: SECRET_PLACEHOLDER },
		});
		expect(setConfig).not.toHaveBeenCalled();
	});

	it("merges core plugin settings and tells a running plugin", async () => {
		const onExternalSettingsChange = vi.fn();
		const { applier, readJson } = applierVault(
			{ ".obsidian/daily-notes.json": JSON.stringify({ folder: "Old", format: "YYYY" }) },
			{},
			{
				"daily-notes": { enabled: true, instance: { onExternalSettingsChange } },
				graph: { enabled: false, instance: { onExternalSettingsChange } },
			},
		);
		const result = await applier.apply({
			snippets: {},
			coreSettings: {
				"daily-notes": { folder: "New" },
				graph: { showTags: true },
				canvas: { snapToGrid: true },
			},
		});
		expect(readJson(".obsidian/daily-notes.json")).toEqual({ folder: "New", format: "YYYY" });
		expect(readJson(".obsidian/graph.json")).toEqual({ showTags: true });
		// A plugin this Obsidian doesn't have gets no file.
		expect(result.coreSettingsChanged).toBe(2);
		// The graph is off: it reads its file when it starts.
		expect(onExternalSettingsChange).toHaveBeenCalledTimes(1);
	});

	it("leaves a core plugin alone when nothing changes", async () => {
		const onExternalSettingsChange = vi.fn();
		const { applier } = applierVault(
			{ ".obsidian/graph.json": JSON.stringify({ showTags: true }) },
			{},
			{ graph: { enabled: true, instance: { onExternalSettingsChange } } },
		);
		const result = await applier.apply({
			snippets: {},
			coreSettings: { graph: { showTags: true } },
		});
		expect(result.coreSettingsChanged).toBe(0);
		expect(onExternalSettingsChange).not.toHaveBeenCalled();
	});

	it("writes core plugin settings before turning the plugin on", async () => {
		const order: string[] = [];
		const { applier, read } = applierVault({}, {}, {
			"daily-notes": {
				enabled: false,
				enable() {
					order.push(read(".obsidian/daily-notes.json") ?? "no file");
					this.enabled = true;
				},
			},
		});
		await applier.apply({
			snippets: {},
			corePlugins: { "daily-notes": true },
			coreSettings: { "daily-notes": { folder: "New" } },
		});
		expect(order[0]).toContain("New");
	});

	it("adds missing bookmarks without removing any", async () => {
		const onExternalSettingsChange = vi.fn();
		const { applier, readJson } = applierVault(
			{
				".obsidian/bookmarks.json": JSON.stringify({
					items: [{ type: "file", ctime: 1, path: "mine.md" }],
				}),
			},
			{},
			{ bookmarks: { enabled: true, instance: { onExternalSettingsChange } } },
		);
		const result = await applier.apply({
			snippets: {},
			bookmarks: [
				{ type: "file", ctime: 2, path: "mine.md" },
				{ type: "search", ctime: 3, query: "tag:#a" },
			],
		});
		expect(result.bookmarksAdded).toBe(1);
		expect(readJson(".obsidian/bookmarks.json")).toEqual({
			items: [
				{ type: "file", ctime: 1, path: "mine.md" },
				{ type: "search", ctime: 3, query: "tag:#a" },
			],
		});
		expect(onExternalSettingsChange).toHaveBeenCalled();
	});

	it("merges bookmark groups of the same title", () => {
		const { items, added } = mergeBookmarks(
			[{ type: "group", title: "Work", items: [{ type: "file", path: "a.md" }] }],
			[
				{
					type: "group",
					title: "Work",
					items: [
						{ type: "file", path: "a.md" },
						{ type: "file", path: "b.md" },
					],
				},
				{ type: "group", title: "New", items: [{ type: "url", url: "https://a" }] },
			],
		);
		expect(added).toBe(2);
		expect(items).toHaveLength(2);
		expect(items[0].items).toHaveLength(2);
	});

	it("reports a missing settings manager instead of failing", async () => {
		const vault = createTestVault();
		const applier = new VaultSetupApplier(vault.app, vault.fileManager, network());
		const result = await applier.apply({
			snippets: {},
			appSettings: { vimMode: true },
			coreSettings: { graph: { showTags: true } },
		});
		expect(result.problems).toHaveLength(2);
	});

	it("takes the settings back on undo, but not the theme", async () => {
		const onExternalSettingsChange = vi.fn();
		const { applier, setConfig } = applierVault(
			{
				".obsidian/app.json": JSON.stringify({ vimMode: false }),
				[APPEARANCE_JSON]: JSON.stringify({ cssTheme: "Old" }),
			},
			{ vimMode: true, tabSize: 2, cssTheme: "New" },
			{ graph: { enabled: true, instance: { onExternalSettingsChange } } },
		);
		await applier.reloadRestored([".obsidian/app.json", ".obsidian/graph.json"]);
		expect(setConfig.mock.calls).toEqual([
			["vimMode", false],
			["tabSize", undefined],
		]);
		expect(onExternalSettingsChange).toHaveBeenCalled();
	});

	it("copies restored values in when Obsidian can't reread the file", async () => {
		const instance = { options: { folder: "Daily", keepDays: 7 } };
		const { applier } = applierVault(
			{ ".obsidian/daily-notes.json": JSON.stringify({ folder: "Before" }) },
			{},
			{ "daily-notes": { enabled: true, instance } },
		);
		await applier.reloadRestored([".obsidian/daily-notes.json"]);
		expect(instance.options).toEqual({ folder: "Before", keepDays: 7 });
	});

	it("empties the bookmarks on undo when there was no file before", async () => {
		const onItemsChanged = vi.fn();
		const instance = { items: [{ type: "file" }], onExternalSettingsChange: vi.fn(), onItemsChanged };
		const { applier } = applierVault({}, {}, { bookmarks: { enabled: true, instance } });
		await applier.reloadRestored([".obsidian/bookmarks.json"]);
		expect(instance.items).toEqual([]);
		expect(onItemsChanged).toHaveBeenCalledWith(false);
	});

	it("leaves out secrets", () => {
		const { setup, redacted } = redactVaultSetup({
			snippets: {},
			appSettings: { apiToken: "a", vimMode: true },
			coreSettings: { webviewer: { password: "b", size: 1 } },
		});
		expect(redacted).toBe(2);
		expect(setup.appSettings).toEqual({ apiToken: SECRET_PLACEHOLDER, vimMode: true });
		expect(setup.coreSettings?.webviewer).toEqual({ password: SECRET_PLACEHOLDER, size: 1 });
	});

	it("describes what Import would change", () => {
		const text = describeVaultSetupChanges(
			{
				snippets: {},
				appSettings: { vimMode: true, spellcheck: true },
				coreSettings: { graph: { showTags: true }, canvas: { a: 1 } },
				bookmarks: [
					{ type: "search", query: "a" },
					{ type: "search", query: "b" },
				],
			},
			{
				snippets: {},
				appSettings: { spellcheck: true },
				coreSettings: { canvas: { a: 1 } },
				bookmarks: [{ type: "search", query: "a" }],
			},
		);
		expect(text).toContain("Obsidian settings: 2 listed (1 would change)");
		expect(text).toContain("Core plugin settings: 2 plugins (1 would change)");
		expect(text).toContain("Bookmarks: 2 listed (1 would be added)");
	});

	it("saves them through Export with secrets left out when asked", async () => {
		const vault = createTestVault({
			".obsidian/app.json": JSON.stringify({ vimMode: true, apiToken: "x" }),
		});
		const { redactedCount } = await new SetupExporter(
			vault.fileManager,
			() => false,
			() => ({ redact: true, extraKeys: [] }),
			undefined,
			() => true,
		).exportSetup();
		expect(redactedCount).toBe(1);
		const saved = vault.readJson<{ appSettings: unknown }>(`.obsidian/${VAULT_SETUP_FILE}`);
		expect(saved.appSettings).toEqual({ vimMode: true, apiToken: SECRET_PLACEHOLDER });
	});
});
