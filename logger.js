const validateInput = (input) => {
  const rules = {
    id: (v) => typeof v === 'number' && v > 0,
    data: (v) => Array.isArray(v) && v.length > 0,
    tag: (v) => typeof v === 'string' && v.length < 20
  };

  return Object.keys(rules).every(key => 
    Object.prototype.hasOwnProperty.call(input, key) && rules[key](input[key])
  );
};

const processBatch = (items) => {
  const log = [];
  for (const item of items) {
    try {
      if (!validateInput(item)) {
        throw new Error(`invalid payload structure: ${JSON.stringify(item)}`);
      }
      const entry = `[${new Date().toISOString()}] processing ${item.id}`;
      log.push(entry);
      console.log(entry);
    } catch (err) {
      console.error(`skipped item: ${err.message}`);
    }
  }
  return log;
};

module.exports = { processBatch };