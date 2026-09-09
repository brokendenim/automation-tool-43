const memoize = (fn) => {
  const cache = new Map();
  return (...args) => {
    const key = JSON.stringify(args);
    if (!cache.has(key)) cache.set(key, fn(...args));
    return cache.get(key);
  };
};

const pipeline = (...fns) => (initialValue) => 
  fns.reduce((acc, fn) => fn(acc), initialValue);

const deepFreeze = (obj) => {
  Object.keys(obj).forEach((prop) => {
    if (typeof obj[prop] === 'object' && obj[prop] !== null) {
      deepFreeze(obj[prop]);
    }
  });
  return Object.freeze(obj);
};

const asyncGuard = (fn, fallback) => async (...args) => {
  try {
    return await fn(...args);
  } catch (err) {
    console.error('[Automation-Tool-43] Execution fault:', err.message);
    return typeof fallback === 'function' ? fallback(err) : fallback;
  }
};

const objectFlatten = (obj, prefix = '') => 
  Object.keys(obj).reduce((acc, k) => {
    const pre = prefix.length ? prefix + '.' : '';
    if (typeof obj[k] === 'object' && obj[k] !== null && !Array.isArray(obj[k])) {
      Object.assign(acc, objectFlatten(obj[k], pre + k));
    } else {
      acc[pre + k] = obj[k];
    }
    return acc;
  }, {});

module.exports = { memoize, pipeline, deepFreeze, asyncGuard, objectFlatten };