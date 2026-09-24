const chalk = (msg, color) => `\x1b[${color}m${msg}\x1b[0m`;

const log = {
  info: (msg) => console.log(`[${new Date().toISOString()}] ${chalk(msg, 36)}`),
  warn: (msg) => console.warn(`[${new Date().toISOString()}] ${chalk(msg, 33)}`),
  error: (msg) => console.error(`[${new Date().toISOString()}] ${chalk(msg, 31)}`),
  trace: (fn) => (...args) => {
    const start = performance.now();
    const res = fn(...args);
    console.debug(`[${fn.name}] finished in ${(performance.now() - start).toFixed(2)}ms`);
    return res;
  }
};

const createSpinner = (text) => {
  const frames = ['-', '\\', '|', '/'];
  let i = 0;
  const id = setInterval(() => process.stdout.write(`\r${frames[i++ % 4]} ${text}`), 100);
  return { stop: () => { clearInterval(id); process.stdout.write('\n'); } };
};

module.exports = { log, createSpinner };