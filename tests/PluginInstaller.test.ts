import { describe, expect, it, vi } from "vitest";
import { Notice, PluginManifest, setRequestUrlHandler } from "obsidian";
import { PluginInstaller } from "../src/core/PluginInstaller";
import { SettingsManager } from "../src/core/SettingsManager";
import { NetworkManager } from "../src/utils/NetworkManager";
import { PLUGIN_REGISTRY_URL, PLUGINS_SETTINGS_FILE } from "../src/types";
import { createTestVault, installedPlugin, TestVault } from "./helpers";

const REPO = "owner/dataview-repo";
const RAW_HEAD = `https://raw.githubusercontent.com/${REPO}/HEAD/manifest.json`;
const release = (tag: string) =>
	`https://github.com/${REPO}/releases/download/${tag}/manifest.json`;
const manifest = (version: string): PluginManifest => ({
	id: "dataview",
	name: "Dataview",
	version,
	minAppVersion: "1.0.0",
});

// Serves the given URLs; everything else answers 404.
function serve(routes: Record<string, unknown>): string[] {
	const requested: string[] = [];
	setRequestUrlHandler(async (req) => {
		requested.push(req.url);
		if (Object.prototype.hasOwnProperty.call(routes, req.url)) {
			return { status: 200, json: routes[req.url] };
		}
		return { status: 404, json: null };
	});
	return requested;
}

const registry = [
	{ id: "calendar", repo: "someone/calendar" },
	{ id: "dataview", repo: REPO },
	{ id: "bad-repo", repo: "no-slash" },
];

interface Setup {
	vault: TestVault;
	installer: PluginInstaller;
	installPlugin: ReturnType<typeof vi.fn>;
}

function setup(
	options: {
		files?: Record<string, string>;
		loadSettingsOnInstall?: boolean;
		withInstallApi?: boolean;
		isMobile?: boolean;
	} = {},
): Setup {
	let vault!: TestVault;
	// Simulates Obsidian writing the plugin folder on install.
	const installPlugin = vi.fn(
		async (_repo: string, _version: string, m: PluginManifest) => {
			const base = `.obsidian/plugins/${m.id}`;
			await vault.adapter.mkdir(base);
			await vault.adapter.write(`${base}/manifest.json`, JSON.stringify(m));
			await vault.adapter.write(`${base}/main.js`, "");
		},
	);
	const plugins =
		options.withInstallApi === false
			? {}
			: { installPlugin, loadManifests: vi.fn(async () => {}) };

	vault = createTestVault(options.files ?? {}, { plugins });
	const installer = new PluginInstaller(
		vault.app,
		vault.fileManager,
		new NetworkManager(),
		new SettingsManager(vault.fileManager, () => true),
		() => options.loadSettingsOnInstall ?? false,
		() => options.isMobile ?? false,
	);
	return { vault, installer, installPlugin };
}

describe("PluginInstaller.installPlugin", () => {
	it("rejects unsafe IDs without touching the network", async () => {
		const { installer } = setup();
		expect(await installer.installPlugin({ id: "../evil" })).toBe("failed");
		expect(await installer.installPlugin({ id: "  " })).toBe("failed");
	});

	it("skips an installed plugin when no version is pinned", async () => {
		const { installer, installPlugin } = setup({
			files: installedPlugin("dataview", manifest("0.1.0")),
		});
		expect(await installer.installPlugin({ id: "dataview" })).toBe("unchanged");
		expect(installPlugin).not.toHaveBeenCalled();
	});

	it("skips an installed plugin already at the pinned version", async () => {
		const { installer, installPlugin } = setup({
			files: installedPlugin("dataview", manifest("v1.0.0")),
		});
		expect(
			await installer.installPlugin({ id: "dataview", version: "1.0.0" }),
		).toBe("unchanged");
		expect(installPlugin).not.toHaveBeenCalled();
	});

	it("fails when Obsidian's installPlugin API is unavailable", async () => {
		const { installer } = setup({ withInstallApi: false });
		expect(await installer.installPlugin({ id: "dataview" })).toBe("failed");
		expect(installer.lastFailure).toContain("installPlugin API");
		expect(Notice.messages).toEqual([]);
	});

	it("fails for plugins missing from the registry", async () => {
		serve({ [PLUGIN_REGISTRY_URL]: registry });
		const { installer } = setup();
		expect(await installer.installPlugin({ id: "unknown" })).toBe("failed");
		expect(installer.lastFailure).toContain("not found");
	});

	it("fails for a malformed registry repo", async () => {
		serve({ [PLUGIN_REGISTRY_URL]: registry });
		const { installer } = setup();
		expect(await installer.installPlugin({ id: "bad-repo" })).toBe("failed");
		expect(installer.lastFailure).toContain("invalid repository format");
	});

	it("installs the latest version from the repo manifest", async () => {
		serve({
			[PLUGIN_REGISTRY_URL]: registry,
			[RAW_HEAD]: manifest("1.2.0"),
			[release("1.2.0")]: manifest("1.2.0"),
		});
		const { installer, installPlugin } = setup();

		expect(await installer.installPlugin({ id: "Dataview" })).toBe("installed");
		expect(installPlugin).toHaveBeenCalledWith(
			REPO,
			"1.2.0",
			manifest("1.2.0"),
		);
	});

	describe("desktop-only plugins", () => {
		const desktopOnly = { ...manifest("1.2.0"), isDesktopOnly: true };

		it("skips them on mobile without installing", async () => {
			serve({
				[PLUGIN_REGISTRY_URL]: registry,
				[RAW_HEAD]: desktopOnly,
				[release("1.2.0")]: desktopOnly,
			});
			const { installer, installPlugin } = setup({ isMobile: true });

			expect(await installer.installPlugin({ id: "dataview" })).toBe(
				"skipped",
			);
			expect(installPlugin).not.toHaveBeenCalled();
			expect(Notice.messages).toEqual([]);
		});

		it("installs them on desktop", async () => {
			serve({
				[PLUGIN_REGISTRY_URL]: registry,
				[RAW_HEAD]: desktopOnly,
				[release("1.2.0")]: desktopOnly,
			});
			const { installer } = setup({ isMobile: false });

			expect(await installer.installPlugin({ id: "dataview" })).toBe(
				"installed",
			);
		});

		it("installs other plugins on mobile", async () => {
			serve({
				[PLUGIN_REGISTRY_URL]: registry,
				[RAW_HEAD]: manifest("1.2.0"),
				[release("1.2.0")]: manifest("1.2.0"),
			});
			const { installer } = setup({ isMobile: true });

			expect(await installer.installPlugin({ id: "dataview" })).toBe(
				"installed",
			);
		});
	});

	it("installs a pinned version from its release manifest", async () => {
		serve({
			[PLUGIN_REGISTRY_URL]: registry,
			[release("0.9.0")]: manifest("0.9.0"),
		});
		const { installer, installPlugin } = setup({
			files: installedPlugin("dataview", manifest("1.0.0")),
		});

		expect(
			await installer.installPlugin({ id: "dataview", version: "0.9.0" }),
		).toBe("installed");
		expect(installPlugin).toHaveBeenCalledWith(
			REPO,
			"0.9.0",
			manifest("0.9.0"),
		);
	});

	it("falls back to a v-prefixed release tag", async () => {
		serve({
			[PLUGIN_REGISTRY_URL]: registry,
			[release("v0.9.0")]: manifest("0.9.0"),
		});
		const { installer } = setup();

		expect(
			await installer.installPlugin({ id: "dataview", version: "0.9.0" }),
		).toBe("installed");
	});

	it("retries installPlugin with a v-prefixed version", async () => {
		serve({
			[PLUGIN_REGISTRY_URL]: registry,
			[release("1.0.0")]: manifest("1.0.0"),
		});
		const { installer, installPlugin } = setup();
		installPlugin.mockRejectedValueOnce(new Error("no such release"));

		expect(
			await installer.installPlugin({ id: "dataview", version: "1.0.0" }),
		).toBe("installed");
		expect(installPlugin.mock.calls.map((c) => c[1])).toEqual([
			"1.0.0",
			"v1.0.0",
		]);
	});

	it("removes a partially installed folder after a failure", async () => {
		serve({
			[PLUGIN_REGISTRY_URL]: registry,
			[release("1.0.0")]: manifest("1.0.0"),
		});
		const { installer, installPlugin, vault } = setup();
		installPlugin.mockImplementation(async () => {
			await vault.adapter.mkdir(".obsidian/plugins/dataview");
			await vault.adapter.write(
				".obsidian/plugins/dataview/manifest.json",
				"{}",
			);
			throw new Error("download failed");
		});

		expect(
			await installer.installPlugin({ id: "dataview", version: "1.0.0" }),
		).toBe("failed");
		expect(await vault.adapter.exists(".obsidian/plugins/dataview")).toBe(
			false,
		);
	});

	it("caches the registry until clearCaches()", async () => {
		const requested = serve({
			[PLUGIN_REGISTRY_URL]: registry,
			[release("1.0.0")]: manifest("1.0.0"),
		});
		const { installer, vault } = setup();
		const registryCalls = () =>
			requested.filter((u) => u === PLUGIN_REGISTRY_URL).length;

		await installer.installPlugin({ id: "dataview", version: "1.0.0" });
		await vault.adapter.rmdir(".obsidian/plugins/dataview", true);
		await installer.installPlugin({ id: "dataview", version: "1.0.0" });
		expect(registryCalls()).toBe(1);

		installer.clearCaches();
		await vault.adapter.rmdir(".obsidian/plugins/dataview", true);
		await installer.installPlugin({ id: "dataview", version: "1.0.0" });
		expect(registryCalls()).toBe(2);
	});

	it.each([true, false])(
		"applies settings after install only when enabled (%s)",
		async (loadSettingsOnInstall) => {
			serve({
				[PLUGIN_REGISTRY_URL]: registry,
				[release("1.0.0")]: manifest("1.0.0"),
			});
			const { installer, vault } = setup({
				loadSettingsOnInstall,
				files: {
					[`.obsidian/${PLUGINS_SETTINGS_FILE}`]: JSON.stringify({
						dataview: { refresh: 5 },
					}),
				},
			});

			await installer.installPlugin({ id: "dataview", version: "1.0.0" });
			const data = vault.read(".obsidian/plugins/dataview/data.json");
			expect(data !== undefined).toBe(loadSettingsOnInstall);
		},
	);
});
