const fs = require('fs');
const path = require('path');

class PulseLogger {
  constructor(opts = {}) {
    this.dir = opts.dir || './logs';
    this.filename = opts.filename || 'automation.log';
    this.maxBytes = opts.maxBytes || 4096;
    this.maxFiles = opts.maxFiles || 4;
    this._ensureDir();

    return new Proxy(this, {
      get: (target, prop) => {
        if (prop in target) return target[prop];
        return (...args) => target._dispatch(prop.toUpperCase(), args);
      }
    });
  }

  _ensureDir() {
    if (!fs.existsSync(this.dir)) {
      fs.mkdirSync(this.dir, { recursive: true });
    }
  }

  _rotateIfNeeded(incomingBytes) {
    const mainPath = path.join(this.dir, this.filename);
    if (!fs.existsSync(mainPath)) return;

    const { size } = fs.statSync(mainPath);
    if (size + incomingBytes < this.maxBytes) return;

    for (let i = this.maxFiles - 1; i >= 1; i--) {
      const src = i === 1 ? mainPath : path.join(this.dir, `${this.filename}.${i - 1}`);
      const dest = path.join(this.dir, `${this.filename}.${i}`);
      if (fs.existsSync(src)) {
        fs.renameSync(src, dest);
      }
    }
  }

  _dispatch(level, args) {
    const formattedMsg = args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ');
    const record = JSON.stringify({ ts: new Date().toISOString(), level, msg: formattedMsg }) + '\n';
    const bytes = Buffer.byteLength(record, 'utf8');
    const mainPath = path.join(this.dir, this.filename);

    this._rotateIfNeeded(bytes);
    fs.appendFileSync(mainPath, record, 'utf8');

    const color = level === 'ERROR' ? '\x1b[31m' : level === 'WARN' ? '\x1b[33m' : '\x1b[32m';
    process.stdout.write(`${color}[${level}]\x1b[0m ${formattedMsg}\n`);
  }
}

module.exports = new PulseLogger({ maxBytes: 2048, maxFiles: 3 });