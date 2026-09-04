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

const withJitter = (fn, attempts = 3, baseDelay = 1000) => {
  const jitter = () => Math.random() * 200;
  return retry(fn, attempts, baseDelay + jitter());
};

module.exports = { retry, withJitter };