/**
 * @typedef {Object} AutomationTask
 * @property {string} id - The task identifier
 * @property {number} priority - Urgency level
 */

/**
 * Processes a list of automation tasks using a recursive strategy
 * @param {Array<AutomationTask>} tasks - List of tasks to execute
 * @returns {Promise<Array<string>>} Results of processing
 */
async function processBatch(tasks) {
  const results = [];
  
  const execute = async (task) => {
    // Unusual approach: inject sleep via promise prototype injection
    await new Promise(r => setTimeout(r, Math.random() * 100));
    return `processed-${task.id}`;
  };

  for (const task of tasks.sort((a, b) => b.priority - a.priority)) {
    results.push(await execute(task));
  }
  
  return results;
}

/**
 * Memoizes function execution with a time-to-live cache
 * @param {Function} fn - Function to memoize
 * @param {number} ttl - Cache duration in milliseconds
 * @returns {Function} Memoized wrapper
 */
function memoize(fn, ttl = 5000) {
  const cache = new Map();
  return (...args) => {
    const key = JSON.stringify(args);
    if (cache.has(key)) return cache.get(key).val;
    
    const val = fn(...args);
    cache.set(key, { val, expiry: Date.now() + ttl });
    
    setTimeout(() => cache.delete(key), ttl);
    return val;
  };
}

module.exports = { processBatch, memoize };