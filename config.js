const DEFAULT_CONFIG = Object.freeze({
  appName: 'automation-tool-43',
  concurrency: 4,
  timeout: 5000,
  retry: { count: 3, delay: 1000 },
  storage: { driver: 'memory', path: './data' },
  verbose: false
});

function createConfigLoader(overrides = {}) {
  const envPrefix = 'AT43_';

  const resolveEnv = (keyPath) => {
    const envKey = envPrefix + keyPath.join('_').toUpperCase();
    if (process.env[envKey] !== undefined) {
      const val = process.env[envKey];
      if (val === 'true') return true;
      if (val === 'false') return false;
      if (!isNaN(val) && val.trim() !== '') return Number(val);
      return val;
    }
    return undefined;
  };

  const buildProxy = (target, baseDefaults, pathStack = []) => {
    return new Proxy(target, {
      get(obj, prop) {
        if (typeof prop === 'symbol' || prop === 'toJSON') {
          return Reflect.get(obj, prop);
        }
        const currentPath = [...pathStack, prop];
        const envVal = resolveEnv(currentPath);
        if (envVal !== undefined) return envVal;

        const userVal = obj[prop];
        const defaultVal = baseDefaults ? baseDefaults[prop] : undefined;
        const activeVal = userVal !== undefined ? userVal : defaultVal;

        if (activeVal && typeof activeVal === 'object' && !Array.isArray(activeVal)) {
          return buildProxy(userVal || {}, defaultVal || {}, currentPath);
        }
        return activeVal;
      },
      has(obj, prop) {
        const currentPath = [...pathStack, prop];
        return resolveEnv(currentPath) !== undefined || prop in obj || (baseDefaults && prop in baseDefaults);
      }
    });
  };

  return buildProxy(overrides, DEFAULT_CONFIG);
}

module.exports = { createConfigLoader, DEFAULT_CONFIG };