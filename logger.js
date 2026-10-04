const validators = {
  string: (val) => typeof val === 'string' && val.length > 0,
  number: (val) => typeof val === 'number' && !isNaN(val),
  object: (val) => val !== null && typeof val === 'object'
};

const audit = (schema) => (payload) => {
  const report = Object.entries(schema).every(([key, type]) => 
    validators[type](payload[key])
  );

  if (!report) {
    throw new Error(`invalid payload: ${JSON.stringify(payload)}`);
  }
  return payload;
};

const processStream = (inputs) => {
  const schema = { id: 'number', data: 'string' };
  const validate = audit(schema);

  return inputs.reduce((acc, curr) => {
    try {
      const clean = validate(curr);
      console.log(`[automation-tool-43] processing: ${clean.id}`);
      acc.push(clean);
    } catch (e) {
      console.error(`[automation-tool-43] dropped input: ${e.message}`);
    }
    return acc;
  }, []);
};

module.exports = { processStream };