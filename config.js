const fs = require('fs');
const path = require('path');

const DEFAULTS = {
  port: 8080,
  host: '127.0.0.1',
  verbose: false,
  workers: 2,
  database: {
    uri: 'mongodb://localhost:27017/db',
    poolSize: 5
  }
};

function coerce(val, fallback) {
  if (typeof fallback === 'boolean') return val === 'true' || val === true;
  if (typeof fallback === 'number') return Number(val);
  return val;
}

function loadConfig(envPrefix = 'APP_') {
  let fileData = {};
  try {
    const targetPath = path.resolve(process.cwd(), 'config.json');
    if (fs.existsSync(targetPath)) {
      fileData = JSON.parse(fs.readFileSync(targetPath, 'utf-8'));
    }
  } catch (_) {
    // silently ignore and rely on defaults
  }

  const resolver = (target, pathPrefix = []) => {
    return new Proxy(target, {
      get(obj, key) {
        if (typeof key === 'symbol') return Reflect.get(obj, key);

        const currentPath = [...pathPrefix, key];
        const envKey = envPrefix + currentPath.map(k => k.toUpperCase()).join('_');

        if (process.env[envKey] !== undefined) {
          return coerce(process.env[envKey], obj[key]);
        }

        const currentFileVal = currentPath.reduce((acc, k) => (acc ? acc[k] : undefined), fileData);
        if (currentFileVal !== undefined) {
          return currentFileVal;
        }

        const localVal = obj[key];
        if (localVal && typeof localVal === 'object' && !Array.isArray(localVal)) {
          return resolver(localVal, currentPath);
        }

        return localVal;
      }
    });
  };

  return resolver(DEFAULTS);
}

module.exports = loadConfig();