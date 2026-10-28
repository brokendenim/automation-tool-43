const fs = require('fs');
const path = require('path');

const DEFAULTS = Object.freeze({
  app: {
    name: 'automation-tool-43',
    env: '$NODE_ENV',
    concurrency: 4,
    verbose: false
  },
  storage: {
    tempDir: '/tmp/auto-43',
    maxRetries: 3
  },
  hooks: []
});

class ConfigLoader {
  #store;

  constructor(customPath = null) {
    const fileData = this.#readConfigFile(customPath);
    this.#store = this.#deepMerge(DEFAULTS, fileData);
    return this.#createCascadingProxy(this.#store);
  }

  #readConfigFile(filePath) {
    if (!filePath) return {};
    try {
      const resolved = path.resolve(filePath);
      if (!fs.existsSync(resolved)) return {};
      const content = fs.readFileSync(resolved, 'utf8');
      return JSON.parse(content);
    } catch {
      return {};
    }
  }

  #deepMerge(target, source) {
    const result = { ...target };
    for (const [key, val] of Object.entries(source || {})) {
      if (val && typeof val === 'object' && !Array.isArray(val) && result[key]) {
        result[key] = this.#deepMerge(result[key], val);
      } else if (val !== undefined) {
        result[key] = val;
      }
    }
    return result;
  }

  #createCascadingProxy(obj) {
    return new Proxy(obj, {
      get: (target, prop) => {
        if (prop in target) {
          const val = target[prop];
          if (typeof val === 'string' && val.startsWith('$')) {
            const envKey = val.slice(1);
            return process.env[envKey] ?? val;
          }
          if (val && typeof val === 'object' && !Array.isArray(val)) {
            return this.#createCascadingProxy(val);
          }
          return val;
        }
        return undefined;
      }
    });
  }
}

module.exports = function loadConfig(filePath) {
  return new ConfigLoader(filePath);
};