import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const vaultObs = join(root, "e2e/target-vault/.obsidian");
const pluginsDir = join(vaultObs, "plugins");
const expected = JSON.parse(
	readFileSync(join(vaultObs, "community-plugins-settings.json"), "utf8")
);
const list = JSON.parse(
	readFileSync(join(vaultObs, "community-plugins-list.json"), "utf8")
);
const enabled = JSON.parse(
	readFileSync(join(vaultObs, "community-plugins.json"), "utf8")
);

function compare(expectedVal, actualVal, path) {
	const errors = [];
	if (expectedVal === null || typeof expectedVal !== "object") {
		if (`${expectedVal}` !== `${actualVal}`) {
			errors.push(
				`${path}: expected=${JSON.stringify(expectedVal)} actual=${JSON.stringify(actualVal)}`
			);
		}
		return errors;
	}
	if (Array.isArray(expectedVal)) {
		if (!Array.isArray(actualVal) || actualVal.length < expectedVal.length) {
			errors.push(`${path}: array mismatch`);
			return errors;
		}
		expectedVal.forEach((v, i) => {
			errors.push(...compare(v, actualVal[i], `${path}[${i}]`));
		});
		return errors;
	}
	if (!actualVal || typeof actualVal !== "object") {
		errors.push(`${path}: missing object`);
		return errors;
	}
	for (const [k, v] of Object.entries(expectedVal)) {
		errors.push(...compare(v, actualVal[k], path ? `${path}.${k}` : k));
	}
	return errors;
}

let pass = 0;
let fail = 0;

console.log("=== Install / enable ===");
for (const id of list) {
	const folder = join(pluginsDir, id);
	const installed =
		existsSync(join(folder, "main.js")) &&
		existsSync(join(folder, "manifest.json"));
	const isEnabled = enabled.includes(id);
	if (installed) {
		console.log(`[OK] installed: ${id}`);
		pass++;
	} else {
		console.log(`[FAIL] not installed: ${id}`);
		fail++;
	}
	if (isEnabled) {
		console.log(`[OK] enabled: ${id}`);
		pass++;
	} else {
		console.log(`[FAIL] not enabled: ${id}`);
		fail++;
	}
}

console.log("\n=== Settings (expected keys must match data.json) ===");
for (const [id, exp] of Object.entries(expected)) {
	const dataPath = join(pluginsDir, id, "data.json");
	if (!existsSync(dataPath)) {
		console.log(`[FAIL] ${id}: missing data.json`);
		fail++;
		continue;
	}
	const actual = JSON.parse(readFileSync(dataPath, "utf8"));
	const errors = compare(exp, actual, "");
	if (errors.length === 0) {
		console.log(`[OK] settings applied: ${id}`);
		pass++;
	} else {
		console.log(`[FAIL] settings for ${id}:`);
		for (const e of errors) console.log(`       ${e}`);
		fail++;
	}
}

console.log(`\nPassed: ${pass}  Failed: ${fail}`);
process.exit(fail > 0 ? 1 : 0);
