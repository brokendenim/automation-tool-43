/**
 * Core automation task pipeline optimizer using a ring-buffer cache
 * and auto-flushing microtask queue.
 */
class TaskCore {
  constructor(capacity = 64) {
    this.capacity = capacity;
    this.cacheKeys = new Array(capacity);
    this.cacheVals = new Array(capacity);
    this.queue = [];
    this.scheduled = false;
  }

  _hash(str) {
    let h = 5381;
    for (let i = 0; i < str.length; i++) {
      h = ((h << 5) + h) ^ str.charCodeAt(i);
    }
    return (h >>> 0) % this.capacity;
  }

  memoize(key, computeFn) {
    const idx = this._hash(key);
    if (this.cacheKeys[idx] === key) {
      return this.cacheVals[idx];
    }
    const result = computeFn();
    this.cacheKeys[idx] = key;
    this.cacheVals[idx] = result;
    return result;
  }

  enqueue(taskFn) {
    return new Promise((resolve, reject) => {
      this.queue.push({ taskFn, resolve, reject });
      if (!this.scheduled) {
        this.scheduled = true;
        queueMicrotask(() => this._flush());
      }
    });
  }

  _flush() {
    const batch = this.queue.splice(0, this.queue.length);
    this.scheduled = false;
    
    for (let i = 0; i < batch.length; i++) {
      const { taskFn, resolve, reject } = batch[i];
      try {
        resolve(taskFn());
      } catch (err) {
        reject(err);
      }
    }
  }

  purgeCache() {
    this.cacheKeys.fill(undefined);
    this.cacheVals.fill(undefined);
  }
}

module.exports = TaskCore;