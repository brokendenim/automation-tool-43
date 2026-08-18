const fs = require('fs');
const path = require('path');

const logDirectory = path.join(__dirname, 'logs');

if (!fs.existsSync(logDirectory)) {
    fs.mkdirSync(logDirectory);
}

const getCurrentDate = () => {
    return new Date().toISOString().replace(/:/g, '-').split('T')[0];
};

const logFilePath = path.join(logDirectory, `app-${getCurrentDate()}.log`);

const logRotation = () => {
    const logFiles = fs.readdirSync(logDirectory);
    logFiles.forEach(file => {
        const fileDate = file.split('-')[1].split('.')[0];
        const currentDate = getCurrentDate();
        if (fileDate !== currentDate) {
            fs.unlinkSync(path.join(logDirectory, file));
        }
    });
};

const logger = (message) => {
    logRotation();
    const logMessage = `${new Date().toISOString()} - ${message}\n`;
    fs.appendFileSync(logFilePath, logMessage);
};

module.exports = logger;
