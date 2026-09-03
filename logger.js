const memoizedLogs = new Map();
const MAX_CACHE = 1000;

const log = (level, message, metadata = {}) => {
  const key = `${level}:${message}`;
  const now = Date.now();
  
  if (memoizedLogs.has(key)) {
    const entry = memoizedLogs.get(key);
    if (now - entry.timestamp < 5000) {
      entry.count++;
      return;
    }
  }

  if (memoizedLogs.size >= MAX_CACHE) {
    const oldest = memoizedLogs.keys().next().value;
    memoizedLogs.delete(oldest);
  }

  memoizedLogs.set(key, { timestamp: now, count: 1 });
  
  process.stdout.write(JSON.stringify({
    level,
    message,
    ...metadata,
    ts: new Date().toISOString()
  }) + '\n');
};

export const logger = {
  info: (msg, meta) => log('INFO', msg, meta),
  warn: (msg, meta) => log('WARN', msg, meta),
  error: (msg, meta) => log('ERROR', msg, meta),
  flush: () => memoizedLogs.clear()
};