const retry = async (fn, retries = 3, delay = 1000) => {
  const attempt = async (count) => {
    try {
      return await fn();
    } catch (err) {
      if (count >= retries) throw err;
      await new Promise((resolve) => setTimeout(resolve, delay * Math.pow(2, count)));
      return attempt(count + 1);
    }
  };
  return attempt(0);
};

const withTimeout = (fn, ms) => {
  return (...args) => Promise.race([
    fn(...args),
    new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), ms))
  ]);
};

const fetchWithResilience = async (url, options = {}, retries = 3) => {
  const request = () => fetch(url, options).then(res => {
    if (!res.ok) throw new Error(`status ${res.status}`);
    return res.json();
  });
  
  return retry(withTimeout(request, 5000), retries);
};

export { retry, fetchWithResilience };