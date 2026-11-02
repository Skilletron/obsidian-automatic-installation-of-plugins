import * as path from "path";
import { env } from "process";
import { parseObsidianVersions } from "wdio-obsidian-service";

// wdio-obsidian-service downloads Obsidian versions into this directory.
const cacheDir = path.resolve(".obsidian-cache");

// "app/installer" pairs. "earliest" is minAppVersion from manifest.json.
// Override with e.g. OBSIDIAN_VERSIONS="latest/latest".
const versions = await parseObsidianVersions(
	env.OBSIDIAN_VERSIONS ?? "earliest/earliest latest/latest",
	{ cacheDir },
);
if (env.CI) {
	// Used as the cache key for .obsidian-cache in CI.
	console.log("obsidian-cache-key:", JSON.stringify(versions));
}

// The plugin is desktop-only (isDesktopOnly in manifest.json), so there is
// no emulateMobile or Android configuration.
export const config: WebdriverIO.Config = {
	runner: "local",
	framework: "mocha",
	specs: ["./test-e2e/specs/**/*.e2e.ts"],
	maxInstances: Number(env.WDIO_MAX_INSTANCES || 2),

	capabilities: versions.map(([appVersion, installerVersion]) => ({
		browserName: "obsidian",
		"wdio:obsidianOptions": {
			appVersion,
			installerVersion,
			plugins: ["."],
			vault: "test-e2e/vaults/empty",
		},
	})),

	services: ["obsidian"],
	reporters: ["obsidian"],

	mochaOpts: {
		ui: "bdd",
		// Import downloads real plugins from GitHub.
		timeout: 120 * 1000,
	},
	waitforInterval: 250,
	waitforTimeout: 10 * 1000,
	logLevel: "warn",

	cacheDir,

	injectGlobals: false,
};
