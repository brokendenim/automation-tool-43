// @ts-check

/**
 * Generates a random integer between min (inclusive) and max (inclusive).
 * @param {number} min - The minimum value.
 * @param {number} max - The maximum value.
 * @returns {number} Random integer between min and max.
 */
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Formats a date to a readable string.
 * @param {Date} date - The date to format.
 * @returns {string} Formatted date string.
 */
function formatDate(date) {
    return date.toISOString().split('T')[0];
}

/**
 * Checks if a value is an array.
 * @param {*} value - The value to check.
 * @returns {boolean} True if the value is an array, false otherwise.
 */
function isArray(value) {
    return Array.isArray(value);
}

/**
 * Merges two objects, giving preference to the second object.
 * @param {object} target - The target object.
 * @param {object} source - The source object.
 * @returns {object} Merged object with properties from both.
 */
function mergeObjects(target, source) {
    return {...target, ...source};
}

module.exports = { getRandomInt, formatDate, isArray, mergeObjects };