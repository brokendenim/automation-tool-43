const retry = (fn, retries = 3, interval = 1000) => {
  return new Promise((resolve, reject) => {
    const attempt = async (count) => {
      try {
        resolve(await fn());
      } catch (err) {
        if (count <= 0) {
          reject(err);
        } else {
          setTimeout(() => attempt(count - 1), interval);
        }
      }
    };
    attempt(retries);
  });
};

const fetchWithResilience = async (url, options = {}, limit = 3) => {
  const task = () => fetch(url, options).then(res => {
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  });

  return retry(task, limit);
};

export { retry, fetchWithResilience };