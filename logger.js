// Simple logger utility

class Logger {
    constructor() {
        this.logs = [];
    }
    info(message) {
        this._log('INFO', message);
    }
    warn(message) {
        this._log('WARN', message);
    }
    error(message) {
        this._log('ERROR', message);
    }
    _log(level, message) {
        const timestamp = new Date().toISOString();
        const logEntry = `${timestamp} [${level}]: ${message}`;
        this.logs.push(logEntry);
        console[level.toLowerCase()](logEntry);
    }
    getLogs() {
        return this.logs;
    }
    clearLogs() {
        this.logs = [];
    }
}

const logger = new Logger();
export default logger;
