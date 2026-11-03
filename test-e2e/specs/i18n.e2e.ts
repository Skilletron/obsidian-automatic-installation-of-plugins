import { browser, expect } from "@wdio/globals";
import { after, describe, it } from "mocha";
import { PLUGIN_ID, openEmptyVault } from "../helpers";

async function commandName(id: string): Promise<string> {
	return browser.executeObsidian(
		({ app }, full) =>
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			(app as any).commands.commands[full]?.name ?? "",
		`${PLUGIN_ID}:${id}`,
	);
}

describe("Translations", () => {
	after(async () => {
		await browser.executeObsidian(() => window.localStorage.removeItem("language"));
		await browser.reloadObsidian();
	});

	it("follows Obsidian's language", async () => {
		await openEmptyVault();
		expect(await commandName("import-plugin-setup")).toContain(
			"Import plugin setup from JSON",
		);

		await browser.executeObsidian(() =>
			window.localStorage.setItem("language", "ru"),
		);
		await browser.reloadObsidian();
		expect(await commandName("import-plugin-setup")).toContain(
			"Импортировать плагины из JSON",
		);
	});
});
