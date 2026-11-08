const memoize = (fn, cache = new Map()) => (...args) => {
  const key = JSON.stringify(args);
  return cache.has(key) ? cache.get(key) : cache.set(key, fn(...args)).get(key);
};

const pipe = (...fns) => (val) => fns.reduce((v, f) => f(v), val);

const retry = async (fn, attempts = 3, delay = 1000) => {
  for (let i = 0; i < attempts; i++) {
    try { return await fn(); } 
    catch (e) { if (i === attempts - 1) throw e; await new Promise(r => setTimeout(r, delay)); }
  }
};

const deepFreeze = (obj) => {
  Object.getOwnPropertyNames(obj).forEach(prop => {
    if (obj[prop] !== null && (typeof obj[prop] === 'object')) deepFreeze(obj[prop]);
  });
  return Object.freeze(obj);
};

const tap = (fn) => (val) => {
  fn(val);
  return val;
};

module.exports = { memoize, pipe, retry, deepFreeze, tap };