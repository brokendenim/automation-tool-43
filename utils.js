function* fibonacciJitterGenerator(maxRetries) {
  let a = 1, b = 1;
  for (let i = 0; i < maxRetries; i++) {
    const jitter = Math.random() * 0.3 + 0.85;
    yield Math.floor(a * 100 * jitter);
    [a, b] = [b, a + b];
  }
}

async function withResilientRetry(fn, options = {}) {
  const {
    maxRetries = 5,
    shouldRetry = (err) => err?.status !== 404,
    onRetry = () => {}
  } = options;

  const delayGen = fibonacciJitterGenerator(maxRetries);
  let attempt = 0;

  while (true) {
    try {
      return await fn({ attempt });
    } catch (error) {
      attempt++;
      const nextDelay = delayGen.next();

      if (nextDelay.done || !shouldRetry(error)) {
        throw error;
      }

      const delayMs = nextDelay.value;
      onRetry(error, attempt, delayMs);
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
}

function createRetryProxy(targetObj, methodNames, retryOptions = {}) {
  return new Proxy(targetObj, {
    get(target, prop, receiver) {
      const origMethod = Reflect.get(target, prop, receiver);
      if (typeof origMethod === 'function' && methodNames.includes(prop)) {
        return (...args) => withResilientRetry(() => origMethod.apply(target, args), retryOptions);
      }
      return origMethod;
    }
  });
}

module.exports = { withResilientRetry, createRetryProxy };