// Configuration settings for the automation tool
const config = {
    apiEndpoint: 'https://api.example.com',
    timeout: 5000,
    retries: 3,
    logLevel: 'info',
};

function validateConfig(config) {
    if (!config.apiEndpoint || typeof config.apiEndpoint !== 'string') {
        throw new Error('Invalid API Endpoint');
    }
    if (typeof config.timeout !== 'number' || config.timeout <= 0) {
        throw new Error('Timeout must be a positive number');
    }
    if (typeof config.retries !== 'number' || config.retries < 0) {
        throw new Error('Retries must be a non-negative number');
    }
    const validLogLevels = ['info', 'warn', 'error', 'debug'];
    if (!validLogLevels.includes(config.logLevel)) {
        throw new Error('Invalid log level');
    }
    return true;
}

try {
    validateConfig(config);
} catch (error) {
    console.error('Configuration error:', error.message);
}

module.exports = config;
