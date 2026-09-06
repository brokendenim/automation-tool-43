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

const computeQueue = new Set();
const executeBatch = (tasks) => {
  const results = Array.from(tasks).map((t) => t());
  tasks.clear();
  return results;
};

const scheduler = {
  schedule: (task) => computeQueue.add(task),
  flush: () => {
    if (computeQueue.size > 0) {
      return executeBatch(computeQueue);
    }
    return [];
  }
};

const processCore = memoize((data) => {
  return data.map(item => ({ ...item, processed: true, ts: Date.now() }));
});

export const coreModule = {
  process: (input) => processCore(input),
  queueTask: scheduler.schedule,
  drain: scheduler.flush
};