/**
 * Creative proxy-based pipeline for safe, fluent data manipulation.
 * Resolves nested paths, handles array mappings, and runs standard methods dynamically.
 */
function chain(data) {
  const pipeline = [];

  const proxyHandler = {
    get(_, prop) {
      if (prop === 'val') {
        return pipeline.reduce((acc, step) => {
          if (acc === null || acc === undefined) return undefined;
          return step(acc);
        }, data);
      }

      return (...args) => {
        pipeline.push((current) => {
          if (current === null || current === undefined) return undefined;
          
          if (typeof current[prop] === 'function') {
            return current[prop](...args);
          }
          
          if (Array.isArray(current)) {
            return current.map(item => {
              if (item === null || item === undefined) return undefined;
              if (typeof item[prop] === 'function') {
                return item[prop](...args);
              }
              return item[prop];
            });
          }
          
          return current[prop];
        });
        
        return new Proxy({}, proxyHandler);
      };
    }
  };

  return new Proxy({}, proxyHandler);
}

module.exports = { chain };