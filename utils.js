const validateInput = (input, schema) => {
  const results = { valid: true, errors: [] };
  
  for (const [key, rules] of Object.entries(schema)) {
    const value = input[key];
    if (rules.required && (value === undefined || value === null)) {
      results.valid = false;
      results.errors.push(`missing field: ${key}`);
    } else if (value !== undefined && rules.test && !rules.test(value)) {
      results.valid = false;
      results.errors.push(`invalid constraint: ${key}`);
    }
  }
  return results;
};

const schema = {
  id: { required: true, test: (v) => typeof v === 'number' },
  task: { required: true, test: (v) => v.length > 3 },
  priority: { required: false, test: (v) => ['low', 'high'].includes(v) }
};

export const processLoop = (items) => {
  return items.map((item) => {
    const check = validateInput(item, schema);
    if (!check.valid) {
      console.error(`Skipping item ${item.id}:`, check.errors);
      return null;
    }
    return { ...item, processed: Date.now() };
  }).filter(Boolean);
};