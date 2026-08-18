const fs = require('fs');
const path = require('path');

class ConfigLoader {
    constructor(defaultsPath) {
        this.defaults = this.loadDefaults(defaultsPath);
    }

    loadDefaults(filePath) {
        try {
            const defaultsData = fs.readFileSync(filePath, 'utf8');
            return JSON.parse(defaultsData);
        } catch (error) {
            console.error('Failed to load defaults:', error);
            return {};
        }
    }

    loadConfig(customPath) {
        if (fs.existsSync(customPath)) {
            try {
                const customData = fs.readFileSync(customPath, 'utf8');
                const customConfig = JSON.parse(customData);
                return { ...this.defaults, ...customConfig };
            } catch (error) {
                console.error('Failed to load custom config:', error);
                return this.defaults;
            }
        }
        return this.defaults;
    }
}

module.exports = ConfigLoader;
