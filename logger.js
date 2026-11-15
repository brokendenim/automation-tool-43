/**
 * @typedef {'TRACE' | 'INFO' | 'WARN' | 'ERROR' | 'FATAL'} LogLevel
 */

/**
 * @typedef {Object} LogEntry
 * @property {number} timestamp - Unix epoch milliseconds when the event occurred.
 * @property {LogLevel} level - Log severity level.
 * @property {string} message - Primary log description message.
 * @property {Record<string, unknown>} [context] - Optional metadata accompanying the log.
 */

/**
 * Format callback for formatting log entries prior to output.
 * @callback LogFormatter
 * @param {LogEntry} entry - The raw log entry object.
 * @returns {string} Formatted log payload standard output string.
 */

const STORAGE_KEY = Symbol('logger.history');

/**
 * Dynamic proxy-based logger supporting dynamically intercepted log levels.
 */
export class AutomationLogger {
  /**
   * @param {LogLevel} [minLevel='INFO'] - Filter threshold for logging activities.
   * @param {LogFormatter} [formatter] - Custom transformation callback.
   */
  constructor(minLevel = 'INFO', formatter) {
    /** @type {Record<LogLevel, number>} */
    this.levels = { TRACE: 10, INFO: 20, WARN: 30, ERROR: 40, FATAL: 50 };
    /** @type {number} */
    this.threshold = this.levels[minLevel] ?? 20;
    /** @type {LogFormatter} */
    this.formatter = formatter || this.defaultFormatter;
    /** @type {LogEntry[]} */
    this[STORAGE_KEY] = [];

    return new Proxy(this, {
      get: (target, prop) => {
        if (typeof prop === 'string' && prop.toUpperCase() in target.levels) {
          const level = /** @type {LogLevel} */ (prop.toUpperCase());
          return (msg, ctx) => target.log(level, msg, ctx);
        }
        return Reflect.get(target, prop);
      }
    });
  }

  /**
   * Transforms log entry into ANSI-colored output string.
   * @param {LogEntry} entry - Structured log data payload.
   * @returns {string} Formatted log message.
   */
  defaultFormatter({ timestamp, level, message, context }) {
    const colors = { TRACE: '\u001b[90m', INFO: '\u001b[32m', WARN: '\u001b[33m', ERROR: '\u001b[31m', FATAL: '\u001b[41m' };
    const reset = '\u001b[0m';
    const timeStr = new Date(timestamp).toISOString();
    const ctxStr = context && Object.keys(context).length ? ` ${JSON.stringify(context)}` : '';
    return `[${timeStr}] ${colors[level] || ''}${level.padEnd(5)}${reset} ${message}${ctxStr}`;
  }

  /**
   * Evaluates severity threshold and persists log payload.
   * @param {LogLevel} level - Severity level to evaluate.
   * @param {string} message - Primary event description.
   * @param {Record<string, unknown>} [context] - Supplementary telemetry.
   * @returns {LogEntry | null} Formatted entry if emitted, null if skipped.
   */
  log(level, message, context) {
    if ((this.levels[level] ?? 0) < this.threshold) return null;
    const entry = { timestamp: Date.now(), level, message, context };
    this[STORAGE_KEY].push(entry);
    console.log(this.formatter(entry));
    return entry;
  }

  /**
   * Returns read-only history of intercepted logs.
   * @returns {readonly LogEntry[]} Snapshot of recorded telemetry entries.
   */
  flush() {
    return Object.freeze([...this[STORAGE_KEY]]);
  }
}