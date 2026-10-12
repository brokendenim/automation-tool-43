const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function* fibonacciJitterSchedule(baseMs, jitterRatio = 0.25) {
  let [a, b] = [baseMs, baseMs * 2];
  while (true) {
    const jitter = (Math.random() * 2 - 1) * jitterRatio * a;
    yield Math.max(0, Math.floor(a + jitter));
    [a, b] = [b, a + b];
  }
}

export async function executeWithRetry(operation, options = {}) {
  const {
    maxRetries = 4,
    baseDelay = 150,
    shouldRetry = () => true,
    onAttemptFailed
  } = options;

  const schedule = fibonacciJitterSchedule(baseDelay);
  let attempt = 0;

  while (true) {
    attempt++;
    try {
      return await operation(attempt);
    } catch (error) {
      const hasAttemptsLeft = attempt <= maxRetries;
      const canRetry = shouldRetry(error);

      if (!hasAttemptsLeft || !canRetry) {
        throw new Error(`Execution permanently failed after ${attempt} attempt(s): ${error.message}`);
      }

      const delayMs = schedule.next().value;
      if (onAttemptFailed) {
        onAttemptFailed(error, attempt, delayMs);
      }

      await sleep(delayMs);
    }
  }
}

export function wrapNetworkClient(client, retryOpts = {}) {
  return new Proxy(client, {
    get(target, prop) {
      const value = target[prop];
      if (typeof value !== 'function') return value;
      return (...args) => executeWithRetry(() => value.apply(target, args), retryOpts);
    }
  });
}