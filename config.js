const sanitizeConfig = (raw) => {
  const defaults = { timeout: 5000, retry: true };
  try {
    if (typeof raw !== 'object' || raw === null) throw new Error('invalid schema');
    return { ...defaults, ...raw };
  } catch (e) {
    console.error('config normalization failure:', e.message);
    return defaults;
  }
};

const getSafe = (key, scope = {}) => {
  const chain = key.split('.');
  return chain.reduce((acc, part) => {
    if (acc === null || acc === undefined) return undefined;
    return acc[part];
  }, scope);
};

const validateEnvironment = (env) => {
  const required = ['API_KEY', 'NODE_ENV'];
  const missing = required.filter(k => !env[k]);
  if (missing.length > 0) {
    throw new ReferenceError(`Missing core env vars: ${missing.join(', ')}`);
  }
  return true;
};

const AppConfig = (input) => {
  const config = sanitizeConfig(input);
  return Object.freeze({
    get: (key) => getSafe(key, config),
    isReady: () => !!config.API_KEY,
    env: process.env.NODE_ENV || 'development'
  });
};

module.exports = { AppConfig, validateEnvironment };