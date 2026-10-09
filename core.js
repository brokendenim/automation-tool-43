const fs = require('fs');
const path = require('path');

const Pipeline = (tasks) => ({
  execute: async (ctx) => {
    for (const task of tasks) {
      ctx = await task(ctx);
    }
    return ctx;
  }
});

const sanitizer = (data) => {
  if (typeof data !== 'object') return {};
  return Object.fromEntries(
    Object.entries(data).filter(([_, v]) => v !== null && v !== undefined)
  );
};

const orchestrator = async (manifestPath) => {
  try {
    const raw = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    const pipeline = Pipeline([
      (data) => ({ ...data, timestamp: Date.now() }),
      (data) => sanitizer(data),
      (data) => ({ ...data, status: 'processed' })
    ]);
    
    return await pipeline.execute(raw);
  } catch (err) {
    return { error: 'execution failure', detail: err.message };
  }
};

module.exports = { orchestrator };