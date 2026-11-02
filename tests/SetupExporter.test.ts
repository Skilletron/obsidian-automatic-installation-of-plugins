import { describe, expect, it } from "vitest";
import { SetupExporter } from "../src/core/SetupExporter";
import {
	PLUGIN_ID,
	PLUGINS_LIST_FILE,
	PLUGINS_SETTINGS_FILE,
} from "../src/types";
import { createTestVault, installedPlugin } from "./helpers";

const LIST_PATH = `.obsidian/${PLUGINS_LIST_FILE}`;
const SETTINGS_PATH = `.obsidian/${PLUGINS_SETTINGS_FILE}`;

describe("SetupExporter", () => {
	it("lists installed plugins sorted by id, skipping itself", async () => {
		const vault = createTestVault({
			...installedPlugin("zeta", { id: "zeta", version: "1.0.0" }),
			...installedPlugin("alpha", { id: "alpha", version: "v2.0.0" }),
			...installedPlugin(PLUGIN_ID, { id: PLUGIN_ID, version: "1.2.1" }),
		});
		const installed = await new SetupExporter(
			vault.fileManager,
		).listInstalledPlugins();

		expect(installed).toEqual([
			{ folderName: "alpha", pluginId: "alpha", version: "2.0.0" },
			{ folderName: "zeta", pluginId: "zeta", version: "1.0.0" },
		]);
	});

	it("skips folders without manifest.json or main.js", async () => {
		const vault = createTestVault({
			".obsidian/plugins/no-main/manifest.json": '{"id":"no-main"}',
			".obsidian/plugins/no-manifest/main.js": "",
			...installedPlugin("ok", { id: "ok" }),
		});
		const installed = await new SetupExporter(
			vault.fileManager,
		).listInstalledPlugins();

		expect(installed.map((p) => p.pluginId)).toEqual(["ok"]);
	});

	it("uses the manifest id over the folder name and de-duplicates", async () => {
		const vault = createTestVault({
			...installedPlugin("folder-a", { id: "same-id", version: "1.0.0" }),
			...installedPlugin("folder-b", { id: "same-id", version: "2.0.0" }),
		});
		const installed = await new SetupExporter(
			vault.fileManager,
		).listInstalledPlugins();

		expect(installed).toHaveLength(1);
		expect(installed[0].pluginId).toBe("same-id");
	});

	it("falls back to the folder name when manifest.json is invalid", async () => {
		const vault = createTestVault({
			".obsidian/plugins/odd/manifest.json": "{not json",
			".obsidian/plugins/odd/main.js": "",
		});
		const installed = await new SetupExporter(
			vault.fileManager,
		).listInstalledPlugins();

		expect(installed).toEqual([
			{ folderName: "odd", pluginId: "odd", version: undefined },
		]);
	});

	it("writes the plugin list and settings files", async () => {
		const vault = createTestVault({
			...installedPlugin(
				"dataview",
				{ id: "dataview", version: "0.5.68" },
				{ refresh: 100 },
			),
			...installedPlugin("calendar", { id: "calendar" }),
			...installedPlugin("array-data", { id: "array-data" }, [1, 2]),
			".obsidian/plugins/bad-data/manifest.json": '{"id":"bad-data"}',
			".obsidian/plugins/bad-data/main.js": "",
			".obsidian/plugins/bad-data/data.json": "{oops",
		});

		const result = await new SetupExporter(vault.fileManager).exportSetup();

		expect(result).toEqual({ pluginCount: 4, settingsCount: 1 });
		expect(vault.readJson(LIST_PATH)).toEqual([
			{ id: "array-data" },
			{ id: "bad-data" },
			{ id: "calendar" },
			{ id: "dataview", version: "0.5.68" },
		]);
		expect(vault.readJson(SETTINGS_PATH)).toEqual({
			dataview: { refresh: 100 },
		});
		expect(vault.read(LIST_PATH)?.endsWith("\n")).toBe(true);
	});

	describe("existing entries for plugins that are not installed", () => {
		const files = () => ({
			...installedPlugin(
				"calendar",
				{ id: "calendar", version: "1.5.10" },
				{ weekStart: "monday" },
			),
			[LIST_PATH]: JSON.stringify([
				"obsidian-git",
				{ id: "templater-obsidian", version: "2.0.0", note: "kept" },
				{ id: "calendar", version: "1.0.0" },
				"obsidian-git",
				PLUGIN_ID,
				{ broken: true },
			]),
			[SETTINGS_PATH]: JSON.stringify({
				"obsidian-git": { autoPullInterval: 10 },
				calendar: { weekStart: "sunday" },
				[PLUGIN_ID]: { x: 1 },
			}),
		});

		it("keeps them when exporting on mobile", async () => {
			const vault = createTestVault(files());
			await new SetupExporter(vault.fileManager, () => true).exportSetup();

			expect(vault.readJson(LIST_PATH)).toEqual([
				{ id: "calendar", version: "1.5.10" },
				"obsidian-git",
				{ id: "templater-obsidian", version: "2.0.0", note: "kept" },
			]);
			expect(vault.readJson(SETTINGS_PATH)).toEqual({
				calendar: { weekStart: "monday" },
				"obsidian-git": { autoPullInterval: 10 },
			});
		});

		it("drops them when exporting on desktop", async () => {
			const vault = createTestVault(files());
			await new SetupExporter(vault.fileManager, () => false).exportSetup();

			expect(vault.readJson(LIST_PATH)).toEqual([
				{ id: "calendar", version: "1.5.10" },
			]);
			expect(vault.readJson(SETTINGS_PATH)).toEqual({
				calendar: { weekStart: "monday" },
			});
		});

		it("ignores invalid existing files on mobile", async () => {
			const vault = createTestVault({
				...installedPlugin("calendar", { id: "calendar" }),
				[LIST_PATH]: "{oops",
				[SETTINGS_PATH]: "[]",
			});
			await new SetupExporter(vault.fileManager, () => true).exportSetup();

			expect(vault.readJson(LIST_PATH)).toEqual([{ id: "calendar" }]);
			expect(vault.readJson(SETTINGS_PATH)).toEqual({});
		});
	});

	it("writes empty files for a vault without plugins", async () => {
		const vault = createTestVault();
		const result = await new SetupExporter(vault.fileManager).exportSetup();

		expect(result).toEqual({ pluginCount: 0, settingsCount: 0 });
		expect(vault.readJson(LIST_PATH)).toEqual([]);
		expect(vault.readJson(SETTINGS_PATH)).toEqual({});
	});
});
