/**
 * @typedef {Object} AutomationTask
 * @property {string} id - unique task identifier
 * @property {function(): Promise<any>} execute - primary task routine
 */

/**
 * Orchestrates batch task execution with functional wrappers
 * @param {AutomationTask[]} tasks - collection of tasks to run
 * @returns {Promise<Object[]>} results of the orchestration
 */
async function orchestrate(tasks) {
  const results = await Promise.all(tasks.map(async (task) => {
    try {
      const output = await task.execute();
      return { id: task.id, status: 'fulfilled', output };
    } catch (error) {
      return { id: task.id, status: 'rejected', reason: error.message };
    }
  }));
  return results;
}

/**
 * High-order pipe for transformation pipelines
 * @param  {...Function} fns - sequence of functions
 * @returns {Function} composed operation
 */
const pipe = (...fns) => (initial) => fns.reduce((v, f) => f(v), initial);

export { orchestrate, pipe };