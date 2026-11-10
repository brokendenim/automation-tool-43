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

const slugify = (str) => 
  str.toString().toLowerCase().trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');

const throttle = (fn, limit) => {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      fn.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

const deepFreeze = (obj) => {
  Object.keys(obj).forEach(prop => {
    if (typeof obj[prop] === 'object' && obj[prop] !== null) deepFreeze(obj[prop]);
  });
  return Object.freeze(obj);
};

export { memoize, pipeline, slugify, throttle, deepFreeze };