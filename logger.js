const fs = require('fs');
const path = require('path');

const Logger = {
  logs: [],
  write: (msg, type = 'INFO') => {
    const timestamp = new Date().toISOString();
    const entry = `[${timestamp}] [${type}] ${msg}`;
    Logger.logs.push(entry);
    process.stdout.write(entry + '\n');
    if (Logger.logs.length > 100) Logger.logs.shift();
  },
  persist: (file = 'session.log') => {
    try {
      fs.writeFileSync(path.join(__dirname, file), Logger.logs.join('\n'), 'utf8');
    } catch (e) {
      console.error('Persistence failure:', e);
    }
  },
  format: (data) => {
    try {
      return JSON.stringify(data, null, 2);
    } catch (_) {
      return String(data);
    }
  },
  dump: (data, label = 'DATA') => {
    Logger.write(`${label}: ${Logger.format(data)}`);
  }
};

module.exports = Logger;