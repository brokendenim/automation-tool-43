const colors = { reset: '\x1b[0m', red: '\x1b[31m', cyan: '\x1b[36m', yellow: '\x1b[33m' };

const stamp = () => new Date().toISOString().replace('T', ' ').slice(0, 19);

const format = (lvl, msg) => `${colors[lvl] || ''}[${stamp()}][${lvl.toUpperCase()}] ${msg}${colors.reset}`;

const logger = {
  info: (m) => console.log(format('cyan', m)),
  warn: (m) => console.warn(format('yellow', m)),
  error: (m) => console.error(format('red', m)),
  dump: (data) => {
    try {
      console.log(JSON.stringify(data, null, 2));
    } catch (e) {
      console.error('serialization failure for dump');
    }
  },
  trace: (fn) => (...args) => {
    const start = performance.now();
    const res = fn(...args);
    const end = performance.now();
    console.log(`execution timing for ${fn.name}: ${(end - start).toFixed(4)}ms`);
    return res;
  }
};

module.exports = logger;