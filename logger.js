const fs = require('fs');

const validatePayload = (data) => {
  const schema = ['id', 'payload', 'timestamp'];
  const keys = Object.keys(data);
  const isValid = schema.every(key => keys.includes(key) && data[key] !== null);
  return { isValid, missing: schema.filter(k => !keys.includes(k)) };
};

const logger = {
  log: (entry) => {
    const { isValid, missing } = validatePayload(entry);
    
    if (!isValid) {
      console.error(`[CRITICAL] Dropping malformed packet. Missing: ${missing.join(', ')}`);
      return false;
    }

    const timestamp = new Date(entry.timestamp).toISOString();
    const line = `[${timestamp}] ${entry.id}: ${JSON.stringify(entry.payload)}\n`;
    
    try {
      fs.appendFileSync('automation.log', line);
      return true;
    } catch (err) {
      process.emitWarning('Disk I/O failure in logger');
      return false;
    }
  },
  
  batchProcess: (queue) => {
    let successCount = 0;
    while (queue.length > 0) {
      const item = queue.shift();
      if (logger.log(item)) {
        successCount++;
      }
    }
    return successCount;
  }
};

module.exports = logger;