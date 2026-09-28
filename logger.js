const fs = require('fs');
const path = require('path');

const LOG_FILE = path.join(__dirname, 'automation.log');

const format = (lvl, msg) => {
  const ts = new Date().toISOString();
  return `[${ts}] [${lvl.toUpperCase()}]: ${msg}`;
};

const stream = (lvl, msg) => {
  const line = format(lvl, msg);
  process.stdout.write(line + '\n');
  fs.appendFile(LOG_FILE, line + '\n', (err) => {
    if (err) console.error('Logging failure:', err);
  });
};

const logger = {
  info: (msg) => stream('info', msg),
  warn: (msg) => stream('warn', msg),
  error: (msg) => stream('error', msg),
  trace: (val) => {
    const stack = new Error().stack.split('\n')[2];
    stream('trace', `${JSON.stringify(val)} at ${stack.trim()}`);
  },
  // Unconventional: quick heartbeat to verify logs
  pulse: () => stream('debug', 'heartbeat signal active')
};

module.exports = logger;