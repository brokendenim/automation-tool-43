const attempt = async (fn, limit = 3, delay = 1000) => {
  let lastError;
  for (let i = 0; i < limit; i++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      if (i < limit - 1) {
        await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
      }
    }
  }
  throw lastError;
};

const createPoller = (fn, interval) => {
  const state = { active: true };
  const loop = async () => {
    while (state.active) {
      try {
        await fn();
      } catch (e) {
        console.error('polling failure:', e);
      }
      await new Promise(r => setTimeout(r, interval));
    }
  };
  loop();
  return { stop: () => { state.active = false; } };
};

module.exports = { attempt, createPoller };