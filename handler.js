const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const withRetry = async (fn, attempts = 3, backoff = 1000) => {
  let lastError;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      if (i < attempts - 1) {
        const delay = backoff * Math.pow(2, i) + Math.random() * 100;
        await sleep(delay);
      }
    }
  }
  throw lastError;
};

const fetchNetworkResource = async (url, options = {}) => {
  return withRetry(async () => {
    const response = await fetch(url, options);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  });
};

module.exports = { withRetry, fetchNetworkResource };