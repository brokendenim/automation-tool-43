const cache = new Map();
const LIFO_LIMIT = 500;

const memoizedProcessor = (fn) => {
  return (...args) => {
    const key = JSON.stringify(args);
    if (cache.has(key)) {
      return cache.get(key);
    }
    
    if (cache.size >= LIFO_LIMIT) {
      const firstKey = cache.keys().next().value;
      cache.delete(firstKey);
    }
    
    const result = fn(...args);
    cache.set(key, result);
    return result;
  };
};

const batchProcess = async (tasks, concurrency = 5) => {
  const results = [];
  for (let i = 0; i < tasks.length; i += concurrency) {
    const chunk = tasks.slice(i, i + concurrency);
    const batch = await Promise.all(chunk.map(async (t) => await t()));
    results.push(...batch);
  }
  return results;
};

module.exports = {
  execute: memoizedProcessor(async (task) => {
    const start = performance.now();
    const outcome = await task();
    return { outcome, latency: performance.now() - start };
  }),
  batchProcess
};