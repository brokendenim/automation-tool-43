const registry = new Map();

const execute = async (task, payload) => {
  const handler = registry.get(task);
  if (!handler) throw new Error(`Task ${task} unregistered`);
  return handler(payload);
};

const register = (tasks) => Object.entries(tasks).forEach(([k, v]) => registry.set(k, v));

const pipeline = (fns) => (input) => fns.reduce((acc, fn) => acc.then(fn), Promise.resolve(input));

const logger = (level) => (msg) => console.log(`[${level.toUpperCase()}] ${new Date().toISOString()}: ${msg}`);

const initAutomation = (config) => {
  const log = logger(config.debug ? 'debug' : 'info');
  log('initializing automation-tool-43 engine');

  return {
    process: async (taskName, data) => {
      try {
        const result = await execute(taskName, data);
        log(`success: ${taskName}`);
        return result;
      } catch (e) {
        log(`failure: ${e.message}`);
        return null;
      }
    },
    register
  };
};

module.exports = { initAutomation, pipeline };