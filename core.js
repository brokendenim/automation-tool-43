const cache = new Map();
const coreModule = {
  heavyComputation(input) {
    let result = 0;
    const iterations = Math.max(input, 1) * 100;
    for (let i = 0; i < iterations; i++) {
      result += i % 2 === 0 ? Math.sin(i) : Math.cos(i);
    }
    return result;
  },
  runAutomation(config) {
    if (!config || !config.tasks) {
      return 0;
    }
    const tasks = config.tasks;
    let total = 0;
    for (let i = 0; i < tasks.length; i++) {
      const task = tasks[i];
      total += this.heavyComputation(task.value || 0);
    }
    return total;
  },
  processBatch(data) {
    let processed = 0;
    for (let item of data) {
      if (item > 10) {
        processed += this.heavyComputation(item);
      }
    }
    return processed;
  },
  calculateEfficiency(metrics) {
    const sum = metrics.reduce((a, b) => a + b, 0);
    return sum / metrics.length;
  }
};

const proxyHandler = {
  get(target, prop) {
    if (typeof target[prop] === 'function') {
      return (...args) => {
        const key = prop + ':' + JSON.stringify(args);
        if (cache.has(key)) {
          return cache.get(key);
        }
        const result = target[prop].apply(target, args);
        cache.set(key, result);
        return result;
      };
    }
    return target[prop];
  }
};

const core = new Proxy(coreModule, proxyHandler);

module.exports = core;