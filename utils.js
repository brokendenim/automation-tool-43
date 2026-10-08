const DataTransformer = {
  pipe: (...fns) => (x) => fns.reduce((v, f) => f(v), x),
  flattenDeep: (arr) => arr.reduce((acc, val) => 
    Array.isArray(val) ? acc.concat(DataTransformer.flattenDeep(val)) : acc.concat(val), []),
  sanitize: (obj) => JSON.parse(JSON.stringify(obj, (key, value) => 
    typeof value === 'undefined' ? null : value)),
  query: (data, path) => path.split('.').reduce((acc, key) => acc && acc[key], data),
  batch: (items, size) => Array.from({ length: Math.ceil(items.length / size) }, 
    (_, i) => items.slice(i * size, i * size + size)),
  zipObject: (keys, values) => keys.reduce((acc, k, i) => ({ ...acc, [k]: values[i] }), {}),
  memoize: (fn) => {
    const cache = new Map();
    return (...args) => {
      const key = JSON.stringify(args);
      if (cache.has(key)) return cache.get(key);
      const result = fn(...args);
      cache.set(key, result);
      return result;
    };
  }
};

module.exports = DataTransformer;