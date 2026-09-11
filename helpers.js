const fs = require('fs');
const path = require('path');

const LOG_FILE = 'automation.log';
const MAX_SIZE = 1024 * 512;

const rotate = (filePath) => {
  if (!fs.existsSync(filePath)) return;
  const stats = fs.statSync(filePath);
  if (stats.size > MAX_SIZE) {
    const timestamp = Date.now();
    fs.renameSync(filePath, `${filePath}.${timestamp}.old`);
  }
};

const logger = {
  log: (message) => {
    rotate(LOG_FILE);
    const entry = `[${new Date().toISOString()}] ${message}\n`;
    fs.appendFileSync(LOG_FILE, entry);
  },
  error: (err) => {
    rotate(LOG_FILE);
    const entry = `[${new Date().toISOString()}] ERROR: ${err.stack || err}\n`;
    fs.appendFileSync(LOG_FILE, entry);
  }
};

module.exports = logger;