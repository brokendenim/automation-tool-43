const env = process.env.NODE_ENV || 'development';

const baseConfig = {
  timeout: 5000,
  retryLimit: 3,
  features: ['auto-save', 'stream-buffer']
};

const strategies = {
  development: { debug: true, verbosity: 2 },
  production: { debug: false, verbosity: 0 },
  test: { debug: true, verbosity: 1 }
};

const buildConfig = (env) => {
  const overrides = strategies[env] || strategies.development;
  return Object.freeze({
    ...baseConfig,
    ...overrides,
    timestamp: Date.now(),
    isProd: env === 'production'
  });
};

const appConfig = buildConfig(env);

const get = (key) => appConfig[key];

const update = (key, val) => {
  if (appConfig.isProd) throw new Error('Immutable in production');
  appConfig[key] = val;
};

module.exports = { get, update, config: appConfig };