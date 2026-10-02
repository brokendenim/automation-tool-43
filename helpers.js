/**
 * Expressive multi-tool helpers for automation pipelines.
 */

// Creative Proxy-backed chain runner for async transformations
export const createPipeline = (initialValue = null) => {
  const steps = [];
  
  const runner = new Proxy(() => {}, {
    get(_, prop) {
      if (prop === 'run') {
        return async () => {
          let current = initialValue;
          for (const step of steps) {
            current = await step(current);
          }
          return current;
        };
      }
      if (prop === 'tap') {
        return (fn) => {
          steps.push(async (val) => {
            await fn(val);
            return val;
          });
          return runner;
        };
      }
      return (...args) => {
        steps.push(async (val) => {
          if (typeof val?.[prop] === 'function') {
            return val[prop](...args);
          }
          if (typeof prop === 'function') {
            return prop(...args, val);
          }
          return val;
        });
        return runner;
      };
    }
  });

  return runner;
};

// Retry decorator using generator function for exponential backoff
export async function retryAsync(fn, retries = 3, delayMs = 100) {
  function* backoffGenerator() {
    let duration = delayMs;
    while (true) {
      yield new Promise((resolve) => setTimeout(resolve, duration));
      duration *= 2;
    }
  }

  const delays = backoffGenerator();
  let lastError;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn(attempt);
    } catch (err) {
      lastError = err;
      if (attempt < retries) {
        await delays.next().value;
      }
    }
  }
  throw lastError;
}

// Deep value extractor template tag for payload formatting
export const extract = (strings, ...keys) => (obj) => {
  return strings.reduce((acc, str, i) => {
    const key = keys[i - 1];
    const val = key ? key.split('.').reduce((o, k) => o?.[k], obj) : '';
    return acc + (val ?? '') + str;
  });
};