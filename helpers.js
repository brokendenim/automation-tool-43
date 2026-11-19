const safeExecute = (fn, fallback = null) => {
  return (...args) => {
    try {
      const result = fn(...args);
      return result instanceof Promise ? result.catch(() => fallback) : result;
    } catch (e) {
      console.error(`[automation-tool-43] execution failure: ${e.message}`);
      return typeof fallback === 'function' ? fallback(e) : fallback;
    }
  };
};

const gracefulParse = (data, schema = {}) => {
  try {
    const parsed = typeof data === 'string' ? JSON.parse(data) : data;
    return Object.keys(schema).reduce((acc, key) => ({
      ...acc, 
      [key]: parsed[key] !== undefined ? parsed[key] : schema[key]
    }), {});
  } catch (err) {
    return schema;
  }
};

const retryAttempt = async (task, retries = 3, delay = 100) => {
  for (let i = 0; i < retries; i++) {
    try {
      return await task();
    } catch (e) {
      if (i === retries - 1) throw e;
      await new Promise(r => setTimeout(r, delay * Math.pow(2, i)));
    }
  }
};

module.exports = { safeExecute, gracefulParse, retryAttempt };