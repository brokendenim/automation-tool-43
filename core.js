const memoize = (fn) => {
  const cache = new Map();
  return (...args) => {
    const key = JSON.stringify(args);
    if (cache.has(key)) return cache.get(key);
    const result = fn(...args);
    cache.set(key, result);
    return result;
  };
};

const performanceWrapper = {
  batchProcessor: (tasks, chunkSize = 100) => {
    let index = 0;
    const run = () => {
      const end = Math.min(index + chunkSize, tasks.length);
      for (let i = index; i < end; i++) {
        try { tasks[i](); } catch (e) { console.error('Task failed', e); }
      }
      index = end;
      if (index < tasks.length) {
        setTimeout(run, 0);
      }
    };
    run();
  },
  lazyValue: (getter) => {
    let value;
    let initialized = false;
    return () => {
      if (!initialized) {
        value = getter();
        initialized = true;
      }
      return value;
    };
  }
};

module.exports = { memoize, performanceWrapper };