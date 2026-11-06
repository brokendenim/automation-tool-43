/**
 * recursive data sanitization for automation-tool-43
 */
const sanitize = (data, mask = ['password', 'token', 'secret']) => {
  if (data === null || typeof data !== 'object') return data;

  return Object.entries(data).reduce((acc, [key, value]) => {
    if (mask.includes(key.toLowerCase())) {
      acc[key] = '***REDACTED***';
    } else if (Array.isArray(value)) {
      acc[key] = value.map(v => sanitize(v, mask));
    } else if (typeof value === 'object') {
      acc[key] = sanitize(value, mask);
    } else {
      acc[key] = value;
    }
    return acc;
  }, Array.isArray(data) ? [] : {});
};

/**
 * pipeline transformation wrapper for stream processing
 */
const pipe = (...fns) => (val) => fns.reduce((acc, fn) => fn(acc), val);

/**
 * deep clone using structuredClone or fallback strategy
 */
const clone = (data) => {
  try {
    return structuredClone(data);
  } catch (e) {
    return JSON.parse(JSON.stringify(data));
  }
};

module.exports = { sanitize, pipe, clone };