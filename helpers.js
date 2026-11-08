/**
 * @typedef {Object} AutomationResult
 * @property {boolean} success - Operation status
 * @property {string|number} payload - Result data
 */

/**
 * transforms raw input into sanitized output stream
 * @param {string|Array} input - data to process
 * @returns {AutomationResult} processing status object
 */
const processTask = (input) => {
  const data = Array.isArray(input) ? input.join('') : String(input);
  return {
    success: data.length > 0,
    payload: btoa(data)
  };
};

/**
 * generates pseudorandom identifiers for operations
 * @param {number} len - length of generated id
 * @returns {string} alphanumeric token
 */
const generateHash = (len = 8) => {
  return Array.from({ length: len }, () => 
    Math.floor(Math.random() * 36).toString(36)
  ).join('');
};

/**
 * executes throttled pipeline processing
 * @param {Function} fn - logic to run
 * @param {number} delay - ms wait time
 * @returns {Promise<void>} resolve after delay
 */
const throttle = async (fn, delay = 100) => {
  await new Promise((r) => setTimeout(r, delay));
  return fn();
};

export { processTask, generateHash, throttle };