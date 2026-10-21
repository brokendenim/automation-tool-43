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

const pipe = (...fns) => (initial) => fns.reduce((val, fn) => fn(val), initial);

const debounce = (fn, delay) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
};

const getNested = (obj, path, fallback = null) => {
  return path.split('.').reduce((acc, part) => (acc && acc[part] !== undefined ? acc[part] : fallback), obj);
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const range = (start, end) => Array.from({ length: end - start }, (_, i) => start + i);

const deepClone = (obj) => JSON.parse(JSON.stringify(obj));

const batchProcess = async (items, limit, task) => {
  const results = [];
  for (let i = 0; i < items.length; i += limit) {
    const batch = items.slice(i, i + limit);
    results.push(...(await Promise.all(batch.map(task))));
  }
  return results;
};

export { memoize, pipe, debounce, getNested, sleep, range, deepClone, batchProcess };