/**
 * A simple logger for frontend applications, supporting local storage and export functions.
 */

export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
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
  private storageKey = 'RKLINK_FRONTEND_LOGS';
  private enabled = true;

  constructor() {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      console.warn('Logger is designed for browser environments and will be disabled.');
      this.enabled = false;
      return;
    }
    this.setupGlobalErrorHandler();
    this.setupUnhandledRejectionHandler();
  }

  private setupGlobalErrorHandler() {
    window.addEventListener('error', (event) => {
      this.error('Global Error', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error?.stack,
      });
    });
  }

  private setupUnhandledRejectionHandler() {
    window.addEventListener('unhandledrejection', (event) => {
      this.error('Unhandled Promise Rejection', {
        reason: event.reason,
      });
    });
  }

  private createLogEntry(level: LogLevel, message: string, data?: any): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      data,
      stack: new Error().stack,
      url: typeof window !== 'undefined' ? window.location.href : '',
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
    };
  }

  private saveLog(entry: LogEntry) {
    if (!this.enabled) return;
    try {
      const logs = this.getLogs();
      logs.push(entry);
      if (logs.length > this.maxLogs) {
        logs.shift();
      }
      localStorage.setItem(this.storageKey, JSON.stringify(logs));
    } catch (error) {
      console.error('Failed to save log:', error);
    }
  }

  public debug(message: string, data?: any) {
    const entry = this.createLogEntry(LogLevel.DEBUG, message, data);
    this.saveLog(entry);
    console.debug(`[${entry.level}] ${message}`, data);
  }

  public info(message: string, data?: any) {
    const entry = this.createLogEntry(LogLevel.INFO, message, data);
    this.saveLog(entry);
    console.info(`[${entry.level}] ${message}`, data);
  }

  public warn(message: string, data?: any) {
    const entry = this.createLogEntry(LogLevel.WARN, message, data);
    this.saveLog(entry);
    console.warn(`[${entry.level}] ${message}`, data);
  }

  public error(message: string, data?: any) {
    const entry = this.createLogEntry(LogLevel.ERROR, message, data);
    this.saveLog(entry);
    console.error(`[${entry.level}] ${message}`, data);
  }

  public getLogs(): LogEntry[] {
    if (!this.enabled) return [];
    try {
      const logs = localStorage.getItem(this.storageKey);
      return logs ? JSON.parse(logs) : [];
    } catch (error) {
      console.error('Failed to get logs:', error);
      return [];
    }
  }

  public clearLogs() {
    if (!this.enabled) return;
    localStorage.removeItem(this.storageKey);
  }

  public exportLogs(): string {
    if (!this.enabled) return '[]';
    return JSON.stringify(this.getLogs(), null, 2);
  }

  public downloadLogs(filename?: string) {
    if (!this.enabled) return;
    const logs = this.exportLogs();
    const blob = new Blob([logs], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
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
}

export const logger = new Logger();
