/**
 * A creative utility toolkit with a Proxy-based safe navigator and pipeline composer.
 */

/**
 * Wraps an object to allow safe, deep property access without throwing TypeError.
 * Returns a chainable proxy that resolves when converted to primitive.
 */
const safeNavigate = (obj) => {
  const handler = {
    get: (target, prop) => {
      if (prop === 'valueOf' || prop === 'toString') {
        return () => target;
      }
      const val = target != null ? target[prop] : undefined;
      return safeNavigate(val);
    }
  };
  return new Proxy(obj ?? {}, handler);
};

/**
 * A sleep function that resolves after a random jitter interval
 * to help mimic human delay in scraping contexts.
 */
const organicDelay = (baseMs = 1000, variance = 0.5) => {
  const min = baseMs * (1 - variance);
  const max = baseMs * (1 + variance);
  const delay = Math.floor(Math.random() * (max - min + 1) + min);
  return new Promise(resolve => setTimeout(resolve, delay));
};

/**
 * A pipeline executor that feeds values through operations, capturing execution telemetry.
 */
const pipeWithTelemetry = async (initialValue, ...fns) => {
  let current = initialValue;
  const telemetry = { start: Date.now(), steps: [] };

  for (const [index, fn] of fns.entries()) {
    const stepStart = Date.now();
    try {
      current = await fn(current);
      telemetry.steps.push({ step: index, status: 'success', duration: Date.now() - stepStart });
    } catch (error) {
      telemetry.steps.push({ step: index, status: 'failed', error: error.message, duration: Date.now() - stepStart });
      throw { lastValue: current, error, telemetry };
    }
  }

  return { result: current, telemetry: { ...telemetry, totalDuration: Date.now() - telemetry.start } };
};

module.exports = { safeNavigate, organicDelay, pipeWithTelemetry };