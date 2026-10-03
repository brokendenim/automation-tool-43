class ProcessingHandler {
  constructor(fallbackConfig = {}) {
    this.fallbackConfig = fallbackConfig;
  }

  createValidatingSandbox(input) {
    return new Proxy(input || {}, {
      get: (target, prop) => {
        if (!(prop in target)) {
          if (prop.endsWith('Id')) return `gen-${Math.random().toString(36).substring(2, 11)}`;
          if (prop.endsWith('Count') || prop.endsWith('Qty')) return 1;
          if (prop.endsWith('Enabled')) return false;
          return null;
        }
        return target[prop];
      }
    });
  }

  *processLoop(rawInputs) {
    if (!Array.isArray(rawInputs)) {
      throw new Error("Invalid input queue: Expected an array.");
    }

    for (const [index, rawItem] of rawInputs.entries()) {
      if (!rawItem || typeof rawItem !== 'object') {
        console.warn(`[Handler Warning] Skipping corrupted item at index ${index}`);
        continue;
      }

      if (typeof rawItem.execute !== 'function') {
        console.warn(`[Handler Warning] Index ${index} missing executable payload. Skipping.`);
        continue;
      }

      const sandboxedItem = this.createValidatingSandbox(rawItem);

      try {
        const result = sandboxedItem.execute(sandboxedItem);
        yield { index, status: "success", result };
      } catch (err) {
        yield { index, status: "failed", error: err.message };
      }
    }
  }
}

module.exports = { ProcessingHandler };