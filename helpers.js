const deepMorph = (obj, transformer) => {
  if (obj === null || typeof obj !== 'object') {
    return transformer(obj);
  }
  
  const isArr = Array.isArray(obj);
  const result = isArr ? [] : {};
  
  for (const key of Object.keys(obj)) {
    result[key] = deepMorph(obj[key], transformer);
  }
  
  return result;
};

const queryPath = (target, path, fallback = undefined) => {
  const segments = path.replace(/\[(\d+)\]/g, '.$1').split('.');
  let current = target;

  for (const segment of segments) {
    if (current === null || current === undefined || !(segment in Object(current))) {
      return fallback;
    }
    current = current[segment];
  }

  return current;
};

const batchStream = function* (items, batchSize = 10) {
  let chunk = [];
  for (const item of items) {
    chunk.push(item);
    if (chunk.length === batchSize) {
      yield chunk;
      chunk = [];
    }
  }
  if (chunk.length > 0) {
    yield chunk;
  }
};

module.exports = { deepMorph, queryPath, batchStream };