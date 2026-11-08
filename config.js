const fs = require('fs');
const path = require('path');

const DEFAULTS = Symbol('defaults');

const defaultConfig = {
  appName: 'automation-tool-43',
  env: 'development',
  logLevel: 'info',
  concurrency: 4,
  timeout: 5000,
  retry: {
    attempts: 3,
    delay: 1000
  }
};

class ConfigLoader {
  constructor(options = {}) {
    this[DEFAULTS] = Object.freeze(JSON.parse(JSON.stringify({ ...defaultConfig, ...options.defaults })));
    this.configPath = options.configPath || path.join(process.cwd(), 'config.json');
  }

  load() {
    let fileConfig = {};
    if (fs.existsSync(this.configPath)) {
      try {
        fileConfig = JSON.parse(fs.readFileSync(this.configPath, 'utf8'));
      } catch (err) {
        fileConfig = {};
      }
    }

    const envConfig = this._extractEnv();
    const merged = this._deepMerge(this[DEFAULTS], fileConfig, envConfig);
    return this._wrapProxy(merged);
  }

  _extractEnv() {
    const env = {};
    const prefix = 'AUTO_TOOL_';
    for (const [key, val] of Object.entries(process.env)) {
      if (key.startsWith(prefix)) {
        const cleanKey = key.slice(prefix.length).toLowerCase();
        try {
          env[cleanKey] = JSON.parse(val);
        } catch {
          env[cleanKey] = val;
        }
      }
    }
    return env;
  }

  _deepMerge(...sources) {
    const result = {};
    for (const src of sources) {
      for (const key of Object.keys(src || {})) {
        if (src[key] && typeof src[key] === 'object' && !Array.isArray(src[key])) {
          result[key] = this._deepMerge(result[key] || {}, src[key]);
        } else if (src[key] !== undefined) {
          result[key] = src[key];
        }
      }
    }
    return result;
  }

  _wrapProxy(target) {
    const defaults = this[DEFAULTS];
    return new Proxy(target, {
      get: (obj, prop) => {
        if (typeof prop === 'symbol') return obj[prop];
        if (prop in obj) {
          return typeof obj[prop] === 'object' && obj[prop] !== null
            ? this._wrapProxy(obj[prop])
            : obj[prop];
        }
        return defaults[prop];
      }
    });
  }
}

module.exports = { ConfigLoader, defaultConfig };