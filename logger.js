const fs = require('fs');
const path = require('path');

const LOG_FILE = 'automation.log';
const MAX_SIZE = 1024 * 512;

const logger = (msg) => {
  const timestamp = new Date().toISOString();
  const entry = `[${timestamp}] ${msg}\n`;
  
  try {
    if (fs.existsSync(LOG_FILE) && fs.statSync(LOG_FILE).size > MAX_SIZE) {
      const rotated = `${LOG_FILE}.${Date.now()}.bak`;
      fs.renameSync(LOG_FILE, rotated);
    }
    fs.appendFileSync(LOG_FILE, entry);
  } catch (err) {
    process.stderr.write(`Logger failure: ${err.message}\n`);
  }
};

module.exports = logger;