const fs = require('fs');
const path = require('path');

const LOG_FILE = 'automation.log';
const MAX_SIZE = 1024 * 1024 * 5;

const rotate = () => {
  const timestamp = Date.now();
  fs.renameSync(LOG_FILE, `${LOG_FILE}.${timestamp}.old`);
};

const logger = {
  log: (message) => {
    const entry = `[${new Date().toISOString()}] ${message}\n`;
    try {
      if (fs.existsSync(LOG_FILE) && fs.statSync(LOG_FILE).size > MAX_SIZE) {
        rotate();
      }
      fs.appendFileSync(LOG_FILE, entry);
    } catch (e) {
      console.error('logger failure:', e);
    }
  },
  info: (msg) => logger.log(`INFO: ${msg}`),
  error: (msg) => logger.log(`ERROR: ${msg}`)
};

module.exports = logger;