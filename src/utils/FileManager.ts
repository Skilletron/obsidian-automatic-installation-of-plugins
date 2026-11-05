import { App, Notice, normalizePath } from "obsidian";
import { logger } from "./Logger";
import { isSafePathSegment } from "./parsePluginList";
import { t } from "../i18n";

export class FileManager {
	constructor(private app: App) {}

	joinPath(...parts: string[]): string {
		const joined = parts.filter((part) => part.length > 0).join("/");
		return normalizePath(joined);
	}

	configPath(...parts: string[]): string {
		for (const part of parts) {
			if (!isSafePathSegment(part)) {
				throw new Error(`Invalid config path segment: ${part}`);
			}
		}
		return this.joinPath(this.app.vault.configDir, ...parts);
	}

	pluginsPath(...parts: string[]): string {
		for (const part of parts) {
			if (!isSafePathSegment(part)) {
				throw new Error(`Invalid plugin path segment: ${part}`);
			}
		}
		return this.configPath("plugins", ...parts);
	}

	async exists(vaultPath: string): Promise<boolean> {
		try {
			return await this.app.vault.adapter.exists(normalizePath(vaultPath));
		} catch (err: unknown) {
			logger.error(`exists() failed for ${vaultPath}:`, err);
			return false;
		}
	}

	async ensureParentDir(vaultFilePath: string): Promise<boolean> {
		const normalized = normalizePath(vaultFilePath);
		const lastSlash = normalized.lastIndexOf("/");
		if (lastSlash <= 0) {
			return true;
		}
		return this.ensureDirectory(normalized.slice(0, lastSlash));
	}

	async ensureDirectory(vaultPath: string): Promise<boolean> {
		try {
			const normalized = normalizePath(vaultPath);
			if (await this.exists(normalized)) {
				return true;
			}
			const parts = normalized.split("/").filter(Boolean);
			let current = "";
			for (const part of parts) {
				if (!isSafePathSegment(part)) {
					throw new Error(`Invalid directory segment: ${part}`);
				}
				current = current ? `${current}/${part}` : part;
				const currentPath = normalizePath(current);
				if (!(await this.exists(currentPath))) {
					await this.app.vault.adapter.mkdir(currentPath);
				}
			}
			return true;
		} catch (err: unknown) {
			logger.error(`Failed to create directory ${vaultPath}:`, err);
			return false;
		}
	}

	async readFile(vaultPath: string): Promise<string | null> {
		try {
			return await this.app.vault.adapter.read(normalizePath(vaultPath));
		} catch (err: unknown) {
			const errorMessage =
				err instanceof Error ? err.message : "Unknown error";
			new Notice(t("file.readFailed", { error: errorMessage }));
			logger.error(`[Installer] File read error for ${vaultPath}:`, err);
			return null;
		}
	}

	async writeFile(vaultPath: string, content: string): Promise<boolean> {
		try {
			const normalized = normalizePath(vaultPath);
			if (!(await this.ensureParentDir(normalized))) {
				return false;
			}
			await this.app.vault.adapter.write(normalized, content);
			await this.confirmWritten(normalized, content);
			return true;
		} catch (err: unknown) {
			const errorMessage =
				err instanceof Error ? err.message : "Unknown error";
			new Notice(t("file.writeFailed", { error: errorMessage }));
			logger.error(`[Installer] File write error for ${vaultPath}:`, err);
			return false;
		}
	}

	async removeRecursive(vaultPath: string): Promise<void> {
		try {
			const normalized = normalizePath(vaultPath);
			if (await this.exists(normalized)) {
				await this.app.vault.adapter.rmdir(normalized, true);
			}
		} catch (err: unknown) {
			logger.debug(`removeRecursive failed for ${vaultPath}:`, err);
		}
	}

	// On slow Android devices a read right after a write can still return
	// the old content. Callers often hand the file to something that reads
	// it straight away (a plugin loading its settings), so wait briefly
	// until the new content reads back.
	//
	// Obsidian 1.5.8 on Android can also leave a new file with 0 bytes while
	// reporting success, and it stays that way; writing it again fixes it.
	// Only an empty file is written again: different content may come from
	// someone else saving the same file, and that must not be overwritten.
	private async confirmWritten(path: string, content: string): Promise<void> {
		let empty = false;
		for (let attempt = 0; attempt < 20; attempt++) {
			try {
				const current = await this.app.vault.adapter.read(path);
				if (current === content) {
					return;
				}
				empty = current === "";
				if (empty) {
					await this.app.vault.adapter.write(path, content);
				}
			} catch {
				// Not readable yet.
			}
			await new Promise((resolve) => window.setTimeout(resolve, 100));
		}
		if (empty) {
			throw new Error(`${path} stayed empty after writing it`);
		}
		logger.warn(`${path} did not read back as written.`);
	}

	// True only for a file that exists and has 0 bytes.
	async isEmptyFile(vaultPath: string): Promise<boolean> {
		try {
			const stat = await this.app.vault.adapter.stat(normalizePath(vaultPath));
			return stat?.size === 0;
		} catch (err: unknown) {
			logger.debug(`stat failed for ${vaultPath}:`, err);
			return false;
		}
	}

	// Deletes a file; true if it is gone afterwards.
	async removeFile(vaultPath: string): Promise<boolean> {
		try {
			const normalized = normalizePath(vaultPath);
			if (await this.exists(normalized)) {
				await this.app.vault.adapter.remove(normalized);
			}
			return true;
		} catch (err: unknown) {
			logger.error(`removeFile() failed for ${vaultPath}:`, err);
			return false;
		}
	}

	// File names directly inside a folder.
	async listFiles(vaultPath: string): Promise<string[]> {
		try {
			const normalized = normalizePath(vaultPath);
			if (!(await this.exists(normalized))) {
				return [];
			}
			const listed = await this.app.vault.adapter.list(normalized);
			return listed.files.map((filePath) => {
				const parts = normalizePath(filePath).split("/").filter(Boolean);
				return parts[parts.length - 1] ?? filePath;
			});
		} catch (err: unknown) {
			logger.error(`listFiles() failed for ${vaultPath}:`, err);
			return [];
		}
	}

	async listDirs(vaultPath: string): Promise<string[]> {
		try {
			const normalized = normalizePath(vaultPath);
			if (!(await this.exists(normalized))) {
				return [];
			}
			const listed = await this.app.vault.adapter.list(normalized);
			return listed.folders.map((folderPath) => {
				const parts = normalizePath(folderPath)
					.split("/")
					.filter(Boolean);
				return parts[parts.length - 1] ?? folderPath;
			});
		} catch (err: unknown) {
			logger.error(`listDirs() failed for ${vaultPath}:`, err);
			return [];
		}
	}

	parseJsonWithValidation<T>(content: string, fileName: string): T | null {
		if (!content || content.trim() === "") {
			new Notice(t("file.empty", { file: fileName }));
			return null;
		}

		try {
			return JSON.parse(content) as T;
		} catch (err: unknown) {
			const errorMessage =
				err instanceof Error ? err.message : "Unknown error";
			new Notice(
				t("file.invalidJson", { file: fileName, error: errorMessage }),
			);
			logger.error(`JSON parse error in ${fileName}:`, err);
			return null;
		}
	}
}
