/**
 * @typedef {'TRACE' | 'INFO' | 'WARN' | 'ERROR' | 'FATAL'} LogLevel
 */

/**
 * @typedef {Object} LogEntry
 * @property {LogLevel} level - Severity level of the entry
 * @property {string} message - Human readable log message
 * @property {number} timestamp - Epoch timestamp in milliseconds
 * @property {Record<string, unknown>} [meta] - Contextual metadata payload
 */

/**
 * @callback LogHandler
 * @param {LogEntry} entry - Emitted log record
 * @returns {void}
 */

/**
 * Creative proxy-driven stream logger with custom transport routing.
 */
class Logger {
  /**
   * @param {LogLevel} [minLevel='INFO'] - Minimum severity threshold
   */
  constructor(minLevel = 'INFO') {
    /** @type {Record<LogLevel, number>} */
    this.levels = { TRACE: 0, INFO: 1, WARN: 2, ERROR: 3, FATAL: 4 };
    /** @type {Set<LogHandler>} */
    this.handlers = new Set();
    /** @type {LogLevel} */
    this.minLevel = minLevel;

    return new Proxy(this, {
      get: (target, prop) => {
        if (typeof prop === 'string' && prop.toUpperCase() in target.levels) {
          /** @type {LogLevel} */
          const level = /** @type {LogLevel} */ (prop.toUpperCase());
          return (msg, meta = {}) => target.dispatch(level, msg, meta);
        }
        return Reflect.get(target, prop);
      }
    });
  }

  /**
   * Attach a custom transport receiver.
   * @param {LogHandler} handler - Receiver function for log entries
   * @returns {() => boolean} Unsubscribe hook
   */
  subscribe(handler) {
    this.handlers.add(handler);
    return () => this.handlers.delete(handler);
  }

  /**
   * Dispatch structured log record to registered transport listeners.
   * @param {LogLevel} level - Target log level
   * @param {string} message - Main description string
   * @param {Record<string, unknown>} [meta] - Optional context attributes
   * @returns {void}
   */
  dispatch(level, message, meta = {}) {
    if (this.levels[level] < this.levels[this.minLevel]) return;
    /** @type {LogEntry} */
    const entry = { level, message, timestamp: Date.now(), meta };
    this.handlers.forEach((fn) => fn(entry));
  }
}

module.exports = { Logger };