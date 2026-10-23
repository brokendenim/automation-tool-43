const retry = async (fn, { retries = 3, delay = 1000, backoff = 2 } = {}) => {
  let attempt = 0;
  let currentDelay = delay;

  while (attempt < retries) {
    try {
      return await fn();
    } catch (err) {
      attempt++;
      if (attempt >= retries) throw err;
      
      await new Promise(resolve => setTimeout(resolve, currentDelay));
      currentDelay *= backoff;
    }
  }
};

const withTimeout = (promise, ms) => {
  const timeout = new Promise((_, reject) => 
    setTimeout(() => reject(new Error('timeout')), ms)
  );
  return Promise.race([promise, timeout]);
};

const robustFetch = async (url, options = {}) => {
  return retry(() => withTimeout(fetch(url, options), 5000));
};

export { retry, robustFetch };