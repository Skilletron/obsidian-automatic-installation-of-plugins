import * as https from "https";
import * as fs from "fs";
import { Notice } from "obsidian";
import { MAX_REDIRECTS, USER_AGENT, NETWORK_TIMEOUT, DOWNLOAD_TIMEOUT, MAX_FILE_SIZE } from "../types";

/**
 * Utility class for network operations.
 */
export class NetworkManager {
	/**
	 * Fetches JSON data from a URL.
	 * @param url - URL to fetch JSON from
	 * @returns Promise resolving to the parsed JSON data
	 * @throws {Error} If the request fails or returns invalid JSON
	 */
	fetchJson<T>(url: string): Promise<T> {
		return new Promise((resolve, reject) => {
			const timeout = setTimeout(() => {
				reject(new Error(`Request timeout for ${url}`));
			}, NETWORK_TIMEOUT);

			https
				.get(
					url,
					{ headers: { "User-Agent": USER_AGENT } },
					(res) => {
						if (res.statusCode === undefined || res.statusCode !== 200) {
							clearTimeout(timeout);
							reject(
								new Error(
									`HTTP ${res.statusCode || "unknown"}: ${url}. The server may be unavailable or the resource may not exist.`
								)
							);
							return;
						}

						let data = "";
						res.on("data", (chunk) => (data += chunk));
						res.on("end", () => {
							clearTimeout(timeout);
							try {
								const parsed = JSON.parse(data) as T;
								resolve(parsed);
							} catch (err) {
								const errorMessage =
									err instanceof Error ? err.message : "Unknown error";
								reject(
									new Error(
										`Failed to parse JSON response from ${url}: ${errorMessage}`
									)
								);
							}
						});
					}
				)
				.on("error", (err) => {
					clearTimeout(timeout);
					const errorMessage =
						err instanceof Error ? err.message : "Unknown error";
					reject(
						new Error(
							`Network error while fetching ${url}: ${errorMessage}. Check your internet connection.`
						)
					);
				})
				.setTimeout(NETWORK_TIMEOUT, () => {
					clearTimeout(timeout);
					reject(new Error(`Request timeout for ${url}`));
				});
		});
	}

	/**
	 * Downloads a file from a URL with support for redirects and size validation.
	 * @param url - URL to download from
	 * @param dest - Destination file path
	 * @param options - Optional headers
	 * @param maxRedirects - Maximum number of redirects to follow
	 * @param onProgress - Optional progress callback
	 * @returns Promise that resolves when download completes
	 * @throws {Error} If download fails, too many redirects occur, or file is too large
	 */
	downloadFileWithRedirect(
		url: string,
		dest: string,
		options: { headers?: Record<string, string> } = {},
		maxRedirects = MAX_REDIRECTS,
		onProgress?: (bytesDownloaded: number) => void
	): Promise<void> {
		return new Promise((resolve, reject) => {
			if (maxRedirects < 0) {
				reject(
					new Error(
						`Too many redirects (max ${MAX_REDIRECTS}). The URL may be misconfigured.`
					)
				);
				return;
			}

			const file = fs.createWriteStream(dest);
			let bytesDownloaded = 0;

			const timeout = setTimeout(() => {
				file.close();
				fs.unlink(dest, () => {
					reject(new Error(`Download timeout for ${url}`));
				});
			}, DOWNLOAD_TIMEOUT);

			https
				.get(url, { headers: options.headers || {} }, (res) => {
					// Check Content-Length header for size validation
					const contentLength = res.headers["content-length"];
					if (contentLength) {
						const size = parseInt(contentLength, 10);
						if (size > MAX_FILE_SIZE) {
							clearTimeout(timeout);
							file.close();
							fs.unlink(dest, () => {
								reject(
									new Error(
										`File too large: ${(size / 1024 / 1024).toFixed(2)} MB (max ${MAX_FILE_SIZE / 1024 / 1024} MB)`
									)
								);
							});
							return;
						}
					}

					if (
						res.statusCode &&
						[301, 302, 303, 307, 308].includes(res.statusCode)
					) {
						const location = res.headers.location;
						if (!location) {
							clearTimeout(timeout);
							reject(
								new Error(
									`Redirect status code ${res.statusCode} but no Location header found for ${url}`
								)
							);
							return;
						}
						file.close();
						fs.unlink(dest, () => {
							this.downloadFileWithRedirect(
								location,
								dest,
								options,
								maxRedirects - 1,
								onProgress
							)
								.then(resolve)
								.catch(reject);
						});
						return;
					}

					if (res.statusCode !== 200) {
						clearTimeout(timeout);
						reject(
							new Error(
								`Failed to download file from ${url}: HTTP ${res.statusCode} ${res.statusMessage || "Unknown error"}`
							)
						);
						return;
					}

					res.on("data", (chunk) => {
						bytesDownloaded += chunk.length;
						if (bytesDownloaded > MAX_FILE_SIZE) {
							clearTimeout(timeout);
							file.close();
							fs.unlink(dest, () => {
								reject(
									new Error(
										`File too large: ${(bytesDownloaded / 1024 / 1024).toFixed(2)} MB (max ${MAX_FILE_SIZE / 1024 / 1024} MB)`
									)
								);
							});
							return;
						}
						if (onProgress) {
							onProgress(bytesDownloaded);
						}
					});

					res.pipe(file);
					file.on("finish", () => {
						clearTimeout(timeout);
						file.close();
						resolve();
					});
					file.on("error", (err) => {
						clearTimeout(timeout);
						fs.unlink(dest, () => {
							const errorMessage =
								err instanceof Error ? err.message : "Unknown error";
							reject(
								new Error(
									`File write error while downloading to ${dest}: ${errorMessage}`
								)
							);
						});
					});
				})
				.on("error", (err) => {
					clearTimeout(timeout);
					fs.unlink(dest, () => {
						const errorMessage =
							err instanceof Error ? err.message : "Unknown error";
						reject(
							new Error(
								`Network error while downloading from ${url}: ${errorMessage}`
							)
						);
					});
				})
				.setTimeout(DOWNLOAD_TIMEOUT, () => {
					clearTimeout(timeout);
					file.close();
					fs.unlink(dest, () => {
						reject(new Error(`Download timeout for ${url}`));
					});
				});
		});
	}
}

