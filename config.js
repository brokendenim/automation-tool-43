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

const loadConfig = (defaults, filePath = './config.json') => {
  let userConfig = {};
  try {
    const absolutePath = path.resolve(process.cwd(), filePath);
    if (fs.existsSync(absolutePath)) {
      userConfig = JSON.parse(fs.readFileSync(absolutePath, 'utf8'));
    }
  } catch (err) {
    console.error('Configuration file corrupted, falling back to defaults.');
  }

  const config = deepMerge(defaults, userConfig);
  
  return new Proxy(config, {
    get: (target, prop) => {
      if (!(prop in target)) {
        throw new Error(`Configuration key "${String(prop)}" is missing.`);
      }
      return target[prop];
    }
  });
};

module.exports = { loadConfig };