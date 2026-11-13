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

const pipeline = (...fns) => (initialValue) => 
  fns.reduce((acc, fn) => fn(acc), initialValue);

const throttle = (fn, wait) => {
  let lastCall = 0;
  return (...args) => {
    const now = Date.now();
    if (now - lastCall >= wait) {
      lastCall = now;
      return fn(...args);
    }
  };
};

const flattenDeep = (arr) => 
  arr.reduce((acc, val) => 
    Array.isArray(val) ? acc.concat(flattenDeep(val)) : acc.concat(val), []);

const sanitize = (obj) => 
  Object.fromEntries(
    Object.entries(obj).filter(([_, v]) => v !== null && v !== undefined)
  );

export { memoize, pipeline, throttle, flattenDeep, sanitize };