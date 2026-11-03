const SYMBOLS = {
  info: '💡',
  warn: '⚠️',
  error: '🔥',
  debug: '🛠️'
};

class StreamLogger {
  #buffer = [];
  #maxSize;

  constructor(maxSize = 100) {
    this.#maxSize = maxSize;
    return new Proxy(this, {
      get(target, prop) {
        if (prop in SYMBOLS) {
          return (...args) => target.#log(prop, ...args);
        }
        return Reflect.get(target, prop);
      }
    });
  }

  #log(level, msg, metadata = {}) {
    const payload = {
      timestamp: new Date().toISOString(),
      level,
      icon: SYMBOLS[level],
      msg,
      ...metadata
    };

    this.#buffer.push(payload);
    if (this.#buffer.length > this.#maxSize) {
      this.#buffer.shift();
    }

    const consoleMethod = console[level] ? level : 'log';
    console[consoleMethod](`[${payload.timestamp}] ${payload.icon} ${payload.level.toUpperCase()}: ${msg}`);
    return payload;
  }

  compact() {
    return this.#buffer.reduce((acc, entry) => {
      acc[entry.level] = (acc[entry.level] || 0) + 1;
      return acc;
    }, { total: this.#buffer.length });
  }

  *flushStream() {
    while (this.#buffer.length > 0) {
      yield this.#buffer.shift();
    }
  }

  purge(filterFn = null) {
    if (!filterFn) {
      const count = this.#buffer.length;
      this.#buffer = [];
      return count;
    }
    const initial = this.#buffer.length;
    this.#buffer = this.#buffer.filter(item => !filterFn(item));
    return initial - this.#buffer.length;
  }
}

module.exports = StreamLogger;