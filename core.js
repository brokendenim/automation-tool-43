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

const heavyComputation = (data) => {
  return data.reduce((acc, val) => acc + Math.sqrt(val * Math.random()), 0);
};

const optimizedProcess = memoize(heavyComputation);

const batchProcess = (items) => {
  const queue = [...items];
  const results = [];
  
  while (queue.length > 0) {
    const chunk = queue.splice(0, 100);
    const processed = chunk.map(optimizedProcess);
    results.push(...processed);
  }
  
  return results;
};

module.exports = { batchProcess, memoize };