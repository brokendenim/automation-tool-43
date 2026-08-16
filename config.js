const fs = require('fs');
const path = require('path');

const DEFAULT_CONFIG = {
    host: 'localhost',
    port: 3000,
    useHttps: false,
    logLevel: 'info',
};

function loadConfig(customConfigPath) {
    let finalConfig = { ...DEFAULT_CONFIG };
    
    if (customConfigPath && fs.existsSync(customConfigPath)) {
        const customConfig = JSON.parse(fs.readFileSync(customConfigPath, 'utf8'));
        finalConfig = { ...finalConfig, ...customConfig };
    } else {
        console.warn('Custom config not found, using defaults.');
    }
    
    return finalConfig;
}

module.exports = { loadConfig };