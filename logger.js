const fs = require('fs');
const path = require('path');
const { EventEmitter } = require('events');

class ShiftLogger extends EventEmitter {
  constructor(dir = './logs', maxSizeBytes = 1024 * 10, maxFiles = 3) {
    super();
    this.dir = dir;
    this.maxSize = maxSizeBytes;
    this.maxFiles = maxFiles;
    this.currentFile = path.join(this.dir, 'current.log');
    this.currentSize = 0;
    this.stream = null;

    if (!fs.existsSync(this.dir)) {
      fs.mkdirSync(this.dir, { recursive: true });
    }
    this._initStream();
  }

  _initStream() {
    this.currentSize = fs.existsSync(this.currentFile)
      ? fs.statSync(this.currentFile).size
      : 0;
    this.stream = fs.createWriteStream(this.currentFile, { flags: 'a' });
  }

  _rotate() {
    if (this.stream) this.stream.end();

    for (let i = this.maxFiles - 1; i >= 1; i--) {
      const oldPath = path.join(this.dir, `archive-${i}.log`);
      const newPath = path.join(this.dir, `archive-${i + 1}.log`);
      if (fs.existsSync(oldPath)) {
        if (i + 1 > this.maxFiles) {
          fs.unlinkSync(oldPath);
        } else {
          fs.renameSync(oldPath, newPath);
        }
      }
    }

    if (fs.existsSync(this.currentFile)) {
      fs.renameSync(this.currentFile, path.join(this.dir, 'archive-1.log'));
    }

    this._initStream();
    this.emit('rotate', { time: new Date() });
  }

  log(level, msg, ...args) {
    const timestamp = new Date().toISOString();
    const formatted = args.length ? ` ${JSON.stringify(args)}` : '';
    const entry = `[${timestamp}] [${level.toUpperCase()}] ${msg}${formatted}\n`;
    const buf = Buffer.from(entry);

    if (this.currentSize + buf.length > this.maxSize) {
      this._rotate();
    }

    this.stream.write(buf);
    this.currentSize += buf.length;
    process.stdout.write(entry);
  }
}

function createProxyLogger(options = {}) {
  const instance = new ShiftLogger(options.dir, options.maxSizeBytes, options.maxFiles);
  return new Proxy(instance, {
    get(target, prop) {
      if (prop in target) return target[prop];
      return (msg, ...args) => target.log(prop, msg, ...args);
    }
  });
}

module.exports = { createProxyLogger, ShiftLogger };