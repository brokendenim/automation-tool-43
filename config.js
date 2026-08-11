const fs = require('fs');
const path = require('path');

const DEFAULTS = {  
    host: 'localhost',  
    port: 3000,  
    db: 'mongodb://localhost:27017/mydb'  
};

function loadConfig(configPath) {  
    const fullPath = path.resolve(configPath);  
    let userConfig = {};  
    try {  
        const configFile = fs.readFileSync(fullPath, 'utf8');  
        userConfig = JSON.parse(configFile);  
    } catch (err) {  
        console.warn(`Could not load config from ${fullPath}. Using defaults.`);  
    }
    return { ...DEFAULTS, ...userConfig };  
}

module.exports = { loadConfig };