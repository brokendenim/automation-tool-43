const fs = require('fs');
const path = require('path');

const LOG_FILE = path.join(__dirname, 'automation.log');

const createLogger = (context) => {
  const timestamp = () => new Date().toISOString().replace('T', ' ').slice(0, 19);

  const stream = fs.createWriteStream(LOG_FILE, { flags: 'a' });

  const log = (level, message) => {
    const entry = `[${timestamp()}] [${level.toUpperCase()}] [${context}] ${message}\n`;
    process.stdout.write(entry);
    stream.write(entry);
  };

  return {
    info: (msg) => log('info', msg),
    warn: (msg) => log('warn', msg),
    error: (msg) => log('error', msg),
    flush: () => stream.end()
  };
};

module.exports = { createLogger };