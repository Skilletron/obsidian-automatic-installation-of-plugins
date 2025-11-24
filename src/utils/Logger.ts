/**
 * Simple logger utility with log levels.
 */
export enum LogLevel {
	DEBUG = 0,
	INFO = 1,
	WARN = 2,
	ERROR = 3,
	NONE = 4,
}

class Logger {
	private level: LogLevel = LogLevel.INFO;

	setLevel(level: LogLevel) {
		this.level = level;
	}

	getLevel(): LogLevel {
		return this.level;
	}

	debug(...args: unknown[]): void {
		if (this.level <= LogLevel.DEBUG) {
			console.debug("[Installer] [DEBUG]", ...args);
		}
	}

	info(...args: unknown[]): void {
		if (this.level <= LogLevel.INFO) {
			console.debug("[Installer] [INFO]", ...args);
		}
	}

	warn(...args: unknown[]): void {
		if (this.level <= LogLevel.WARN) {
			console.warn("[Installer] [WARN]", ...args);
		}
	}

	error(...args: unknown[]): void {
		if (this.level <= LogLevel.ERROR) {
			console.error("[Installer] [ERROR]", ...args);
		}
	}
}

export const logger = new Logger();

