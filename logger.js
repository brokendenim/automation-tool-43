const fs = require('fs');
const path = require('path');
const { Writable } = require('stream');

class RotatingLogger extends Writable {
  constructor(logPath, maxSize = 1024 * 1024) {
    super();
    this.logPath = logPath;
    this.maxSize = maxSize;
    this.stream = fs.createWriteStream(logPath, { flags: 'a' });
  }

  _write(chunk, enc, cb) {
    const stats = fs.existsSync(this.logPath) ? fs.statSync(this.logPath) : { size: 0 };
    
    if (stats.size + chunk.length > this.maxSize) {
      this.stream.end();
      const archive = `${this.logPath}.${Date.now()}.old`;
      fs.renameSync(this.logPath, archive);
      this.stream = fs.createWriteStream(this.logPath, { flags: 'a' });
    }

    this.stream.write(chunk, enc, cb);
  }

  log(level, message) {
    const entry = `[${new Date().toISOString()}] ${level.toUpperCase()}: ${message}\n`;
    this.write(entry);
  }
}

module.exports = new RotatingLogger(path.join(__dirname, 'automation.log'));