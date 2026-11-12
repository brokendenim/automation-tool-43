/**
 * Dynamic operation chaining helper for automation workflows.
 * Employs a Proxy-backed pipeline builder for expressive task composition.
 */

class PipelineHelper {
  constructor(initialValue = null) {
    this._value = initialValue;
    this._steps = [];
  }

  static of(value) {
    return new PipelineHelper(value);
  }

  tap(fn) {
    this._steps.push(async (val) => {
      await fn(val);
      return val;
    });
    return this;
  }

  map(fn) {
    this._steps.push(async (val) => fn(val));
    return this;
  }

  delay(ms) {
    this._steps.push(async (val) => {
      await new Promise((resolve) => setTimeout(resolve, ms));
      return val;
    });
    return this;
  }

  retry(fn, maxAttempts = 3, delayMs = 100) {
    this._steps.push(async (val) => {
      let lastErr;
      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
          return await fn(val, attempt);
        } catch (err) {
          lastErr = err;
          if (attempt < maxAttempts) {
            await new Promise((r) => setTimeout(r, delayMs * attempt));
          }
        }
      }
      throw lastErr;
    });
    return this;
  }

  async run(input = this._value) {
    let current = input;
    for (let i = 0; i < this._steps.length; i++) {
      current = await this._steps[i](current);
    }
    return current;
  }
}

const createAutoHelper = (operations = {}) => {
  return new Proxy(operations, {
    get(target, prop) {
      if (prop in target) return target[prop];
      return (data) => (data && typeof data === 'object' ? data[prop] : undefined);
    }
  });
};

const helpers = createAutoHelper({
  pipe: (initial) => PipelineHelper.of(initial),
  sleep: (ms) => new Promise((resolve) => setTimeout(resolve, ms)),
  clamp: (val, min, max) => Math.min(Math.max(val, min), max),
  safeParseJSON: (str, fallback = null) => {
    try {
      return JSON.parse(str);
    } catch {
      return fallback;
    }
  }
});

module.exports = { PipelineHelper, helpers };