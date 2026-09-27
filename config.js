const fs = require('fs');
const path = require('path');

const DEFAULTS = {
  env: 'development',
  server: {
    host: 'localhost',
    port: 8080,
  },
  automation: {
    interval: 5000,
    retries: 3,
    silent: false
  }
};

function createConfigProxy(target, envPrefix = '') {
  return new Proxy(target, {
    get(obj, prop) {
      if (typeof prop === 'symbol' || prop === 'inspect') {
        return obj[prop];
      }

      const envKey = `${envPrefix}${prop.toUpperCase()}`;
      const envVal = process.env[envKey];

      if (obj[prop] !== null && typeof obj[prop] === 'object' && !Array.isArray(obj[prop])) {
        return createConfigProxy(obj[prop] || {}, `${envKey}_`);
      }

      if (envVal !== undefined) {
        if (/^\d+$/.test(envVal)) return Number(envVal);
        if (envVal === 'true') return true;
        if (envVal === 'false') return false;
        return envVal;
      }

      return obj[prop];
    }
  });
}

class ConfigLoader {
  constructor(customDefaults = {}) {
    this.baseConfig = { ...DEFAULTS, ...customDefaults };
  }

  load(filePath) {
    let fileConfig = {};
    if (filePath && fs.existsSync(filePath)) {
      try {
        fileConfig = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      } catch (e) {
        fileConfig = {};
      }
    }
    const merged = this.deepMerge(this.baseConfig, fileConfig);
    return createConfigProxy(merged);
  }

  deepMerge(target, source) {
    const output = { ...target };
    for (const key of Object.keys(source)) {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        output[key] = this.deepMerge(target[key] || {}, source[key]);
      } else {
        output[key] = source[key];
      }
    }
    return output;
  }
}

module.exports = {
  config: new ConfigLoader().load(process.env.CONFIG_PATH || path.join(process.cwd(), 'config.json')),
  ConfigLoader
};