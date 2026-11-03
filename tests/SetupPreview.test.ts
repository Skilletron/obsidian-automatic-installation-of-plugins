import { describe, expect, it } from "vitest";
import { Notice } from "obsidian";
import { SetupPreview } from "../src/core/SetupPreview";
import { PLUGINS_LIST_FILE, PLUGINS_SETTINGS_FILE } from "../src/types";
import { createTestVault, installedPlugin } from "./helpers";

const LIST_PATH = `.obsidian/${PLUGINS_LIST_FILE}`;
const SETTINGS_PATH = `.obsidian/${PLUGINS_SETTINGS_FILE}`;

function preview(files: Record<string, string>, isMobile = false) {
	const vault = createTestVault(files);
	return new SetupPreview(vault.fileManager, () => isMobile);
}

describe("SetupPreview.buildReport", () => {
	it("reports a missing list file", async () => {
		const report = await preview({}).buildReport(true);
		expect(report).toMatchObject({
			rows: [],
			listMissing: true,
			settingsMissing: true,
		});
		expect(Notice.messages[0]).toContain("not found");
	});

	it("returns null for invalid list JSON", async () => {
		const report = await preview({ [LIST_PATH]: "[" }).buildReport(true);
		expect(report).toBeNull();
	});

	it("returns null when the list is not an array", async () => {
		const report = await preview({ [LIST_PATH]: "{}" }).buildReport(true);
		expect(report).toBeNull();
	});

	it("classifies install, skip, re-pin and pinned-ok rows", async () => {
		const report = await preview({
			...installedPlugin("unpinned", { id: "unpinned", version: "1.0.0" }),
			...installedPlugin("same", { id: "same", version: "v2.0.0" }),
			...installedPlugin("older", { id: "older", version: "1.0.0" }),
			[LIST_PATH]: JSON.stringify([
				"missing",
				{ id: "missing-pinned", version: "3.0.0" },
				"unpinned",
				{ id: "same", version: "2.0.0" },
				{ id: "older", version: "1.1.0" },
			]),
		}).buildReport(true);

		expect(report?.rows.map((r) => [r.id, r.installAction])).toEqual([
			["missing", "install"],
			["missing-pinned", "install"],
			["unpinned", "skip"],
			["same", "ok-pinned"],
			["older", "repin"],
		]);
		expect(report?.summary).toMatchObject({
			install: 2,
			skip: 1,
			repin: 1,
			okPinned: 1,
		});

		const rows = Object.fromEntries(report!.rows.map((r) => [r.id, r]));
		expect(rows["missing-pinned"].installNote).toContain("@3.0.0");
		expect(rows["unpinned"].localVersion).toBe("1.0.0");
		expect(rows["older"].installNote).toBe("Would change 1.0.0 → 1.1.0");
	});

	it("treats a folder without main.js as not installed", async () => {
		const report = await preview({
			".obsidian/plugins/broken/manifest.json": JSON.stringify({
				id: "broken",
				version: "1.0.0",
			}),
			[LIST_PATH]: JSON.stringify(["broken"]),
		}).buildReport(true);

		expect(report?.rows[0]).toMatchObject({
			installed: false,
			installAction: "install",
			localVersion: null,
		});
	});

	it("marks a pinned plugin with an unreadable version as re-pin", async () => {
		const report = await preview({
			...installedPlugin("noversion", { id: "noversion" }),
			[LIST_PATH]: JSON.stringify([{ id: "noversion", version: "1.0.0" }]),
		}).buildReport(true);

		expect(report?.rows[0].installAction).toBe("repin");
		expect(report?.rows[0].installNote).toContain("unknown");
	});

	describe("settings column", () => {
		const list = JSON.stringify(["installed", "missing", "no-entry"]);
		const files = {
			...installedPlugin("installed", { id: "installed", version: "1.0.0" }),
			...installedPlugin("no-entry", { id: "no-entry", version: "1.0.0" }),
			[LIST_PATH]: list,
			[SETTINGS_PATH]: JSON.stringify({
				installed: { a: 1 },
				missing: { a: 1 },
			}),
		};

		it("with apply-on-install on", async () => {
			const report = await preview(files).buildReport(true);
			expect(
				report?.rows.map((r) => [r.id, r.settingsAction]),
			).toEqual([
				["installed", "would-apply"],
				["missing", "would-apply"],
				["no-entry", "no-settings-entry"],
			]);
			expect(report?.summary.wouldApplySettings).toBe(2);
		});

		it("with apply-on-install off", async () => {
			const report = await preview(files).buildReport(false);
			expect(
				report?.rows.map((r) => [r.id, r.settingsAction]),
			).toEqual([
				["installed", "would-apply"],
				["missing", "plugin-not-installed"],
				["no-entry", "no-settings-entry"],
			]);
			expect(report?.summary.wouldApplySettings).toBe(1);
		});

		it("when the settings file is missing", async () => {
			const report = await preview({
				[LIST_PATH]: JSON.stringify(["a"]),
			}).buildReport(true);
			expect(report?.settingsMissing).toBe(true);
			expect(report?.rows[0].settingsAction).toBe("settings-file-missing");
		});

		it("ignores a settings file that is not an object", async () => {
			const report = await preview({
				[LIST_PATH]: JSON.stringify(["a"]),
				[SETTINGS_PATH]: JSON.stringify(["a"]),
			}).buildReport(true);
			expect(report?.rows[0].settingsAction).toBe("no-settings-entry");
		});
	});
});

describe("SetupPreview.formatReportText", () => {
	it("lists every row with its notes", async () => {
		const p = preview({
			[LIST_PATH]: JSON.stringify([{ id: "a", version: "1.0.0" }]),
		});
		const report = await p.buildReport(true);
		const text = p.formatReportText(report!);

		expect(text).toContain("Summary: install 1, skip 0, re-pin 0");
		expect(text).toContain(`Note: ${PLUGINS_SETTINGS_FILE} not found.`);
		expect(text).toContain("• a@1.0.0");
		expect(text).toContain("install:  Would install @1.0.0");
	});

	it("marks an empty list", async () => {
		const p = preview({ [LIST_PATH]: "[]" });
		const text = p.formatReportText((await p.buildReport(true))!);
		expect(text).toContain("(empty list)");
	});
});

describe("SetupPreview with devices and enabled", () => {
	const files = {
		[LIST_PATH]: JSON.stringify([
			{ id: "git", devices: "desktop" },
			{ id: "calendar", enabled: false },
		]),
	};

	it("marks plugins listed for other devices", async () => {
		const report = await preview(files, true).buildReport(true);
		expect(report?.summary.otherDevice).toBe(1);
		expect(report?.summary.install).toBe(1);
		expect(report?.rows[0]).toMatchObject({
			id: "git",
			installAction: "other-device",
			settingsAction: "other-device",
		});
		expect(report?.rows[0].installNote).toContain("desktop only");
	});

	it("installs them on the right device", async () => {
		const report = await preview(files, false).buildReport(true);
		expect(report?.summary.otherDevice).toBe(0);
		expect(report?.summary.install).toBe(2);
	});

	it("notes plugins that stay turned off", async () => {
		const report = await preview(files, false).buildReport(true);
		expect(report?.rows[1].installNote).toContain("left turned off");
	});
});
