const fs = require('fs');
const path = require('path');

const deepMerge = (target, source) => {
  for (const key in source) {
    if (source[key] instanceof Object && key in target) {
      Object.assign(source[key], deepMerge(target[key], source[key]));
    }
  }
  return { ...target, ...source };
};

const loadConfig = (filePath, defaults = {}) => {
  try {
    const absolutePath = path.resolve(process.cwd(), filePath);
    const fileContent = fs.existsSync(absolutePath) 
      ? JSON.parse(fs.readFileSync(absolutePath, 'utf8')) 
      : {};
    
    return deepMerge(defaults, fileContent);
  } catch (err) {
    return defaults;
  }
};

const initAutomationConfig = (overrides) => {
  const base = {
    retries: 3,
    timeout: 5000,
    paths: { input: './in', output: './out' },
    debug: false
  };
  
  return loadConfig('config.json', deepMerge(base, overrides));
};

module.exports = { initAutomationConfig };