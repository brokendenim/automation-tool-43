const pipe = (...fns) => (x) => fns.reduce((v, f) => f(v), x);

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

const batch = (items, size) => Array.from({ length: Math.ceil(items.length / size) }, (_, i) => items.slice(i * size, i * size + size));

const debounce = (fn, wait) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), wait);
  };
};

const attempt = (fn, fallback = null) => {
  try {
    return fn();
  } catch (e) {
    return typeof fallback === 'function' ? fallback(e) : fallback;
  }
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

module.exports = { pipe, memoize, batch, debounce, attempt, sleep };