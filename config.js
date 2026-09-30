const sanitizeConfig = (raw) => {
  const defaults = { timeout: 5000, retries: 3 };
  try {
    if (typeof raw !== 'object' || raw === null) throw new TypeError('Invalid config input');
    return Object.assign(Object.create(null), defaults, Object.fromEntries(
      Object.entries(raw).map(([k, v]) => [k, v ?? defaults[k]])
    ));
  } catch (err) {
    console.error('Config injection failure:', err.message);
    return defaults;
  }
};

const getSafeDeep = (obj, path, fallback) => {
  const parts = path.split('.');
  let current = obj;
  for (const part of parts) {
    if (current === null || typeof current !== 'object' || !(part in current)) {
      return fallback;
    }
    current = current[part];
  }
  return current ?? fallback;
};

const envOverride = (key) => {
  const val = process.env[key];
  if (val === undefined) return null;
  try {
    return JSON.parse(val);
  } catch {
    return val;
  }
};

module.exports = {
  sanitizeConfig,
  getSafeDeep,
  envOverride
};