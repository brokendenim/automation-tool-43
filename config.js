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
    const fullPath = path.resolve(process.cwd(), userPath);
    const fileContent = fs.readFileSync(fullPath, 'utf8');
    const userConfig = JSON.parse(fileContent);
    return deepMerge(defaults, userConfig);
  } catch (err) {
    return defaults;
  }
};

module.exports = { loadConfig };