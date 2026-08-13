function cleanData(data) {
    if (!Array.isArray(data)) {
        throw new TypeError('Input must be an array');
    }
    return data
        .map(item => item && typeof item === 'object' ? Object.entries(item).reduce((acc, [key, value]) => {
            if (value !== null && value !== undefined) {
                acc[key] = typeof value === 'string' ? value.trim() : value;
            }
            return acc;
        }, {}) : item)
        .filter(item => item && Object.keys(item).length > 0);
}

function mergeDeep(target, source) {
    if (typeof target !== 'object' || target === null || typeof source !== 'object' || source === null) {
        return target;
    }
    for (const key in source) {
        if (source.hasOwnProperty(key)) {
            if (key in target) {
                target[key] = mergeDeep(target[key], source[key]);
            } else {
                target[key] = source[key];
            }
        }
    }
    return target;
}

function formatDate(date) {
    return date instanceof Date ? date.toISOString().split('T')[0] : null;
}

module.exports = { cleanData, mergeDeep, formatDate };