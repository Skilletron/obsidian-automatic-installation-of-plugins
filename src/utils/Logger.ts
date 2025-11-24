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

	debug(...args: any[]): void {
		if (this.level <= LogLevel.DEBUG) {
			console.log("[Installer] [DEBUG]", ...args);
		}
	}

	info(...args: any[]): void {
		if (this.level <= LogLevel.INFO) {
			console.log("[Installer] [INFO]", ...args);
		}
	}

	warn(...args: any[]): void {
		if (this.level <= LogLevel.WARN) {
			console.warn("[Installer] [WARN]", ...args);
		}
	}

	error(...args: any[]): void {
		if (this.level <= LogLevel.ERROR) {
			console.error("[Installer] [ERROR]", ...args);
		}
	}
}

export const logger = new Logger();

