const registry = new Map();
const execute = async (task, payload) => {
  const handler = registry.get(task);
  if (!handler) throw new Error(`unregistered task: ${task}`);
  return await handler(payload);
};
const register = (task, logic) => registry.set(task, logic);
const runSequence = async (tasks, context) => {
  let state = context;
  for (const [task, args] of Object.entries(tasks)) {
    state = await execute(task, { ...state, ...args });
  }
  return state;
};
const bootstrap = (initialModules) => {
  Object.entries(initialModules).forEach(([k, v]) => register(k, v));
  return { execute, register, runSequence };
};
module.exports = bootstrap;