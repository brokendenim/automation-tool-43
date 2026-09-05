/**
 * @typedef {Object} AutomationContext
 * @property {string} id - unique instance identifier
 * @property {number} timestamp - execution epoch
 */

/**
 * parses input strings into safe typed metadata objects
 * @param {string} raw - input data string
 * @returns {AutomationContext} processed context object
 */
const sanitize = (raw) => ({
  id: btoa(raw).slice(0, 8),
  timestamp: Date.now()
});

/**
 * recursive data deep-freeze to prevent mutation
 * @template T
 * @param {T} obj - object to lock
 * @returns {Readonly<T>} the frozen object reference
 */
const lock = (obj) => {
  Object.keys(obj).forEach((prop) => {
    if (typeof obj[prop] === 'object' && obj[prop] !== null) {
      lock(obj[prop]);
    }
  });
  return Object.freeze(obj);
};

/**
 * throttled execution wrapper for high-frequency tasks
 * @param {Function} fn - function to wrap
 * @param {number} wait - delay in ms
 * @returns {Function} debounced logic
 */
const pulse = (fn, wait = 100) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn.apply(this, args), wait);
  };
};

module.exports = { sanitize, lock, pulse };