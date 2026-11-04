const retry = async (operation, { attempts = 3, delay = 1000, factor = 2 } = {}) => {
  let lastError;
  let currentDelay = delay;

  for (let i = 0; i < attempts; i++) {
    try {
      return await operation();
    } catch (err) {
      lastError = err;
      if (i < attempts - 1) {
        await new Promise((resolve) => setTimeout(resolve, currentDelay));
        currentDelay *= factor;
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

const resilientFetch = async (url, options = {}, config = {}) => {
  const request = () => fetch(url, options).then(res => {
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  });
  
  return retry(() => withTimeout(request(), config.timeout || 5000), config);
};

module.exports = { retry, withTimeout, resilientFetch };