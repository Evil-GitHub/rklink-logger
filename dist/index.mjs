// src/logger.ts
var LogLevel = /* @__PURE__ */ ((LogLevel2) => {
  LogLevel2["DEBUG"] = "DEBUG";
  LogLevel2["INFO"] = "INFO";
  LogLevel2["WARN"] = "WARN";
  LogLevel2["ERROR"] = "ERROR";
  return LogLevel2;
})(LogLevel || {});
var Logger = class {
  maxLogs = 1e3;
  storageKey = "RKLINK_FRONTEND_LOGS";
  enabled = true;
  constructor() {
    if (typeof window === "undefined" || typeof document === "undefined") {
      console.warn("Logger is designed for browser environments and will be disabled.");
      this.enabled = false;
      return;
    }
    this.setupGlobalErrorHandler();
    this.setupUnhandledRejectionHandler();
  }
  setupGlobalErrorHandler() {
    window.addEventListener("error", (event) => {
      this.error("Global Error", {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error?.stack
      });
    });
  }
  setupUnhandledRejectionHandler() {
    window.addEventListener("unhandledrejection", (event) => {
      this.error("Unhandled Promise Rejection", {
        reason: event.reason
      });
    });
  }
  createLogEntry(level, message, data) {
    return {
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      level,
      message,
      data,
      stack: new Error().stack,
      url: typeof window !== "undefined" ? window.location.href : "",
      userAgent: typeof navigator !== "undefined" ? navigator.userAgent : ""
    };
  }
  saveLog(entry) {
    if (!this.enabled) return;
    try {
      const logs = this.getLogs();
      logs.push(entry);
      if (logs.length > this.maxLogs) {
        logs.shift();
      }
      localStorage.setItem(this.storageKey, JSON.stringify(logs));
    } catch (error) {
      console.error("Failed to save log:", error);
    }
  }
  debug(message, data) {
    const entry = this.createLogEntry("DEBUG" /* DEBUG */, message, data);
    this.saveLog(entry);
    console.debug(`[${entry.level}] ${message}`, data);
  }
  info(message, data) {
    const entry = this.createLogEntry("INFO" /* INFO */, message, data);
    this.saveLog(entry);
    console.info(`[${entry.level}] ${message}`, data);
  }
  warn(message, data) {
    const entry = this.createLogEntry("WARN" /* WARN */, message, data);
    this.saveLog(entry);
    console.warn(`[${entry.level}] ${message}`, data);
  }
  error(message, data) {
    const entry = this.createLogEntry("ERROR" /* ERROR */, message, data);
    this.saveLog(entry);
    console.error(`[${entry.level}] ${message}`, data);
  }
  getLogs() {
    if (!this.enabled) return [];
    try {
      const logs = localStorage.getItem(this.storageKey);
      return logs ? JSON.parse(logs) : [];
    } catch (error) {
      console.error("Failed to get logs:", error);
      return [];
    }
  }
  clearLogs() {
    if (!this.enabled) return;
    localStorage.removeItem(this.storageKey);
  }
  exportLogs() {
    if (!this.enabled) return "[]";
    return JSON.stringify(this.getLogs(), null, 2);
  }
  downloadLogs(filename) {
    if (!this.enabled) return;
    const logs = this.exportLogs();
    const blob = new Blob([logs], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename || `logs-${(/* @__PURE__ */ new Date()).toISOString()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
  getLogsSummary() {
    if (!this.enabled) {
      return { total: 0, errors: 0, warnings: 0, info: 0, debug: 0 };
    }
    const logs = this.getLogs();
    return {
      total: logs.length,
      errors: logs.filter((l) => l.level === "ERROR" /* ERROR */).length,
      warnings: logs.filter((l) => l.level === "WARN" /* WARN */).length,
      info: logs.filter((l) => l.level === "INFO" /* INFO */).length,
      debug: logs.filter((l) => l.level === "DEBUG" /* DEBUG */).length
    };
  }
  enable() {
    this.enabled = true;
  }
  disable() {
    this.enabled = false;
  }
};
var logger = new Logger();
export {
  LogLevel,
  logger
};
