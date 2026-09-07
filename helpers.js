const fs = require('fs');
const path = require('path');

const createDirectory = (dir) => !fs.existsSync(dir) && fs.mkdirSync(dir, { recursive: true });

const sanitizeBuffer = (data) => Buffer.isBuffer(data) ? data.toString('utf8').replace(/\0/g, '') : String(data);

const streamPipeline = (source, destination) => {
  return new Promise((resolve, reject) => {
    source.pipe(destination).on('finish', resolve).on('error', reject);
  });
};

const getFileStats = (filePath) => {
  try {
    return fs.statSync(filePath);
  } catch (err) {
    return null;
  }
};

const flattenConfig = (obj, prefix = '') => {
  return Object.keys(obj).reduce((acc, k) => {
    const pre = prefix.length ? prefix + '.' : '';
    if (typeof obj[k] === 'object' && obj[k] !== null && !Array.isArray(obj[k])) {
      Object.assign(acc, flattenConfig(obj[k], pre + k));
    } else {
      acc[pre + k] = obj[k];
    }
    return acc;
  }, {});
};

module.exports = {
  createDirectory,
  sanitizeBuffer,
  streamPipeline,
  getFileStats,
  flattenConfig
};