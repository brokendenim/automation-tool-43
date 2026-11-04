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

const loadConfig = (configPath, defaults = {}) => {
  let userConfig = {};
  try {
    const absolutePath = path.resolve(process.cwd(), configPath);
    if (fs.existsSync(absolutePath)) {
      userConfig = JSON.parse(fs.readFileSync(absolutePath, 'utf8'));
    }
  } catch (err) {
    process.emitWarning(`Config load fail: ${err.message}`);
  }
  return deepMerge(defaults, userConfig);
};

module.exports = { loadConfig };