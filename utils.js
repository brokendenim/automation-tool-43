const retry = (fn, { retries = 3, delay = 1000, factor = 2 } = {}) => {
  return new Promise((resolve, reject) => {
    const attempt = (n, currentDelay) => {
      fn()
        .then(resolve)
        .catch((error) => {
          if (n <= 0) return reject(error);
          setTimeout(() => attempt(n - 1, currentDelay * factor), currentDelay);
        });
    };
    attempt(retries, delay);
  });
};

const withExponentialBackoff = async (task, options) => {
  const config = { retries: 3, delay: 500, ...options };
  try {
    return await retry(task, config);
  } catch (err) {
    console.error(`[automation-tool-43] task failed after ${config.retries} attempts`);
    throw err;
  }
};

module.exports = { withExponentialBackoff };