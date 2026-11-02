// Minimal runtime stand-in for the "obsidian" package, which ships types only.
// Aliased in vitest.config.mts; covers just what the plugin sources use.

export function normalizePath(path: string): string {
	const normalized = path
		.replace(/\\/g, "/")
		.replace(/\/+/g, "/")
		.replace(/^\/+|\/+$/g, "");
	return normalized === "" ? "/" : normalized;
}

export class Notice {
	static messages: string[] = [];

	constructor(public message: string) {
		Notice.messages.push(message);
	}

	setMessage(message: string): this {
		this.message = message;
		Notice.messages.push(message);
		return this;
	}

	hide(): void {}
}

// In-memory adapter. Paths are vault-relative and already normalized.
export class FileSystemAdapter {
	files = new Map<string, string>();
	folders = new Set<string>();

	constructor(initialFiles: Record<string, string> = {}) {
		for (const [path, content] of Object.entries(initialFiles)) {
			this.addFile(path, content);
		}
	}

	private addParents(path: string): void {
		const parts = path.split("/");
		for (let i = 1; i < parts.length; i++) {
			this.folders.add(parts.slice(0, i).join("/"));
		}
	}

	private addFile(path: string, content: string): void {
		this.files.set(path, content);
		this.addParents(path);
	}

	async exists(path: string): Promise<boolean> {
		return this.files.has(path) || this.folders.has(path);
	}

	async read(path: string): Promise<string> {
		const content = this.files.get(path);
		if (content === undefined) {
			throw new Error(`ENOENT: ${path}`);
		}
		return content;
	}

	async write(path: string, content: string): Promise<void> {
		const parent = path.slice(0, path.lastIndexOf("/"));
		if (parent && !this.folders.has(parent)) {
			throw new Error(`ENOENT: parent folder missing for ${path}`);
		}
		this.files.set(path, content);
	}

	async mkdir(path: string): Promise<void> {
		this.folders.add(path);
		this.addParents(path);
	}

	async rmdir(path: string, recursive: boolean): Promise<void> {
		const prefix = `${path}/`;
		const hasChildren =
			[...this.files.keys()].some((p) => p.startsWith(prefix)) ||
			[...this.folders].some((p) => p.startsWith(prefix));
		if (hasChildren && !recursive) {
			throw new Error(`ENOTEMPTY: ${path}`);
		}
		for (const p of [...this.files.keys()]) {
			if (p.startsWith(prefix)) this.files.delete(p);
		}
		for (const p of [...this.folders]) {
			if (p.startsWith(prefix)) this.folders.delete(p);
		}
		this.folders.delete(path);
	}

	async list(path: string): Promise<{ files: string[]; folders: string[] }> {
		const prefix = `${path}/`;
		const isDirectChild = (p: string) =>
			p.startsWith(prefix) && !p.slice(prefix.length).includes("/");
		return {
			files: [...this.files.keys()].filter(isDirectChild),
			folders: [...this.folders].filter(isDirectChild),
		};
	}
}

export interface RequestUrlParam {
	url: string;
	headers?: Record<string, string>;
	throw?: boolean;
}

export interface RequestUrlResponse {
	status: number;
	json: unknown;
}

// Tests replace this handler via setRequestUrlHandler().
let requestUrlHandler: (req: RequestUrlParam) => Promise<RequestUrlResponse> =
	async (req) => {
		throw new Error(`Unexpected network request: ${req.url}`);
	};

export function setRequestUrlHandler(
	handler: (req: RequestUrlParam) => Promise<RequestUrlResponse>,
): void {
	requestUrlHandler = handler;
}

// Like Obsidian's requestUrl, rejects on 400+ unless `throw: false` is passed.
export async function requestUrl(
	req: RequestUrlParam,
): Promise<RequestUrlResponse> {
	const response = await requestUrlHandler(req);
	if (req.throw !== false && response.status >= 400) {
		throw Object.assign(
			new Error(`Request failed, status ${response.status}`),
			{ status: response.status },
		);
	}
	return response;
}

export class App {}

export class Modal {
	contentEl = {} as HTMLElement;
	constructor(public app: App) {}
	open(): void {}
	close(): void {}
}

export class Setting {
	constructor(public containerEl: HTMLElement) {}
}

export class Plugin {}

export class PluginSettingTab {}

export type PluginManifest = {
	id: string;
	name: string;
	version: string;
	minAppVersion: string;
	author?: string;
	description?: string;
};
