/**
 * Helper utilities for automation-tool-43 task orchestration.
 */

const deepFreeze = (obj) => {
  Object.keys(obj).forEach((prop) => {
    if (typeof obj[prop] === 'object' && obj[prop] !== null && !Object.isFrozen(obj[prop])) {
      deepFreeze(obj[prop]);
    }
  });
  return Object.freeze(obj);
};

const microChunk = async function* (items, chunkSize = 10, delayMs = 5) {
  for (let i = 0; i < items.length; i += chunkSize) {
    yield items.slice(i, i + chunkSize);
    if (i + chunkSize < items.length) {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
};

const safeInterpolate = (strings, ...values) => {
  return strings.reduce((acc, str, i) => {
    const val = values[i - 1];
    const sanitized = typeof val === 'string' ? val.replace(/["'\\]/g, '\\$&') : String(val ?? '');
    return acc + sanitized + str;
  });
};

const createRetryRunner = (maxAttempts = 3, backoffFactor = 1.5) => {
  return async (taskFn, onRetry = () => {}) => {
    let attempt = 0;
    let delay = 100;
    while (attempt < maxAttempts) {
      try {
        return await taskFn(attempt);
      } catch (error) {
        attempt++;
        if (attempt >= maxAttempts) throw error;
        onRetry(error, attempt);
        await new Promise((res) => setTimeout(res, delay));
        delay *= backoffFactor;
      }
    }
  };
};

const tap = (fn) => (val) => {
  fn(val);
  return val;
};

module.exports = {
  deepFreeze,
  microChunk,
  safeInterpolate,
  createRetryRunner,
  tap
};