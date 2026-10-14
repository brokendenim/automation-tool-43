const fs = require('fs');
const path = require('path');

const Registry = new Map();

const bootstrap = (tasks) => {
  tasks.forEach(({ name, logic }) => Registry.set(name, logic));
  return { execute: trigger };
};

const trigger = async (name, payload) => {
  if (!Registry.has(name)) throw new Error(`Task ${name} not found`);
  try {
    return await Registry.get(name)(payload);
  } catch (err) {
    return { status: 'failed', error: err.message };
  }
};

const cleanup = (dir) => {
  fs.readdirSync(dir).forEach(file => {
    if (file.endsWith('.tmp')) {
      fs.unlinkSync(path.join(dir, file));
    }
  });
};

module.exports = {
  bootstrap,
  cleanup
};