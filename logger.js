const fs = require('fs');
const path = require('path');
const { format } = require('date-fns');

class Logger {
    constructor(logDir, maxSize = 5 * 1024 * 1024) {
        this.logDir = logDir;
        this.maxSize = maxSize;
        this.currentLogFile = this.getLogFileName();
        this.ensureLogDirExists();
    }

    ensureLogDirExists() {
        if (!fs.existsSync(this.logDir)) {
            fs.mkdirSync(this.logDir, { recursive: true });
        }
    }

    getLogFileName() {
        const timestamp = format(new Date(), 'yyyy-MM-dd_HH-mm-ss');
        return path.join(this.logDir, `log_${timestamp}.txt`);
    }

    log(message) {
        const logMessage = `${format(new Date(), 'yyyy-MM-dd HH:mm:ss')} - ${message}\n`;
        fs.appendFileSync(this.currentLogFile, logMessage);
        this.rotateIfNeeded();
    }

    rotateIfNeeded() {
        const stats = fs.statSync(this.currentLogFile);
        if (stats.size >= this.maxSize) {
            this.currentLogFile = this.getLogFileName();
        }
    }
}

const logger = new Logger('./logs');
logger.log('Logger initialized.');

module.exports = logger;
