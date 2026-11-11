const fs = require('fs');
const path = require('path');

const safeLog = (data, context = 'default') => {
  const timestamp = new Date().toISOString();
  const entry = { timestamp, context, data };

  try {
    if (typeof data === 'undefined') throw new Error('Data undefined');
    const serialized = JSON.stringify(entry) + '\n';
    fs.appendFileSync(path.join(__dirname, 'log.txt'), serialized);
  } catch (err) {
    if (err.code === 'ENOENT') {
      fs.writeFileSync(path.join(__dirname, 'log.txt'), '--- INIT LOG ---\n');
      safeLog(data, context);
    } else {
      const fallback = `[CRITICAL_FAILURE] ${context}: ${err.message}`;
      process.stderr.write(fallback + '\n');
      const emergencyPath = path.join(__dirname, 'emergency.log');
      fs.appendFileSync(emergencyPath, fallback + '\n');
    }
  }
};

module.exports = { safeLog };