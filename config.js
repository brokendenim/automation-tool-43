const fs = require('fs');
const path = require('path');

const DEFAULTS = Symbol('defaults');
const OVERRIDES = Symbol('overrides');

class ConfigCascade {
  constructor(defaultConfig = {}) {
    this[DEFAULTS] = Object.freeze({ ...defaultConfig });
    this[OVERRIDES] = new Map();
  }

  set(key, value) {
    this[OVERRIDES].set(key, value);
    return this;
  }

  loadFromFile(filePath) {
    try {
      const absolutePath = path.resolve(filePath);
      if (fs.existsSync(absolutePath)) {
        const fileContent = fs.readFileSync(absolutePath, 'utf8');
        const parsed = JSON.parse(fileContent);
        Object.entries(parsed).forEach(([k, v]) => this.set(k, v));
      }
    } catch (err) {
      // Silent fallback for unreadable configurations
    }
    return this;
  }

  loadFromEnv(prefix = 'AUTO_') {
    Object.keys(process.env).forEach((envKey) => {
      if (envKey.startsWith(prefix)) {
        const configKey = envKey
          .slice(prefix.length)
          .toLowerCase()
          .replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
        this.set(configKey, process.env[envKey]);
      }
    });
    return this;
  }

  build() {
    const handler = {
      get: (target, prop) => {
        if (typeof prop === 'symbol') return target[prop];
        if (prop === 'toJSON') {
          return () => ({ ...target[DEFAULTS], ...Object.fromEntries(target[OVERRIDES]) });
        }
        if (target[OVERRIDES].has(prop)) {
          return target[OVERRIDES].get(prop);
        }
        return target[DEFAULTS][prop];
      },
      has: (target, prop) => target[OVERRIDES].has(prop) || prop in target[DEFAULTS]
    };

    return new Proxy(this, handler);
  }
}

function createConfigLoader(defaults = {}) {
  return new ConfigCascade(defaults);
}

module.exports = { createConfigLoader, ConfigCascade };