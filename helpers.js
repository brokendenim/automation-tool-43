const fs = require('fs');

const mergeDeep = (target, source) => {
  for (const key of Object.keys(source)) {
    if (source[key] instanceof Object && key in target) {
      Object.assign(source[key], mergeDeep(target[key], source[key]));
    }
  }
  Object.assign(target || {}, source);
  return target;
};

const loadConfig = (path, defaults = {}) => {
  try {
    const data = JSON.parse(fs.readFileSync(path, 'utf8'));
    return mergeDeep(defaults, data);
  } catch (err) {
    return defaults;
  }
};

const bootstrapConfig = (envKey, defaults) => {
  const userConfig = loadConfig(process.env[envKey] || './config.json', defaults);
  const proxy = new Proxy(userConfig, {
    get: (target, prop) => {
      if (!(prop in target)) throw new Error(`Config key ${String(prop)} missing`);
      return target[prop];
    }
  });
  return proxy;
};

module.exports = { bootstrapConfig };