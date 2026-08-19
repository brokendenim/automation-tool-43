function mergeDeep(target, source) {
    for (const key of Object.keys(source)) {
        if (source[key] instanceof Object && key in target)
            target[key] = mergeDeep(target[key], source[key]);
        else
            target[key] = source[key];
    }
    return target;
}

function flattenObject(ob) {
    const result = {};
    for (const i in ob) {
        if ((typeof ob[i]) === 'object' && !Array.isArray(ob[i])) {
            const temp = flattenObject(ob[i]);
            for (const j in temp) {
                result[`${i}.${j}`] = temp[j];
            }
        } else {
            result[i] = ob[i];
        }
    }
    return result;
}

function parseJsonSafely(jsonString) {
    try {
        return JSON.parse(jsonString);
    } catch (error) {
        console.error('JSON parsing error:', error);
        return null;
    }
}

module.exports = {
    mergeDeep,
    flattenObject,
    parseJsonSafely
};