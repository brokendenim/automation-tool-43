const LEVELS = { DEBUG: 0, INFO: 1, WARN: 2, ERROR: 3 };

const colorize = (lvl) => {
  const codes = { 0: '\x1b[36m', 1: '\x1b[32m', 2: '\x1b[33m', 3: '\x1b[31m' };
  return `${codes[lvl] || ''}%s\x1b[0m`;
};

export const logger = {
  level: LEVELS.INFO,
  log(msg, lvl = LEVELS.INFO) {
    if (lvl < this.level) return;
    const timestamp = new Date().toISOString().split('T')[1].slice(0, -1);
    const label = Object.keys(LEVELS).find((k) => LEVELS[k] === lvl);
    console.log(colorize(lvl), `[${timestamp}][${label}] ${msg}`);
  },
  debug: (m) => logger.log(m, LEVELS.DEBUG),
  info: (m) => logger.log(m, LEVELS.INFO),
  warn: (m) => logger.log(m, LEVELS.WARN),
  error: (m) => logger.log(m, LEVELS.ERROR),
  pipe: (fn) => (...args) => {
    try {
      return fn(...args);
    } catch (e) {
      logger.error(`execution failure: ${e.message}`);
      throw e;
    }
  }
};