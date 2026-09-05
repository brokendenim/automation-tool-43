const fs = require('fs');
const path = require('path');

class LightRotationLogger {
  constructor(logDir = './logs', maxBytes = 10240) {
    this.logDir = logDir;
    this.maxBytes = maxBytes;
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
    this.logFile = path.join(logDir, 'automation.log');

    // Creative proxy to handle dynamic severity methods dynamically
    return new Proxy(this, {
      get: (target, prop) => {
        if (['info', 'warn', 'error', 'debug'].includes(prop)) {
          return (msg) => target.write(prop.toUpperCase(), msg);
        }
        return target[prop];
      }
    });
  }

  write(level, msg) {
    this._rotateIfNecessary();
    const timestamp = new Date().toISOString().slice(0, 19).replace('T', ' ');
    const formatted = `[${timestamp}] [${level}] ${msg}\n`;
    
    fs.appendFileSync(this.logFile, formatted);
    
    const colorMap = { INFO: 32, WARN: 33, ERROR: 31, DEBUG: 36 };
    const color = colorMap[level] || 37;
    process.stdout.write(`\x1b[${color}m${formatted}\x1b[0m`);
  }

  _rotateIfNecessary() {
    if (fs.existsSync(this.logFile)) {
      const { size } = fs.statSync(this.logFile);
      if (size >= this.maxBytes) {
        const rotatedPath = path.join(this.logDir, `automation.${Date.now()}.log`);
        fs.renameSync(this.logFile, rotatedPath);
      }
    }
  }
}

module.exports = LightRotationLogger;