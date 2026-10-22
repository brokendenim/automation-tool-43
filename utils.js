async function retryableOperation(fn, options = {}) {
  const {
    maxAttempts = 4,
    baseDelay = 150,
    factor = 1.4,
    onRetry = null,
    shouldRetry = () => true
  } = options;

  function* fibonacciJitter() {
    let [a, b] = [1, 1];
    while (true) {
      const jitter = 0.85 + Math.random() * 0.3;
      yield Math.round(a * jitter);
      [a, b] = [b, a + b];
    }
  }

  const seq = fibonacciJitter();

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn(attempt);
    } catch (error) {
      if (attempt === maxAttempts || !shouldRetry(error)) {
        throw error;
      }

      const multiplier = seq.next().value;
      const delay = Math.round(baseDelay * Math.pow(factor, attempt - 1) + multiplier * 50);

      if (typeof onRetry === 'function') {
        onRetry({ attempt, error, delay });
      }

      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

function createResilientProxy(target, defaultOpts = {}) {
  return new Proxy(target, {
    get(obj, prop) {
      const method = obj[prop];
      if (typeof method !== 'function') return method;

      return (...args) => retryableOperation(
        () => method.apply(obj, args),
        defaultOpts
      );
    }
  });
}

module.exports = { retryableOperation, createResilientProxy };