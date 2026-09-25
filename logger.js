const fs = require('fs');
const path = require('path');
const { EventEmitter } = require('events');

class RotatingLogger extends EventEmitter {
  constructor(opts = {}) {
    super();
    this.dir = opts.dir || './logs';
    this.maxBytes = opts.maxBytes || 1024 * 5;
    this.maxFiles = opts.maxFiles || 3;
    this.currentSize = 0;
    this.stream = null;
    if (!fs.existsSync(this.dir)) fs.mkdirSync(this.dir, { recursive: true });
    this._initStream();
  }

  _initStream() {
    const filePath = path.join(this.dir, 'current.log');
    this.currentSize = fs.existsSync(filePath) ? fs.statSync(filePath).size : 0;
    this.stream = fs.createWriteStream(filePath, { flags: 'a' });
  }

  _rotate() {
    this.stream.end();
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const archivedPath = path.join(this.dir, `log-${timestamp}.log`);
    const currentPath = path.join(this.dir, 'current.log');
    fs.renameSync(currentPath, archivedPath);
    this._cleanupOldLogs();
    this._initStream();
    this.emit('rotate', archivedPath);
  }

  _cleanupOldLogs() {
    const files = fs.readdirSync(this.dir)
      .filter(f => f.startsWith('log-'))
      .sort((a, b) => fs.statSync(path.join(this.dir, b)).mtimeMs - fs.statSync(path.join(this.dir, a)).mtimeMs);
    while (files.length >= this.maxFiles) {
      fs.unlinkSync(path.join(this.dir, files.pop()));
    }
  }

  write(level, msg) {
    const entry = `[${new Date().toISOString()}] [${level.toUpperCase()}] ${msg}\n`;
    const entrySize = Buffer.byteLength(entry);
    if (this.currentSize + entrySize > this.maxBytes) this._rotate();
    this.stream.write(entry);
    this.currentSize += entrySize;
  }
}

const createLogger = (options) => {
  const instance = new RotatingLogger(options);
  return new Proxy(instance, {
    get(target, prop) {
      if (['info', 'warn', 'error', 'debug'].includes(prop)) {
        return (msg) => target.write(prop, msg);
      }
      return target[prop];
    }
  });
};

module.exports = createLogger;