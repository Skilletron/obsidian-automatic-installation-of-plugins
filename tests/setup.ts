import { beforeEach } from "vitest";
import { Notice, setRequestUrlHandler } from "obsidian";
import { logger, LogLevel } from "../src/utils/Logger";

// Plugin code uses window.setTimeout and document.querySelector.
const globals = globalThis as Record<string, unknown>;
globals.window ??= globalThis;
globals.document ??= { querySelector: () => null };

beforeEach(() => {
	Notice.messages = [];
	logger.setLevel(LogLevel.NONE);
	setRequestUrlHandler(async (req) => {
		throw new Error(`Unexpected network request: ${req.url}`);
	});
});
