const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const retry = async (fn, attempts = 3, interval = 1000, backoff = 1.5) => {
  let lastError;
  let currentDelay = interval;

  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      if (i < attempts - 1) {
        await delay(currentDelay);
        currentDelay *= backoff;
      }
    }
  }
  throw lastError;
};

const withRetry = (fn, options = {}) => {
  const { attempts = 3, interval = 1000 } = options;
  return (...args) => retry(() => fn(...args), attempts, interval);
};

module.exports = { withRetry };