const EDGE_CASES = {
  UNSAFE_NUMBERS: [NaN, Infinity, -Infinity],
  EMPTY_FALLBACK: Object.freeze({ status: 'degraded', payload: null })
};

/**
 * Creates a self-healing boundary around functions to intercept edge-case failures.
 */
function createSafeBoundary(fn, customFallback = null) {
  if (typeof fn !== 'function') {
    const staticVal = fn ?? customFallback ?? EDGE_CASES.EMPTY_FALLBACK;
    return () => staticVal;
  }

  return new Proxy(fn, {
    apply(target, thisArg, argsList) {
      const sanitizedArgs = argsList.map(arg => {
        if (EDGE_CASES.UNSAFE_NUMBERS.includes(arg)) return 0;
        if (typeof arg === 'symbol') return arg.toString();
        return arg;
      });

      try {
        const result = Reflect.apply(target, thisArg, sanitizedArgs);
        
        if (result instanceof Promise) {
          return result.catch(err => {
            return ErrorTrapResolver.resolve(err, customFallback);
          });
        }
        return result ?? customFallback;
      } catch (err) {
        return ErrorTrapResolver.resolve(err, customFallback);
      }
    }
  });
}

const ErrorTrapResolver = {
  resolve(err, fallback) {
    const errorMap = new Map([
      [RangeError, () => fallback ?? []],
      [TypeError, () => fallback ?? {}],
      [URIError, () => fallback ?? '']
    ]);

    for (const [ErrorType, handler] of errorMap) {
      if (err instanceof ErrorType) return handler();
    }

    return fallback ?? EDGE_CASES.EMPTY_FALLBACK;
  }
};

module.exports = { createSafeBoundary, ErrorTrapResolver };