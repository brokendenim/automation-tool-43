const _logLevels = { info: 1, warn: 2, error: 3, debug: 0 };
const _currentLevel = _logLevels[process.env.LOG_LEVEL?.toLowerCase()] || _logLevels.info;

function formatPayload(tag, data) {
  const timestamp = new Date().toISOString();
  const serialized = typeof data === 'object' ? JSON.stringify(data) : data;
  return `[${timestamp}] [${tag.toUpperCase()}] -> ${serialized}`;
}

const logger = new Proxy({}, {
  get(target, prop) {
    if (typeof prop === 'string' && prop in _logLevels) {
      return (tag, message) => {
        if (_logLevels[prop] >= _currentLevel) {
          const output = formatPayload(tag, message);
          if (prop === 'error') {
            console.error('\x1b[31m%s\x1b[0m', output);
          } else if (prop === 'warn') {
            console.warn('\x1b[33m%s\x1b[0m', output);
          } else {
            console.log('\x1b[36m%s\x1b[0m', output);
          }
        }
      };
    }
    return target[prop];
  }
});

module.exports = logger;