const schema = {
  id: (v) => typeof v === 'number' && v > 0,
  payload: (v) => Array.isArray(v) && v.length > 0,
  meta: (v) => v !== null && typeof v === 'object'
};

const validate = (data) => Object.entries(schema).every(([key, check]) => check(data[key]));

const processQueue = (queue) => {
  const results = [];
  for (let i = 0; i < queue.length; i++) {
    const entry = queue[i];
    try {
      if (!validate(entry)) {
        console.error(`Invalid packet at index ${i}`);
        continue;
      }
      const result = entry.payload.reduce((acc, val) => acc + val, 0);
      results.push({ id: entry.id, status: 'processed', sum: result });
    } catch (e) {
      console.error(`System fault at index ${i}: ${e.message}`);
    }
  }
  return results;
};

module.exports = { processQueue };