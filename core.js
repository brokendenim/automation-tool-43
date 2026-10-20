const retry = async (fn, { retries = 3, delay = 1000, backoff = 2 } = {}) => {
  let attempt = 0;
  while (attempt < retries) {
    try {
      return await fn();
    } catch (error) {
      attempt++;
      if (attempt >= retries) throw error;
      const wait = delay * Math.pow(backoff, attempt - 1);
      await new Promise(resolve => setTimeout(resolve, wait));
    }
  }
};

const networkRequest = async (url, options = {}) => {
  return retry(async () => {
    const response = await fetch(url, options);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  }, { retries: 5 });
};

module.exports = { retry, networkRequest };