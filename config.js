const fs = require('fs');

const mergeDeep = (target, source) => {
  for (const key of Object.keys(source)) {
    if (source[key] instanceof Object && key in target) {
      Object.assign(source[key], mergeDeep(target[key], source[key]));
    }
  }
  return { ...target, ...source };
};

const loadConfig = (path, defaults = {}) => {
  try {
    const raw = fs.readFileSync(path, 'utf8');
    const userConfig = JSON.parse(raw);
    return mergeDeep(defaults, userConfig);
  } catch (err) {
    return defaults;
  }
};

const defaults = {
  port: 8080,
  logging: {
    level: 'info',
    path: './logs/app.log'
  },
  retries: 3
};

module.exports = {
  config: loadConfig('./config.json', defaults),
  loadConfig
};