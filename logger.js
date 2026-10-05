const fs = require('fs');
const path = require('path');

const LOG_DIR = './logs';
const MAX_SIZE = 1024 * 1024;

if (!fs.existsSync(LOG_DIR)) fs.mkdirSync(LOG_DIR);

const getLogPath = (idx) => path.join(LOG_DIR, `app.${idx}.log`);

const rotate = () => {
  for (let i = 2; i >= 0; i--) {
    const current = getLogPath(i);
    if (fs.existsSync(current)) fs.renameSync(current, getLogPath(i + 1));
  }
};

const logger = (msg) => {
  const logFile = getLogPath(0);
  const timestamp = new Date().toISOString();
  const entry = `[${timestamp}] ${msg}\n`;

  if (fs.existsSync(logFile) && fs.statSync(logFile).size > MAX_SIZE) {
    rotate();
  }

  fs.appendFileSync(logFile, entry);
};

module.exports = { logger };