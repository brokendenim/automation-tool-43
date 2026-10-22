const validator = (input) => {
  const rules = {
    id: (v) => typeof v === 'number' && v > 0,
    task: (v) => typeof v === 'string' && v.length > 3,
    priority: (v) => ['low', 'mid', 'high'].includes(v)
  };
  return Object.entries(rules).every(([key, check]) => check(input[key]));
};

const processQueue = (items) => {
  console.log(`[automation-tool-43] processing ${items.length} items`);
  
  const results = items.map((item, idx) => {
    try {
      if (!validator(item)) throw new Error(`malformed entry at index ${idx}`);
      return { status: 'success', id: item.id };
    } catch (err) {
      console.error(`[validation-error] ${err.message}`);
      return { status: 'failed', reason: err.message };
    }
  });

  const stats = results.filter(r => r.status === 'success').length;
  console.log(`[summary] ${stats} items successfully processed`);
  return results;
};

module.exports = { processQueue };