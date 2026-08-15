import { requestUrl } from "obsidian";
import { USER_AGENT } from "../types";

/**
 * Network helpers via Obsidian's requestUrl (follows redirects; no Node https/fs).
 */
export class NetworkManager {
	/**
	 * Fetches and parses JSON from a URL.
	 */
	async fetchJson<T>(url: string): Promise<T> {
		const response = await requestUrl({
			url,
			headers: {
				"User-Agent": USER_AGENT,
				Accept: "application/json, */*",
			},
		});

		if (response.status < 200 || response.status >= 300) {
			throw new Error(
				`HTTP ${response.status}: ${url}. The server may be unavailable or the resource may not exist.`
			);
		}

		try {
			return response.json as T;
		} catch (err: unknown) {
			const errorMessage =
				err instanceof Error ? err.message : "Unknown error";
			throw new Error(
				`Failed to parse JSON response from ${url}: ${errorMessage}`
			);
		}
	}
}
