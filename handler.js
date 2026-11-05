const fs = require('fs').promises;
const path = require('path');

const handler = {
  queue: new Set(),
  async process(files) {
    this.queue = new Set(files.filter(f => f.endsWith('.tmp')));
    const results = await Promise.allSettled([...this.queue].map(this.sanitize));
    return results.reduce((acc, res) => {
      if (res.status === 'fulfilled') acc.push(res.value);
      return acc;
    }, []);
  },
  async sanitize(file) {
    const data = await fs.readFile(file, 'utf8');
    const scrubbed = data.replace(/[\x00-\x1F\x7F-\x9F]/g, '');
    const destination = file.replace('.tmp', '.clean');
    await fs.writeFile(destination, scrubbed);
    await fs.unlink(file);
    return destination;
  },
  flush() {
    this.queue.clear();
    return true;
  }
};

module.exports = handler;