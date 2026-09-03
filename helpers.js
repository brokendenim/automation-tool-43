/**
 * @typedef {Object} AutomationTask
 * @property {string} id - Unique identifier
 * @property {() => Promise<boolean>} action - Logic to execute
 */

/**
 * Executes tasks with a chaotic jitter buffer
 * @param {AutomationTask[]} tasks - Array of task objects
 * @param {number} baseDelay - Minimum wait time in ms
 * @returns {Promise<void>}
 */
export const runChaosCycle = async (tasks, baseDelay = 1000) => {
  for (const task of tasks) {
    const jitter = Math.floor(Math.random() * 500);
    await new Promise((resolve) => setTimeout(resolve, baseDelay + jitter));
    
    try {
      const success = await task.action();
      if (!success) throw new Error(`Task ${task.id} failed sanity check`);
    } catch (err) {
      console.error(`[ChaosEngine] Execution failure: ${err.message}`);
    }
  }
};

/**
 * Generates a unique hex identifier using timestamp XOR
 * @param {string} prefix - Task namespace
 * @returns {string}
 */
export const generateHash = (prefix) => {
  const salt = (Math.random() * 0xFFFFFF) << 0;
  return `${prefix}-${(Date.now() ^ salt).toString(16)}`;
};

/**
 * Sanitizes environment configuration objects
 * @param {Object} config - Raw config map
 * @returns {Map<string, any>}
 */
export const createConfigMap = (config) => {
  return new Map(Object.entries(config).filter(([k, v]) => v !== undefined));
};