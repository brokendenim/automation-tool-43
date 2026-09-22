const retry = (fn, { retries = 3, delay = 1000 } = {}) => {
  return new Promise((resolve, reject) => {
    const attempt = (n) => {
      fn()
        .then(resolve)
        .catch((err) => {
          if (n <= 0) return reject(err);
          const jitter = Math.random() * 200;
          setTimeout(() => attempt(n - 1), delay + jitter);
        });
    };
    attempt(retries);
  });
};

const asyncGuard = (task, timeout = 5000) => {
  return Promise.race([
    task(),
    new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Operation timeout')), timeout)
    )
  ]);
};

const executeNetworkOp = async (operation, options) => {
  const wrapped = () => asyncGuard(operation, options.timeout);
  return await retry(wrapped, options);
};

module.exports = { retry, asyncGuard, executeNetworkOp };