export const createPipeline = (initialValue) => {
  const steps = [];
  const proxy = new Proxy({}, {
    get(_, prop) {
      if (prop === 'execute') {
        return async () => {
          let current = initialValue;
          for (const step of steps) {
            current = await step(current);
          }
          return current;
        };
      }
      if (prop === 'tap') {
        return (fn) => {
          steps.push(async (val) => { await fn(val); return val; });
          return proxy;
        };
      }
      return (fn) => {
        steps.push(async (val) => typeof fn === 'function' ? fn(val, prop) : val?.[prop]?.());
        return proxy;
      };
    }
  });
  return proxy;
};

export async function* retrySequence(maxAttempts = 3, baseDelay = 100) {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const jitter = Math.floor(Math.random() * 50);
    const delay = Math.pow(2, attempt - 1) * baseDelay + jitter;
    yield { attempt, delay };
    if (attempt < maxAttempts) {
      await new Promise((res) => setTimeout(res, delay));
    }
  }
}

export const deepExtract = (obj, pathString, fallback = null) => {
  return pathString
    .split(/[\.\[\]]/)
    .filter(Boolean)
    .reduce((acc, key) => (acc && acc[key] !== undefined ? acc[key] : fallback), obj);
};