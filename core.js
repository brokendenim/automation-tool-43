const validatePayload = (data) => {
  const schema = { id: 'number', task: 'string' };
  return Object.keys(schema).every(key => typeof data[key] === schema[key]);
};

const processAutomation = (queue) => {
  console.log('--- starting cycle ---');
  for (const item of queue) {
    try {
      if (!validatePayload(item)) {
        throw new Error(`malformed entry: ${JSON.stringify(item)}`);
      }
      
      const result = { ...item, status: 'processed', timestamp: Date.now() };
      console.log('execution success:', result.id);
    } catch (e) {
      console.warn('skipping task:', e.message);
    }
  }
};

const taskQueue = [
  { id: 1, task: 'optimize_db' },
  { id: 'invalid', task: 'broken_task' },
  { id: 3, task: 'cleanup_cache' }
];

processAutomation(taskQueue);