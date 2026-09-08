/**
 * Core performance engine using structural hash memoization
 * and a tick-based generational cache pruner.
 */
class CoreOptimizer {
  constructor(retentionCycles = 4) {
    this.store = new Map();
    this.cycle = 0;
    this.retentionCycles = retentionCycles;
  }

  hashKey(action, payload) {
    const repr = `${action.name}:${JSON.stringify(payload)}`;
    let h = 0x811c9dc5;
    for (let i = 0; i < repr.length; i++) {
      h ^= repr.charCodeAt(i);
      h += (h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24);
    }
    return h >>> 0;
  }

  async memoize(action, payload) {
    const key = this.hashKey(action, payload);
    const cached = this.store.get(key);

    if (cached) {
      cached.cycle = this.cycle;
      return cached.result;
    }

    const promise = Promise.resolve().then(() => action(payload));
    this.store.set(key, { result: promise, cycle: this.cycle });

    try {
      return await promise;
    } catch (err) {
      this.store.delete(key);
      throw err;
    }
  }

  gc() {
    this.cycle++;
    for (const [key, entry] of this.store.entries()) {
      if (this.cycle - entry.cycle >= this.retentionCycles) {
        this.store.delete(key);
      }
    }
  }

  batchProcess(jobs) {
    return Promise.all(jobs.map(({ action, payload }) => this.memoize(action, payload)));
  }
}

module.exports = { CoreOptimizer };