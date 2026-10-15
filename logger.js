const fs = require('fs');
const path = require('path');

const LOG_FILE = 'automation-tool-43.log';
const MAX_SIZE = 1024 * 512;

function rotateIfNeeded() {
  if (!fs.existsSync(LOG_FILE)) return;
  const stats = fs.statSync(LOG_FILE);
  if (stats.size > MAX_SIZE) {
    const timestamp = Date.now();
    fs.renameSync(LOG_FILE, `${LOG_FILE}.${timestamp}.old`);
  }
}

function logger(message) {
  rotateIfNeeded();
  const entry = `[${new Date().toISOString()}] ${message}\n`;
  fs.appendFileSync(LOG_FILE, entry, 'utf8');
}

module.exports = { logger };