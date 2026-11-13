const fs = require('fs');
const path = require('path');

const LOG_DIR = path.join(__dirname, 'logs');
const MAX_SIZE = 1024 * 1024;

if (!fs.existsSync(LOG_DIR)) fs.mkdirSync(LOG_DIR);

const rotate = (filePath) => {
  const stats = fs.statSync(filePath);
  if (stats.size > MAX_SIZE) {
    const timestamp = Date.now();
    fs.renameSync(filePath, `${filePath}.${timestamp}.old`);
  }
};

const logger = (message, level = 'INFO') => {
  const logPath = path.join(LOG_DIR, 'app.log');
  if (fs.existsSync(logPath)) rotate(logPath);

  const entry = `[${new Date().toISOString()}] [${level}] ${message}\n`;
  fs.appendFileSync(logPath, entry);
};

module.exports = {
  info: (msg) => logger(msg, 'INFO'),
  error: (msg) => logger(msg, 'ERROR')
};