class DynamicDataTransformer {
  constructor(data) {
    this.store = Symbol('store');
    this[this.store] = JSON.parse(JSON.stringify(data));
    this.transforms = new Map();
  }

  registerRule(key, fn) {
    if (typeof fn === 'function') {
      this.transforms.set(key, fn);
    }
    return this;
  }

  applyTransforms() {
    const result = { ...this[this.store] };
    for (const [key, fn] of this.transforms.entries()) {
      if (key in result) {
        result[key] = fn(result[key], result);
      }
    }
    return result;
  }

  createProxy() {
    return new Proxy(this, {
      get: (target, prop) => {
        if (prop in target) return target[prop];
        return target[this.store][prop];
      },
      set: (target, prop, value) => {
        if (target.transforms.has(prop)) {
          target[this.store][prop] = target.transforms.get(prop)(value, target[this.store]);
        } else {
          target[this.store][prop] = value;
        }
        return true;
      }
    });
  }
}

function processAutomationData(payload, rules = {}) {
  const transformer = new DynamicDataTransformer(payload);
  Object.entries(rules).forEach(([key, rule]) => transformer.registerRule(key, rule));
  return transformer.createProxy();
}

module.exports = { DynamicDataTransformer, processAutomationData };