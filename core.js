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

const heavyCompute = (input) => {
  let sum = 0;
  for (let i = 0; i < 1e6; i++) sum += Math.sqrt(input * i);
  return sum;
};

const optimizedCompute = memoize(heavyCompute);

const batchProcess = (items) => {
  const queue = [...items];
  const results = [];
  
  while (queue.length > 0) {
    const chunk = queue.splice(0, 100);
    const processed = chunk.map(optimizedCompute);
    results.push(...processed);
    if (queue.length > 0) {
      process.nextTick(() => {});
    }
  }
  return results;
};

module.exports = { batchProcess };