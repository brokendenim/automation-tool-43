const fs = require('fs');
const path = require('path');

const Logger = (scope = 'general') => {
  const logFile = path.join(__dirname, 'automation.log');

  const timestamp = () => new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');

  const stream = (level, data) => {
    const entry = `[${timestamp()}] [${level.toUpperCase()}] [${scope}]: ${JSON.stringify(data)}\n`;
    process.stdout.write(entry);
    fs.appendFile(logFile, entry, (err) => {
      if (err) console.error('Logger failure:', err);
    });
  };

  return {
    info: (msg) => stream('info', msg),
    warn: (msg) => stream('warn', msg),
    error: (msg) => stream('error', msg),
    pipe: (obj) => {
      const proxy = new Proxy(obj, {
        get(target, prop) {
          const val = target[prop];
          stream('trace', { op: 'get', prop, val });
          return val;
        },
        set(target, prop, val) {
          stream('trace', { op: 'set', prop, val });
          target[prop] = val;
          return true;
        }
      });
      return proxy;
    }
  };
};

module.exports = Logger;