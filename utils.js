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

const pipe = (...fns) => (x) => fns.reduce((v, f) => f(v), x);

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const deepClone = (obj) => JSON.parse(JSON.stringify(obj));

const retry = async (fn, attempts = 3, interval = 1000) => {
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (err) {
      if (i === attempts - 1) throw err;
      await delay(interval);
    }
  }
};

const shuffle = (arr) => arr.sort(() => Math.random() - 0.5);

const getNested = (obj, path, fallback = null) => {
  const keys = path.split('.');
  return keys.reduce((acc, key) => (acc && acc[key] !== undefined ? acc[key] : fallback), obj);
};

module.exports = { memoize, pipe, delay, deepClone, retry, shuffle, getNested };