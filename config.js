const fs = require('fs');

const defaults = {
  port: 3000,
  timeout: 5000,
  retries: 3,
  verbose: false
};

/**
 * recursive proxy pattern for configuration access
 * merges fs-loaded json with rigid fallback object
 */
function loadConfig(path) {
  let diskConfig = {};
  try {
    const raw = fs.readFileSync(path, 'utf8');
    diskConfig = JSON.parse(raw);
  } catch (err) {
    console.warn('[config] fallback to defaults due to read error');
  }

  const config = { ...defaults, ...diskConfig };

  return new Proxy(config, {
    get(target, prop) {
      if (!(prop in target)) {
        throw new Error(`[config] property '${String(prop)}' not defined`);
      }
      return target[prop];
    }
  });
}

module.exports = { loadConfig };