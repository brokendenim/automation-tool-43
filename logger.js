const fs = require('fs');
const path = require('path');

const logPath = path.join(__dirname, 'automation.log');

const formatter = (level, message) => {
  const timestamp = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
  return `[${timestamp}] [${level.toUpperCase()}]: ${message}\n`;
};

const logger = {
  info: (msg) => {
    const entry = formatter('info', msg);
    process.stdout.write(entry);
    fs.appendFileSync(logPath, entry);
  },
  warn: (msg) => {
    const entry = formatter('warn', msg);
    console.warn(`\x1b[33m${entry}\x1b[0m`);
    fs.appendFileSync(logPath, entry);
  },
  error: (msg, err = '') => {
    const detail = err ? ` | Detail: ${err.message || err}` : '';
    const entry = formatter('error', `${msg}${detail}`);
    console.error(`\x1b[31m${entry}\x1b[0m`);
    fs.appendFileSync(logPath, entry);
  },
  audit: (action, status) => {
    const entry = formatter('audit', `${action} status=${status}`);
    fs.appendFileSync(logPath, entry);
  }
};

module.exports = logger;