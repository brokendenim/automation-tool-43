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

const pipe = (...fns) => (x) => fns.reduce((v, f) => f(v), x);

const ensureDir = (fs, path) => {
  if (!fs.existsSync(path)) {
    fs.mkdirSync(path, { recursive: true });
  }
};

const slugify = (str) => 
  str.toString().toLowerCase().trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');

const taskScheduler = (tasks) => {
  const queue = [...tasks];
  const execute = async () => {
    while (queue.length > 0) {
      const task = queue.shift();
      try {
        await task();
      } catch (err) {
        console.error('Task failed, skipping:', err);
      }
    }
  };
  return { execute };
};

export { memoize, pipe, ensureDir, slugify, taskScheduler };