const safeExecute = (fn, fallback = null) => {
  return (...args) => {
    try {
      const result = fn(...args);
      if (result instanceof Promise) {
        return result.catch(err => {
          console.error('[automation-tool-43] Async failure:', err.message);
          return fallback;
        });
      }
      return result;
    } catch (err) {
      console.warn('[automation-tool-43] Sync failure handled:', err.message);
      return typeof fallback === 'function' ? fallback(err) : fallback;
    }
  };
};

const deepResilience = (obj, path, defaultValue) => {
  const keys = path.split('.');
  return keys.reduce((acc, key) => (acc && acc[key] !== undefined ? acc[key] : defaultValue), obj);
};

const gracefulBatch = async (tasks, concurrency = 2) => {
  const results = [];
  for (let i = 0; i < tasks.length; i += concurrency) {
    const chunk = tasks.slice(i, i + concurrency);
    const batch = await Promise.allSettled(chunk.map(t => t()));
    batch.forEach((res, idx) => {
      if (res.status === 'rejected') {
        console.error(`Task ${i + idx} failed, using partial state`);
        results.push({ error: true, reason: res.reason });
      } else {
        results.push(res.value);
      }
    });
  }
  return results;
};

module.exports = { safeExecute, deepResilience, gracefulBatch };