const fs = require('fs');

class RotatingStream {
  constructor(filepath, limit = 5000) {
    this.filepath = filepath;
    this.limit = limit;
    this.size = 0;
    this.init();
  }

  init() {
    if (fs.existsSync(this.filepath)) {
      this.size = fs.statSync(this.filepath).size;
    }
  }

  write(message) {
    const payload = Buffer.from(message);
    if (this.size + payload.length > this.limit) {
      this.rotate();
    }
    fs.appendFileSync(this.filepath, payload);
    this.size += payload.length;
  }

  rotate() {
    const backupPath = `${this.filepath}.${Date.now()}.log`;
    if (fs.existsSync(this.filepath)) {
      fs.renameSync(this.filepath, backupPath);
    }
    this.size = 0;
  }
}

function setupLogger(filepath, limit) {
  const rotater = new RotatingStream(filepath, limit);
  return new Proxy({}, {
    get(_, level) {
      return (...args) => {
        const timestamp = new Date().toISOString();
        const payload = args.map(a => typeof a === 'object' ? JSON.stringify(a) : a).join(' ');
        const logLine = `[${timestamp}] [${level.toUpperCase()}] ${payload}\n`;
        rotater.write(logLine);
      };
    }
  });
}

module.exports = { setupLogger };