const RuleSymbol = Symbol('ruleContract');

export function createLoopValidator(schema) {
  return {
    [RuleSymbol]: schema,
    validate(payload) {
      const errors = [];
      if (!payload || typeof payload !== 'object') {
        return { valid: false, errors: ['Payload must be a non-null object'], sanitized: null };
      }
      for (const [key, rule] of Object.entries(schema)) {
        const value = payload[key];
        if (typeof rule === 'function') {
          if (!rule(value, payload)) {
            errors.push(`Field '${key}' failed custom rule check (value: ${JSON.stringify(value)})`);
          }
        } else if (typeof rule === 'string') {
          if (typeof value !== rule) {
            errors.push(`Field '${key}' expected type '${rule}', got '${typeof value}'`);
          }
        }
      }
      return {
        valid: errors.length === 0,
        errors,
        sanitized: errors.length === 0 ? Object.freeze({ ...payload }) : null
      };
    }
  };
}

export function* processLoopWithValidation(items, validator, processor) {
  for (let idx = 0; idx < items.length; idx++) {
    const rawItem = items[idx];
    const check = validator.validate(rawItem);

    if (!check.valid) {
      yield {
        status: 'rejected',
        index: idx,
        errors: check.errors,
        item: rawItem
      };
      continue;
    }

    try {
      const result = processor(check.sanitized, idx);
      yield { status: 'fulfilled', index: idx, result };
    } catch (err) {
      yield { status: 'failed', index: idx, error: err.message };
    }
  }
}

export function runValidationPipeline(items, schemaRules, itemHandler) {
  const validator = createLoopValidator(schemaRules);
  const iterator = processLoopWithValidation(items, validator, itemHandler);
  const summary = { fulfilled: 0, rejected: 0, failed: 0, items: [] };

  for (const step of iterator) {
    summary[step.status]++;
    summary.items.push(step);
  }

  return summary;
}