const normalize = (data) => {
  const pipeline = [
    (d) => (typeof d === 'string' ? d.trim() : d),
    (d) => (d instanceof Date ? d.toISOString() : d),
    (d) => (d && typeof d === 'object' ? Object.fromEntries(Object.entries(d).map(([k, v]) => [k.toLowerCase(), normalize(v)])) : d)
  ];
  return pipeline.reduce((acc, step) => step(acc), data);
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

const sanitize = (payload) => {
  const shadow = JSON.parse(JSON.stringify(payload));
  const clean = normalize(shadow);
  return deepFreeze(clean);
};

module.exports = { sanitize };