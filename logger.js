const fs = require('fs');
const path = require('path');

const LOG_DIR = './logs';
const MAX_SIZE = 1024 * 1024 * 5;
const LOG_FILE = path.join(LOG_DIR, 'app.log');

if (!fs.existsSync(LOG_DIR)) fs.mkdirSync(LOG_DIR);

const rotate = () => {
  const timestamp = Date.now();
  fs.renameSync(LOG_FILE, `${LOG_FILE}.${timestamp}.old`);
  const archives = fs.readdirSync(LOG_DIR).filter(f => f.endsWith('.old'));
  if (archives.length > 5) {
    archives.sort().slice(0, -5).forEach(f => fs.unlinkSync(path.join(LOG_DIR, f)));
  }
};

const logger = (msg) => {
  const entry = `[${new Date().toISOString()}] ${msg}\n`;
  if (fs.existsSync(LOG_FILE) && fs.statSync(LOG_FILE).size > MAX_SIZE) {
    rotate();
  }
  fs.appendFileSync(LOG_FILE, entry);
};

module.exports = logger;