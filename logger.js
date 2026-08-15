const fs = require('fs');
const path = require('path');

class Logger {
    constructor(logDir, maxSize, maxFiles) {
        this.logDir = logDir;
        this.maxSize = maxSize;
        this.maxFiles = maxFiles;
        this.logFile = path.join(logDir, 'app.log');
        this.init();
    }

    init() {
        if (!fs.existsSync(this.logDir)) {
            fs.mkdirSync(this.logDir, { recursive: true });
        }
        if (!fs.existsSync(this.logFile)) {
            fs.writeFileSync(this.logFile, '');
        }
    }

    log(message) {
        const currentSize = fs.statSync(this.logFile).size;
        if (currentSize >= this.maxSize) {
            this.rotateLogs();
        }
        fs.appendFileSync(this.logFile, `${new Date().toISOString()}: ${message}\n`);
    }

    rotateLogs() {
        for (let i = this.maxFiles - 1; i > 0; i--) {
            const oldFile = path.join(this.logDir, `app.log.${i}`);
            const newFile = path.join(this.logDir, `app.log.${i + 1}`);
            if (fs.existsSync(oldFile)) {
                fs.renameSync(oldFile, newFile);
            }
        }
        const newLogFile = path.join(this.logDir, 'app.log.1');
        fs.renameSync(this.logFile, newLogFile);
        fs.writeFileSync(this.logFile, '');
    }
}

module.exports = Logger;