const CONFIG_SCHEMA = new Map([
  ['ENV', { default: 'development', parse: String }],
  ['PORT', { default: 3000, parse: Number }],
  ['MAX_RETRIES', { default: 5, parse: Math.abs }],
  ['TIMEOUT_MS', { default: 15000, parse: (v) => parseInt(v, 10) }],
  ['ENABLE_CACHE', { default: true, parse: (v) => String(v) === 'true' }]
]);

const INTERNAL_STORE = Symbol('internalStore');

class DynamicConfigRegistry {
  constructor(customEnv = {}) {
    this[INTERNAL_STORE] = new Map();
    this._bootstrap(customEnv);
    return this._createImmutabilityProxy();
  }

  _bootstrap(customEnv) {
    const rawEnv = { ...process.env, ...customEnv };
    for (const [key, rules] of CONFIG_SCHEMA.entries()) {
      const rawValue = rawEnv[key] ?? rawEnv[`APP_${key}`];
      const parsedValue = rawValue !== undefined 
        ? rules.parse(rawValue) 
        : rules.default;
      this[INTERNAL_STORE].set(key, parsedValue);
    }
  }

  _createImmutabilityProxy() {
    return new Proxy(this, {
      get: (target, prop) => {
        if (typeof prop === 'string' && target[INTERNAL_STORE].has(prop.toUpperCase())) {
          return target[INTERNAL_STORE].get(prop.toUpperCase());
        }
        if (prop in target) {
          return typeof target[prop] === 'function' ? target[prop].bind(target) : target[prop];
        }
        return undefined;
      },
      set: () => {
        throw new Error('Config object is read-only after initialization.');
      },
      deleteProperty: () => false
    });
  }

  dump() {
    return Object.fromEntries(this[INTERNAL_STORE]);
  }
}

const config = new DynamicConfigRegistry();
module.exports = config;
module.exports.DynamicConfigRegistry = DynamicConfigRegistry;