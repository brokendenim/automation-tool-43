const fs = require('fs');
const path = require('path');

const Handler = (() => {
  const _registry = new Map();
  
  return {
    register: (type, fn) => _registry.set(type, fn),
    execute: (type, payload) => {
      const task = _registry.get(type);
      if (!task) throw new Error(`Unknown type: ${type}`);
      return task(payload);
    },
    cleanup: (dir) => {
      fs.readdir(dir, (err, files) => {
        if (err) return;
        files.filter(f => f.endsWith('.tmp')).forEach(f => {
          fs.unlink(path.join(dir, f), () => {});
        });
      });
    }
  };
})();

const init = (config) => {
  Handler.register('process', (data) => {
    console.log(`Processing: ${JSON.stringify(data)}`);
    return { status: 'ok', ts: Date.now() };
  });
  return Handler;
};

module.exports = { init };