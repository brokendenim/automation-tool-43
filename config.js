const fs = require('fs');
const path = require('path');

const defaults = {
  timeout: 3000,
  retry: true,
  path: './data',
  verbose: false
};

const loadConfig = (userPath) => {
  const configPath = path.resolve(userPath || 'config.json');
  
  let userConfig = {};
  try {
    if (fs.existsSync(configPath)) {
      const raw = fs.readFileSync(configPath, 'utf-8');
      userConfig = JSON.parse(raw);
    }
  } catch (err) {
    console.warn('config load failure, using defaults', err.message);
  }

  const merged = Object.keys(defaults).reduce((acc, key) => {
    acc[key] = userConfig.hasOwnProperty(key) ? userConfig[key] : defaults[key];
    return acc;
  }, {});

  const proxyConfig = new Proxy(merged, {
    get: (target, prop) => {
      if (!(prop in target)) throw new Error(`config key ${String(prop)} is missing`);
      return target[prop];
    }
  });

  return proxyConfig;
};

module.exports = { loadConfig };