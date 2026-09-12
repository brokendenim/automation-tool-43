const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const withRetry = async (fn, options = {}) => {
  const { maxRetries = 3, backoff = 1000 } = options;
  let attempt = 0;

  while (attempt <= maxRetries) {
    try {
      return await fn();
    } catch (err) {
      attempt++;
      if (attempt > maxRetries) throw err;
      
      const jitter = Math.random() * 200;
      const delay = Math.pow(2, attempt) * backoff + jitter;
      
      console.warn(`Attempt ${attempt} failed, retrying in ${Math.round(delay)}ms...`);
      await sleep(delay);
    }
  }
};

const fetchWithResilience = async (url, config) => {
  return await withRetry(async () => {
    const response = await fetch(url, config);
    if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
    return response.json();
  }, { maxRetries: 4, backoff: 500 });
};

module.exports = { withRetry, fetchWithResilience };