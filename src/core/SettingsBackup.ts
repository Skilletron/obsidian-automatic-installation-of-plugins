import { FileManager } from "../utils/FileManager";
import { logger } from "../utils/Logger";

// One file this plugin is about to change, with its content before the
// change (null if it did not exist).
export interface BackupEntry {
	path: string;
	// Set for a plugin's data.json, so the plugin can be restarted on undo.
	pluginId?: string;
	content: string | null;
}

export interface Snapshot {
	version: 1;
	createdAt: string;
	reason: string;
	entries: BackupEntry[];
}

export const BACKUP_DIR = "community-install-manager-backups";
const KEEP_SNAPSHOTS = 10;

// Saves the files Import, Apply settings and Export overwrite, so the last
// change can be undone. Each operation is one snapshot; up to
// KEEP_SNAPSHOTS are kept in the config folder.
export class SettingsBackup {
	private session: { reason: string; entries: BackupEntry[] } | null = null;

	constructor(private fileManager: FileManager) {}

	begin(reason: string): void {
		this.session = { reason, entries: [] };
	}

	async end(): Promise<void> {
		const session = this.session;
		this.session = null;
		if (session && session.entries.length > 0) {
			await this.save(session.reason, session.entries);
		}
	}

	// Call before writing `path`. Outside begin()/end() the file gets a
	// snapshot of its own.
	async capture(path: string, pluginId?: string): Promise<void> {
		if (this.session?.entries.some((entry) => entry.path === path)) {
			return;
		}
		const content = (await this.fileManager.exists(path))
			? await this.fileManager.readFile(path)
			: null;
		const entry: BackupEntry = { path, content };
		if (pluginId) {
			entry.pluginId = pluginId;
		}
		if (this.session) {
			this.session.entries.push(entry);
		} else {
			await this.save("Settings change", [entry]);
		}
	}

	async latest(): Promise<{ name: string; snapshot: Snapshot } | null> {
		const names = await this.listNames();
		for (const name of names.reverse()) {
			const raw = await this.fileManager.readFile(this.pathFor(name));
			const snapshot = raw ? parseSnapshot(raw) : null;
			if (snapshot) {
				return { name, snapshot };
			}
			logger.warn(`Ignoring unreadable backup ${name}.`);
		}
		return null;
	}

	// Puts every file back as it was. Returns the paths it restored.
	async restore(snapshot: Snapshot): Promise<string[]> {
		const restored: string[] = [];
		for (const entry of snapshot.entries) {
			if (!this.isSafeTarget(entry.path)) {
				logger.warn(`Skipping unsafe backup path: ${entry.path}`);
				continue;
			}
			const ok =
				entry.content === null
					? await this.fileManager.removeFile(entry.path)
					: await this.fileManager.writeFile(entry.path, entry.content);
			if (ok) {
				restored.push(entry.path);
			}
		}
		return restored;
	}

	async remove(name: string): Promise<void> {
		await this.fileManager.removeFile(this.pathFor(name));
	}

	private async save(reason: string, entries: BackupEntry[]): Promise<void> {
		const snapshot: Snapshot = {
			version: 1,
			createdAt: new Date().toISOString(),
			reason,
			entries,
		};
		const names = await this.listNames();
		const name = uniqueName(snapshot.createdAt, names);
		const written = await this.fileManager.writeFile(
			this.pathFor(name),
			JSON.stringify(snapshot, null, 2),
		);
		if (!written) {
			logger.warn("Could not save a settings backup.");
			return;
		}
		const all = [...names, name].sort();
		for (const old of all.slice(0, Math.max(0, all.length - KEEP_SNAPSHOTS))) {
			await this.remove(old);
		}
	}

	// Snapshot file names, oldest first.
	private async listNames(): Promise<string[]> {
		const dir = this.fileManager.configPath(BACKUP_DIR);
		const files = await this.fileManager.listFiles(dir);
		return files.filter((name) => name.endsWith(".json")).sort();
	}

	private pathFor(name: string): string {
		return this.fileManager.configPath(BACKUP_DIR, name);
	}

	// Backups live in a synced folder, so only restore inside the config
	// folder, never into the backups themselves.
	private isSafeTarget(path: string): boolean {
		const configDir = this.fileManager.configPath();
		const parts = path.split("/");
		return (
			path.startsWith(`${configDir}/`) &&
			!parts.includes("..") &&
			!path.startsWith(`${this.fileManager.configPath(BACKUP_DIR)}/`)
		);
	}
}

// ISO timestamps sort by time; ":" and "." are not safe in file names.
function uniqueName(createdAt: string, existing: string[]): string {
	const base = createdAt.replace(/[:.]/g, "-");
	let name = `${base}.json`;
	for (let i = 1; existing.includes(name); i++) {
		name = `${base}-${i}.json`;
	}
	return name;
}

function parseSnapshot(raw: string): Snapshot | null {
	try {
		const parsed = JSON.parse(raw) as Partial<Snapshot>;
		if (
			parsed?.version !== 1 ||
			!Array.isArray(parsed.entries) ||
			!parsed.entries.every(
				(entry) =>
					typeof entry?.path === "string" &&
					(entry.content === null || typeof entry.content === "string"),
			)
		) {
			return null;
		}
		return {
			version: 1,
			createdAt: String(parsed.createdAt ?? ""),
			reason: String(parsed.reason ?? ""),
			entries: parsed.entries,
		};
	} catch {
		return null;
	}
}
