import { browser, expect } from "@wdio/globals";
import { before, describe, it } from "mocha";
import {
	PLUGIN_ID,
	readConfigJson,
	runPluginMethod,
	writeConfigJson,
} from "../helpers";

const APPEARANCE = "community-appearance.json";

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
		await browser.reloadObsidian({ vault: "test-e2e/vaults/empty" });
		await writeConfigJson("community-plugins-list.json", []);
		await writeConfigJson(APPEARANCE, {
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
		const appearance = await browser.executeObsidian(async ({ app }, id) => {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			const plugin = (app as any).plugins.plugins[id];
			return (await plugin.setupPreview.buildReport(true, true))?.appearance;
		}, PLUGIN_ID);
		expect(appearance).toContain("already using Minimal");
		expect(appearance).toContain("0 new, 0 changed, 2 unchanged");
	});

	it("exports the theme and snippets", async () => {
		await runPluginMethod("exportPluginSetup");
		expect(await readConfigJson(APPEARANCE)).toEqual({
			theme: { name: "Minimal", version: "9.1.3" },
			snippets: {
				"e2e-off": { css: "body { --e2e-other: 1; }", enabled: false },
				"e2e-tweak": { css: "body { --e2e-marker: 1; }", enabled: true },
			},
		});
	});

	it("moves to a new pinned theme version", async () => {
		const setup = await readConfigJson<Record<string, unknown>>(APPEARANCE);
		await writeConfigJson(APPEARANCE, {
			...setup,
			theme: { name: "Minimal", version: "9.1.4" },
		});
		await runPluginMethod("runImportPipeline");
		const state = await themeState();
		expect(state.installedVersion).toBe("9.1.4");
		expect(state.active).toBe("Minimal");
	});
});
