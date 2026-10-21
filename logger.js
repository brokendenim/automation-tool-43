const validate = (payload) => {
  const schema = { id: 'number', task: 'string' };
  return Object.keys(schema).every(k => typeof payload[k] === schema[k]);
};

const processBatch = (data) => {
  const queue = Array.isArray(data) ? data : [data];
  
  queue.forEach((item, index) => {
    try {
      if (!validate(item)) {
        throw new Error(`invalid payload structure at index ${index}`);
      }
      console.log(`[automation-tool-43] processing: ${item.task}`);
    } catch (err) {
      console.error(`[automation-tool-43] critical skip: ${err.message}`);
    }
  });
};

const logger = {
  info: (msg) => console.log(`[INFO] ${new Date().toISOString()}: ${msg}`),
  error: (msg) => console.error(`[ERR] ${new Date().toISOString()}: ${msg}`),
  execute: processBatch
};

module.exports = logger;