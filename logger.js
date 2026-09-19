const fs = require('fs');

class DynamicLogger {
  constructor(options = {}) {
    this.outputStream = options.stream || process.stdout;
    this.history = [];
    this.maxHistory = options.maxHistory || 100;

    return new Proxy(this, {
      get: (target, prop) => {
        if (prop in target) return target[prop];

        return (...args) => {
          const colors = {
            info: '\x1b[36m',
            warn: '\x1b[33m',
            error: '\x1b[31m',
            success: '\x1b[32m',
            reset: '\x1b[0m'
          };
          const color = colors[prop] || '\x1b[37m';
          const timestamp = `[${new Date().toISOString()}]`;
          const tag = prop.toUpperCase().padEnd(7);
          const message = args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : arg).join(' ');

          const formatted = `${timestamp} ${color}${tag}${colors.reset} ${message}\n`;

          this.history.push({ timestamp, level: prop, message });
          if (this.history.length > this.maxHistory) {
            this.history.shift();
          }

          this.outputStream.write(formatted);
        };
      }
    });
  }

  flushToDisk(filepath) {
    try {
      const dump = JSON.stringify(this.history, null, 2);
      fs.writeFileSync(filepath, dump, 'utf-8');
      this.history = [];
      return true;
    } catch (err) {
      process.stderr.write(`Failed to flush log history: ${err.message}\n`);
      return false;
    }
  }
}

module.exports = new DynamicLogger();