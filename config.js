const env = process.env.NODE_ENV || 'development';

const baseConfig = {
  timeout: 5000,
  retries: 3,
  poolSize: 10
};

const environments = {
  development: { ...baseConfig, debug: true, endpoint: 'http://localhost:8080' },
  production: { ...baseConfig, debug: false, endpoint: 'https://api.automation.io' },
  test: { ...baseConfig, debug: false, endpoint: 'http://localhost:9000' }
};

const getConfig = (key) => {
  const config = environments[env];
  return key ? config[key] : config;
};

const applyOverrides = (updates) => {
  Object.entries(updates).forEach(([k, v]) => {
    environments[env][k] = v;
  });
};

module.exports = {
  getConfig,
  applyOverrides,
  currentEnv: env
};