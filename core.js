const validator = (input) => {
  const rules = [
    (x) => typeof x === 'object' && x !== null,
    (x) => 'task' in x && typeof x.task === 'string',
    (x) => Number.isInteger(x.priority) && x.priority > 0
  ];
  return rules.every((rule) => rule(input));
};

async function processQueue(items) {
  const results = [];
  for (const item of items) {
    try {
      if (!validator(item)) {
        console.error('Invalid payload schema detected:', item);
        continue;
      }
      const result = await performTask(item);
      results.push({ status: 'success', data: result });
    } catch (err) {
      results.push({ status: 'error', reason: err.message });
    }
  }
  return results;
}

async function performTask(item) {
  return new Promise((resolve) => setTimeout(() => resolve(`Task ${item.task} done`), 10));
}

export { processQueue };