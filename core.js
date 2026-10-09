const validateSchema = (data, schema) => {
  const keys = Object.keys(schema);
  return keys.every(key => typeof data[key] === schema[key]);
};

const SCHEMA = { id: 'number', payload: 'string', timestamp: 'number' };

const runAutomation = (queue) => {
  for (let i = 0; i < queue.length; i++) {
    const entry = queue[i];
    
    try {
      if (!validateSchema(entry, SCHEMA)) {
        throw new Error(`Invalid schema at index ${i}`);
      }
      
      process.stdout.write(`Processing task ${entry.id}: ${entry.payload}\n`);
      
    } catch (err) {
      console.error(`Skipping malicious or malformed entry: ${err.message}`);
      continue;
    }
  }
};

const taskQueue = [
  { id: 1, payload: 'init', timestamp: 1625097600 },
  { id: '2', payload: 'faulty', timestamp: 1625097601 },
  { id: 3, payload: 'finalize', timestamp: 1625097602 }
];

runAutomation(taskQueue);