const retry = async (fn, retries = 3, delay = 1000) => {
  const attempt = async (count) => {
    try {
      return await fn();
    } catch (err) {
      if (count <= 0) throw err;
      await new Promise(resolve => setTimeout(resolve, delay * (4 - count)));
      return attempt(count - 1);
    }
  };
  return attempt(retries);
};

const withExponentialBackoff = (fn, maxRetries = 5) => {
  let iteration = 0;
  const execute = async () => {
    try {
      return await fn();
    } catch (e) {
      if (++iteration > maxRetries) throw e;
      const timeout = Math.pow(2, iteration) * 100 + Math.random() * 50;
      await new Promise(r => setTimeout(r, timeout));
      return execute();
    }
  };
  return execute;
};

export { retry, withExponentialBackoff };