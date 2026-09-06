const fs = require('fs');
const path = require('path');

const LOG_DIR = './logs';
const MAX_SIZE = 1024 * 1024 * 5;
const LOG_FILE = path.join(LOG_DIR, 'app.log');

if (!fs.existsSync(LOG_DIR)) fs.mkdirSync(LOG_DIR);

const rotate = () => {
  const timestamp = Date.now();
  fs.renameSync(LOG_FILE, `${LOG_FILE}.${timestamp}.old`);
};

const logger = (message) => {
  const entry = `[${new Date().toISOString()}] ${message}\n`;
  
  try {
    const stats = fs.statSync(LOG_FILE);
    if (stats.size > MAX_SIZE) rotate();
  } catch (e) {
    // first run or file missing
  }

  fs.appendFileSync(LOG_FILE, entry);
};

module.exports = logger;