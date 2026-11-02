import * as path from "path";
import { env, platform } from "process";
import { syncBuiltinESMExports } from "module";
import url from "url";
import { parseObsidianVersions } from "wdio-obsidian-service";

// Real Obsidian for Android in an Android Virtual Device (default name
// "obsidian_test"). Needs the Android SDK (ANDROID_HOME) and Java 17.
// Run with `npm run test:android`.

if (platform === "win32") {
	// wdio-obsidian-service builds file:// URLs for paths on the device with
	// pathToFileURL, which on Windows prepends the host drive letter
	// (file:///E:/storage/...), so uploading the test vault fails. Device
	// paths are POSIX paths: build those URLs directly.
	const pathToFileURL = url.pathToFileURL;
	url.pathToFileURL = ((filePath: string, options?: object) =>
		filePath.startsWith("/")
			? new URL(`file://${filePath}`)
			: pathToFileURL(filePath, options)) as typeof url.pathToFileURL;
	syncBuiltinESMExports();
}

const cacheDir = path.resolve(".obsidian-cache");
const versions = await parseObsidianVersions(
	env.OBSIDIAN_VERSIONS ?? "latest/latest",
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
	// Android tests cannot run in parallel.
	maxInstances: 1,

	capabilities: versions.map(([appVersion]) => ({
		browserName: "obsidian",
		platformName: "Android",
		"appium:automationName": "UiAutomator2",
		"appium:avd": env.ANDROID_AVD ?? "obsidian_test",
		"appium:enforceXPath1": true,
		// A cold emulator boot can take several minutes.
		"appium:avdLaunchTimeout": 5 * 60 * 1000,
		"appium:avdReadyTimeout": 5 * 60 * 1000,
		// The service resets Obsidian when needed.
		"appium:noReset": true,
		"wdio:obsidianOptions": {
			appVersion,
			plugins: ["."],
			vault: "test-e2e/vaults/empty",
		},
	})),

	services: [
		"obsidian",
		[
			"appium",
			{
				args: {
					allowInsecure: "*:chromedriver_autodownload,*:adb_shell",
				},
			},
		],
	],
	reporters: ["obsidian"],

	mochaOpts: {
		ui: "bdd",
		timeout: 180 * 1000,
	},
	waitforInterval: 250,
	waitforTimeout: 10 * 1000,
	logLevel: "warn",

	cacheDir,

	injectGlobals: false,
};
