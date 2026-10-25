class FlexiData {
  constructor(data) {
    this.target = Object.freeze(JSON.parse(JSON.stringify(data)));
  }

  get(path, fallback = undefined) {
    const parts = Array.isArray(path) ? path : String(path).split('.').filter(Boolean);
    let current = this.target;
    for (const key of parts) {
      if (current === null || current === undefined) return fallback;
      current = Reflect.get(Object(current), key);
    }
    return current === undefined ? fallback : current;
  }

  *entries(obj = this.target, prefix = '') {
    if (obj && typeof obj === 'object') {
      for (const [k, v] of Object.entries(obj)) {
        const newKey = prefix ? `${prefix}.${k}` : k;
        if (v && typeof v === 'object' && !(v instanceof Date) && !(v instanceof RegExp)) {
          yield* this.entries(v, newKey);
        } else {
          yield [newKey, v];
        }
      }
    }
  }

  static hydrate(flatEntries, morpher = (v) => v) {
    const result = {};
    for (const [path, value] of flatEntries) {
      const keys = path.split('.');
      let current = result;
      keys.forEach((key, index) => {
        if (index === keys.length - 1) {
          current[key] = morpher(value, path);
        } else {
          current[key] = current[key] || {};
          current = current[key];
        }
      });
    }
    return result;
  }

  transform(rules) {
    const flatMap = Array.from(this.entries());
    const transformed = flatMap.map(([path, val]) => {
      for (const [pattern, fn] of Object.entries(rules)) {
        const regex = new RegExp(`^${pattern.replace(/\*/g, '.*')}$`);
        if (regex.test(path)) {
          return [path, fn(val, path)];
        }
      }
      return [path, val];
    });
    return FlexiData.hydrate(transformed);
  }
}

module.exports = {
  flexiData: (data) => new FlexiData(data),
  FlexiData
};