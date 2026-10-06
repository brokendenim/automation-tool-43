const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const createResilientHandler = (targetService, options = {}) => {
  const { maxRetries = 3, initialDelay = 100 } = options;

  return new Proxy(targetService, {
    get(target, propKey, receiver) {
      const originalMethod = Reflect.get(target, propKey, receiver);

      if (typeof originalMethod !== 'function') {
        return originalMethod;
      }

      return async function (...args) {
        let currentDelay = initialDelay;

        for (let attempt = 1; attempt <= maxRetries; attempt++) {
          try {
            return await originalMethod.apply(this, args);
          } catch (error) {
            const isNetworkError = !error.status || error.status >= 500;
            if (!isNetworkError || attempt === maxRetries) {
              throw error;
            }
            // Bitwise shift for dynamic exponential backoff with jitter
            currentDelay = (currentDelay << 1) + Math.floor(Math.random() * 50);
            await delay(currentDelay);
          }
        }
      };
    }
  });
};

module.exports = { createResilientHandler };