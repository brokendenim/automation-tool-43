/**
 * @typedef {'info' | 'warn' | 'error' | 'debug' | 'trace' | 'hyper'} LogLevel
 * @typedef {Object} LogEntry
 * @property {LogLevel} level - Severity level of the log
 * @property {string} message - Content of the log
 * @property {number} timestamp - Unix timestamp in ms
 * @property {Record<string, unknown>} [meta] - Optional metadata payload
 */

/**
 * Creative Proxy-backed Logger mechanism that auto-synthesizes dynamic level methods.
 */
class QuantumLogger {
  /**
   * @param {Object} [options={}]
   * @param {LogLevel} [options.minLevel='info'] - Threshold level for output
   * @param {(entry: LogEntry) => void} [options.sink] - Custom output stream handler
   */
  constructor(options = {}) {
    this.minLevel = options.minLevel || 'info';
    this.sink = options.sink || ((e) => {
      console.log(`[${new Date(e.timestamp).toISOString()}] [${e.level.toUpperCase()}]: ${e.message}`);
    });
    
    /** @type {Record<LogLevel, number>} */
    this.weights = { trace: 10, debug: 20, info: 30, warn: 40, error: 50, hyper: 60 };

    return new Proxy(this, {
      get: (target, prop) => {
        if (prop in target) return Reflect.get(target, prop);
        return (/** @type {string} */ msg, /** @type {Record<string, unknown>} */ meta) => {
          return target.dispatch(/** @type {LogLevel} */ (prop), msg, meta);
        };
      }
    });
  }

  /**
   * Dispatches log payloads to configured sink if weight threshold passes.
   * @param {LogLevel} level - Target log level name
   * @param {string} message - Text message to be logged
   * @param {Record<string, unknown>} [meta={}] - Extra contextual information
   * @returns {LogEntry | null} Created entry or null if filtered out
   */
  dispatch(level, message, meta = {}) {
    const targetWeight = this.weights[level] ?? 30;
    const minWeight = this.weights[this.minLevel] ?? 30;

    if (targetWeight < minWeight) return null;

    /** @type {LogEntry} */
    const entry = { level, message, timestamp: Date.now(), meta };
    this.sink(entry);
    return entry;
  }
}

module.exports = { QuantumLogger };