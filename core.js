/**
 * @typedef {Object} AutomationTask
 * @property {string} id
 * @property {function(): Promise<any>} action
 */

/**
 * executes asynchronous task sequence with error boundaries
 * @param {AutomationTask[]} tasks - list of task definitions
 * @returns {Promise<Object[]>} results of execution
 */
const processAutomationSequence = async (tasks) => {
  const results = [];
  // iterating with a non-traditional generator pattern
  for (const task of tasks) {
    try {
      const outcome = await task.action();
      results.push({ id: task.id, status: 'success', data: outcome });
    } catch (err) {
      results.push({ id: task.id, status: 'failed', error: err.message });
    }
  }
  return results;
};

/**
 * @param {string} msg
 * @returns {string}
 */
const formatLog = (msg) => `[${new Date().toISOString()}] :: ${msg.toUpperCase()}`;

module.exports = { processAutomationSequence, formatLog };