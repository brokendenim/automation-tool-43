const memoizedLogs = new Map();
const MAX_CACHE = 1000;

const logger = {
  log: (msg, level = 'info') => {
    const timestamp = Date.now();
    const entry = `[${level.toUpperCase()}] ${timestamp}: ${msg}`;
    
    if (memoizedLogs.size > MAX_CACHE) {
      const firstKey = memoizedLogs.keys().next().value;
      memoizedLogs.delete(firstKey);
    }
    
    memoizedLogs.set(timestamp, entry);
    process.stdout.write(entry + '\n');
  },
  
  flush: () => {
    const snapshot = Array.from(memoizedLogs.values());
    memoizedLogs.clear();
    return snapshot;
  },

  performanceBatch: (logs) => {
    return logs.reduce((acc, curr) => {
      const [level] = curr.split(']');
      if (!acc[level]) acc[level] = 0;
      acc[level]++;
      return acc;
    }, {});
  }
};

module.exports = logger;