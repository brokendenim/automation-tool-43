/**
 * Executes async network operations with exponential backoff and jitter.
 * Uses an async generator schedule stream and Proxy wrappers.
 */

async function* backoffSchedule(maxRetries = 3, initialDelay = 300, maxDelay = 5000) {
  let attempt = 0;
  while (attempt < maxRetries) {
    attempt++;
    const factor = Math.pow(2, attempt - 1);
    const jitter = Math.random() * 100;
    const delayMs = Math.min(initialDelay * factor + jitter, maxDelay);
    yield { attempt, delayMs };
  }
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export async function executeWithRetry(operation, options = {}) {
  const {
    maxRetries = 4,
    initialDelay = 250,
    maxDelay = 4000,
    onRetry = null,
    shouldRetry = () => true
  } = options;

  let lastError;
  const schedule = backoffSchedule(maxRetries, initialDelay, maxDelay);

  for await (const { attempt, delayMs } of schedule) {
    try {
      return await operation(attempt);
    } catch (error) {
      lastError = error;
      if (!shouldRetry(error) || attempt === maxRetries) {
        throw error;
      }
      if (typeof onRetry === 'function') {
        onRetry(error, attempt, delayMs);
      }
      await sleep(delayMs);
    }
  }

  throw lastError || new Error('Operation failed after retries');
}

export function createRetryProxy(target, retryOptions = {}) {
  return new Proxy(target, {
    get(obj, prop) {
      const val = Reflect.get(obj, prop);
      if (typeof val !== 'function') return val;
      return (...args) => executeWithRetry(() => val.apply(obj, args), retryOptions);
    }
  });
}