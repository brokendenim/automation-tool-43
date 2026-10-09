const resilienceLayer = (fn, fallback = null) => async (...args) => {
  try {
    return await fn(...args);
  } catch (err) {
    if (err instanceof TypeError) {
      console.error('Type mismatch in automation stream:', err.message);
      return fallback;
    }
    if (err.code === 'ECONNRESET') {
      console.warn('Network volatility detected, pausing sequence');
      await new Promise(r => setTimeout(r, 1000));
      return fn(...args);
    }
    throw new Error(`Critical automation failure: ${err.message}`);
  }
};

const gracefulProcessor = async (tasks) => {
  const results = await Promise.allSettled(tasks.map(t => resilienceLayer(t)));
  return results.map((res, i) => 
    res.status === 'fulfilled' ? res.value : { error: true, index: i }
  );
};

module.exports = { resilienceLayer, gracefulProcessor };