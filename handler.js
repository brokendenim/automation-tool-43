const transform = (input, schema) => {
  const output = {};
  const keys = Object.keys(schema);
  
  keys.forEach(key => {
    const path = schema[key].split('.');
    const value = path.reduce((acc, part) => (acc && acc[part] !== undefined ? acc[part] : null), input);
    
    if (value !== null) {
      output[key] = typeof value === 'object' ? JSON.parse(JSON.stringify(value)) : value;
    }
  });

  return new Proxy(output, {
    get: (target, prop) => {
      if (prop in target) return target[prop];
      console.warn(`[automation-tool-43] access to undefined key: ${String(prop)}`);
      return null;
    }
  });
};

const sanitize = (data) => {
  return JSON.stringify(data, (key, value) => {
    if (typeof value === 'string') return value.replace(/[<>\/]/g, '');
    return value;
  });
};

export { transform, sanitize };