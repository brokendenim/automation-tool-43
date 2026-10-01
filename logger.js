const fs = require('fs');
const path = require('path');

const LOG_FILE = 'app.log';
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
    process.stdout.write(entry);
    fs.appendFileSync(LOG_FILE, entry);
  },
  error: (err) => {
    logger.log(`ERROR: ${err.stack || err}`);
  },
  info: (msg) => {
    logger.log(`INFO: ${msg}`);
  }
};

module.exports = logger;