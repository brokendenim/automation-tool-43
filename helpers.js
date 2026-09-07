const memoize = (fn) => {
  const cache = new Map();
  return (...args) => {
    const key = JSON.stringify(args);
    if (cache.has(key)) return cache.get(key);
    const result = fn(...args);
    cache.set(key, result);
    return result;
  };
};

const pipeline = (...fns) => (initialValue) => 
  fns.reduce((acc, fn) => fn(acc), initialValue);

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const pick = (obj, keys) => 
  keys.reduce((acc, key) => (key in obj ? { ...acc, [key]: obj[key] } : acc), {});

const deepFreeze = (obj) => {
  Object.keys(obj).forEach((prop) => {
    if (typeof obj[prop] === 'object' && obj[prop] !== null) deepFreeze(obj[prop]);
  });
  return Object.freeze(obj);
};

const attempt = (fn, fallback) => {
  try {
    return fn();
  } catch {
    return typeof fallback === 'function' ? fallback() : fallback;
  }
};

module.exports = { memoize, pipeline, wait, pick, deepFreeze, attempt };