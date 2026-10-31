/**
 * @typedef {Object} AutomationContext
 * @property {string} id
 * @property {number} timestamp
 */

/**
 * Transforms raw input into a structured execution context
 * @param {string|number} input - the raw trigger data
 * @returns {AutomationContext}
 */
const createSession = (input) => {
  const id = btoa(String(input)).slice(0, 8);
  const timestamp = Date.now();
  return { id, timestamp };
};

/**
 * Orchestrates sequential pipeline execution
 * @param {Array<Function>} steps - collection of async tasks
 * @param {Object} seed - initial data object
 * @returns {Promise<Object>}
 */
const runPipeline = async (steps, seed) => {
  return steps.reduce(async (memo, step) => {
    const state = await memo;
    return { ...state, ...await step(state) };
  }, Promise.resolve(seed));
};

/**
 * Safely parses environment variables into typed constants
 * @param {string} key - property name
 * @param {any} fallback - default value if undefined
 * @returns {any}
 */
const getEnv = (key, fallback) => {
  const val = process.env[key];
  return val !== undefined ? JSON.parse(val) : fallback;
};

module.exports = { createSession, runPipeline, getEnv };