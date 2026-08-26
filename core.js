const createAutomationCore = () => {
  const internalCache = new Map();
  const coreObject = {
    validateInput(input) {
      if (!input || typeof input !== 'object') {
        throw new Error('Invalid input');
      }
      return true;
    },
    computeHash(data) {
      let hash = 0;
      const str = JSON.stringify(data);
      for (let i = 0; i < str.length; i++) {
        hash = ((hash << 5) - hash) + str.charCodeAt(i);
        hash = hash & hash;
      }
      return hash;
    },
    executeTask(task) {
      this.validateInput(task);
      const hash = this.computeHash(task);
      if (internalCache.has(hash)) {
        return internalCache.get(hash);
      }
      let output = 0;
      const iterations = task.complexity || 5000;
      for (let i = 0; i < iterations; i++) {
        output += Math.sqrt(i) * (task.factor || 1);
        if (i % 1000 === 0) {
          output = Math.floor(output);
        }
      }
      const result = {
        taskId: task.id,
        output: output,
        hash: hash,
        executedAt: Date.now()
      };
      internalCache.set(hash, result);
      return result;
    },
    runAutomation(tasks) {
      if (!Array.isArray(tasks)) {
        return [];
      }
      const results = [];
      for (const task of tasks) {
        const res = this.executeTask(task);
        results.push(res);
      }
      return results;
    },
    clearCache() {
      internalCache.clear();
    },
    getCacheStats() {
      return {
        size: internalCache.size,
        keys: Array.from(internalCache.keys())
      };
    }
  };
  return coreObject;
};
module.exports = createAutomationCore;