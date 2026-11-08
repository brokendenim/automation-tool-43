const catchBoundary = (fn, fallback = null) => (...args) => {
  try {
    const result = fn(...args);
    if (result instanceof Promise) {
      return result.catch(err => {
        console.error('async failure:', err.message);
        return fallback;
      });
    }
    return result;
  } catch (err) {
    const faultCode = err.code || 'UNKNOWN_FAULT';
    const registry = {
      'ENOENT': () => console.warn('missing dependency encountered'),
      'TypeError': () => console.error('type mismatch in automation flow'),
      'default': () => console.error('unexpected crash:', err)
    };
    (registry[faultCode] || registry.default)();
    return typeof fallback === 'function' ? fallback(err) : fallback;
  }
};

const robustExecution = (tasks) => {
  return tasks.map(task => catchBoundary(task, (e) => ({
    status: 'failed',
    error: e.message,
    recovered: true
  })));
};

module.exports = { catchBoundary, robustExecution };