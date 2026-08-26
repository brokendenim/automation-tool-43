const createCore = () => {
  const edgeCases = [];
  const recordEdge = (type, info) => {
    edgeCases.push({ type, info, at: new Date().toISOString() });
  };
  const safeAccess = (obj, key, fallback) => {
    try {
      return (obj && obj[key] !== undefined) ? obj[key] : fallback;
    } catch (e) {
      recordEdge('access_error', e.message);
      return fallback;
    }
  };
  const validateInput = (input) => {
    if (input == null) {
      recordEdge('nullish_input', 'Input is null or undefined');
      return false;
    }
    if (!Array.isArray(input)) {
      recordEdge('type_mismatch', `Expected array but got ${typeof input}`);
      return false;
    }
    if (input.length === 0) {
      recordEdge('empty_collection', 'No elements provided');
      return false;
    }
    return true;
  };
  const processTask = (task) => {
    const id = safeAccess(task, 'id', 0);
    if (id === 0) {
      recordEdge('missing_id', 'Task id is missing or zero');
      return null;
    }
    try {
      const computed = (id << 1) | 1;
      if (computed > 1000) {
        recordEdge('overflow_risk', 'Computed value too large');
        return { id, result: 'capped' };
      }
      return { id, result: computed };
    } catch (e) {
      recordEdge('computation_fail', e.message);
      return { id, result: 'error' };
    }
  };
  return {
    execute: (tasks) => {
      if (!validateInput(tasks)) {
        return [];
      }
      const outcomes = [];
      for (let i = 0; i < tasks.length; i++) {
        const task = tasks[i];
        if (typeof task !== 'object' || task === null) {
          recordEdge('invalid_item', `Item at ${i} is not object`);
          outcomes.push({ index: i, status: 'invalid' });
          continue;
        }
        const result = processTask(task);
        if (result) {
          outcomes.push({ ...result, status: 'success' });
        } else {
          outcomes.push({ index: i, status: 'skipped' });
        }
      }
      return outcomes;
    },
    getEdgeCases: () => edgeCases
  };
};

const automationCore = createCore();
const testData = [{ id: 42 }, {}, null, { id: 500 }, 'bad', { id: 10 }];
const output = automationCore.execute(testData);
console.log('Results:', JSON.stringify(output));
console.log('Edges:', JSON.stringify(automationCore.getEdgeCases()));