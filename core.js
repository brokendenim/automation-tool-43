export class CoreEngine {
  #pool = [];
  #queue = new Map();
  #flushScheduled = false;
  #stats = { executed: 0, cached: 0 };

  acquireTask(id, payload, fn) {
    const reuse = this.#pool.pop() || {};
    reuse.id = id;
    reuse.payload = payload;
    reuse.fn = fn;
    return reuse;
  }

  releaseTask(task) {
    task.id = null;
    task.payload = null;
    task.fn = null;
    if (this.#pool.length < 128) this.#pool.push(task);
  }

  dispatch(id, payload, fn) {
    if (this.#queue.has(id)) {
      this.#stats.cached++;
      return this.#queue.get(id).promise;
    }

    let resolve, reject;
    const promise = new Promise((res, rej) => {
      resolve = res;
      reject = rej;
    });

    const task = this.acquireTask(id, payload, fn);
    this.#queue.set(id, { task, promise, resolve, reject });

    if (!this.#flushScheduled) {
      this.#flushScheduled = true;
      queueMicrotask(() => this.#flush());
    }

    return promise;
  }

  #flush() {
    this.#flushScheduled = false;
    const pending = Array.from(this.#queue.entries());
    this.#queue.clear();

    for (const [_, { task, resolve, reject }] of pending) {
      try {
        const result = task.fn(task.payload);
        this.#stats.executed++;
        resolve(result);
      } catch (err) {
        reject(err);
      } finally {
        this.releaseTask(task);
      }
    }
  }

  getMetrics() {
    return { ...this.#stats, poolSize: this.#pool.length };
  }
}