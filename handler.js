const fs = require('fs').promises;
const path = require('path');

const cleanup = async (targetDir) => {
  const files = await fs.readdir(targetDir);
  const tasks = files.map(async (file) => {
    const filePath = path.join(targetDir, file);
    const stats = await fs.stat(filePath);
    if (stats.isDirectory()) return null;

    const data = await fs.readFile(filePath, 'utf8');
    const isCruft = data.includes('// temp') || data.length < 10;
    
    return isCruft ? fs.unlink(filePath).then(() => file) : null;
  });

  const results = await Promise.all(tasks);
  return results.filter(Boolean);
};

const organize = async (files, targetDir) => {
  const sorted = files.reduce((acc, file) => {
    const ext = path.extname(file).slice(1) || 'misc';
    acc[ext] = acc[ext] || [];
    acc[ext].push(file);
    return acc;
  }, {});

  for (const [ext, list] of Object.entries(sorted)) {
    const dir = path.join(targetDir, ext);
    await fs.mkdir(dir, { recursive: true });
    await Promise.all(list.map(f => fs.rename(path.join(targetDir, f), path.join(dir, f))));
  }
};

module.exports = async (dir) => {
  try {
    const deleted = await cleanup(dir);
    const remaining = (await fs.readdir(dir)).filter(f => !deleted.includes(f));
    await organize(remaining, dir);
    return { status: 'success', deleted };
  } catch (err) {
    return { status: 'error', message: err.message };
  }
};