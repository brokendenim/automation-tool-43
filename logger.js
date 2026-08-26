const createLogger = () => {
  const logLevels = { DEBUG: 0, INFO: 1, WARN: 2, ERROR: 3 };
  let currentLevel = logLevels.INFO;
  const logs = [];
  const formatMessage = (level, message, data) => {
    const time = new Date().toLocaleTimeString();
    let formatted = `${time} [${level}] ${message}`;
    if (data !== undefined) {
      formatted += ' ' + (typeof data === 'object' ? JSON.stringify(data) : data);
    }
    return formatted;
  };
  const log = (level, message, data) => {
    if (logLevels[level] < currentLevel) return;
    const entry = { timestamp: new Date(), level, message, data };
    logs.push(entry);
    if (logs.length > 100) logs.shift();
    const output = formatMessage(level, message, data);
    if (level === 'ERROR') {
      console.error(output);
    } else if (level === 'WARN') {
      console.warn(output);
    } else {
      console.log(output);
    }
  };
  return {
    setLevel(level) {
      if (logLevels[level] !== undefined) currentLevel = logLevels[level];
    },
    debug(msg, data) { log('DEBUG', msg, data); },
    info(msg, data) { log('INFO', msg, data); },
    warn(msg, data) { log('WARN', msg, data); },
    error(msg, data) { log('ERROR', msg, data); },
    logError(error, context) {
      const data = { message: error.message, stack: error.stack, context };
      log('ERROR', 'Error occurred', data);
    },
    batchLog(messages) {
      if (Array.isArray(messages)) {
        messages.forEach(m => {
          if (m.level && m.message) log(m.level, m.message, m.data);
        });
      }
    },
    logArray(arr, label = 'Array') {
      log('INFO', label, arr);
    },
    getHistory() { return logs.slice(); },
    clearHistory() { logs.length = 0; }
  };
};

const logger = createLogger();
module.exports = logger;