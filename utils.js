const memoize = (fn, cache = new Map()) => (...args) => {
  const key = JSON.stringify(args);
  return cache.has(key) ? cache.get(key) : cache.set(key, fn(...args)).get(key);
};

const pipeline = (...fns) => (val) => fns.reduce((acc, fn) => fn(acc), val);

const debounce = (fn, delay) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
};

const chunk = (arr, size) => Array.from({ length: Math.ceil(arr.length / size) }, (_, i) => arr.slice(i * size, i * size + size));

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const attempt = (fn, ...args) => {
  try {
    return { data: fn(...args), error: null };
  } catch (error) {
    return { data: null, error };
  }
};

module.exports = { memoize, pipeline, debounce, chunk, sleep, attempt };