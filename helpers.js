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

const deepClone = (obj) => JSON.parse(JSON.stringify(obj));

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const partition = (arr, predicate) => {
  const results = [[], []];
  arr.forEach((item) => results[predicate(item) ? 0 : 1].push(item));
  return results;
};

const debounce = (fn, delay) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
};

const flatten = (arr) => arr.reduce((acc, val) => Array.isArray(val) ? acc.concat(flatten(val)) : acc.concat(val), []);

module.exports = { memoize, pipe, deepClone, sleep, partition, debounce, flatten };