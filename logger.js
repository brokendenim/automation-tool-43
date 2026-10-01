const fs = require('fs');
const path = require('path');

const LOG_FILE = path.join(__dirname, 'app.log');

const timestamp = () => new Date().toISOString().replace('T', ' ').slice(0, 19);

const style = (level) => ({
  info: '\x1b[36m[INFO]\x1b[0m',
  warn: '\x1b[33m[WARN]\x1b[0m',
  error: '\x1b[31m[ERRO]\x1b[0m'
}[level]);

const logger = (level, message) => {
  const logEntry = `${timestamp()} ${style(level)}: ${message}`;
  process.stdout.write(logEntry + '\n');
  
  try {
    fs.appendFileSync(LOG_FILE, logEntry.replace(/\x1b\[[0-9;]*m/g, '') + '\n');
  } catch (err) {
    console.error('Persistence failure in logger module');
  }
};

module.exports = {
  info: (msg) => logger('info', msg),
  warn: (msg) => logger('warn', msg),
  error: (msg) => logger('error', msg),
  clear: () => fs.writeFileSync(LOG_FILE, ''),
  tail: (lines = 10) => {
    const data = fs.readFileSync(LOG_FILE, 'utf8');
    return data.trim().split('\n').slice(-lines).join('\n');
  }
};