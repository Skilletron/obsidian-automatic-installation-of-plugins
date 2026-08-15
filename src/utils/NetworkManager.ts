import { requestUrl } from "obsidian";
import { USER_AGENT } from "../types";
import { logger } from "./Logger";

export class NetworkError extends Error {
	constructor(
		message: string,
		public readonly status: number,
		public readonly url: string,
	) {
		super(message);
		this.name = "NetworkError";
	}
}

export class NetworkManager {
	async fetchJson<T>(url: string): Promise<T> {
		const response = await requestUrl({
			url,
			headers: {
				"User-Agent": USER_AGENT,
				Accept: "application/json, */*",
			},
		});

		if (response.status < 200 || response.status >= 300) {
			const hint = this.statusHint(response.status);
			throw new NetworkError(
				`HTTP ${response.status}: ${url}.${hint}`,
				response.status,
				url,
			);
		}

		try {
			return response.json as T;
		} catch (err: unknown) {
			const errorMessage =
				err instanceof Error ? err.message : "Unknown error";
			throw new Error(
				`Failed to parse JSON response from ${url}: ${errorMessage}`,
			);
		}
	}

	private statusHint(status: number): string {
		if (status === 403 || status === 429) {
			return " GitHub may be rate-limiting unauthenticated requests; wait and try again.";
		}
		if (status === 404) {
			return " The resource was not found.";
		}
		return " The server may be unavailable.";
	}

	static describeError(err: unknown): string {
		if (err instanceof NetworkError) {
			if (err.status === 403 || err.status === 429) {
				logger.warn("GitHub rate limit or forbidden:", err.url);
				return "GitHub rate limit or access denied. Wait a few minutes and try again.";
			}
			return `HTTP ${err.status}`;
		}
		return err instanceof Error ? err.message : "Unknown error";
	}
}
