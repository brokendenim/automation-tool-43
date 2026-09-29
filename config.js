const env = process.env.NODE_ENV || 'development';

const defaults = {
  timeout: 5000,
  retries: 3,
  cache: true
};

const configurations = {
  development: {
    ...defaults,
    logLevel: 'debug',
    apiBase: 'http://localhost:3000'
  },
  production: {
    ...defaults,
    timeout: 10000,
    retries: 5,
    logLevel: 'warn',
    apiBase: 'https://api.automation.prod'
  }
};

const getConfig = (key) => {
  const config = configurations[env] || configurations.development;
  return key ? config[key] : config;
};

const mergeSettings = (custom) => {
  const base = getConfig();
  return Object.assign(Object.create(null), base, custom);
};

module.exports = {
  env,
  getConfig,
  mergeSettings
};