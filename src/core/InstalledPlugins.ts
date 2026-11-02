import { FileManager } from "../utils/FileManager";
import { isSafePathSegment, normalizeVersion } from "../utils/parsePluginList";
import { logger } from "../utils/Logger";

export interface InstalledPlugin {
	folderName: string;
	pluginId: string;
	version?: string;
	// true when main.js is present next to manifest.json
	complete: boolean;
	// Set only when the manifest says so.
	isDesktopOnly?: true;
}

// Scans .obsidian/plugins/* for folders with a manifest.json. The plugin id
// comes from the manifest, falling back to the folder name.
export async function scanInstalledPlugins(
	fileManager: FileManager,
): Promise<InstalledPlugin[]> {
	const folderNames = await fileManager.listDirs(fileManager.pluginsPath());
	const installed: InstalledPlugin[] = [];

	for (const folderName of folderNames) {
		if (!isSafePathSegment(folderName)) {
			continue;
		}

		const manifestPath = fileManager.pluginsPath(folderName, "manifest.json");
		if (!(await fileManager.exists(manifestPath))) {
			continue;
		}

		let pluginId = folderName;
		let version: string | undefined;
		let isDesktopOnly: true | undefined;
		const raw = await fileManager.readFile(manifestPath);
		if (raw) {
			try {
				const manifest = JSON.parse(raw) as {
					id?: unknown;
					version?: unknown;
					isDesktopOnly?: unknown;
				};
				if (manifest.isDesktopOnly === true) {
					isDesktopOnly = true;
				}
				if (typeof manifest.id === "string" && manifest.id.trim()) {
					pluginId = manifest.id.trim();
				}
				if (
					typeof manifest.version === "string" &&
					manifest.version.trim()
				) {
					version = normalizeVersion(manifest.version);
				}
			} catch (err: unknown) {
				logger.warn(
					`Invalid manifest.json for folder "${folderName}", using folder name:`,
					err,
				);
			}
		}

		const complete = await fileManager.exists(
			fileManager.pluginsPath(folderName, "main.js"),
		);
		installed.push({ folderName, pluginId, version, complete });
		if (isDesktopOnly) {
			installed[installed.length - 1].isDesktopOnly = true;
		}
	}

	return installed;
}

// Finds the folder for a plugin id. A folder named after the id wins; otherwise
// a folder whose manifest declares that id.
export function findPluginFolder(
	installed: InstalledPlugin[],
	pluginId: string,
): InstalledPlugin | undefined {
	return (
		installed.find((p) => p.folderName === pluginId) ??
		installed.find((p) => p.pluginId === pluginId)
	);
}
