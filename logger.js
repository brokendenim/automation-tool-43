const fs = require('fs');
const path = require('path');

const LOG_DIR = path.join(__dirname, 'logs');
const MAX_SIZE = 1024 * 1024;

if (!fs.existsSync(LOG_DIR)) fs.mkdirSync(LOG_DIR);

const getLogPath = () => path.join(LOG_DIR, 'app.log');

const rotate = () => {
  const logFile = getLogPath();
  if (fs.existsSync(logFile) && fs.statSync(logFile).size > MAX_SIZE) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    fs.renameSync(logFile, path.join(LOG_DIR, `app-${timestamp}.log`));
  }
};

const logger = (msg) => {
  rotate();
  const entry = `[${new Date().toISOString()}] ${msg}\n`;
  process.stdout.write(entry);
  fs.appendFileSync(getLogPath(), entry);
};

module.exports = { logger };