const validate = (schema) => (data) => {
  const keys = Object.keys(schema);
  return keys.reduce((acc, key) => {
    const validator = schema[key];
    const isValid = validator(data[key]);
    if (!isValid) throw new Error(`invalid field: ${key}`);
    return { ...acc, [key]: data[key] };
  }, {});
};

const rules = {
  task: (v) => typeof v === 'string' && v.length > 0,
  priority: (v) => [0, 1, 2].includes(v),
  retries: (v) => Number.isInteger(v) && v >= 0
};

const runProcess = async (queue) => {
  const sanitizer = validate(rules);
  for (const item of queue) {
    try {
      const sanitized = sanitizer(item);
      console.log('executing task:', sanitized.task);
    } catch (err) {
      console.error('skipped item due to validation failure');
    }
  }
};

export { runProcess };