/**
 * A simple logger for frontend applications, supporting local storage and export functions.
 */
declare enum LogLevel {
    DEBUG = "DEBUG",
    INFO = "INFO",
    WARN = "WARN",
    ERROR = "ERROR"
}
interface LogEntry {
    timestamp: string;
    level: LogLevel;
    message: string;
    data?: any;
    stack?: string;
    url?: string;
    userAgent?: string;
}
declare class Logger {
    private maxLogs;
    private storageKey;
    private enabled;
    constructor();
    private setupGlobalErrorHandler;
    private setupUnhandledRejectionHandler;
    private createLogEntry;
    private saveLog;
    debug(message: string, data?: any): void;
    info(message: string, data?: any): void;
    warn(message: string, data?: any): void;
    error(message: string, data?: any): void;
    getLogs(): LogEntry[];
    clearLogs(): void;
    exportLogs(): string;
    downloadLogs(filename?: string): void;
    getLogsSummary(): {
        total: number;
        errors: number;
        warnings: number;
        info: number;
        debug: number;
    };
    enable(): void;
    disable(): void;
}
declare const logger: Logger;

export { type LogEntry, LogLevel, logger };
