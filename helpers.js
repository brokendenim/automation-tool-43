const memoize = (fn) => {
  const cache = new Map();
  return (...args) => {
    const key = JSON.stringify(args);
    return cache.has(key) ? cache.get(key) : cache.set(key, fn(...args)).get(key);
  };
};

const pipeline = (...fns) => (val) => fns.reduce((acc, fn) => fn(acc), val);

const batchProcess = (items, fn, chunkSize = 10) => {
  const results = [];
  for (let i = 0; i < items.length; i += chunkSize) {
    results.push(...items.slice(i, i + chunkSize).map(fn));
  }
  return results;
};

const createRegistry = () => {
  const registry = new Map();
  return {
    register: (key, val) => registry.set(key, val),
    resolve: (key) => registry.get(key),
    keys: () => Array.from(registry.keys()),
    clear: () => registry.clear()
  };
};

const debounce = (fn, delay = 300) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
};

module.exports = { memoize, pipeline, batchProcess, createRegistry, debounce };