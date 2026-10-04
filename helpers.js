const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const retry = async (fn, options = {}) => {
  const { maxRetries = 3, factor = 2, baseDelay = 1000 } = options;
  let lastError;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      if (attempt === maxRetries) break;
      
      const waitTime = baseDelay * Math.pow(factor, attempt);
      await delay(waitTime + Math.random() * 100);
    }
  }
  throw lastError;
};

const safeFetch = async (url, config = {}) => {
  return await retry(async () => {
    const response = await fetch(url, config);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response;
  }, {
    maxRetries: 4,
    baseDelay: 500
  });
};

export { retry, safeFetch };