import { browser, expect } from "@wdio/globals";
import { before, describe, it } from "mocha";
import {
	HIDER,
	pluginState,
	readConfigJson,
	runPluginMethod,
	updateOwnSettings,
	writeConfigJson,
	openEmptyVault,
} from "../helpers";

const DATA_JSON = `plugins/${HIDER}/data.json`;
const PLACEHOLDER = "<secret removed on export>";

describe("Secrets on export and undo", () => {
	before(async () => {
		await openEmptyVault();
		await updateOwnSettings({ redactSecretsOnExport: true });
		await writeConfigJson("community-plugins-list.json", [
			{ id: HIDER, version: "1.7.1" },
		]);
		await writeConfigJson("community-plugins-settings.json", {
			[HIDER]: { hideStatus: true },
		});
		await runPluginMethod("runImportPipeline");
		expect((await pluginState(HIDER)).loaded).toBe(true);
	});

	it("leaves secrets out of the export and keeps them on apply", async () => {
		const data = await readConfigJson<Record<string, unknown>>(DATA_JSON);
		await writeConfigJson(DATA_JSON, { ...data, apiToken: "real-token" });

		await runPluginMethod("exportPluginSetup");
		const exported = await readConfigJson<Record<string, Record<string, unknown>>>(
			"community-plugins-settings.json",
		);
		expect(exported?.[HIDER]).toMatchObject({
			hideStatus: true,
			apiToken: PLACEHOLDER,
		});

		await runPluginMethod("applySettingsToInstalledPlugins");
		expect(await readConfigJson(DATA_JSON)).toMatchObject({
			hideStatus: true,
			apiToken: "real-token",
		});
	});

	it("undoes the last Apply settings and restarts the plugin", async () => {
		await writeConfigJson("community-plugins-settings.json", {
			[HIDER]: { hideStatus: false },
		});
		await runPluginMethod("applySettingsToInstalledPlugins");
		expect((await pluginState(HIDER)).settings?.hideStatus).toBe(false);

		await runPluginMethod("undoLastChange");

		expect(await readConfigJson(DATA_JSON)).toMatchObject({
			hideStatus: true,
			apiToken: "real-token",
		});
		const hider = await pluginState(HIDER);
		expect(hider.loaded).toBe(true);
		expect(hider.settings?.hideStatus).toBe(true);
	});

	it("undoes an Export", async () => {
		await writeConfigJson("community-plugins-list.json", ["my-own-list"]);
		await runPluginMethod("exportPluginSetup");
		expect(await readConfigJson("community-plugins-list.json")).not.toEqual([
			"my-own-list",
		]);

		await runPluginMethod("undoLastChange");

		expect(await readConfigJson("community-plugins-list.json")).toEqual([
			"my-own-list",
		]);
	});
});
