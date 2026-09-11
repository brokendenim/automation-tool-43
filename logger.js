/**
 * @typedef {Object} LogOptions
 * @property {string} [level='INFO'] - severity level
 */

/**
 * functional-style logger with tag-based filtering
 * @param {string} tag - module context
 * @returns {(message: string, options?: LogOptions) => void}
 */
const createLogger = (tag) => {
  const style = 'color: #00ff00; font-weight: bold;';
  return (message, options = {}) => {
    const { level = 'INFO' } = options;
    const timestamp = new Date().toISOString();
    const entry = `[${timestamp}] [${level}] [${tag}]: ${message}`;

    if (process.env.NODE_ENV !== 'production') {
      console.log(`%c${entry}`, style);
    } else {
      process.stdout.write(entry + '\n');
    }
  };
};

/**
 * creates a dedicated error handler for automation workflows
 * @param {Error} err - exception instance
 * @param {string} context - function name
 * @returns {void}
 */
const logError = (err, context) => {
  const handler = createLogger('CORE-ERROR');
  handler(`${context} -> ${err.message}`, { level: 'ERROR' });
};

module.exports = { createLogger, logError };