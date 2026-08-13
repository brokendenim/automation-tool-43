const fs = require('fs');
const path = require('path');

const configPath = path.join(__dirname, 'config.json');

function readConfig() {
    try {
        const rawData = fs.readFileSync(configPath);
        const config = JSON.parse(rawData);
        validateConfig(config);
        return config;
    } catch (error) {
        handleError(error);
    }
}

function validateConfig(config) {
    if (!config.database || !config.port) {
        throw new Error('Invalid configuration: Database and port are required.');
    }
}

function handleError(error) {
    switch (error.code) {
        case 'ENOENT':
            console.error('Configuration file not found. Please ensure the file exists.');
            break;
        case 'EACCES':
            console.error('Permission denied when accessing the configuration file.');
            break;
        default:
            console.error(`An error occurred: ${error.message}`);
    }
    process.exit(1);
}

module.exports = { readConfig };