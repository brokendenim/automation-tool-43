const handler = (fn) => async (...args) => {
  try {
    const result = await fn(...args);
    return { success: true, data: result };
  } catch (err) {
    const faultMap = {
      'ECONNRESET': 'network_blip',
      'TypeError': 'type_mismatch',
      'RangeError': 'out_of_bounds'
    };

    const faultType = faultMap[err.name] || faultMap[err.code] || 'unidentified_chaos';
    const timestamp = new Date().toISOString();

    console.error(`[${timestamp}] Logic disturbance: ${faultType}`, err.message);

    return {
      success: false,
      fault: faultType,
      recovery: faultType === 'network_blip' ? 'retry_suggested' : 'fatal_halt',
      trace: err.stack.split('\n')[0]
    };
  }
};

module.exports = { handler };