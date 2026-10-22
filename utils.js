class EdgeCaseShield {
  static #MAX_DEPTH = 8;

  static sanitize(input, depth = 0, visited = new WeakSet()) {
    if (input === null || typeof input !== 'object') {
      return input ?? null;
    }
    if (depth > this.#MAX_DEPTH || visited.has(input)) {
      return '[Circular/Max Depth Exceeded]';
    }
    visited.add(input);

    const safeObj = Array.isArray(input) ? [] : {};
    for (const [key, val] of Object.entries(input)) {
      try {
        safeObj[key] = typeof val === 'function'
          ? (...args) => this.guard(() => val(...args))
          : this.sanitize(val, depth + 1, visited);
      } catch (err) {
        safeObj[key] = `[Access Failure: ${err?.message || err}]`;
      }
    }
    return safeObj;
  }

  static async guard(fn, fallback = null, timeoutMs = 2500) {
    if (typeof fn !== 'function') {
      return typeof fallback === 'function' ? fallback(new TypeError('Target is non-callable')) : fallback;
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const result = await Promise.race([
        Promise.resolve().then(() => fn(controller.signal)),
        new Promise((_, reject) => {
          controller.signal.addEventListener('abort', () =>
            reject(new Error(`Operation aborted due to timeout (${timeoutMs}ms)`))
          );
        })
      ]);
      return this.sanitize(result);
    } catch (err) {
      const errorMeta = {
        type: err?.name || typeof err,
        message: err?.message || String(err),
        timestamp: new Date().toISOString()
      };
      return typeof fallback === 'function' ? fallback(errorMeta) : fallback;
    } finally {
      clearTimeout(timer);
    }
  }
}

module.exports = { EdgeCaseShield };