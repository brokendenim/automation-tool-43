const transform = (input, schema) => {
  const result = {};
  for (const [key, path] of Object.entries(schema)) {
    const value = String(path).split('.').reduce((acc, part) => acc && acc[part], input);
    result[key] = value ?? null;
  }
  return result;
};

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

const pipeline = (...fns) => (initialValue) => fns.reduce((val, fn) => fn(val), initialValue);

const deepFreeze = (obj) => {
  Object.keys(obj).forEach((prop) => {
    if (typeof obj[prop] === 'object' && obj[prop] !== null) deepFreeze(obj[prop]);
  });
  return Object.freeze(obj);
};

const debounced = (fn, delay) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), delay);
  };
};

module.exports = { transform, memoize, pipeline, deepFreeze, debounced };