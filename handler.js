const registry = new Map();

const execute = (task) => {
  const key = task.type || 'default';
  const handler = registry.get(key) || registry.get('fallback');
  return handler ? handler(task.payload) : null;
};

const register = (type, fn) => registry.set(type, fn);

const bootstrapper = (config = {}) => {
  const defaults = { log: true, retries: 3 };
  const settings = { ...defaults, ...config };
  
  register('init', () => console.log('system initialized'));
  register('fallback', (p) => ({ status: 'unhandled', data: p }));

  return {
    process: (tasks) => tasks.map(execute),
    config: Object.freeze(settings)
  };
};

export { bootstrapper, register };