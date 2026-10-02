const utils = {
  pipe: (...fns) => (x) => fns.reduce((v, f) => f(v), x),
  memoize: (fn) => {
    const cache = new Map();
    return (...args) => {
      const key = JSON.stringify(args);
      if (cache.has(key)) return cache.get(key);
      const result = fn(...args);
      cache.set(key, result);
      return result;
    };
  },
  debounce: (fn, delay) => {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), delay);
    };
  },
  randomId: (len = 16) => [...Array(len)].map(() => Math.floor(Math.random() * 16).toString(16)).join(''),
  retry: async (fn, attempts = 3) => {
    for (let i = 0; i < attempts; i++) {
      try {
        return await fn();
      } catch (e) {
        if (i === attempts - 1) throw e;
        await new Promise(r => setTimeout(r, 100 * (i + 1)));
      }
    }
  },
  deepClone: (obj) => JSON.parse(JSON.stringify(obj)),
  toggle: (val) => !val
};

module.exports = utils;