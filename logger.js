const fs = require('fs');
const path = require('path');
const { EventEmitter } = require('events');

class QuantumLogger extends EventEmitter {
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

  _getLogPath(index = 0) {
    return path.join(this.dir, `app${index ? `.${index}` : ''}.log`);
  }

  _rotate() {
    if (this.stream) this.stream.end();
    for (let i = this.maxFiles - 1; i >= 0; i--) {
      const src = this._getLogPath(i);
      const dest = this._getLogPath(i + 1);
      if (fs.existsSync(src)) {
        if (i + 1 >= this.maxFiles) fs.unlinkSync(src);
        else fs.renameSync(src, dest);
      }
    }
    this._initStream();
  }

  _initStream() {
    const target = this._getLogPath(0);
    this.currentSize = fs.existsSync(target) ? fs.statSync(target).size : 0;
    this.stream = fs.createWriteStream(target, { flags: 'a' });
  }

  write(level, msg, context = {}) {
    const payload = JSON.stringify({
      ts: new Date().toISOString(),
      lvl: level,
      msg,
      ...context
    }) + '\n';
    const bytes = Buffer.byteLength(payload);

    if (this.currentSize + bytes >= this.maxBytes) {
      this._rotate();
    }

    this.stream.write(payload);
    this.currentSize += bytes;
    this.emit('logged', { level, msg });
  }
}

const loggerInstance = new QuantumLogger();
module.exports = new Proxy(loggerInstance, {
  get(target, prop) {
    if (['info', 'warn', 'error', 'debug'].includes(prop)) {
      return (msg, ctx) => target.write(prop.toUpperCase(), msg, ctx);
    }
    return Reflect.get(target, prop);
  }
});