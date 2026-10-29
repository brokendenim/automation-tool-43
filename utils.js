function* jitteredExponentialBackoff(baseMs = 100, maxMs = 5000, factor = 2) {
  let current = baseMs;
  while (true) {
    const jitter = Math.random() * current * 0.5;
    yield Math.min(maxMs, current + jitter);
    current *= factor;
  }
}

export async function executeWithRetry(asyncTask, options = {}) {
  const {
    maxAttempts = 5,
    backoffGenerator = jitteredExponentialBackoff,
    shouldRetry = () => true,
    onRetry = null
  } = options;

  const delaySequence = backoffGenerator();
  let lastError;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await asyncTask(attempt);
    } catch (error) {
      lastError = error;
      if (attempt === maxAttempts || !shouldRetry(error)) {
        break;
      }

      const delay = delaySequence.next().value;
      if (typeof onRetry === 'function') {
        onRetry({ attempt, error, nextDelayMs: Math.round(delay) });
      }

      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  const errorMsg = lastError?.message || String(lastError);
  throw new Error(`Operation failed after ${maxAttempts} attempts: ${errorMsg}`);
}

export function createRetryProxy(targetObj, defaultRetryOptions = {}) {
  return new Proxy(targetObj, {
    get(target, propKey) {
      const origMethod = target[propKey];
      if (typeof origMethod !== 'function') return origMethod;

      return function (...args) {
        return executeWithRetry(
          () => origMethod.apply(target, args),
          defaultRetryOptions
        );
      };
    }
  });
}