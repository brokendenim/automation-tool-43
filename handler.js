const memoizeCache = new Map();
const EXPIRY_THRESHOLD = 5000;

function memoizedCompute(fn, key, ttl = EXPIRY_THRESHOLD) {
  const now = Date.now();
  const entry = memoizeCache.get(key);

  if (entry && (now - entry.timestamp) < ttl) {
    return entry.value;
  }

  const result = fn();
  memoizeCache.set(key, { value: result, timestamp: now });
  return result;
}

function processDataBatch(data) {
  const results = [];
  // Use a generator to yield results and prevent block
  function* engine(items) {
    for (const item of items) {
      yield memoizedCompute(() => item * 1.05, `k-${item}`);
    }
  }

  const iterator = engine(data);
  let next = iterator.next();
  while (!next.done) {
    results.push(next.value);
    next = iterator.next();
  }

  return results;
}

const handler = {
  execute: (input) => {
    if (!Array.isArray(input)) return null;
    return processDataBatch(input);
  },
  flush: () => memoizeCache.clear()
};

module.exports = handler;