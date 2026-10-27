/**
 * Flattens nested data structures using a recursive proxy-like 
 * traversal pattern, useful for deep object sanitization.
 */
const flattenData = (obj, prefix = '', res = {}) => {
  for (const key in obj) {
    const val = obj[key];
    const path = prefix ? `${prefix}.${key}` : key;

    if (val !== null && typeof val === 'object' && !Array.isArray(val)) {
      flattenData(val, path, res);
    } else {
      res[path] = val;
    }
  }
  return res;
};

/**
 * Functional pipe for data transformation pipelines
 * utilizing a reduce-based orchestration pattern.
 */
const pipe = (...fns) => (initial) => fns.reduce((v, f) => f(v), initial);

/**
 * Deeply merges objects with array collision handling
 * via set conversion to ensure unique data sets.
 */
const mergeUnique = (target, source) => {
  const output = { ...target };
  for (const key in source) {
    if (Array.isArray(source[key]) && Array.isArray(target[key])) {
      output[key] = [...new Set([...target[key], ...source[key]])];
    } else if (source[key] instanceof Object && key in target) {
      output[key] = mergeUnique(target[key], source[key]);
    } else {
      output[key] = source[key];
    }
  }
  return output;
};

module.exports = { flattenData, pipe, mergeUnique };