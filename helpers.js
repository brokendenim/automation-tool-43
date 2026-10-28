const memoize = (fn, cache = new Map()) => (...args) => {
  const key = JSON.stringify(args);
  return cache.has(key) ? cache.get(key) : cache.set(key, fn(...args)).get(key);
};

const pipe = (...fns) => (x) => fns.reduce((v, f) => f(v), x);

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const flattenDeep = (arr) => arr.reduce((acc, val) => Array.isArray(val) ? acc.concat(flattenDeep(val)) : acc.concat(val), []);

const safeJSON = (data, fallback = {}) => {
  try {
    return typeof data === 'string' ? JSON.parse(data) : data;
  } catch {
    return fallback;
  }
};

const debounce = (fn, wait) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), wait);
  };
};

const pick = (obj, keys) => keys.reduce((acc, k) => (k in obj ? { ...acc, [k]: obj[k] } : acc), {});

module.exports = { memoize, pipe, delay, flattenDeep, safeJSON, debounce, pick };