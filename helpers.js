const memoize = (fn, ttl = 30000) => {
  const cache = new Map();
  return (...args) => {
    const key = JSON.stringify(args);
    const entry = cache.get(key);
    if (entry && Date.now() - entry.time < ttl) return entry.val;
    const result = fn(...args);
    cache.set(key, { val: result, time: Date.now() });
    return result;
  };
};

const batchProcess = (items, processor, chunkSize = 10) => {
  const results = [];
  let index = 0;
  const run = () => {
    const end = Math.min(index + chunkSize, items.length);
    for (; index < end; index++) {
      results.push(processor(items[index]));
    }
    return index < items.length ? new Promise(resolve => setTimeout(() => resolve(run()), 0)) : results;
  };
  return run();
};

const objectPool = (factory, size = 50) => {
  const pool = Array.from({ length: size }, factory);
  return {
    acquire: () => pool.pop() || factory(),
    release: (obj) => pool.length < size && pool.push(obj)
  };
};

export { memoize, batchProcess, objectPool };