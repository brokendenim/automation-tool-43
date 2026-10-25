const fs = require('fs');
const path = require('path');

const LOG_FILE = 'automation-tool-43.log';
const MAX_SIZE = 1024 * 512;

const rotate = () => {
  if (fs.existsSync(LOG_FILE) && fs.statSync(LOG_FILE).size > MAX_SIZE) {
    const timestamp = Date.now();
    fs.renameSync(LOG_FILE, `${LOG_FILE}.${timestamp}.bak`);
  }
};

const logger = {
  info: (msg) => {
    rotate();
    const entry = `[${new Date().toISOString()}] INFO: ${msg}\n`;
    process.stdout.write(entry);
    fs.appendFileSync(LOG_FILE, entry);
  },
  error: (msg) => {
    rotate();
    const entry = `[${new Date().toISOString()}] ERROR: ${msg}\n`;
    process.stderr.write(entry);
    fs.appendFileSync(LOG_FILE, entry);
  }
};

module.exports = logger;