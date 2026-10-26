const fs = require('fs');

const mergeDeep = (target, source) => {
  for (const key of Object.keys(source)) {
    if (source[key] instanceof Object && key in target) {
      Object.assign(source[key], mergeDeep(target[key], source[key]));
    }
  }
  return { ...target, ...source };
};

/**
 * Load configuration with functional defaults fallback
 * Usage: loadConfig('./conf.json', { port: 8080 })
 */
const loadConfig = (path, defaults) => {
  try {
    const fileContent = fs.readFileSync(path, 'utf-8');
    const userConfig = JSON.parse(fileContent);
    return mergeDeep(defaults, userConfig);
  } catch (err) {
    return defaults;
  }
};

module.exports = { loadConfig };