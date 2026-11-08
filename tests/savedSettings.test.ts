import { describe, expect, it } from "vitest";
import { settingsFromSaved, usedBefore } from "../src/utils/savedSettings";
import { DEFAULT_SETTINGS, PLUGINS_LIST_FILE, PLUGINS_SETTINGS_FILE } from "../src/types";
import { createTestVault } from "./helpers";

describe("saved settings", () => {
	it("uses the new defaults for a new install", () => {
		expect(settingsFromSaved(null, false)).toEqual(DEFAULT_SETTINGS);
	});

	it("keeps the old behaviour for a vault that used it without saving settings", () => {
		const settings = settingsFromSaved(null, true);
		expect(settings.redactSecretsOnExport).toBe(false);
		expect(settings.syncVaultSetup).toBe(false);
		// Older versions merged plugin settings by default too.
		expect(settings.mergePluginSettings).toBe(true);
	});

	it("keeps the old behaviour for settings saved before these options", () => {
		const settings = settingsFromSaved({ autoInstallPlugins: true }, false);
		expect(settings).toMatchObject({
			autoInstallPlugins: true,
			mergePluginSettings: false,
			redactSecretsOnExport: false,
			syncVaultSetup: false,
		});
	});

	it("keeps what the user chose", () => {
		const settings = settingsFromSaved(
			{ redactSecretsOnExport: true, syncVaultSetup: true },
			true,
		);
		expect(settings.redactSecretsOnExport).toBe(true);
		expect(settings.syncVaultSetup).toBe(true);
	});

	it("tells an earlier install by its export files", async () => {
		expect(await usedBefore(createTestVault().fileManager)).toBe(false);
		for (const file of [PLUGINS_LIST_FILE, PLUGINS_SETTINGS_FILE]) {
			const vault = createTestVault({ [`.obsidian/${file}`]: "[]" });
			expect(await usedBefore(vault.fileManager)).toBe(true);
		}
	});
});
