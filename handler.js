class AutomationHandler {
  constructor(context = {}) {
    this.context = { ...context, initializedAt: Date.now() };
    this.registry = new Map();
  }

  register(name, fn) {
    this.registry.set(name, fn);
    return this;
  }

  get execute() {
    return new Proxy({}, {
      get: (_, actionName) => {
        return async (...args) => {
          const task = this.registry.get(actionName);
          if (!task) {
            throw new Error(`Task '${actionName}' is not registered`);
          }
          const result = await task(this.context, ...args);
          this.context[actionName] = result;
          return result;
        };
      }
    });
  }

  purge() {
    const structuralKeys = ['initializedAt'];
    Object.keys(this.context).forEach((key) => {
      if (!structuralKeys.includes(key)) {
        delete this.context[key];
      }
    });
    return this;
  }
}

module.exports = { AutomationHandler };