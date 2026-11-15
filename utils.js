const fs = require('fs');
const path = require('path');

const collect = (dir, ext = '.js') => {
  return fs.readdirSync(dir).reduce((acc, file) => {
    const full = path.join(dir, file);
    if (fs.statSync(full).isDirectory()) {
      return acc.concat(collect(full, ext));
    }
    return file.endsWith(ext) ? [...acc, full] : acc;
  }, []);
};

const orchestrate = (tasks) => {
  const results = { success: [], errors: [] };
  return tasks.reduce((promise, task) => 
    promise.then(() => task())
      .then(res => ({ ...results, success: [...results.success, res] }))
      .catch(err => ({ ...results, errors: [...results.errors, err.message] })),
    Promise.resolve(results)
  );
};

const memoize = (fn) => {
  const cache = new Map();
  return (...args) => {
    const key = JSON.stringify(args);
    if (!cache.has(key)) {
      cache.set(key, fn(...args));
    }
    return cache.get(key);
  };
};

module.exports = { collect, orchestrate, memoize };