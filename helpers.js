function deepMerge(target, source) {
    if (typeof target !== 'object' || target === null) {
        return source;
    }
    for (const key in source) {
        if (source.hasOwnProperty(key)) {
            if (source[key] && typeof source[key] === 'object') {
                target[key] = deepMerge(target[key] || {}, source[key]);
            } else {
                target[key] = source[key];
            }
        }
    }
    return target;
}

function getUniqueArray(array) {
    return [...new Set(array)];
}

function safelyParseJSON(jsonString, fallback) {
    try {
        return JSON.parse(jsonString);
    } catch (err) {
        return fallback;
    }
}

module.exports = {
    deepMerge,
    getUniqueArray,
    safelyParseJSON
};