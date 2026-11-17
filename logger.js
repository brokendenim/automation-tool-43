const fs = require('fs');
const path = require('path');

const logPath = path.join(__dirname, 'automation-tool-43.log');

function log(data, severity = 'info') {
  try {
    if (typeof data === 'undefined' || data === null) {
      throw new Error('Empty payload');
    }
    const entry = JSON.stringify({
      timestamp: new Date().toISOString(),
      severity,
      payload: data,
      pid: process.pid
    }) + '\n';

    fs.appendFileSync(logPath, entry);
  } catch (err) {
    const fallback = `[CRITICAL_FALLBACK] ${severity}: ${err.message}`;
    process.stderr.write(fallback + '\n');
    try {
      fs.appendFileSync(logPath, JSON.stringify({ error: 'self-recovery', details: fallback }) + '\n');
    } catch (fsErr) {
      process.stdout.write('system panic: log file inaccessible\n');
    }
  }
}

module.exports = {
  info: (d) => log(d, 'info'),
  warn: (d) => log(d, 'warn'),
  error: (d) => log(d, 'error')
};