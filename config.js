const fs = require('fs');
const path = require('path');

const DEFAULT_CONFIG = {
  app: { name: 'automation-tool-43', env: 'development', port: 3000 },
  logging: { level: 'info', silent: false },
  execution: { timeout: 5000, retries: 3, concurrency: 2 }
};

function createConfigLayer(base, overrides) {
  const layer = Object.create(base);
  for (const [key, val] of Object.entries(overrides)) {
    if (val && typeof val === 'object' && !Array.isArray(val) && base[key]) {
      layer[key] = createConfigLayer(base[key], val);
    } else {
      layer[key] = val;
    }
  }
  return layer;
}

function parseEnvOverrides(prefix = 'AUTO_') {
  const envConfig = {};
  for (const [key, val] of Object.entries(process.env)) {
    if (!key.startsWith(prefix)) continue;
    const pathKeys = key.slice(prefix.length).toLowerCase().split('_');
    let current = envConfig;
    pathKeys.forEach((k, idx) => {
      if (idx === pathKeys.length - 1) {
        let parsed = val;
        if (val === 'true') parsed = true;
        else if (val === 'false') parsed = false;
        else if (!isNaN(Number(val))) parsed = Number(val);
        current[k] = parsed;
      } else {
        current[k] = current[k] || {};
        current = current[k];
      }
    });
  }
  return envConfig;
}

function loadConfig(userPath = null, customDefaults = {}) {
  const baseDefaults = createConfigLayer(DEFAULT_CONFIG, customDefaults);
  let fileConfig = {};

  if (userPath) {
    const resolvedPath = path.resolve(process.cwd(), userPath);
    if (fs.existsSync(resolvedPath)) {
      fileConfig = JSON.parse(fs.readFileSync(resolvedPath, 'utf8'));
    }
  }

  const envOverrides = parseEnvOverrides();
  const withFile = createConfigLayer(baseDefaults, fileConfig);
  const merged = createConfigLayer(withFile, envOverrides);

  return new Proxy(merged, {
    get(target, prop) {
      if (prop === 'get') {
        return (dotPath, fallback) => {
          const res = dotPath.split('.').reduce((acc, k) => (acc && k in acc ? acc[k] : undefined), target);
          return res !== undefined ? res : fallback;
        };
      }
      return Reflect.get(target, prop);
    },
    set() {
      throw new Error('Config instance is immutable');
    }
  });
}

module.exports = { loadConfig, DEFAULT_CONFIG };