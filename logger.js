const logger = (() => {
  const logStore = [];
  const colors = { INFO: '\x1b[32m', WARN: '\x1b[33m', ERROR: '\x1b[31m', DEBUG: '\x1b[34m' };
  const reset = '\x1b[0m';
  function formatMessage(level, message) {
    const timestamp = new Date().toLocaleString();
    const paddedLevel = level.padEnd(5, ' ');
    return `${timestamp} ${colors[level] || ''}>> ${paddedLevel} ${message} ${reset}`;
  }
  function log(level, ...args) {
    const message = args.map(arg => {
      if (arg instanceof Error) return arg.stack || arg.message;
      if (typeof arg === 'object' && arg !== null) return JSON.stringify(arg, null, 2);
      return String(arg);
    }).join(' ');
    const formatted = formatMessage(level, message);
    console.log(formatted);
    logStore.push({ level, message, timestamp: new Date().toISOString() });
  }
  return {
    info: (...args) => log('INFO', ...args),
    warn: (...args) => log('WARN', ...args),
    error: (...args) => log('ERROR', ...args),
    debug: (...args) => log('DEBUG', ...args),
    withContext: (context) => ({
      info: (...args) => log('INFO', `[${context}]`, ...args),
      warn: (...args) => log('WARN', `[${context}]`, ...args),
      error: (...args) => log('ERROR', `[${context}]`, ...args),
      debug: (...args) => log('DEBUG', `[${context}]`, ...args)
    }),
    time: (label) => {
      const start = Date.now();
      return { end: () => log('DEBUG', `${label} completed in ${Date.now() - start}ms`) };
    },
    getLogs: () => [...logStore],
    clearLogs: () => { logStore.length = 0; }
  };
})();
module.exports = logger;