import { describe, expect, it } from "vitest";
import { BACKUP_DIR, SettingsBackup } from "../src/core/SettingsBackup";
import { createTestVault } from "./helpers";

const DIR = `.obsidian/${BACKUP_DIR}`;
const DATA = ".obsidian/plugins/dataview/data.json";
const LIST = ".obsidian/community-plugins-list.json";

function snapshotFiles(vault: ReturnType<typeof createTestVault>): string[] {
	return [...vault.adapter.files.keys()].filter((p) => p.startsWith(`${DIR}/`));
}

describe("SettingsBackup", () => {
	it("saves one snapshot per session with the content before the change", async () => {
		const vault = createTestVault({ [DATA]: '{"a":1}' });
		const backup = new SettingsBackup(vault.fileManager);

		backup.begin("Apply settings");
		await backup.capture(DATA, "dataview");
		await backup.capture(DATA, "dataview");
		await backup.capture(LIST);
		await backup.end();

		expect(snapshotFiles(vault)).toHaveLength(1);
		const latest = await backup.latest();
		expect(latest?.snapshot.reason).toBe("Apply settings");
		expect(latest?.snapshot.entries).toEqual([
			{ path: DATA, pluginId: "dataview", content: '{"a":1}' },
			{ path: LIST, content: null },
		]);
	});

	it("does not save an empty session", async () => {
		const vault = createTestVault();
		const backup = new SettingsBackup(vault.fileManager);
		backup.begin("Import");
		await backup.end();
		expect(await backup.latest()).toBeNull();
	});

	it("saves a snapshot right away outside a session", async () => {
		const vault = createTestVault({ [DATA]: "{}" });
		const backup = new SettingsBackup(vault.fileManager);
		await backup.capture(DATA, "dataview");
		expect(snapshotFiles(vault)).toHaveLength(1);
	});

	it("restores files and deletes ones that did not exist", async () => {
		const vault = createTestVault({ [DATA]: '{"a":1}' });
		const backup = new SettingsBackup(vault.fileManager);
		backup.begin("Import");
		await backup.capture(DATA, "dataview");
		await backup.capture(LIST);
		await backup.end();

		await vault.adapter.write(DATA, '{"a":2}');
		await vault.adapter.write(LIST, "[]");

		const latest = await backup.latest();
		const restored = await backup.restore(latest!.snapshot);
		expect(restored).toEqual([DATA, LIST]);
		expect(vault.read(DATA)).toBe('{"a":1}');
		expect(vault.read(LIST)).toBeUndefined();

		await backup.remove(latest!.name);
		expect(await backup.latest()).toBeNull();
	});

	it("returns the newest snapshot and keeps only the last ten", async () => {
		const vault = createTestVault();
		const backup = new SettingsBackup(vault.fileManager);
		await vault.adapter.mkdir(DIR);
		for (let i = 0; i < 12; i++) {
			const second = String(i).padStart(2, "0");
			await vault.adapter.write(`${DIR}/2026-01-01T00-00-${second}-000Z.json`, "x");
		}
		await backup.capture(DATA, "dataview");

		expect(snapshotFiles(vault)).toHaveLength(10);
		expect((await backup.latest())?.snapshot.entries[0].path).toBe(DATA);
	});

	it("skips unreadable snapshots", async () => {
		const vault = createTestVault({
			[`${DIR}/2026-01-01T00-00-00-000Z.json`]: JSON.stringify({
				version: 1,
				createdAt: "2026-01-01T00:00:00.000Z",
				reason: "Export",
				entries: [{ path: LIST, content: "[]" }],
			}),
			[`${DIR}/2026-01-02T00-00-00-000Z.json`]: "{broken",
		});
		const backup = new SettingsBackup(vault.fileManager);
		expect((await backup.latest())?.snapshot.reason).toBe("Export");
	});

	it("refuses to restore outside the config folder or into backups", async () => {
		const vault = createTestVault();
		const backup = new SettingsBackup(vault.fileManager);
		const restored = await backup.restore({
			version: 1,
			createdAt: "",
			reason: "x",
			entries: [
				{ path: "notes/secret.md", content: "pwned" },
				{ path: ".obsidian/../notes/x.md", content: "pwned" },
				{ path: `${DIR}/fake.json`, content: "pwned" },
				{ path: LIST, content: "[]" },
			],
		});
		expect(restored).toEqual([LIST]);
		expect(vault.read("notes/secret.md")).toBeUndefined();
	});
});
