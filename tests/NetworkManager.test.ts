import { describe, expect, it } from "vitest";
import { setRequestUrlHandler } from "obsidian";
import { NetworkError, NetworkManager } from "../src/utils/NetworkManager";
import { USER_AGENT } from "../src/types";

const URL = "https://example.com/manifest.json";

describe("NetworkManager", () => {
	it("returns parsed JSON and sends the user agent", async () => {
		let headers: Record<string, string> | undefined;
		setRequestUrlHandler(async (req) => {
			headers = req.headers;
			return { status: 200, json: { id: "x" } };
		});

		expect(await new NetworkManager().fetchJson(URL)).toEqual({ id: "x" });
		expect(headers?.["User-Agent"]).toBe(USER_AGENT);
	});

	it("wraps JSON parse failures", async () => {
		setRequestUrlHandler(async () => ({
			status: 200,
			get json(): unknown {
				throw new SyntaxError("Unexpected token");
			},
		}));

		await expect(new NetworkManager().fetchJson(URL)).rejects.toThrow(
			/Failed to parse JSON response/,
		);
	});

	it("tryFetchJson returns null on 404", async () => {
		setRequestUrlHandler(async () => ({ status: 404, json: null }));
		expect(await new NetworkManager().tryFetchJson(URL)).toBeNull();
	});

	it("fetchJson throws a NetworkError with a rate-limit hint on 403", async () => {
		setRequestUrlHandler(async () => ({ status: 403, json: null }));
		const err = await new NetworkManager().fetchJson(URL).catch((e) => e);
		expect(err).toBeInstanceOf(NetworkError);
		expect(err.status).toBe(403);
		expect(err.message).toContain("rate-limiting");
	});

	it("asks requestUrl not to throw on HTTP errors", async () => {
		let throwOption: boolean | undefined;
		setRequestUrlHandler(async (req) => {
			throwOption = req.throw;
			return { status: 200, json: {} };
		});
		await new NetworkManager().fetchJson(URL);
		expect(throwOption).toBe(false);
	});

	it("tryFetchJson rethrows non-404 errors", async () => {
		setRequestUrlHandler(async () => {
			throw new Error("offline");
		});
		await expect(new NetworkManager().tryFetchJson(URL)).rejects.toThrow(
			"offline",
		);
	});

	describe("describeError", () => {
		it("explains rate limits", () => {
			for (const status of [403, 429]) {
				expect(
					NetworkManager.describeError(new NetworkError("x", status, URL)),
				).toContain("rate limit");
			}
		});

		it("shows the HTTP status for other network errors", () => {
			expect(
				NetworkManager.describeError(new NetworkError("x", 500, URL)),
			).toBe("HTTP 500");
		});

		it("uses the message of plain errors", () => {
			expect(NetworkManager.describeError(new Error("boom"))).toBe("boom");
			expect(NetworkManager.describeError("weird")).toBe("Unknown error");
		});
	});
});
