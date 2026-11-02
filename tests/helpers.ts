import { App, FileSystemAdapter } from "obsidian";
import { FileManager } from "../src/utils/FileManager";

export const CONFIG_DIR = ".obsidian";

export interface TestVault {
	app: App;
	adapter: FileSystemAdapter;
	fileManager: FileManager;
	read(path: string): string | undefined;
	readJson<T = unknown>(path: string): T;
}

export function createTestVault(
	files: Record<string, string> = {},
	extra: Record<string, unknown> = {},
): TestVault {
	const adapter = new FileSystemAdapter(files);
	const app = {
		vault: { adapter, configDir: CONFIG_DIR },
		workspace: {
			layoutReady: true,
			onLayoutReady: (cb: () => void) => cb(),
		},
		...extra,
	} as unknown as App;

	return {
		app,
		adapter,
		fileManager: new FileManager(app),
		read: (path) => adapter.files.get(path),
		readJson: <T>(path: string) => {
			const raw = adapter.files.get(path);
			if (raw === undefined) {
				throw new Error(`File not found in test vault: ${path}`);
			}
			return JSON.parse(raw) as T;
		},
	};
}

// Files for a plugin installed under .obsidian/plugins/<folder>.
export function installedPlugin(
	folder: string,
	manifest: Record<string, unknown>,
	data?: unknown,
): Record<string, string> {
	const base = `${CONFIG_DIR}/plugins/${folder}`;
	const files: Record<string, string> = {
		[`${base}/manifest.json`]: JSON.stringify(manifest),
		[`${base}/main.js`]: "module.exports = {};",
	};
	if (data !== undefined) {
		files[`${base}/data.json`] = JSON.stringify(data);
	}
	return files;
}
