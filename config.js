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

const loadConfig = (defaults, configPath) => {
  try {
    const fullPath = path.resolve(process.cwd(), configPath);
    if (!fs.existsSync(fullPath)) return defaults;
    
    const fileData = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
    return deepMerge(defaults, fileData);
  } catch (err) {
    return defaults;
  }
};

module.exports = { loadConfig };