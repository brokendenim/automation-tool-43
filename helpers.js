const transform = (input, mapping) => {
  const result = Array.isArray(input) ? [] : {};
  for (const [key, value] of Object.entries(input)) {
    const targetKey = mapping[key] || key;
    if (value !== null && typeof value === 'object') {
      result[targetKey] = transform(value, mapping);
    } else {
      result[targetKey] = value;
    }
  }
  return result;
};

const deepFreeze = (obj) => {
  Object.keys(obj).forEach(prop => {
    if (typeof obj[prop] === 'object' && obj[prop] !== null) {
      deepFreeze(obj[prop]);
    }
  });
  return Object.freeze(obj);
};

const pluck = (collection, path) => {
  const segments = path.split('.');
  return collection.map(item => 
    segments.reduce((acc, part) => acc && acc[part], item)
  ).filter(val => val !== undefined);
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

export { transform, deepFreeze, pluck, memoize };