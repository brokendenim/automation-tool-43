const validateSchema = (data, schema) => {
  const keys = Object.keys(schema);
  return keys.every(key => {
    const validator = schema[key];
    const value = data[key];
    return typeof value === validator || (validator instanceof RegExp && validator.test(value));
  });
};

const schema = {
  id: 'number',
  payload: /^[a-z0-9]+$/i,
  status: 'string'
};

async function processQueue(items) {
  for (const item of items) {
    try {
      if (!validateSchema(item, schema)) {
        throw new Error(`Invalid schema for item: ${item.id}`);
      }
      
      console.log(`Processing: ${item.payload}`);
      await new Promise(resolve => setTimeout(resolve, 50));
    } catch (err) {
      console.error(`Skipping batch due to: ${err.message}`);
      continue;
    }
  }
}

const dataPool = [
  { id: 1, payload: 'abc123', status: 'ready' },
  { id: 2, payload: '!!!', status: 'error' },
  { id: 3, payload: 'xyz789', status: 'ready' }
];

processQueue(dataPool);