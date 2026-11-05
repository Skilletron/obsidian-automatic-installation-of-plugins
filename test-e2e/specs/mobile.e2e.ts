import { browser, expect } from "@wdio/globals";
import { before, describe, it } from "mocha";
import {
	URL_INTO_SELECTION,
	isMobile,
	pluginState,
	runPluginMethod,
	updateOwnSettings,
	waitUntilPluginIdle,
	writeConfigJson,
	openEmptyVault,
} from "../helpers";

// A desktop-only plugin (isDesktopOnly: true in its manifest).
const DESKTOP_ONLY = "open-vscode";

async function isInstalled(id: string): Promise<boolean> {
	return (await pluginState(id)).installedVersion !== null;
}

// Startup auto-install and desktop-only handling. On desktop these check
// that nothing changed; the mobile cases run in mobile emulation and on
// Android.
describe("Automatic actions and desktop-only plugins on mobile", () => {
	let mobile = false;

	before(async () => {
		await openEmptyVault();
		mobile = await isMobile();
		await writeConfigJson("community-plugins-list.json", [
			URL_INTO_SELECTION,
		]);
		await updateOwnSettings({
			autoInstallPlugins: true,
			allowAutoActionsOnMobile: false,
		});
		// Restart with the same vault so the startup actions run.
		await browser.reloadObsidian();
	});

	it("runs startup auto-install on desktop but not on mobile by default", async () => {
		if (mobile) {
			// Give a startup import time to start, if it were going to.
			await browser.pause(5000);
			expect(await isInstalled(URL_INTO_SELECTION)).toBe(false);
		} else {
			await browser.waitUntil(() => isInstalled(URL_INTO_SELECTION), {
				timeout: 60 * 1000,
				timeoutMsg: "startup auto-install did not run on desktop",
			});
		}
	});

	it("runs startup auto-install on mobile once allowed", async function () {
		if (!mobile) {
			this.skip();
		}
		await updateOwnSettings({ allowAutoActionsOnMobile: true });
		await browser.reloadObsidian();

		await browser.waitUntil(() => isInstalled(URL_INTO_SELECTION), {
			timeout: 60 * 1000,
			timeoutMsg: "startup auto-install did not run after allowing it",
		});
	});

	it("skips desktop-only plugins on mobile", async function () {
		if (!mobile) {
			this.skip();
		}
		await updateOwnSettings({ autoInstallPlugins: false });
		await writeConfigJson("community-plugins-list.json", [
			DESKTOP_ONLY,
			URL_INTO_SELECTION,
		]);

		await runPluginMethod("runImportPipeline");

		expect(await isInstalled(DESKTOP_ONLY)).toBe(false);
		expect(await isInstalled(URL_INTO_SELECTION)).toBe(true);
	});

	it("repairs a plugin whose main.js was left empty", async () => {
		await updateOwnSettings({ autoInstallPlugins: false });
		await writeConfigJson("community-plugins-list.json", [URL_INTO_SELECTION]);
		const mainSize = (empty: boolean) =>
			browser.executeObsidian(
				async ({ app }, id, empty) => {
					const path = `${app.vault.configDir}/plugins/${id}/main.js`;
					if (empty) {
						await app.vault.adapter.write(path, "");
					}
					return (await app.vault.adapter.read(path)).length;
				},
				URL_INTO_SELECTION,
				empty,
			);
		await waitUntilPluginIdle();
		expect(await mainSize(true)).toBe(0);

		await runPluginMethod("runImportPipeline");

		expect(await mainSize(false)).toBeGreaterThan(0);
	});
});
