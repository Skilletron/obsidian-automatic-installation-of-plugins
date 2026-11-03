import { describe, expect, it, vi } from "vitest";
import { setRequestUrlHandler } from "obsidian";
import {
	AppearanceApplier,
	describeAppearanceChanges,
	parseAppearance,
	readAppearance,
} from "../src/core/Appearance";
import { SetupExporter } from "../src/core/SetupExporter";
import { NetworkManager } from "../src/utils/NetworkManager";
import { APPEARANCE_FILE, COMMUNITY_THEMES_URL } from "../src/types";
import { createTestVault } from "./helpers";

const SNIPPETS = ".obsidian/snippets";
const APPEARANCE_JSON = ".obsidian/appearance.json";

describe("parseAppearance", () => {
	it("reads a theme with or without a version, and snippets", () => {
		expect(
			parseAppearance({
				theme: { name: "Minimal", version: "v9.1.3" },
				snippets: { tweaks: { css: "a{}", enabled: false }, other: { css: "" } },
			}),
		).toEqual({
			theme: { name: "Minimal", version: "9.1.3" },
			snippets: { tweaks: { css: "a{}", enabled: false }, other: { css: "" } },
		});
		expect(parseAppearance({ theme: "Minimal" })).toEqual({
			theme: { name: "Minimal" },
			snippets: {},
		});
	});

	it("drops unsafe or broken snippets and themes", () => {
		expect(
			parseAppearance({
				theme: { name: "../evil" },
				snippets: {
					"../x": { css: "a{}" },
					".hidden": { css: "a{}" },
					nocss: { enabled: true },
					ok: { css: "b{}" },
				},
			}),
		).toEqual({ snippets: { ok: { css: "b{}" } } });
		expect(parseAppearance([])).toBeNull();
	});
});

describe("readAppearance", () => {
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
		expect(await readAppearance(vault.fileManager)).toEqual({
			theme: { name: "Minimal", version: "9.1.3" },
			snippets: {
				off: { css: "b{}", enabled: false },
				on: { css: "a{}", enabled: true },
			},
		});
	});

	it("reports the default theme for a fresh vault", async () => {
		const vault = createTestVault();
		expect(await readAppearance(vault.fileManager)).toEqual({
			theme: { name: "" },
			snippets: {},
		});
	});
});

describe("describeAppearanceChanges", () => {
	it("summarizes theme and snippet changes", () => {
		expect(
			describeAppearanceChanges(
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
			describeAppearanceChanges(
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
	const applier = new AppearanceApplier(
		vault.app,
		vault.fileManager,
		new NetworkManager(),
	);
	return { vault, customCss, applier };
}

describe("AppearanceApplier", () => {
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

describe("SetupExporter with appearance", () => {
	const files = {
		[APPEARANCE_JSON]: JSON.stringify({ cssTheme: "", enabledCssSnippets: ["a"] }),
		[`${SNIPPETS}/a.css`]: "a{}",
	};

	it("writes community-appearance.json when asked", async () => {
		const vault = createTestVault(files);
		const result = await new SetupExporter(
			vault.fileManager,
			() => false,
			undefined,
			undefined,
			() => true,
		).exportSetup();
		expect(vault.readJson(`.obsidian/${APPEARANCE_FILE}`)).toEqual({
			theme: { name: "" },
			snippets: { a: { css: "a{}", enabled: true } },
		});
		expect(result.message).toContain("1 CSS snippet");
	});

	it("leaves it out otherwise", async () => {
		const vault = createTestVault(files);
		await new SetupExporter(vault.fileManager, () => false).exportSetup();
		expect(vault.read(`.obsidian/${APPEARANCE_FILE}`)).toBeUndefined();
	});
});
