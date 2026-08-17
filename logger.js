class Logger {
    constructor() {
        this.logs = [];
    }

    log(message) {
        const timestamp = new Date().toISOString();
        this.logs.push(`[${timestamp}] ${message}`);
    }

    getLogs() {
        return this.logs.join('\n');
    }

    clearLogs() {
        this.logs = [];
    }

    optimizeLogSize(maxSize) {
        while (this.logs.length > maxSize) {
            this.logs.shift();
        }
    }
}

const logger = new Logger();

// Example usage:
logger.log('Application started');
logger.log('User logged in');
logger.optimizeLogSize(5); // Retains only the last 5 logs

export default logger;