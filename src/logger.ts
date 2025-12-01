export enum LogLevel {
  DEBUG = "DEBUG",
  INFO = "INFO",
  WARN = "WARN",
  ERROR = "ERROR",
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  data?: any;
  stack?: string;
  url?: string;
  userAgent?: string;
}

class Logger {
  private maxLogs = 1000;
  private storageKey = "RKLINK_FRONTEND_LOGS";
  private enabled = true;
  private levelThreshold: LogLevel = LogLevel.DEBUG;
  private logExpireDays = 30;

  constructor() {
    if (typeof window === "undefined" || typeof document === "undefined") {
      console.warn(
        "Logger is designed for browser environments and will be disabled."
      );
      this.enabled = false;
      return;
    }
    this.cleanExpiredLogs();
    this.setupGlobalErrorHandler();
    this.setupUnhandledRejectionHandler();
  }

  public setLevelThreshold(level: LogLevel) {
    this.levelThreshold = level;
  }

  private levelOrder(level: LogLevel): number {
    switch (level) {
      case LogLevel.DEBUG:
        return 0;
      case LogLevel.INFO:
        return 1;
      case LogLevel.WARN:
        return 2;
      case LogLevel.ERROR:
        return 3;
      default:
        return 0;
    }
  }

  private shouldLog(level: LogLevel): boolean {
    return this.levelOrder(level) >= this.levelOrder(this.levelThreshold);
  }

  private safeLocalStorageSet(key: string, value: string) {
    try {
      localStorage.setItem(key, value);
    } catch {
      // localStorage 可能被禁用或容量满了，忽略错误
    }
  }

  private safeLocalStorageGet(key: string): string | null {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  }

  private createLogEntry(
    level: LogLevel,
    message: string,
    data?: any
  ): LogEntry {
    let stack: string | undefined = undefined;
    if (data && data instanceof Error) {
      stack = data.stack;
    } else if (typeof data === "object" && data?.stack) {
      stack = data.stack;
    } else {
      stack = new Error().stack;
    }
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      data,
      stack,
      url: typeof window !== "undefined" ? window.location.href : "",
      userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "",
    };
  }

  private getLogs(): LogEntry[] {
    if (!this.enabled) return [];
    const raw = this.safeLocalStorageGet(this.storageKey);
    if (!raw) return [];
    try {
      return JSON.parse(raw) as LogEntry[];
    } catch {
      // 出错则清空，防止死循环
      this.clearLogs();
      return [];
    }
  }

  private saveLog(entry: LogEntry) {
    if (!this.enabled) return;
    if (!this.shouldLog(entry.level)) return;

    const logs = this.getLogs();
    logs.push(entry);

    if (logs.length > this.maxLogs) {
      logs.shift();
    }

    this.safeLocalStorageSet(this.storageKey, JSON.stringify(logs));
  }

  private cleanExpiredLogs() {
    const expireTime = Date.now() - this.logExpireDays * 24 * 60 * 60 * 1000;
    const logs = this.getLogs();
    const filtered = logs.filter((log) => {
      return new Date(log.timestamp).getTime() >= expireTime;
    });
    if (filtered.length !== logs.length) {
      this.safeLocalStorageSet(this.storageKey, JSON.stringify(filtered));
    }
  }

  private colorMap = {
    [LogLevel.DEBUG]: "color: gray",
    [LogLevel.INFO]: "color: blue",
    [LogLevel.WARN]: "color: orange",
    [LogLevel.ERROR]: "color: red; font-weight: bold",
  };

  private logToConsole(entry: LogEntry) {
    if (!this.shouldLog(entry.level)) return;

    const color = this.colorMap[entry.level] || "";
    const baseMsg = `%c[${entry.level}] %c${entry.message}`;
    const styleLevel = color;
    const styleMsg = "color: black; font-weight: normal";
    switch (entry.level) {
      case LogLevel.DEBUG:
        console.debug(baseMsg, styleLevel, styleMsg, entry.data);
        break;
      case LogLevel.INFO:
        console.info(baseMsg, styleLevel, styleMsg, entry.data);
        break;
      case LogLevel.WARN:
        console.warn(baseMsg, styleLevel, styleMsg, entry.data);
        break;
      case LogLevel.ERROR:
        console.error(baseMsg, styleLevel, styleMsg, entry.data);
        break;
      default:
        console.log(baseMsg, styleLevel, styleMsg, entry.data);
    }
  }

  public debug(message: string, data?: any) {
    const entry = this.createLogEntry(LogLevel.DEBUG, message, data);
    this.saveLog(entry);
    this.logToConsole(entry);
  }

  public info(message: string, data?: any) {
    const entry = this.createLogEntry(LogLevel.INFO, message, data);
    this.saveLog(entry);
    this.logToConsole(entry);
  }

  public warn(message: string, data?: any) {
    const entry = this.createLogEntry(LogLevel.WARN, message, data);
    this.saveLog(entry);
    this.logToConsole(entry);
  }

  public error(message: string, data?: any) {
    const entry = this.createLogEntry(LogLevel.ERROR, message, data);
    this.saveLog(entry);
    this.logToConsole(entry);
  }

  public clearLogs() {
    if (!this.enabled) return;
    try {
      localStorage.removeItem(this.storageKey);
    } catch {
      // ignore
    }
  }

  public exportLogs(): string {
    if (!this.enabled) return "[]";
    return JSON.stringify(this.getLogs(), null, 2);
  }

  public downloadLogs(filename?: string) {
    if (!this.enabled) return;
    const logs = this.exportLogs();
    const blob = new Blob([logs], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename || `logs-${new Date().toISOString()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  public getLogsSummary() {
    if (!this.enabled) {
      return { total: 0, errors: 0, warnings: 0, info: 0, debug: 0 };
    }
    const logs = this.getLogs();
    return {
      total: logs.length,
      errors: logs.filter((l) => l.level === LogLevel.ERROR).length,
      warnings: logs.filter((l) => l.level === LogLevel.WARN).length,
      info: logs.filter((l) => l.level === LogLevel.INFO).length,
      debug: logs.filter((l) => l.level === LogLevel.DEBUG).length,
    };
  }

  public enable() {
    this.enabled = true;
  }

  public disable() {
    this.enabled = false;
  }

  private setupGlobalErrorHandler() {
    window.addEventListener("error", (event) => {
      this.error("Global Error", {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error?.stack,
      });
    });
  }

  private setupUnhandledRejectionHandler() {
    window.addEventListener("unhandledrejection", (event) => {
      this.error("Unhandled Promise Rejection", {
        reason: event.reason,
      });
    });
  }
}

export const logger = new Logger();
