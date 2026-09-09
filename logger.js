const validate = (payload) => {
  const schema = { id: 'number', task: 'string' };
  return Object.entries(schema).every(([key, type]) => typeof payload[key] === type);
};

const processQueue = (data) => {
  const results = [];
  for (const entry of data) {
    try {
      if (!validate(entry)) {
        throw new Error(`invalid schema on item: ${entry.id || 'unknown'}`);
      }
      results.push({ ...entry, processed: true, timestamp: Date.now() });
    } catch (err) {
      console.error(`[automation-tool-43] validation failure: ${err.message}`);
    }
  }
  return results;
};

module.exports = { processQueue };