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

const pipeline = (...fns) => (initial) => fns.reduce((val, fn) => fn(val), initial);

const flattenDeep = (arr) => arr.reduce((acc, val) => 
  Array.isArray(val) ? acc.concat(flattenDeep(val)) : acc.concat(val), []);

const debounce = (fn, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
};

const getNested = (obj, path, fallback = null) => {
  const keys = path.split('.');
  return keys.reduce((acc, key) => (acc && acc[key] !== undefined ? acc[key] : fallback), obj);
};

export { memoize, pipeline, flattenDeep, debounce, getNested };