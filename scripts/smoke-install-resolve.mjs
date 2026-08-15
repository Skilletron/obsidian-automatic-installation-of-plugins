import https from "node:https";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

globalThis.window = {
	setTimeout,
	clearTimeout,
};

const USER_AGENT = "obsidian-plugin-installer-smoke";
const MAX_REDIRECTS = 5;
const TIMEOUT = 30000;
const REGISTRY =
	"https://raw.githubusercontent.com/obsidianmd/obsidian-releases/master/community-plugins.json";

function fetchJson(url, maxRedirects = MAX_REDIRECTS) {
	return new Promise((resolve, reject) => {
		if (maxRedirects < 0) {
			reject(new Error(`Too many redirects for ${url}`));
			return;
		}
		const t = setTimeout(() => reject(new Error(`Timeout ${url}`)), TIMEOUT);
		https
			.get(url, { headers: { "User-Agent": USER_AGENT, Accept: "*/*" } }, (res) => {
				const status = res.statusCode ?? 0;
				if ([301, 302, 303, 307, 308].includes(status)) {
					clearTimeout(t);
					res.resume();
					const loc = res.headers.location;
					if (!loc) {
						reject(new Error(`Redirect ${status} no Location: ${url}`));
						return;
					}
					fetchJson(new URL(loc, url).toString(), maxRedirects - 1)
						.then(resolve)
						.catch(reject);
					return;
				}
				if (status !== 200) {
					clearTimeout(t);
					res.resume();
					reject(new Error(`HTTP ${status}: ${url}`));
					return;
				}
				let data = "";
				res.on("data", (c) => (data += c));
				res.on("end", () => {
					clearTimeout(t);
					try {
						resolve(JSON.parse(data));
					} catch (e) {
						reject(e);
					}
				});
			})
			.on("error", (e) => {
				clearTimeout(t);
				reject(e);
			});
	});
}

function isUnstable(r) {
	return !!r.prerelease || /beta|alpha|rc|preview/i.test(r.tag_name || "");
}

async function resolvePlugin(id, registry) {
	const meta = registry.find((p) => p.id === id);
	if (!meta) throw new Error("not in registry");
	const [owner, repo] = meta.repo.split("/");
	const releases = await fetchJson(
		`https://api.github.com/repos/${owner}/${repo}/releases?per_page=20`
	);
	const candidates = releases.filter(
		(r) => !r.draft && (r.assets || []).some((a) => a.name === "manifest.json")
	);
	const release = candidates.find((r) => !isUnstable(r)) || candidates[0];
	if (!release) throw new Error("no release with manifest.json");
	const asset = release.assets.find((a) => a.name === "manifest.json");
	const manifest = await fetchJson(asset.browser_download_url);
	return {
		repo: meta.repo,
		tag: release.tag_name,
		manifestId: manifest.id,
		manifestName: manifest.name,
		version: manifest.version,
	};
}

const listPath = join(
	root,
	"e2e/target-vault/.obsidian/community-plugins-list.json"
);
const rawList = JSON.parse(readFileSync(listPath, "utf8"));
const entries = rawList.map((item) =>
	typeof item === "string" ? { id: item } : { id: item.id, version: item.version }
);

console.log(`Resolving ${entries.length} plugins...\n`);
const registry = await fetchJson(REGISTRY);

let ok = 0;
let fail = 0;
for (const entry of entries) {
	const id = entry.id;
	try {
		const r = await resolvePlugin(id, registry);
		const pin =
			entry.version && entry.version !== r.version
				? ` (list pin ${entry.version}, latest stable ${r.version})`
				: entry.version
					? ` (pin ${entry.version})`
					: "";
		console.log(
			`[OK] ${id} -> ${r.repo}@${r.tag} (manifest id=${r.manifestId}, v=${r.version})${pin}`
		);
		ok++;
	} catch (e) {
		console.log(`[FAIL] ${id}: ${e.message}`);
		fail++;
	}
}

console.log(`\nPassed: ${ok}  Failed: ${fail}`);
process.exit(fail > 0 ? 1 : 0);
