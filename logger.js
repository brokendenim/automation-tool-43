const fs = require('fs');
const path = require('path');

const Logger = {
  level: process.env.LOG_LEVEL || 'info',
  levels: { debug: 0, info: 1, warn: 2, error: 3 },
  
  format: (msg, lvl) => `[${new Date().toISOString()}] [${lvl.toUpperCase()}]: ${msg}`,

  write: (msg, lvl) => {
    if (Logger.levels[lvl] < Logger.levels[Logger.level]) return;
    const logEntry = Logger.format(msg, lvl);
    console.log(logEntry);
    try {
      fs.appendFileSync(path.join(__dirname, 'app.log'), logEntry + '\n');
    } catch (e) {
      console.error('File system write access restricted');
    }
  },

  debug: (m) => Logger.write(m, 'debug'),
  info: (m) => Logger.write(m, 'info'),
  warn: (m) => Logger.write(m, 'warn'),
  error: (m) => Logger.write(m, 'error'),

  tap: (label) => (val) => {
    Logger.info(`${label}: ${JSON.stringify(val)}`);
    return val;
  },

  asyncWrapper: (fn) => async (...args) => {
    try {
      return await fn(...args);
    } catch (err) {
      Logger.error(`Execution failure: ${err.message}`);
      throw err;
    }
  }
};

module.exports = Logger;