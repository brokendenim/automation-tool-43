const fs = require('fs');
const path = require('path');

class RotatingLogger {
  constructor(filename, maxBytes = 10240) {
    this.filename = filename;
    this.maxBytes = maxBytes;
  }

  rotate() {
    if (!fs.existsSync(this.filename)) return;
    const ext = path.extname(this.filename);
    const base = path.basename(this.filename, ext);
    const dir = path.dirname(this.filename);
    const archivePath = path.join(dir, `${base}_${Date.now()}${ext}`);
    fs.renameSync(this.filename, archivePath);
  }

  write(level, message) {
    const timestamp = new Date().toISOString();
    const logLine = `[${timestamp}] [${level.toUpperCase()}] ${message}\n`;
    const sizeDelta = Buffer.byteLength(logLine, 'utf8');

    let currentSize = 0;
    try {
      currentSize = fs.statSync(this.filename).size;
    } catch (err) {
      // File does not exist yet
    }

    if (currentSize + sizeDelta > this.maxBytes) {
      this.rotate();
    }

    fs.appendFileSync(this.filename, logLine, 'utf8');
  }
}

const createLogger = (filepath, maxBytes) => {
  const instance = new RotatingLogger(filepath, maxBytes);
  return new Proxy(instance, {
    get(target, prop) {
      if (prop in target) {
        return target[prop];
      }
      return (message) => target.write(prop, message);
    },
    set(target, prop, value) {
      target.write(prop, String(value));
      return true;
    }
  });
};

module.exports = createLogger;