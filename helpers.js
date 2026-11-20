const retry = async (fn, retries = 3, delay = 1000) => {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      if (attempt === retries - 1) throw err;
      await new Promise(resolve => setTimeout(resolve, delay * (attempt + 1)));
    }
  }
};

const withExponentialBackoff = async (task, max = 5) => {
  let count = 0;
  const execute = async () => {
    try {
      return await task();
    } catch (error) {
      if (++count > max) throw error;
      const jitter = Math.random() * 200;
      await new Promise(r => setTimeout(r, Math.pow(2, count) * 100 + jitter));
      return execute();
    }
  };
  return execute();
};

module.exports = { retry, withExponentialBackoff };