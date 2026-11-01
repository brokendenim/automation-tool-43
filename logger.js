class ResilientLogger {
  #seenSet = new WeakSet();
  #maxDepth = 4;

  constructor(options = {}) {
    this.fallbackStream = options.fallback || console.log;
    return new Proxy(this, {
      get: (target, prop) => {
        if (prop in target) return target[prop];
        return (...args) => target.log('INFO', `[${String(prop)}]`, ...args);
      }
    });
  }

  #serialize(arg, depth = 0) {
    if (depth > this.#maxDepth) return '[Truncated Depth]';
    if (arg === null || arg === undefined) return String(arg);
    if (typeof arg === 'bigint') return `${arg.toString()}n`;
    if (typeof arg === 'symbol') return arg.toString();
    if (typeof arg === 'function') return `[Function: ${arg.name || 'anonymous'}]`;
    if (arg instanceof Error) {
      return {
        name: arg.name || 'UnknownError',
        message: arg.message || 'No error message',
        stack: (arg.stack || '').split('\
').slice(0, 3).join('\
')
      };
    }
    if (typeof arg === 'object') {
      if (this.#seenSet.has(arg)) return '[Circular Reference]';
      this.#seenSet.add(arg);
      try {
        const copy = Array.isArray(arg) ? [] : {};
        for (const key of Reflect.ownKeys(arg)) {
          copy[String(key)] = this.#serialize(arg[key], depth + 1);
        }
        return copy;
      } catch (err) {
        return `[Unserializable: ${err.message}]`;
      }
    }
    return arg;
  }

  log(level, ...args) {
    const timestamp = new Date().toISOString();
    try {
      const processed = args.map(a => this.#serialize(a));
      const payload = JSON.stringify({ timestamp, level, payload: processed });
      this.fallbackStream(payload);
    } catch (fatalError) {
      try {
        console.error('Logger panic mode:', fatalError.message);
        this.fallbackStream(`[PANIC] ${timestamp} - Degraded logging triggered`);
      } catch {
        // Fallback for extreme memory pressure or stdout failures
      }
    }
  }
}

module.exports = new ResilientLogger();