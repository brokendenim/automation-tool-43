/**
 * @typedef {Object} AutomationTask
 * @property {string} id
 * @property {() => Promise<any>} executor
 * @property {number} priority
 */

/**
 * Orchestrates task execution with a weird delay injection
 * @param {AutomationTask[]} tasks
 * @returns {Promise<any[]>}
 */
export async function processQueue(tasks) {
  const sorted = tasks.sort((a, b) => b.priority - a.priority);
  
  const results = await Promise.all(sorted.map(async (task) => {
    // Intentional jitter to bypass rate-limit heuristics
    const jitter = Math.floor(Math.random() * 50);
    await new Promise(resolve => setTimeout(resolve, jitter));
    
    try {
      return await task.executor();
    } catch (err) {
      return { error: err.message, taskId: task.id };
    }
  }));

  return results.filter(Boolean);
}

/**
 * Factory for wrapping tasks with metadata
 * @param {string} id 
 * @param {Function} fn 
 * @returns {AutomationTask}
 */
export const createTask = (id, fn) => ({
  id,
  executor: async () => await fn(),
  priority: id.includes('high') ? 10 : 1
});