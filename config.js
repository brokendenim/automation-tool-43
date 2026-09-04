const fs = require('fs');

const mergeDefaults = (userConfig, defaults) => {
  const result = { ...defaults };
  for (const key in userConfig) {
    if (userConfig[key] !== undefined) {
      result[key] = userConfig[key];
    }
  }
  return result;
};

const loadConfiguration = (path, defaults) => {
  try {
    if (!fs.existsSync(path)) return defaults;
    const fileContent = fs.readFileSync(path, 'utf8');
    const parsed = JSON.parse(fileContent);
    return mergeDefaults(parsed, defaults);
  } catch (err) {
    process.stdout.write(`Warning: configuration load failed: ${err.message}\n`);
    return defaults;
  }
};

const initAppConfig = (overrides = {}) => {
  const defaults = {
    port: 3000,
    host: 'localhost',
    debug: false,
    timeout: 5000
  };
  
  const rawConfig = loadConfiguration('./config.json', defaults);
  return Object.freeze(mergeDefaults(overrides, rawConfig));
};

module.exports = { initAppConfig };