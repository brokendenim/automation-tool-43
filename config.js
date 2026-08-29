'use strict';

function createConfigLoader(defaults = {}) {
  let config = Object.assign({}, defaults);

  const proxyHandler = {
    get(target, prop) {
      if (prop in target) {
        return target[prop];
      }
      if (prop in defaults) {
        return defaults[prop];
      }
      return undefined;
    },

    set(target, prop, value) {
      target[prop] = value;
      return true;
    }
  };

  let configProxy = new Proxy(config, proxyHandler);

  function merge(overrides) {
    if (typeof overrides === 'string') {
      try {
        overrides = JSON.parse(overrides);
      } catch (err) {
        overrides = {};
      }
    }
    if (typeof overrides !== 'object' || overrides === null) {
      overrides = {};
    }
    config = Object.assign({}, config, overrides);
    configProxy = new Proxy(config, proxyHandler);
    return loader;
  }

  function getNested(path) {
    const keys = path.split('.');
    let current = configProxy;
    for (const key of keys) {
      current = current[key];
      if (current === undefined) {
        return undefined;
      }
    }
    return current;
  }

  const loader = {
    load: merge,
    get(key) {
      return configProxy[key];
    },
    set(key, value) {
      configProxy[key] = value;
    },
    all() {
      return Object.assign({}, config);
    },
    reset() {
      config = Object.assign({}, defaults);
      configProxy = new Proxy(config, proxyHandler);
    },
    getNested: getNested
  };

  return loader;
}

module.exports = createConfigLoader;