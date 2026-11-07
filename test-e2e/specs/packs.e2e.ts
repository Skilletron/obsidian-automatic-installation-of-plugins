import { browser, expect } from "@wdio/globals";
import { describe, it } from "mocha";
import {
	HIDER,
	PLUGIN_ID,
	pluginState,
	readConfigJson,
	runPluginMethod,
	updateOwnSettings,
	waitUntilPluginIdle,
	writeConfigJson,
	writeVaultFile,
	openEmptyVault,
} from "../helpers";

const PLACEHOLDER = "<secret removed on export>";
// wdio-obsidian-service installs a helper plugin of its own in test vaults.
const ours = (items: unknown) =>
	(items as Array<{ id?: string }>).filter(
		(item) => item.id !== "wdio-obsidian-service-plugin",
	);

async function callPlugin(method: string, ...args: string[]): Promise<void> {
	await browser.executeObsidian(
		async ({ app }, id, method, args) => {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			await (app as any).plugins.plugins[id][method](...args);
		},
		PLUGIN_ID,
		method,
		args,
	);
}

async function clickInPicker(text: string): Promise<void> {
	await browser.executeObsidian((_, text) => {
		[
			...document.querySelectorAll<HTMLButtonElement>(
				".community-install-manager-pack-export-modal button",
			),
		]
			.find((b) => b.textContent?.startsWith(text))
			?.click();
	}, text);
}

async function readPack(): Promise<{
	plugins: Array<{ id?: string }>;
	settings: Record<string, Record<string, unknown>>;
	vaultSetup?: { hotkeys?: Record<string, unknown> };
}> {
	return JSON.parse(
		await browser.executeObsidian(({ app }) =>
			app.vault.adapter.read("setup-pack.json"),
		),
	);
}

async function noticeText(): Promise<string> {
	return browser.executeObsidian(() =>
		[...document.querySelectorAll(".notice")]
			.map((n) => n.textContent ?? "")
			.join(" | "),
	);
}

describe("Setup packs", () => {
	let packText = "";

	it("exports a shareable pack with secrets left out", async () => {
		await openEmptyVault();
		await writeConfigJson("community-plugins-list.json", [
			{ id: HIDER, version: "1.7.1" },
		]);
		await runPluginMethod("runImportPipeline");
		const data = await readConfigJson<Record<string, unknown>>(
			`plugins/${HIDER}/data.json`,
		);
		await writeConfigJson(`plugins/${HIDER}/data.json`, {
			...data,
			hideStatus: true,
			apiToken: "real-token",
		});

		await callPlugin("exportSetupPack");
		const picker = browser.$(".community-install-manager-pack-export-modal");
		await picker.waitForExist();
		await expect(picker).toHaveText(expect.stringContaining(HIDER));
		// Nothing is written until the button is pressed.
		expect(
			await browser.executeObsidian(({ app }) =>
				app.vault.adapter.exists("setup-pack.json"),
			),
		).toBe(false);

		await clickInPicker("Save pack");
		await browser.waitUntil(
			() =>
				browser.executeObsidian(({ app }) =>
					app.vault.adapter.exists("setup-pack.json"),
				),
			{ timeoutMsg: "the pack was not saved" },
		);
		packText = await browser.executeObsidian(({ app }) =>
			app.vault.adapter.read("setup-pack.json"),
		);
		const pack = JSON.parse(packText);
		expect(pack.format).toBe("community-install-manager/setup-pack");
		expect(ours(pack.plugins)).toEqual([{ id: HIDER, version: "1.7.1" }]);
		expect(pack.settings[HIDER]).toMatchObject({
			hideStatus: true,
			apiToken: PLACEHOLDER,
		});
	});

	it("leaves out plugins that are turned off in the picker", async () => {
		await writeConfigJson("hotkeys.json", {
			[`${HIDER}:toggle-tab-containers`]: [{ modifiers: ["Mod"], key: "J" }],
			"editor:toggle-bold": [{ modifiers: ["Mod"], key: "B" }],
		});
		await updateOwnSettings({ syncVaultSetup: true });
		await callPlugin("exportSetupPack");
		await browser
			.$(".community-install-manager-pack-export-modal")
			.waitForExist();
		await browser.executeObsidian((_, name) => {
			const row = [
				...document.querySelectorAll<HTMLElement>(
					".community-install-manager-pack-export-list .setting-item",
				),
			].find((item) => item.textContent?.includes(name));
			row?.querySelector<HTMLElement>(".checkbox-container")?.click();
		}, HIDER);
		const before = await browser.executeObsidian(({ app }) =>
			app.vault.adapter.read("setup-pack.json"),
		);
		await clickInPicker("Save pack");
		await browser.waitUntil(
			async () =>
				(await browser.executeObsidian(({ app }) =>
					app.vault.adapter.read("setup-pack.json"),
				)) !== before,
			{ timeoutMsg: "the pack was not saved" },
		);

		const pack = await readPack();
		expect(pack.plugins.map((p) => p.id)).not.toContain(HIDER);
		expect(pack.settings[HIDER]).toBeUndefined();
		expect(JSON.stringify(pack)).not.toContain("real-token");
		expect(Object.keys(pack.vaultSetup?.hotkeys ?? {})).toEqual([
			"editor:toggle-bold",
		]);
	});

	it("does not save a pack when the picker is cancelled", async () => {
		const before = await browser.executeObsidian(({ app }) =>
			app.vault.adapter.read("setup-pack.json"),
		);
		await callPlugin("exportSetupPack");
		await browser
			.$(".community-install-manager-pack-export-modal")
			.waitForExist();
		await clickInPicker("Cancel");
		await browser
			.$(".community-install-manager-pack-export-modal")
			.waitForExist({ reverse: true });
		expect(
			await browser.executeObsidian(({ app }) =>
				app.vault.adapter.read("setup-pack.json"),
			),
		).toBe(before);
	});

	it("imports a pack only after confirmation", async () => {
		await openEmptyVault();
		await browser.executeObsidian(({ app }) =>
			app.vault.adapter.mkdir("shared"),
		);
		await writeVaultFile("shared/pack.json", packText);

		await callPlugin("loadSetupPack", "shared/pack.json");
		const modal = browser.$(".community-install-manager-pack-modal");
		await modal.waitForExist();
		await expect(modal).toHaveText(expect.stringContaining(HIDER));
		// Nothing has happened yet.
		expect((await pluginState(HIDER)).installedVersion).toBeNull();

		await browser.executeObsidian(() => {
			const button = [
				...document.querySelectorAll<HTMLButtonElement>(
					".community-install-manager-pack-modal button",
				),
			].find((b) => b.textContent === "Add to my setup and import");
			button?.click();
		});
		await browser.waitUntil(
			async () => (await pluginState(HIDER)).loaded,
			{ timeout: 60 * 1000, timeoutMsg: "the pack's plugin was not installed" },
		);
		const hider = await pluginState(HIDER);
		expect(hider.installedVersion).toBe("1.7.1");
		expect(hider.settings?.hideStatus).toBe(true);
		expect(hider.settings?.apiToken).toBeUndefined();
		expect(ours(await readConfigJson("community-plugins-list.json"))).toEqual([
			{ id: HIDER, version: "1.7.1" },
		]);
	});

	it("applies a confirmed pack's snippets even when syncing them is off", async () => {
		// Let the import from the previous test finish first; a second one
		// would be turned away while it runs.
		await waitUntilPluginIdle();
		await updateOwnSettings({ syncVaultSetup: false });
		const pack = {
			format: "community-install-manager/setup-pack",
			version: 1,
			plugins: [],
			settings: {},
			vaultSetup: {
				snippets: { "from-pack": { css: "body { --pack-marker: 1; }" } },
			},
		};
		await writeVaultFile("shared/snippet-pack.json", JSON.stringify(pack));
		await callPlugin("loadSetupPack", "shared/snippet-pack.json");
		await browser.$(".community-install-manager-pack-modal").waitForExist();
		await browser.executeObsidian(() => {
			[
				...document.querySelectorAll<HTMLButtonElement>(
					".community-install-manager-pack-modal button",
				),
			]
				.find((b) => b.textContent === "Add to my setup and import")
				?.click();
		});
		await browser.waitUntil(
			() =>
				browser.executeObsidian(({ app }) =>
					// eslint-disable-next-line @typescript-eslint/no-explicit-any
					(app as any).customCss.enabledSnippets.has("from-pack"),
				),
			{ timeout: 30 * 1000, timeoutMsg: "the pack's snippet was not applied" },
		);
	});

	it("refuses links that are not https or not packs", async () => {
		await callPlugin("loadSetupPack", "http://example.com/pack.json");
		expect(await noticeText()).toContain("only https links");

		await callPlugin(
			"loadSetupPack",
			"https://raw.githubusercontent.com/kepano/obsidian-hider/HEAD/manifest.json",
		);
		expect(await noticeText()).toContain("Not a setup pack");
		expect(await browser.$(".community-install-manager-pack-modal").isExisting()).toBe(
			false,
		);
	});
});
