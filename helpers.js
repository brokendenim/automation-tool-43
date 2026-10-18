/**
 * Proxy-driven lazy evaluation pipeline and recursive data morpher.
 */
const createLazyPipe = (data) => {
  const steps = [];

  const engine = new Proxy({}, {
    get(_, prop) {
      if (prop === 'execute') {
        return () => steps.reduce((val, fn) => fn(val), data);
      }
      if (prop === 'tap') {
        return (fn) => (steps.push(val => (fn(val), val)), engine);
      }
      return (...args) => {
        steps.push(curr => {
          if (curr == null) return curr;
          if (typeof curr[prop] === 'function') return curr[prop](...args);
          if (Array.isArray(curr) && typeof Array.prototype[prop] === 'function') {
            return Array.prototype[prop].call(curr, ...args);
          }
          return curr[prop];
        });
        return engine;
      };
    }
  });

  return engine;
};

const morphStructure = (source, rules) => {
  if (typeof source !== 'object' || source === null) return source;

  const result = Array.isArray(source) ? [] : {};
  for (const [key, value] of Object.entries(source)) {
    const rule = rules[key] || rules['*'];
    const nextVal = typeof rule === 'function' ? rule(value, key, source) : value;
    result[key] = (nextVal && typeof nextVal === 'object')
      ? morphStructure(nextVal, rules)
      : nextVal;
  }
  return result;
};

module.exports = { createLazyPipe, morphStructure };