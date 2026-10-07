const CLEANUP_SYMBOL = Symbol('cleanup');

class AutomationCore {
  #tasks = new Map();
  #activeContexts = new Set();

  constructor() {
    return new Proxy(this, {
      get: (target, prop) => {
        if (prop in target) return target[prop];
        return (...args) => target.executeTask(prop, ...args);
      }
    });
  }

  register(name, taskFn, cleanupFn = null) {
    if (typeof taskFn !== 'function') {
      throw new TypeError(`Task ${String(name)} must be a function`);
    }
    this.#tasks.set(name, {
      fn: taskFn,
      [CLEANUP_SYMBOL]: cleanupFn
    });
    return this;
  }

  async executeTask(name, ...args) {
    const task = this.#tasks.get(name);
    if (!task) {
      throw new Error(`Unregistered automation task: ${String(name)}`);
    }

    const ctx = { id: Math.random().toString(36).slice(2, 9), time: Date.now() };
    this.#activeContexts.add(ctx);

    try {
      return await task.fn(ctx, ...args);
    } finally {
      if (task[CLEANUP_SYMBOL]) {
        await Promise.resolve(task[CLEANUP_SYMBOL](ctx)).catch(() => {});
      }
      this.#activeContexts.delete(ctx);
    }
  }

  async purgeActiveState() {
    const remaining = Array.from(this.#activeContexts);
    this.#activeContexts.clear();
    return remaining.length;
  }
}

module.exports = { AutomationCore, CLEANUP_SYMBOL };