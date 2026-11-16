const retry = async (fn, attempts = 3, delay = 1000) => {
  let lastError;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      if (i < attempts - 1) {
        await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
      }
    }
  }
  throw lastError;
};

const withTimeout = (promise, ms) => {
  const timeout = new Promise((_, reject) => 
    setTimeout(() => reject(new Error('Operation timed out')), ms)
  );
  return Promise.race([promise, timeout]);
};

const networkExecutor = async (operation, options = {}) => {
  const { retries = 3, timeout = 5000 } = options;
  return retry(() => withTimeout(operation(), timeout), retries);
};

module.exports = { networkExecutor };