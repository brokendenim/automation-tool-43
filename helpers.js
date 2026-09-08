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

const batchProcess = (tasks, chunkSize = 10) => {
  const results = [];
  for (let i = 0; i < tasks.length; i += chunkSize) {
    results.push(...tasks.slice(i, i + chunkSize).map(t => t()));
  }
  return results;
};

const lazyLoader = (factory) => {
  let instance = null;
  return () => {
    if (!instance) instance = factory();
    return instance;
  };
};

const throttleEvent = (fn, wait) => {
  let timer = null;
  return (...args) => {
    if (timer) return;
    timer = setTimeout(() => {
      fn(...args);
      timer = null;
    }, wait);
  };
};

export { memoize, batchProcess, lazyLoader, throttleEvent };