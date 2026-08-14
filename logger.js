// Import necessary modules
const fs = require('fs');
const path = require('path');
const { format, createLogger, transports } = require('winston');

// Directory and file setup
const logDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir);
}

const logFile = path.join(logDir, 'app.log');

// Logger configuration
const logger = createLogger({
    level: 'info',
    format: format.combine(
        format.label({ label: 'my-app' }),
        format.timestamp(),
        format.printf(({ timestamp, level, message }) => {
            return `${timestamp} [${level}]: ${message}`;
        })
    ),
    transports: [
        new transports.File({ filename: logFile }),
        new transports.Console()
    ],
    exceptionHandlers: [
        new transports.File({ filename: path.join(logDir, 'exceptions.log') })
    ],
    rejectionHandlers: [
        new transports.File({ filename: path.join(logDir, 'rejections.log') })
    ]
});

// Log rotation
const logRotate = () => {
    fs.stat(logFile, (err, stats) => {
        if (err) return logger.error('Could not access log file');
        if (stats.size > 5 * 1024 * 1024) { // If file is larger than 5MB
            const newFileName = `${logFile}.${new Date().toISOString()}.gz`;
            fs.rename(logFile, newFileName, (err) => {
                if (err) logger.error('Rotation failed');
                logger.info('Log rotated to: ' + newFileName);
            });
        }
    });
};

// Setup interval to check for rotation every 10 minutes
setInterval(logRotate, 10 * 60 * 1000);

module.exports = logger;