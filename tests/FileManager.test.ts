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
