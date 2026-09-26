const fs = require('fs');
const path = require('path');

const getTimestamp = () => new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');

const log = (level, message, meta = {}) => {
  const entry = {
    timestamp: getTimestamp(),
    level: level.toUpperCase(),
    message,
    ...meta
  };

  const logLine = `[${entry.timestamp}] ${entry.level}: ${entry.message} ${Object.keys(meta).length ? JSON.stringify(meta) : ''}`;
  
  process.stdout.write(logLine + '\n');

  if (process.env.LOG_FILE) {
    const logPath = path.resolve(process.cwd(), process.env.LOG_FILE);
    fs.appendFileSync(logPath, logLine + '\n');
  }
};

const logger = {
  info: (msg, meta) => log('info', msg, meta),
  warn: (msg, meta) => log('warn', msg, meta),
  error: (msg, meta) => log('error', msg, meta),
  debug: (msg, meta) => {
    if (process.env.DEBUG === 'true') log('debug', msg, meta);
  },
  table: (data) => console.table(data)
};

module.exports = logger;