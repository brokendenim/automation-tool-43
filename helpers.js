/**
 * Resilient async call wrapper using Async Generator for stateful retry delays
 */
async function* retrySchedule(maxRetries = 3, baseDelayMs = 200, factor = 2) {
  let delay = baseDelayMs;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    yield { attempt, delay };
    const jitter = Math.random() * 0.3 * delay;
    delay = Math.round(delay * factor + jitter);
  }
}

export async function executeWithRetry(asyncOp, options = {}) {
  const {
    maxRetries = 4,
    initialDelay = 150,
    backoffFactor = 1.8,
    onRetry = null,
    shouldRetry = () => true
  } = options;

  let lastError;
  const schedule = retrySchedule(maxRetries, initialDelay, backoffFactor);

  for await (const { attempt, delay } of schedule) {
    try {
      return await asyncOp(attempt);
    } catch (err) {
      lastError = err;
      if (attempt === maxRetries || !shouldRetry(err)) {
        break;
      }
      if (typeof onRetry === 'function') {
        onRetry(err, attempt, delay);
      }
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw new Error(`Operation failed after ${maxRetries} attempts: ${lastError?.message || lastError}`);
}

export function createRetryProxy(targetObj) {
  return new Proxy(targetObj, {
    get(target, prop) {
      const original = target[prop];
      if (typeof original !== 'function') return original;

      return function (...args) {
        return executeWithRetry(() => original.apply(target, args));
      };
    }
  });
}