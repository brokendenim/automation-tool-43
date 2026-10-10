const fs = require('fs');
const path = require('path');

class RotatingLogger {
  constructor({ dir = './logs', maxBytes = 50000 } = {}) {
    this.dir = dir;
    this.maxBytes = maxBytes;
    this.currentSize = 0;
    this.stream = null;
    if (!fs.existsSync(this.dir)) {
      fs.mkdirSync(this.dir, { recursive: true });
    }
    this.rotate();
  }

  rotate() {
    if (this.stream) this.stream.end();
    const stamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = path.join(this.dir, `automation-${stamp}.log`);
    this.stream = fs.createWriteStream(filename, { flags: 'a' });
    this.currentSize = 0;
  }

  log(level, message, meta = {}) {
    const entry = JSON.stringify({
      timestamp: new Date().toISOString(),
      level: String(level).toLowerCase(),
      message,
      ...meta
    }) + '\n';

    const bytes = Buffer.byteLength(entry);
    if (this.currentSize + bytes > this.maxBytes) {
      this.rotate();
    }

    this.stream.write(entry);
    this.currentSize += bytes;
    process.stdout.write(`[${String(level).toUpperCase()}] ${message}\n`);
  }
}

const loggerInstance = new RotatingLogger({ maxBytes: 100 * 1024 });

module.exports = new Proxy(loggerInstance, {
  get(target, prop) {
    if (typeof target[prop] === 'function') {
      return target[prop].bind(target);
    }
    return (message, meta) => target.log(prop, message, meta);
  }
});