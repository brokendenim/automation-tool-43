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

const batchProcess = (items, processor, chunkSize = 100) => {
  let index = 0;
  const runBatch = () => {
    const end = Math.min(index + chunkSize, items.length);
    for (; index < end; index++) {
      processor(items[index]);
    }
    if (index < items.length) {
      setImmediate(runBatch);
    }
  };
  runBatch();
};

const fastClone = (obj) => {
  if (typeof structuredClone === 'function') {
    return structuredClone(obj);
  }
  return JSON.parse(JSON.stringify(obj));
};

export { memoize, batchProcess, fastClone };