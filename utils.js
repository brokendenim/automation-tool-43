function* fibonacciJitterBackoff(baseMs = 100, maxMs = 10000) {
  let prev = 0;
  let curr = 1;
  while (true) {
    const next = prev + curr;
    prev = curr;
    curr = next;
    const rawDelay = Math.min(curr * baseMs, maxMs);
    const jitter = rawDelay * (Math.random() * 0.5 - 0.25);
    yield Math.max(0, Math.floor(rawDelay + jitter));
  }
}

export async function retryNetworkOp(task, options = {}) {
  const {
    maxAttempts = 5,
    baseMs = 200,
    maxMs = 8000,
    shouldRetry = (err) => err?.status >= 500 || err?.code === 'ECONNRESET' || !err?.status,
    onRetry = () => {}
  } = options;

  const backoffStream = fibonacciJitterBackoff(baseMs, maxMs);
  let attempt = 0;

  while (true) {
    attempt++;
    try {
      return await task({ attempt });
    } catch (error) {
      if (attempt >= maxAttempts || !shouldRetry(error)) {
        throw error;
      }
      const delay = backoffStream.next().value;
      onRetry(error, attempt, delay);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
}

export function createResilientFetch(defaultOptions = {}) {
  return (url, init = {}) => {
    return retryNetworkOp(
      async () => {
        const response = await fetch(url, init);
        if (!response.ok && response.status >= 500) {
          const err = new Error(`HTTP error ${response.status}`);
          err.status = response.status;
          throw err;
        }
        return response;
      },
      defaultOptions
    );
  };
}