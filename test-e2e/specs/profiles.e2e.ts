import { browser, expect } from "@wdio/globals";
import { before, describe, it } from "mocha";
import {
	HIDER,
	URL_INTO_SELECTION,
	isMobile,
	pluginState,
	readConfigJson,
	runPluginMethod,
	writeConfigJson,
	openEmptyVault,
} from "../helpers";

describe("Device profiles and enabled in the plugin list", () => {
	let thisDevice: "desktop" | "mobile" = "desktop";
	let otherDevice: "desktop" | "mobile" = "mobile";

	before(async () => {
		await openEmptyVault();
		if (await isMobile()) {
			thisDevice = "mobile";
			otherDevice = "desktop";
		}
		await writeConfigJson("community-plugins-list.json", [
			{ id: URL_INTO_SELECTION, devices: otherDevice },
			{
				id: HIDER,
				version: "1.7.1",
				enabled: false,
				devices: [thisDevice],
				note: "kept by export",
			},
		]);
		await runPluginMethod("runImportPipeline");
	});

	it("skips plugins listed for another device", async () => {
		expect((await pluginState(URL_INTO_SELECTION)).installedVersion).toBeNull();
	});

	it("installs a plugin marked enabled: false but leaves it off", async () => {
		const hider = await pluginState(HIDER);
		expect(hider.installedVersion).toBe("1.7.1");
		expect(hider.enabled).toBe(false);
		expect(hider.loaded).toBe(false);
	});

	it("exports enabled and devices and keeps custom fields", async () => {
		await runPluginMethod("exportPluginSetup");
		const list = await readConfigJson<Array<Record<string, unknown>>>(
			"community-plugins-list.json",
		);
		expect(list).toContainEqual({
			id: HIDER,
			version: "1.7.1",
			enabled: false,
			devices: [thisDevice],
			note: "kept by export",
		});
	});
});
