const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const retry = async (fn, options = {}) => {
  const { attempts = 3, interval = 1000, backoff = 1.5 } = options;
  let currentAttempt = 0;
  let currentInterval = interval;

  while (currentAttempt < attempts) {
    try {
      return await fn();
    } catch (error) {
      currentAttempt++;
      if (currentAttempt >= attempts) throw error;

      await delay(currentInterval);
      currentInterval *= backoff;
    }
  }
};

const robustFetch = async (url, options = {}) => {
  return retry(async () => {
    const response = await fetch(url, options);
    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status}`);
    }
    return response.json();
  }, {
    attempts: 5,
    interval: 500
  });
};

module.exports = { retry, robustFetch };