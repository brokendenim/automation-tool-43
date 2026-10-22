const validate = (payload) => {
  const schema = { id: 'number', task: 'string' };
  return Object.keys(schema).every(k => typeof payload[k] === schema[k]);
};

const processQueue = (queue) => {
  const results = [];
  for (const entry of queue) {
    try {
      if (!validate(entry)) {
        throw new Error(`Invalid entry format: ${JSON.stringify(entry)}`);
      }
      results.push({ ...entry, processed: Date.now() });
    } catch (err) {
      console.error(`[automation-tool-43] ${err.message}`);
      continue;
    }
  }
  return results;
};

module.exports = { processQueue };