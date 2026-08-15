const fs = require('fs');
const path = require('path');
const { format } = require('date-fns');

class Logger {
    constructor(logDir = 'logs', maxFiles = 5) {
        this.logDir = logDir;
        this.maxFiles = maxFiles;
        this.currentLogIndex = 1;
        this.currentLogPath = this._getLogFilePath();
        this._ensureLogDirExists();
    }

    _getLogFilePath() {
        const timestamp = format(new Date(), 'yyyy-MM-dd');
        return path.join(this.logDir, `log_${timestamp}.log`);
    }

    _ensureLogDirExists() {
        if (!fs.existsSync(this.logDir)) {
            fs.mkdirSync(this.logDir);
        }
    }

    _rotateLogs() {
        const files = fs.readdirSync(this.logDir);
        const logFiles = files.filter(file => /^log_\d{4}-\d{2}-\d{2}\.log$/.test(file));

        if (logFiles.length >= this.maxFiles) {
            const oldestLog = logFiles.sort()[0];
            fs.unlinkSync(path.join(this.logDir, oldestLog));
        }
    }

    log(message) {
        this._rotateLogs();
        const logMessage = `${format(new Date(), 'HH:mm:ss')} - ${message}\n`;
        fs.appendFileSync(this.currentLogPath, logMessage);
    }
}

module.exports = new Logger();