import { browser, expect } from "@wdio/globals";
import { before, describe, it } from "mocha";
import { HIDER, PLUGIN_ID, runPluginMethod, writeConfigJson, openEmptyVault } from "../helpers";

interface Row {
	id: string;
	settingsChanges?: Array<{ path: string; kind: string; before?: unknown; after?: unknown }>;
}

describe("Settings changes in the import preview", () => {
	before(async () => {
		await openEmptyVault();
		await writeConfigJson("community-plugins-list.json", [
			{ id: HIDER, version: "1.7.1" },
		]);
		await writeConfigJson("community-plugins-settings.json", {
			[HIDER]: { hideStatus: true },
		});
		await runPluginMethod("runImportPipeline");
		await writeConfigJson("community-plugins-settings.json", {
			[HIDER]: { hideStatus: false, hideTabs: true },
		});
	});

	it("lists the settings that would change", async () => {
		const rows = await browser.executeObsidian(async ({ app }, id) => {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			const plugin = (app as any).plugins.plugins[id];
			return (await plugin.setupPreview.buildReport(true))?.rows as Row[];
		}, PLUGIN_ID);
		const hider = rows.find((r) => r.id === HIDER);
		expect(hider?.settingsChanges).toEqual(
			expect.arrayContaining([
				{ path: "hideStatus", kind: "changed", before: true, after: false },
			]),
		);
		expect(hider?.settingsChanges?.some((c) => c.path === "hideTabs")).toBe(true);
	});

	it("shows them in the preview window", async () => {
		await runPluginMethod("previewPluginSetup");
		await browser.$(".community-install-manager-preview-changes").waitForExist();
		const text = await browser.executeObsidian(() => {
			const details = document.querySelector<HTMLDetailsElement>(
				".community-install-manager-preview-changes",
			);
			if (details) {
				details.open = true;
			}
			return details?.textContent ?? "";
		});
		expect(text).toContain("hideStatus: true → false");
		if (process.env.SHOT_DIR) {
			await browser.saveScreenshot(`${process.env.SHOT_DIR}/preview-diff.png`);
		}
		await browser.keys("Escape");
	});
});
