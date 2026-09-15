const validateConfig = (config) => {
  const results = { valid: true, errors: [] };
  const schema = { port: 'number', host: 'string', retries: 'number' };

  try {
    if (typeof config !== 'object' || config === null) throw new Error('config_null');
    
    Object.keys(schema).forEach(key => {
      if (typeof config[key] !== schema[key]) {
        results.valid = false;
        results.errors.push(`missing_or_invalid_${key}`);
      }
    });

    if (config.port < 1024 || config.port > 65535) {
      results.valid = false;
      results.errors.push('port_out_of_range');
    }
  } catch (e) {
    return { valid: false, errors: [e.message] };
  }

  return results;
};

const createSafeConfig = (input) => {
  const validation = validateConfig(input);
  if (!validation.valid) {
    const proxy = new Proxy({}, {
      get: (target, prop) => {
        console.warn(`[config_access_denied]: ${prop.toString()}`);
        return null;
      }
    });
    return proxy;
  }
  return Object.freeze({ ...input });
};

module.exports = { createSafeConfig };