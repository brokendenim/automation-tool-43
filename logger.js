const LEVELS = { DEBUG: 0, INFO: 1, WARN: 2, ERROR: 3 };
const currentLevel = process.env.LOG_LEVEL || 'INFO';

const format = (lvl, msg) => `[${new Date().toISOString()}] ${lvl}: ${msg}`;

const logger = Object.keys(LEVELS).reduce((acc, key) => {
  acc[key.toLowerCase()] = (msg) => {
    if (LEVELS[key] >= LEVELS[currentLevel]) {
      process.stdout.write(format(key, msg) + '\n');
    }
  };
  return acc;
}, {});

const pipe = (fn, ...args) => (...extras) => fn(...args, ...extras);

const createScopedLogger = (scope) => ({
  info: pipe(logger.info, `(${scope})`), 
  error: pipe(logger.error, `(${scope})`)
});

module.exports = { ...logger, createScopedLogger };