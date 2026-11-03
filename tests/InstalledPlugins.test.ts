import { describe, expect, it } from "vitest";
import {
	findPluginFolder,
	scanInstalledPlugins,
} from "../src/core/InstalledPlugins";
import { createTestVault, installedPlugin } from "./helpers";

describe("scanInstalledPlugins", () => {
	it("reads id and version from each manifest", async () => {
		const { fileManager } = createTestVault({
			...installedPlugin("dataview", { id: "dataview", version: "v0.5.68" }),
			...installedPlugin("folder", { id: "real-id" }),
		});

		const scanned = await scanInstalledPlugins(fileManager);
		expect(
			scanned.sort((a, b) => a.folderName.localeCompare(b.folderName)),
		).toEqual([
			{
				folderName: "dataview",
				pluginId: "dataview",
				version: "0.5.68",
				complete: true,
			},
			{
				folderName: "folder",
				pluginId: "real-id",
				version: undefined,
				complete: true,
			},
		]);
	});

	it("marks folders without main.js as incomplete", async () => {
		const { fileManager } = createTestVault({
			".obsidian/plugins/partial/manifest.json": '{"id":"partial"}',
		});
		expect(await scanInstalledPlugins(fileManager)).toEqual([
			{
				folderName: "partial",
				pluginId: "partial",
				version: undefined,
				complete: false,
			},
		]);
	});

	it("skips folders without manifest.json", async () => {
		const { fileManager } = createTestVault({
			".obsidian/plugins/empty/main.js": "",
		});
		expect(await scanInstalledPlugins(fileManager)).toEqual([]);
	});

	it("uses the folder name when the manifest is invalid", async () => {
		const { fileManager } = createTestVault({
			".obsidian/plugins/odd/manifest.json": "{",
			".obsidian/plugins/odd/main.js": "",
		});
		const [plugin] = await scanInstalledPlugins(fileManager);
		expect(plugin.pluginId).toBe("odd");
	});

	it("returns [] when the plugins folder is missing", async () => {
		const { fileManager } = createTestVault();
		expect(await scanInstalledPlugins(fileManager)).toEqual([]);
	});
});

describe("findPluginFolder", () => {
	const installed = [
		{ folderName: "x", pluginId: "dataview", complete: true },
		{ folderName: "dataview", pluginId: "dataview", complete: true },
		{ folderName: "folder", pluginId: "real-id", complete: true },
	];

	it("prefers the folder named after the id", () => {
		expect(findPluginFolder(installed, "dataview")?.folderName).toBe(
			"dataview",
		);
	});

	it("falls back to a manifest id match", () => {
		expect(findPluginFolder(installed, "real-id")?.folderName).toBe(
			"folder",
		);
	});

	it("returns undefined for unknown plugins", () => {
		expect(findPluginFolder(installed, "missing")).toBeUndefined();
	});
});

describe("scanInstalledPlugins isDesktopOnly", () => {
	it("flags desktop-only plugins", async () => {
		const { fileManager } = createTestVault({
			...installedPlugin("git", { id: "git", isDesktopOnly: true }),
			...installedPlugin("cal", { id: "cal", isDesktopOnly: false }),
		});
		const scanned = await scanInstalledPlugins(fileManager);
		const byId = Object.fromEntries(scanned.map((p) => [p.pluginId, p]));
		expect(byId.git.isDesktopOnly).toBe(true);
		expect(byId.cal.isDesktopOnly).toBeUndefined();
	});
});
