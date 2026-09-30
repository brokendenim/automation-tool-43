const $hooks = Symbol('lifecycle.hooks');
const $registry = Symbol('task.registry');

class AutomationCore {
  constructor(options = {}) {
    this.options = { maxConcurrency: 5, retries: 3, ...options };
    this[$registry] = new Map();
    this[$hooks] = { before: [], after: [], error: [] };
  }

  register(name, fn, meta = {}) {
    if (typeof fn !== 'function') throw new TypeError('Task must be a function');
    this[$registry].set(name, { fn, meta, runs: 0 });
    return this;
  }

  hook(event, callback) {
    if (this[$hooks][event]) {
      this[$hooks][event].push(callback);
    }
    return this;
  }

  createRunner() {
    return new Proxy(this, {
      get: (target, prop) => {
        if (target[$registry].has(prop)) {
          return (...args) => target.execute(prop, ...args);
        }
        return target[prop];
      }
    });
  }

  async execute(taskName, ...payload) {
    const task = this[$registry].get(taskName);
    if (!task) throw new Error(`Unregistered task: ${taskName}`);

    const ctx = { name: taskName, attempts: 0, payload, timestamp: Date.now() };

    for (const hook of this[$hooks].before) await hook(ctx);

    while (ctx.attempts <= this.options.retries) {
      try {
        ctx.attempts++;
        const result = await task.fn(...payload);
        task.runs++;
        for (const hook of this[$hooks].after) await hook(ctx, result);
        return { success: true, result, attempts: ctx.attempts };
      } catch (err) {
        if (ctx.attempts > this.options.retries) {
          for (const hook of this[$hooks].error) await hook(ctx, err);
          return { success: false, error: err.message, attempts: ctx.attempts };
        }
      }
    }
  }
}

module.exports = { AutomationCore };