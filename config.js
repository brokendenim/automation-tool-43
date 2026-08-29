const fs = require('fs');
const path = require('path');

function deepMerge(base, override) {
  const merged = { ...base };
  Object.keys(override || {}).forEach((key) => {
    if (override[key] && typeof override[key] === 'object' && !Array.isArray(override[key])) {
      merged[key] = deepMerge(base[key] || {}, override[key]);
    } else if (key in override) {
      merged[key] = override[key];
    }
  });
  return merged;
}

function loadConfig(configPath, defaults = {}) {
  let config = Object.assign({}, defaults);
  const resolvedPath = path.resolve(configPath);
  if (fs.existsSync(resolvedPath)) {
    try {
      const rawContent = fs.readFileSync(resolvedPath, 'utf8');
      const userData = JSON.parse(rawContent);
      config = deepMerge(defaults, userData);
    } catch (err) {
      console.error('Error loading config file, defaults applied');
    }
  }
  return new Proxy(config, {
    get(target, key) {
      if (key in target) {
        return target[key];
      }
      if (key in defaults) {
        return defaults[key];
      }
      return undefined;
    },
    has(target, key) {
      return key in target || key in defaults;
    }
  });
}

module.exports = { loadConfig };