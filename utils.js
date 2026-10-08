const fs = require('fs');
const path = require('path');

const directoryScanner = (root) => {
  const entries = fs.readdirSync(root, { withFileTypes: true });
  return entries.reduce((acc, entry) => {
    const fullPath = path.join(root, entry.name);
    return entry.isDirectory() 
      ? [...acc, ...directoryScanner(fullPath)] 
      : [...acc, fullPath];
  }, []);
};

const batchProcessor = (items, batchSize, fn) => {
  const results = [];
  for (let i = 0; i < items.length; i += batchSize) {
    results.push(Promise.all(items.slice(i, i + batchSize).map(fn)));
  }
  return Promise.all(results).then(res => res.flat());
};

const createPipe = (...fns) => (initialValue) => 
  fns.reduce((acc, fn) => fn(acc), initialValue);

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

module.exports = { 
  directoryScanner, 
  batchProcessor, 
  createPipe, 
  memoize 
};