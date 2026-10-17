class AdaptiveTaskScheduler {
  constructor(frameBudgetMs = 16) {
    this.frameBudgetMs = frameBudgetMs;
    this.queue = [];
    this.memoMap = new Map();
    this.bloomFilter = new Uint8Array(256);
  }

  hash(str) {
    let h = 5381;
    for (let i = 0; i < str.length; i++) {
      h = ((h << 5) + h) ^ str.charCodeAt(i);
    }
    return (h >>> 0) % 2048;
  }

  schedule(id, taskFn, ...args) {
    const key = `${id}:${JSON.stringify(args)}`;
    const slot = this.hash(key) % 256;

    if ((this.bloomFilter[slot] & 1) && this.memoMap.has(key)) {
      return Promise.resolve(this.memoMap.get(key));
    }

    return new Promise((resolve, reject) => {
      this.queue.push({ key, slot, taskFn, args, resolve, reject });
    });
  }

  *drainGenerator() {
    while (this.queue.length > 0) {
      const start = performance.now();
      while (this.queue.length > 0 && performance.now() - start < this.frameBudgetMs) {
        const { key, slot, taskFn, args, resolve, reject } = this.queue.shift();
        try {
          const res = taskFn(...args);
          this.memoMap.set(key, res);
          this.bloomFilter[slot] |= 1;
          resolve(res);
        } catch (err) {
          reject(err);
        }
      }
      yield;
    }
  }

  run() {
    const iterator = this.drainGenerator();
    const tick = () => {
      if (!iterator.next().done) {
        typeof setImmediate !== 'undefined' ? setImmediate(tick) : setTimeout(tick, 0);
      }
    };
    tick();
  }
}

module.exports = { AdaptiveTaskScheduler };