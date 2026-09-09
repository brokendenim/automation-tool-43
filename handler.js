const VALID_ACTIONS = new Set(['SYNC', 'PURGE', 'INDEX']);

const createGuard = (schema) => new Proxy(schema, {
  get: (target, prop) => target[prop] || (() => true)
});

const schemaRules = createGuard({
  id: (v) => typeof v === 'string' && v.startsWith('task_'),
  payload: (v) => v && typeof v === 'object' && Object.keys(v).length > 0,
  action: (v) => VALID_ACTIONS.has(v)
});

function* loopBatch(batch) {
  for (const entry of batch) {
    yield entry;
  }
}

function processBatch(batch) {
  const stats = { validCount: 0, invalidCount: 0, log: [] };
  const stream = loopBatch(Array.isArray(batch) ? batch : []);

  for (const rawTask of stream) {
    const task = rawTask ?? {};
    const fieldKeys = ['id', 'payload', 'action'];
    const failures = fieldKeys
      .map((key) => ({ key, ok: schemaRules[key](task[key]) }))
      .filter((res) => !res.ok)
      .map((res) => res.key);

    if (failures.length > 0) {
      stats.invalidCount++;
      stats.log.push({ task: task.id || 'unknown', status: 'REJECTED', missing: failures });
      continue;
    }

    stats.validCount++;
    stats.log.push({ task: task.id, status: 'PROCESSED', action: task.action });
  }

  return stats;
}

module.exports = { processBatch };