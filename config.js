const fs = require('fs');
const path = require('path');

class ConfigLoader {
    constructor(defaults) {
        this.defaults = defaults;
        this.config = {};
    }

    load(filePath) {
        const fullPath = path.resolve(filePath);
        if (fs.existsSync(fullPath)) {
            const userConfig = JSON.parse(fs.readFileSync(fullPath, 'utf-8'));
            this.config = { ...this.defaults, ...userConfig };
        } else {
            this.config = this.defaults;
        }
        return this.config;
    }
}

const defaultConfig = {
    host: 'localhost',
    port: 3000,
    env: 'development'
};

module.exports = new ConfigLoader(defaultConfig);