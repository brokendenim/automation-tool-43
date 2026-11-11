const validate = (data) => {
  const schema = { id: 'number', task: 'string' };
  return Object.keys(schema).every(key => typeof data[key] === schema[key]);
};

const processQueue = (queue) => {
  console.log('Initiating cycle');
  const results = [];
  
  for (let i = 0; i < queue.length; i++) {
    const entry = queue[i];
    
    try {
      if (!validate(entry)) {
        throw new Error(`invalid payload at index ${i}`);
      }
      
      const output = { ...entry, processed: true, timestamp: Date.now() };
      results.push(output);
      console.log(`success: ${entry.id}`);
    } catch (err) {
      console.error(`skipped index ${i}: ${err.message}`);
    }
  }
  return results;
};

const automationTool43 = {
  run: (payloads) => processQueue(payloads)
};

module.exports = automationTool43;