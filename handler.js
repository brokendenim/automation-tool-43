/**
 * Fluent lazy data handler using Proxies and Generators.
 * Allows deep dynamic path traversal with automatic fallback and batch mapping.
 */
class DynamicDataLens {
  constructor(target, fallback = null) {
    this._target = target;
    this._fallback = fallback;
    this._transforms = [];
  }

  pipe(fn) {
    this._transforms.push(fn);
    return this;
  }

  *evaluate(obj = this._target) {
    let current = obj;
    for (const transform of this._transforms) {
      if (current === undefined || current === null) break;
      current = transform(current);
    }
    if (current === undefined || current === null) {
      yield this._fallback;
    } else if (Array.isArray(current)) {
      yield* current;
    } else {
      yield current;
    }
  }

  static createProxy(data = {}) {
    const handler = {
      get(target, prop, receiver) {
        if (prop === 'unwrap') return () => target;
        if (prop === 'collect') return () => [...new DynamicDataLens(target).evaluate()];
        if (prop in target) {
          const value = Reflect.get(target, prop, receiver);
          return typeof value === 'object' && value !== null 
            ? DynamicDataLens.createProxy(value) 
            : value;
        }
        return DynamicDataLens.createProxy({});
      },
      set(target, prop, value) {
        const pathSegments = prop.toString().split('.');
        let current = target;
        for (let i = 0; i < pathSegments.length - 1; i++) {
          const key = pathSegments[i];
          if (!(key in current) || typeof current[key] !== 'object') {
            current[key] = {};
          }
          current = current[key];
        }
        current[pathSegments[pathSegments.length - 1]] = value;
        return true;
      }
    };
    return new Proxy(data, handler);
  }
}

function createDataHandler(initialState = {}) {
  const store = DynamicDataLens.createProxy(initialState);
  
  return {
    query: (path, defaultValue = undefined) => {
      const keys = String(path).split('.');
      let result = store;
      for (const key of keys) {
        result = result[key];
        if (result === undefined) return defaultValue;
      }
      return result.unwrap ? result.unwrap() : result;
    },
    mutate: (path, value) => {
      store[path] = value;
      return store;
    },
    process: (data, ...mappers) => {
      const lens = new DynamicDataLens(data);
      mappers.forEach(m => lens.pipe(m));
      return Array.from(lens.evaluate());
    }
  };
}

module.exports = { DynamicDataLens, createDataHandler };