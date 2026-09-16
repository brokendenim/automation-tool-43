const logger = require('./logger');

class AutomationHandler {
  #pipeline = new Map();
  #stats = Symbol('stats');

  constructor() {
    this[this.#stats] = { executed: 0, purged: 0 };
    return new Proxy(this, {
      get: (target, prop) => {
        if (prop in target || typeof prop === 'symbol') return target[prop];
        return (fn, opts = {}) => target.register(prop, fn, opts);
      }
    });
  }

  register(name, fn, { priority = 0, ttl = Infinity } = {}) {
    this.#pipeline.set(String(name), {
      fn,
      priority,
      expiresAt: ttl === Infinity ? Infinity : Date.now() + ttl,
      runs: 0
    });
    return this;
  }

  async dispatch(context = {}) {
    this.#purgeStale();
    const sorted = [...this.#pipeline.entries()]
      .sort(([, a], [, b]) => b.priority - a.priority);

    const results = [];
    for (const [name, task] of sorted) {
      try {
        const output = await task.fn(context);
        task.runs++;
        this[this.#stats].executed++;
        results.push({ name, status: 'fulfilled', output });
      } catch (error) {
        results.push({ name, status: 'rejected', reason: error.message });
      }
    }
    return results;
  }

  #purgeStale() {
    const now = Date.now();
    for (const [name, task] of this.#pipeline.entries()) {
      if (now > task.expiresAt) {
        this.#pipeline.delete(name);
        this[this.#stats].purged++;
      }
    }
  }

  get metrics() {
    return {
      activeTasks: this.#pipeline.size,
      ...this[this.#stats]
    };
  }
}

module.exports = { AutomationHandler };