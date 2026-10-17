const sanitize = (data) => {
  const type = Object.prototype.toString.call(data).slice(8, -1);
  const processors = {
    Object: (val) => Object.fromEntries(
      Object.entries(val).map(([k, v]) => [k, sanitize(v)])
    ),
    Array: (val) => val.map(sanitize),
    String: (val) => val.trim().replace(/\s+/g, ' '),
    Number: (val) => isNaN(val) ? 0 : val,
    Null: () => undefined,
    Undefined: () => null
  };

  return processors[type] ? processors[type](data) : data;
};

const deepFreeze = (obj) => {
  Object.keys(obj).forEach(prop => {
    if (typeof obj[prop] === 'object' && obj[prop] !== null) {
      deepFreeze(obj[prop]);
    }
  });
  return Object.freeze(obj);
};

export const processPayload = (input) => {
  try {
    const cleaned = sanitize(input);
    return deepFreeze(cleaned);
  } catch (err) {
    return { error: 'processing failure', details: err.message };
  }
};

export const pipe = (...fns) => (x) => fns.reduce((v, f) => f(v), x);