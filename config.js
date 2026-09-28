const fs = require('fs');
const path = require('path');

const deepMerge = (target, source) => {
  for (const key of Object.keys(source)) {
    if (source[key] instanceof Object && key in target) {
      Object.assign(source[key], deepMerge(target[key], source[key]));
    }
  }
  return { ...target, ...source };
};

const loadConfig = (userPath, defaults = {}) => {
  try {
    const configPath = path.resolve(process.cwd(), userPath);
    const fileData = fs.existsSync(configPath) 
      ? JSON.parse(fs.readFileSync(configPath, 'utf8')) 
      : {};
    return deepMerge(defaults, fileData);
  } catch (err) {
    console.error('Configuration parsing failure:', err.message);
    return defaults;
  }
};

module.exports = { loadConfig };