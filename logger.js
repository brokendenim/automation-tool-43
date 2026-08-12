const fs = require('fs');
const path = require('path');

class Logger {
    constructor(logDir, maxSize, maxFiles) {
        this.logDir = logDir;
        this.maxSize = maxSize;
        this.maxFiles = maxFiles;
        this.currentLogFile = path.join(logDir, `app.log`);
        this.initLogFile();
    }

    initLogFile() {
        if (!fs.existsSync(this.logDir)) {
            fs.mkdirSync(this.logDir, { recursive: true });
        }
    }

    rotateLogs() {
        const files = fs.readdirSync(this.logDir);
        if (files.length >= this.maxFiles) {
            const oldestFile = path.join(this.logDir, files[0]);
            fs.unlinkSync(oldestFile);
        }
    }

    log(message) {
        const logMessage = `${new Date().toISOString()} - ${message}\n`;
        if (fs.existsSync(this.currentLogFile) && fs.statSync(this.currentLogFile).size >= this.maxSize) {
            this.rotateLogs();
        }
        fs.appendFileSync(this.currentLogFile, logMessage);
    }
}

module.exports = Logger;