class TaskScheduler {
  #cache = new Map();
  #queue = [];
  #isProcessing = false;
  #batchSize = 16;

  constructor(targetFps = 60) {
    this.frameBudget = 1000 / targetFps;
  }

  memoize(key, computeFn) {
    if (this.#cache.has(key)) {
      return Promise.resolve(this.#cache.get(key));
    }
    return new Promise((resolve, reject) => {
      this.#queue.push({ key, computeFn, resolve, reject });
      this.#schedule();
    });
  }

  #schedule() {
    if (this.#isProcessing) return;
    this.#isProcessing = true;
    queueMicrotask(() => this.#processBatch());
  }

  #processBatch() {
    const start = performance.now();
    let processed = 0;

    while (this.#queue.length > 0 && processed < this.#batchSize) {
      const task = this.#queue.shift();
      try {
        const result = task.computeFn();
        this.#cache.set(task.key, result);
        task.resolve(result);
      } catch (err) {
        task.reject(err);
      }
      processed++;

      if (performance.now() - start > this.frameBudget) {
        this.#batchSize = Math.max(1, Math.floor(this.#batchSize * 0.8));
        break;
      }
    }

    if (performance.now() - start < this.frameBudget / 2) {
      this.#batchSize = Math.min(1024, Math.ceil(this.#batchSize * 1.25));
    }

    this.#isProcessing = false;
    if (this.#queue.length > 0) {
      setTimeout(() => this.#schedule(), 0);
    }
  }

  clearCache() {
    this.#cache.clear();
  }
}

module.exports = { TaskScheduler };