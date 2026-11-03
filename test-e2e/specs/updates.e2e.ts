import { browser, expect } from "@wdio/globals";
import { before, describe, it } from "mocha";
import {
	HIDER,
	PLUGIN_ID,
	pluginState,
	readConfigJson,
	runPluginMethod,
	writeConfigJson,
} from "../helpers";

interface Update {
	pluginId: string;
	installed: string;
	available: string | null;
	newerNeedsApp?: { version: string; minAppVersion: string };
	pinned?: string;
}

async function findUpdates(): Promise<Update[]> {
	return browser.executeObsidian(async ({ app }, id) => {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		return (await (app as any).plugins.plugins[id].findUpdates()) ?? [];
	}, PLUGIN_ID);
}

// Hider 1.7.1 needs Obsidian 1.13.1, so older versions under test get no
// update for it, only a note about the newer version.
describe("Checking for and installing plugin updates", () => {
	let canUpdate = false;
	let hider: Update | undefined;

	before(async () => {
		await browser.reloadObsidian({ vault: "test-e2e/vaults/empty" });
		await writeConfigJson("community-plugins-list.json", [
			{ id: HIDER, version: "1.7.0" },
		]);
		await runPluginMethod("runImportPipeline");
		expect((await pluginState(HIDER)).installedVersion).toBe("1.7.0");

		const appVersion = await browser.executeObsidian(
			({ obsidian }) => obsidian.apiVersion,
		);
		const [major, minor] = appVersion.split(".").map(Number);
		canUpdate = major > 1 || (major === 1 && minor >= 14);
	});

	it("finds the newer version and knows about the pin", async () => {
		hider = (await findUpdates()).find((u) => u.pluginId === HIDER);
		expect(hider?.installed).toBe("1.7.0");
		expect(hider?.pinned).toBe("1.7.0");
		if (canUpdate) {
			expect(hider?.available).toBe("1.7.1");
		} else {
			expect(hider?.available).toBeNull();
			expect(hider?.newerNeedsApp?.minAppVersion).toBe("1.13.1");
		}
	});

	it("updates the plugin, keeps it running and moves the pin", async function () {
		if (!canUpdate) {
			this.skip();
		}
		await browser.executeObsidian(
			async ({ app }, id, updates) => {
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				await (app as any).plugins.plugins[id].updatePlugins(updates);
			},
			PLUGIN_ID,
			[hider],
		);

		const state = await pluginState(HIDER);
		expect(state.installedVersion).toBe("1.7.1");
		expect(state.enabled).toBe(true);
		expect(state.loaded).toBe(true);
		expect(await readConfigJson("community-plugins-list.json")).toEqual([
			{ id: HIDER, version: "1.7.1" },
		]);
	});

	it("shows the updates in a modal", async () => {
		await browser.executeObsidian(async ({ app }, id) => {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			await (app as any).plugins.plugins[id].checkForUpdates();
		}, PLUGIN_ID);
		const modal = browser.$(".community-install-manager-updates-modal");
		await expect(modal).toExist();
		await expect(modal).toHaveText(
			expect.stringContaining(canUpdate ? "up to date" : "needs Obsidian"),
		);
		await browser.keys("Escape");
	});
});
