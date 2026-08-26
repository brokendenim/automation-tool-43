const retryOperation = async (fn, attempts = 3, delay = 1000) => {
  try {
    return await fn();
  } catch (error) {
    if (attempts <= 1) throw error;
    await new Promise(res => setTimeout(res, delay));
    return retryOperation(fn, attempts - 1, delay * 2);
  }
};

const executeWithBackoff = async (operations) => {
  const results = [];
  for (const op of operations) {
    const res = await retryOperation(op);
    results.push(res);
  }
  return results;
};

module.exports = { retryOperation, executeWithBackoff };