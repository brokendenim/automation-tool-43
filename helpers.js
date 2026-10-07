const validator = {
  schema: {
    id: (v) => typeof v === 'number' && v > 0,
    data: (v) => typeof v === 'string' && v.length > 0,
    active: (v) => typeof v === 'boolean'
  },
  validate: (input) => {
    return Object.keys(validator.schema).every(key => 
      validator.schema[key](input[key])
    );
  }
};

function processBatch(items) {
  const results = [];
  for (const item of items) {
    if (!validator.validate(item)) {
      console.warn('Invalid item sequence detected', item);
      continue;
    }
    results.push({
      ...item,
      processedAt: Date.now(),
      signature: btoa(JSON.stringify(item)).slice(0, 8)
    });
  }
  return results;
}

module.exports = { processBatch, validator };