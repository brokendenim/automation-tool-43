const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const retry = async (fn, { retries = 3, factor = 2, baseDelay = 1000 } = {}) => {
  let lastError;
  let currentDelay = baseDelay;

  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      if (attempt < retries - 1) {
        await delay(currentDelay);
        currentDelay *= factor;
      }
    }
  }
  throw lastError;
};

const fetchWithRetry = async (url, options = {}) => {
  return retry(
    async () => {
      const response = await fetch(url, options);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response;
    },
    { retries: 5 }
  );
};

module.exports = { retry, fetchWithRetry };