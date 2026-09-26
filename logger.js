const fs = require('fs');
const path = require('path');
const EventEmitter = require('events');

class RotatingLogger extends EventEmitter {
  constructor(dir = './logs', maxSizeBytes = 1024 * 5) {
    super();
    this.dir = dir;
    this.maxSize = maxSizeBytes;
    this.currentPath = path.join(this.dir, 'active.log');
    this.bytesWritten = 0;
    if (!fs.existsSync(this.dir)) fs.mkdirSync(this.dir, { recursive: true });
    this._initStream();
  }

  _initStream() {
    if (fs.existsSync(this.currentPath)) {
      this.bytesWritten = fs.statSync(this.currentPath).size;
    }
    this.stream = fs.createWriteStream(this.currentPath, { flags: 'a' });
  }

  _rotate() {
    this.stream.end();
    const stamp = new Date().toISOString().replace(/[:.]/g, '-');
    const archivePath = path.join(this.dir, `log-${stamp}.log`);
    fs.renameSync(this.currentPath, archivePath);
    this.bytesWritten = 0;
    this._initStream();
    this.emit('rotate', archivePath);
  }

  log(level, message) {
    const line = `[${new Date().toISOString()}] [${level.toUpperCase()}] ${message}\n`;
    const lineSize = Buffer.byteLength(line);
    if (this.bytesWritten + lineSize >= this.maxSize) {
      this._rotate();
    }
    this.stream.write(line);
    this.bytesWritten += lineSize;
  }
}

const createLogger = (dir, maxSize) => {
  const instance = new RotatingLogger(dir, maxSize);
  return new Proxy(instance, {
    get(target, prop) {
      if (typeof target[prop] !== 'undefined') return target[prop];
      return (msg) => target.log(prop, msg);
    }
  });
};

module.exports = { createLogger };