function* fibonacciJitter(baseMs = 100) {
  let [a, b] = [1, 1];
  while (true) {
    const jitter = Math.floor(Math.random() * 50);
    yield a * baseMs + jitter;
    [a, b] = [b, a + b];
  }
}

export async function executeWithRetry(asyncFn, options = {}) {
  const {
    maxAttempts = 5,
    retryIf = () => true,
    delayStrategy = fibonacciJitter(150),
    onRetry = null
  } = options;

  let lastError;
  const history = [];

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const result = await asyncFn(attempt, history);
      return { success: true, attempts: attempt, data: result, history };
    } catch (error) {
      lastError = error;
      history.push({ attempt, error, timestamp: Date.now() });

      if (attempt === maxAttempts || !retryIf(error)) {
        break;
      }

      const waitMs = delayStrategy.next().value;
      if (typeof onRetry === 'function') {
        onRetry(error, attempt, waitMs);
      }

      await new Promise((resolve) => setTimeout(resolve, waitMs));
    }
  }

  return { success: false, attempts: maxAttempts, error: lastError, history };
}

export function createRetryProxy(targetObj, retryOptions = {}) {
  return new Proxy(targetObj, {
    get(target, propKey) {
      const orig = target[propKey];
      if (typeof orig !== 'function') return orig;
      return (...args) => executeWithRetry(() => orig.apply(target, args), retryOptions);
    }
  });
}