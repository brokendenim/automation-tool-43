const path = require('path');

const safeConfigLoader = (configPath) => {
  try {
    if (!configPath || typeof configPath !== 'string') {
      throw new Error('invalid_path_type');
    }
    return require(path.resolve(configPath));
  } catch (err) {
    const errorMap = {
      MODULE_NOT_FOUND: { status: 404, fallback: {} },
      EACCES: { status: 403, fallback: { secure: true } },
      invalid_path_type: { status: 400, fallback: { local: true } }
    };

    const recovery = errorMap[err.code] || { status: 500, fallback: null };
    
    if (!recovery.fallback) {
      process.stderr.write(`[CRITICAL] Config failed: ${err.message}\n`);
      process.exit(1);
    }

    console.warn(`[RECOVERY] Status ${recovery.status} - Applying safe defaults`);
    return recovery.fallback;
  }
};

module.exports = {
  load: safeConfigLoader,
  timestamp: Date.now()
};