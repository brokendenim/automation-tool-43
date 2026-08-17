function normalizeData(dataArray) {
    return dataArray.map(item => {
        return Object.keys(item).reduce((acc, key) => {
            acc[key.toLowerCase()] = typeof item[key] === 'string' ? item[key].trim() : item[key];
            return acc;
        }, {});
    });
}

function filterData(dataArray, criteria) {
    return dataArray.filter(item => {
        return Object.keys(criteria).every(key => {
            return item[key] === criteria[key];
        });
    });
}

function transformData(dataArray, transformer) {
    return dataArray.map(transformer);
}

module.exports = { normalizeData, filterData, transformData };