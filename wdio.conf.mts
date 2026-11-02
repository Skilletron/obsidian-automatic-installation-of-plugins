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

export const config: WebdriverIO.Config = {
	runner: "local",
	framework: "mocha",
	specs: ["./test-e2e/specs/**/*.e2e.ts"],
	maxInstances: Number(env.WDIO_MAX_INSTANCES || 2),

	capabilities: [
		...versions.map<WebdriverIO.Capabilities>(
			([appVersion, installerVersion]) => ({
				browserName: "obsidian",
				"wdio:obsidianOptions": {
					appVersion,
					installerVersion,
					plugins: ["."],
					vault: "test-e2e/vaults/empty",
				},
			}),
		),
		// Mobile UI emulated on desktop: a quick check for code that only
		// works with the desktop layout. It is not the real mobile app (no
		// Capacitor file system); wdio.mobile.conf.mts runs Android.
		{
			browserName: "obsidian",
			"wdio:obsidianOptions": {
				appVersion: "latest",
				installerVersion: "latest",
				emulateMobile: true,
				plugins: ["."],
				vault: "test-e2e/vaults/empty",
			},
			"goog:chromeOptions": {
				mobileEmulation: {
					deviceMetrics: { width: 390, height: 844 },
				},
			},
		},
	],

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
