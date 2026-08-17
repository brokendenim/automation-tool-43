class Logger {
    constructor() {
        this.logEntries = [];
    }

    log(message, level = 'info') {
        const timestamp = new Date().toISOString();
        const entry = { timestamp, level, message };
        this.logEntries.push(entry);
        console[level](\`[\${level}\] [\${timestamp}\]: \${message}\`);
    }

    getLogs() {
        return this.logEntries;
    }

    clearLogs() {
        this.logEntries = [];
    }
}

const logger = new Logger();

export default logger;
