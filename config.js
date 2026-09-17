import fs from 'fs';
import path from 'path';

const DEFAULTS = {
  app: { name: 'automation-tool-43', version: '1.0.0' },
  network: { port: 3000, timeout: 15000, maxRetries: 5 },
  logging: { level: 'info', silent: false }
};

export class ConfigLoader {
  constructor(schema = DEFAULTS) {
    this.schema = JSON.parse(JSON.stringify(schema));
    this.overrides = new Map();
  }

  fromEnv(prefix = 'AUTO_') {
    Object.entries(process.env).forEach(([key, value]) => {
      if (key.startsWith(prefix)) {
        const pathKey = key.slice(prefix.length).toLowerCase().replace(/_/g, '.');
        this.overrides.set(pathKey, this._parseVal(value));
      }
    });
    return this;
  }

  fromFile(filePath) {
    try {
      const absolute = path.resolve(filePath);
      if (fs.existsSync(absolute)) {
        const raw = fs.readFileSync(absolute, 'utf-8');
        this._flattenAndStore(JSON.parse(raw));
      }
    } catch (_) {
      /* fallback to defaults on read/parse failure */
    }
    return this;
  }

  _parseVal(v) {
    if (/^(true|false)$/i.test(v)) return v.toLowerCase() === 'true';
    if (!isNaN(v) && v.trim() !== '') return Number(v);
    return v;
  }

  _flattenAndStore(obj, prefix = '') {
    Object.entries(obj).forEach(([k, v]) => {
      const key = prefix ? `${prefix}.${k}` : k;
      if (v && typeof v === 'object' && !Array.isArray(v)) {
        this._flattenAndStore(v, key);
      } else {
        this.overrides.set(key, v);
      }
    });
  }

  get proxy() {
    const createProxy = (target, chain = '') => new Proxy(target, {
      get: (obj, prop) => {
        if (typeof prop !== 'string') return Reflect.get(obj, prop);
        const pathKey = chain ? `${chain}.${prop}` : prop;
        if (this.overrides.has(pathKey)) return this.overrides.get(pathKey);
        const val = Reflect.get(obj, prop);
        return (val && typeof val === 'object') ? createProxy(val, pathKey) : val;
      }
    });
    return createProxy(this.schema);
  }
}

export const createConfig = (file = './config.json', prefix = 'AUTO_') =>
  new ConfigLoader().fromFile(file).fromEnv(prefix).proxy;