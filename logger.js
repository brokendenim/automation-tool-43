class Logger {
    constructor() {
        this.levels = ['error', 'warn', 'info', 'debug'];
    }

    log(level, message) {
        if (this.levels.includes(level)) {
            const timestamp = new Date().toISOString();
            console.log(`[${timestamp}] ${level.toUpperCase()}: ${message}`);
        } else {
            console.error('Invalid log level:', level);
        }
    }

    error(message) {
        this.log('error', message);
    }

    warn(message) {
        this.log('warn', message);
    }

    info(message) {
        this.log('info', message);
    }

    debug(message) {
        this.log('debug', message);
    }
}

const logger = new Logger();
export default logger;