const fs = require('fs');
const path = require('path');
const { EventEmitter } = require('events');

class RotatingLogger extends EventEmitter {
  constructor(options = {}) {
    super();
    this.dir = options.dir || './logs';
    this.maxBytes = options.maxBytes || 1024 * 10;
    this.maxFiles = options.maxFiles || 5;
    this.currentSize = 0;
    this.activeStream = null;

    if (!fs.existsSync(this.dir)) fs.mkdirSync(this.dir, { recursive: true });
    this._rotateStream();
  }

  _rotateStream() {
    if (this.activeStream) this.activeStream.end();
    
    const stamp = new Date().toISOString().replace(/[:.]/g, '-');
    const logPath = path.join(this.dir, `app-${stamp}.log`);
    this.activeStream = fs.createWriteStream(logPath, { flags: 'a' });
    this.currentSize = 0;
    this._purgeExcessLogs();
  }

  _purgeExcessLogs() {
    const files = fs.readdirSync(this.dir)
      .filter(f => f.startsWith('app-') && f.endsWith('.log'))
      .map(f => ({ name: f, time: fs.statSync(path.join(this.dir, f)).mtimeMs }))
      .sort((a, b) => b.time - a.time);

    files.slice(this.maxFiles).forEach(file => {
      fs.unlinkSync(path.join(this.dir, file.name));
    });
  }

  log(level, message, meta = {}) {
    const payload = JSON.stringify({ time: new Date().toISOString(), level: level.toUpperCase(), message, ...meta }) + '\n';
    const bytes = Buffer.byteLength(payload);
    if (this.currentSize + bytes > this.maxBytes) {
      this._rotateStream();
    }
    this.activeStream.write(payload);
    this.currentSize += bytes;
    this.emit('log', { level, message, bytes });
  }
}

const createLogger = (opts) => {
  const instance = new RotatingLogger(opts);
  return new Proxy(instance, {
    get(target, prop) {
      if (prop in target) return typeof target[prop] === 'function' ? target[prop].bind(target) : target[prop];
      return (msg, meta) => target.log(prop, msg, meta);
    }
  });
};

module.exports = { createLogger };