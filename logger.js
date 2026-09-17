const fs = require('fs');
const path = require('path');

const Logger = {
  level: process.env.LOG_LEVEL || 'info',
  levels: { debug: 0, info: 1, warn: 2, error: 3 },
  
  format: (msg, lvl) => `[${new Date().toISOString()}] [${lvl.toUpperCase()}]: ${JSON.stringify(msg, null, 2)}`,

  write: (lvl, data) => {
    if (Logger.levels[lvl] < Logger.levels[Logger.level]) return;
    const entry = Logger.format(data, lvl);
    process.stdout.write(entry + '\n');
    
    if (lvl === 'error') {
      fs.appendFileSync(path.join(__dirname, 'error.log'), entry + '\n');
    }
  },

  debug: (d) => Logger.write('debug', d),
  info: (d) => Logger.write('info', d),
  warn: (d) => Logger.write('warn', d),
  error: (d) => Logger.write('error', d),

  tap: (label) => (data) => {
    Logger.info({ label, data });
    return data;
  }
};

module.exports = Logger;