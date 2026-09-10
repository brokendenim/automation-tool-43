const retry = (fn, { attempts = 3, delay = 1000, backoff = 2 } = {}) => {
  let count = 0;
  const execute = async (...args) => {
    try {
      return await fn(...args);
    } catch (err) {
      count++;
      if (count >= attempts) throw err;
      await new Promise((res) => setTimeout(res, delay * Math.pow(backoff, count - 1)));
      return execute(...args);
    }
  };
  return execute;
};

const networkRequest = async (url) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
};

const safeFetch = retry(networkRequest, { attempts: 4, delay: 500 });

export { retry, safeFetch };