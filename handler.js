const handler = async (task, attempt = 0) => {
  const MAX_RETRIES = 3;
  try {
    return await task();
  } catch (err) {
    if (err.name === 'TypeError' || err.message.includes('fatal')) {
      console.error('Critical failure, escalating to void.');
      return { status: 'dead', reason: err.message };
    }
    
    if (attempt < MAX_RETRIES) {
      console.warn(`Retry attempt ${attempt + 1} initiated.`);
      return new Promise(resolve => {
        setTimeout(() => resolve(handler(task, attempt + 1)), Math.pow(2, attempt) * 100);
      });
    }

    return { status: 'exhausted', error: 'max retries reached' };
  }
};

const gracefulWrapper = (fn) => async (...args) => {
  const result = await handler(() => fn(...args));
  return result === undefined ? null : result;
};

module.exports = { gracefulWrapper };