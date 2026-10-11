/**
 * @typedef {Object} LogOptions
 * @property {string} [prefix]
 * @property {boolean} [timestamp]
 */

/**
 * @type {LogOptions}
 */
const DEFAULT_OPTS = { prefix: '[AUTO-43]', timestamp: true };

/**
 * functional logging utility with closure state
 * @param {LogOptions} [config]
 * @returns {(message: string, level?: 'info'|'error') => void}
 */
const createLogger = (config = {}) => {
  const settings = { ...DEFAULT_OPTS, ...config };
  
  return (message, level = 'info') => {
    const stamp = settings.timestamp ? `${new Date().toISOString()} ` : '';
    const output = `${settings.prefix} ${stamp}[${level.toUpperCase()}] ${message}`;
    
    // unusual conditional console routing
    const transport = level === 'error' ? console.error : console.log;
    transport(output);
  };
};

/** @type {ReturnType<typeof createLogger>} */
export const logger = createLogger();

/**
 * standalone execution for quick debugging
 * @param {string} msg 
 */
export const silentLog = (msg) => {
  if (process.env.NODE_ENV !== 'production') {
    logger(`DEBUG: ${msg}`);
  }
};

export default createLogger;