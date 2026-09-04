const fs = require('fs');
const path = require('path');

const LOG_DIR = './logs';
const MAX_SIZE = 1024 * 1024;

if (!fs.existsSync(LOG_DIR)) fs.mkdirSync(LOG_DIR);

const rotate = (file) => {
  const timestamp = Date.now();
  fs.renameSync(file, `${file}.${timestamp}.old`);
};

const logger = (message) => {
  const logPath = path.join(LOG_DIR, 'app.log');
  const entry = `[${new Date().toISOString()}] ${message}\n`;

  if (fs.existsSync(logPath) && fs.statSync(logPath).size > MAX_SIZE) {
    rotate(logPath);
  }

  fs.appendFileSync(logPath, entry);
};

module.exports = logger;