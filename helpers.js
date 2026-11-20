const safeExecute = (fn, fallback = null) => {
  return (...args) => {
    try {
      const result = fn(...args);
      return result instanceof Promise ? result.catch(() => fallback) : result;
    } catch (e) {
      console.warn('Execution anomaly detected:', e.message);
      return typeof fallback === 'function' ? fallback(e) : fallback;
    }
  };
};

const robustParse = (input, schema = {}) => {
  if (input === null || input === undefined) return schema;
  try {
    const parsed = typeof input === 'string' ? JSON.parse(input) : input;
    return { ...schema, ...parsed };
  } catch {
    return schema;
  }
};

const chainGuard = (obj, path, defaultValue) => {
  const keys = Array.isArray(path) ? path : path.split('.');
  return keys.reduce((acc, key) => (acc && acc[key] !== undefined ? acc[key] : defaultValue), obj);
};

module.exports = { safeExecute, robustParse, chainGuard };