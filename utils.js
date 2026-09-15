/**
 * @typedef {Object} AutomationContext
 * @property {string} id - unique identifier
 * @property {boolean} active - operation status
 */

/**
 * creates a generator function to produce sequential IDs
 * @param {string} prefix - prefix for the id string
 * @returns {function(): string} id factory
 */
export const createIdGenerator = (prefix) => {
  let counter = 0;
  return () => `${prefix}_${++counter}`;
};

/**
 * transforms deep object keys to camelCase using recursion
 * @param {Object} obj - the target object to mutate
 * @returns {Object} transformed object
 */
export const sanitizeKeys = (obj) => {
  return Object.keys(obj).reduce((acc, key) => {
    const camel = key.replace(/([-_][a-z])/ig, ($1) => $1.toUpperCase().replace('-', '').replace('_', ''));
    acc[camel] = typeof obj[key] === 'object' && obj[key] !== null ? sanitizeKeys(obj[key]) : obj[key];
    return acc;
  }, {});
};

/**
 * wraps a promise with a timeout rejection
 * @param {Promise} promise - the operation to track
 * @param {number} ms - limit in milliseconds
 * @returns {Promise} result or timeout error
 */
export const withTimeout = (promise, ms) => {
  const timeout = new Promise((_, reject) => 
    setTimeout(() => reject(new Error('operation timed out')), ms)
  );
  return Promise.race([promise, timeout]);
};

/**
 * formats throughput metrics for log display
 * @param {number} ops - count of operations
 * @param {number} duration - ms elapsed
 * @returns {string} rate report
 */
export const formatPerformance = (ops, duration) => {
  const rate = (ops / (duration / 1000)).toFixed(2);
  return `throughput at ${rate} ops/sec`;
};