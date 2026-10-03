const normalize = (data, schema = {}) => {
  const result = Array.isArray(data) ? [...data] : { ...data };
  const transform = (obj) => {
    Object.keys(obj).forEach((key) => {
      if (obj[key] && typeof obj[key] === 'object') transform(obj[key]);
      if (schema[key] === 'trim') obj[key] = String(obj[key]).trim();
      if (schema[key] === 'numeric') obj[key] = Number(obj[key]) || 0;
      if (schema[key] === 'boolean') obj[key] = !!obj[key];
    });
    return obj;
  };
  return transform(result);
};

const deepFreeze = (obj) => {
  Object.freeze(obj);
  Object.getOwnPropertyNames(obj).forEach((prop) => {
    if (obj[prop] !== null && (typeof obj[prop] === 'object' || typeof obj[prop] === 'function') && !Object.isFrozen(obj[prop])) {
      deepFreeze(obj[prop]);
    }
  });
  return obj;
};

const pipe = (...fns) => (x) => fns.reduce((v, f) => f(v), x);

export { normalize, deepFreeze, pipe };