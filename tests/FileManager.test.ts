import { describe, expect, it } from "vitest";
import { Notice } from "obsidian";
import { FileManager } from "../src/utils/FileManager";
import { createTestVault } from "./helpers";

describe("FileManager", () => {
	describe("paths", () => {
		it("builds paths inside the config directory", () => {
			const { fileManager } = createTestVault();
			expect(fileManager.configPath("community-plugins.json")).toBe(
				".obsidian/community-plugins.json",
			);
			expect(fileManager.pluginsPath("dataview", "data.json")).toBe(
				".obsidian/plugins/dataview/data.json",
			);
			expect(fileManager.pluginsPath()).toBe(".obsidian/plugins");
		});

		it.each(["..", ".", "a/b", "a\\b", ""])(
			"rejects unsafe segment %j",
			(segment) => {
				const { fileManager } = createTestVault();
				expect(() => fileManager.configPath(segment)).toThrow();
				expect(() => fileManager.pluginsPath(segment)).toThrow();
			},
		);

		it("joinPath drops empty parts and normalizes slashes", () => {
			const { fileManager } = createTestVault();
			expect(fileManager.joinPath("a", "", "b\\c", "d/")).toBe("a/b/c/d");
		});
	});

	describe("writeFile", () => {
		it("creates missing parent folders", async () => {
			const vault = createTestVault();
			const ok = await vault.fileManager.writeFile(
				".obsidian/plugins/new/data.json",
				"{}",
			);
			expect(ok).toBe(true);
			expect(vault.read(".obsidian/plugins/new/data.json")).toBe("{}");
			expect(vault.adapter.folders.has(".obsidian/plugins/new")).toBe(true);
		});

		it("returns false and shows a notice when the write fails", async () => {
			const vault = createTestVault();
			vault.adapter.write = async () => {
				throw new Error("disk full");
			};
			const ok = await vault.fileManager.writeFile(".obsidian/x.json", "{}");
			expect(ok).toBe(false);
			expect(Notice.messages).toEqual([
				expect.stringContaining("disk full"),
			]);
		});
	});

	describe("readFile", () => {
		it("returns null and shows a notice for missing files", async () => {
			const { fileManager } = createTestVault();
			expect(await fileManager.readFile(".obsidian/missing.json")).toBeNull();
			expect(Notice.messages).toHaveLength(1);
		});
	});

	describe("listDirs", () => {
		it("returns direct child folder names only", async () => {
			const { fileManager } = createTestVault({
				".obsidian/plugins/a/manifest.json": "{}",
				".obsidian/plugins/b/nested/file.txt": "",
				".obsidian/plugins/file.json": "{}",
			});
			const dirs = await fileManager.listDirs(".obsidian/plugins");
			expect(dirs.sort()).toEqual(["a", "b"]);
		});

		it("returns an empty list for a missing folder", async () => {
			const { fileManager } = createTestVault();
			expect(await fileManager.listDirs(".obsidian/plugins")).toEqual([]);
		});
	});

	describe("removeRecursive", () => {
		it("removes a folder with its contents", async () => {
			const vault = createTestVault({
				".obsidian/plugins/a/manifest.json": "{}",
				".obsidian/plugins/a/sub/x.txt": "",
				".obsidian/plugins/b/manifest.json": "{}",
			});
			await vault.fileManager.removeRecursive(".obsidian/plugins/a");
			expect(await vault.fileManager.exists(".obsidian/plugins/a")).toBe(
				false,
			);
			expect(vault.read(".obsidian/plugins/b/manifest.json")).toBe("{}");
		});
	});

	describe("parseJsonWithValidation", () => {
		it("parses valid JSON", () => {
			const { fileManager } = createTestVault();
			expect(
				fileManager.parseJsonWithValidation('{"a":1}', "file.json"),
			).toEqual({ a: 1 });
		});

		it("returns null with a notice for empty content", () => {
			const { fileManager } = createTestVault();
			expect(fileManager.parseJsonWithValidation("  ", "file.json")).toBeNull();
			expect(Notice.messages[0]).toContain("file.json is empty");
		});

		it("returns null with a notice for invalid JSON", () => {
			const { fileManager } = createTestVault();
			expect(fileManager.parseJsonWithValidation("{", "file.json")).toBeNull();
			expect(Notice.messages[0]).toContain("Invalid JSON in file.json");
		});
	});
});

describe("FileManager.writeFile on slow storage", () => {
	it("waits until the new content reads back", async () => {
		const { fileManager, adapter } = createTestVault();
		const read = adapter.read.bind(adapter);
		let staleReads = 2;
		adapter.read = async (path: string) =>
			staleReads-- > 0 ? "" : read(path);

		expect(await fileManager.writeFile(".obsidian/a.json", "{}")).toBe(true);
		expect(staleReads).toBeLessThan(0);
		expect(await fileManager.readFile(".obsidian/a.json")).toBe("{}");
	});

	it("writes a file again when the write left it empty", async () => {
		const { fileManager, adapter } = createTestVault();
		const write = adapter.write.bind(adapter);
		let lostWrites = 1;
		adapter.write = async (path: string, content: string) =>
			write(path, lostWrites-- > 0 ? "" : content);

		expect(await fileManager.writeFile(".obsidian/a.css", "a {}")).toBe(true);
		expect(await fileManager.readFile(".obsidian/a.css")).toBe("a {}");
	});

	it("reports a failure when the file stays empty", async () => {
		const { fileManager, adapter } = createTestVault();
		const write = adapter.write.bind(adapter);
		adapter.write = async (path: string) => write(path, "");

		expect(await fileManager.writeFile(".obsidian/a.css", "a {}")).toBe(false);
		expect(Notice.messages).toEqual([expect.stringContaining("stayed empty")]);
	});

	it("does not overwrite different content saved by someone else", async () => {
		const { fileManager, adapter } = createTestVault();
		const write = adapter.write.bind(adapter);
		let writes = 0;
		adapter.write = async (path: string) => {
			writes++;
			await write(path, "saved by another plugin");
		};

		expect(await fileManager.writeFile(".obsidian/a.json", "{}")).toBe(true);
		expect(writes).toBe(1);
	});

	it("writes an empty file without treating it as lost", async () => {
		const { fileManager, adapter } = createTestVault();
		const write = adapter.write.bind(adapter);
		let writes = 0;
		adapter.write = async (path: string, content: string) => {
			writes++;
			await write(path, content);
		};

		expect(await fileManager.writeFile(".obsidian/a.css", "")).toBe(true);
		expect(writes).toBe(1);
	});
});

describe("FileManager.isEmptyFile", () => {
	it("is true only for an existing file with 0 bytes", async () => {
		const { fileManager } = createTestVault({
			".obsidian/empty.css": "",
			".obsidian/full.css": "a {}",
		});
		expect(await fileManager.isEmptyFile(".obsidian/empty.css")).toBe(true);
		expect(await fileManager.isEmptyFile(".obsidian/full.css")).toBe(false);
		expect(await fileManager.isEmptyFile(".obsidian/missing.css")).toBe(false);
	});
});
