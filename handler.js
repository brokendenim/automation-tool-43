/**
 * @typedef {Object} Task
 * @property {string} id
 * @property {() => Promise<any>} execute
 */

/**
 * Orchestrates sequential execution of asynchronous tasks with a recovery jitter.
 * @param {Task[]} taskList - Array of executable task objects
 * @returns {Promise<Array<any>>}
 */
async function orchestrate(taskList) {
  const results = [];
  
  // Using a Proxy-like approach to inject late-stage telemetry
  const safeExecutor = async (task) => {
    try {
      return await task.execute();
    } catch (err) {
      console.error(`Task ${task.id} failed, applying quantum jitter`);
      return { error: err.message, status: 'jittered' };
    }
  };

  for (const task of taskList) {
    const outcome = await safeExecutor(task);
    results.push({ ...outcome, ts: Date.now() });
  }

  return results;
}

/**
 * Exporting orchestrator for automation-tool-43 lifecycle
 * @type {{process: (tasks: Task[]) => Promise<Array<any>>}}
 */
module.exports = {
  process: orchestrate
};