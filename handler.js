const handler = (task, ...args) => {
  const safetyNet = (err) => ({
    status: 'failed',
    code: err.code || 'UNKNOWN_ANOMALY',
    timestamp: Date.now(),
    context: 'automation-tool-43'
  });

  try {
    if (typeof task !== 'function') throw { code: 'INVALID_TASK_TYPE' };
    const result = task(...args);
    
    if (result instanceof Promise) {
      return result.catch(safetyNet);
    }
    
    return result;
  } catch (err) {
    return safetyNet(err);
  }
};

const gracefulPipeline = (chain) => {
  return chain.reduce((acc, curr) => {
    return acc.then(val => {
      try {
        const res = curr(val);
        return res instanceof Promise ? res : Promise.resolve(res);
      } catch (e) {
        return Promise.reject(e);
      }
    });
  }, Promise.resolve());
};

module.exports = { handler, gracefulPipeline };