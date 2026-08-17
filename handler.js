function handleError(error) {
    const errorTypes = {
        'TypeError': 'There was a type mismatch.',
        'ReferenceError': 'You are trying to access an unknown variable.',
        'SyntaxError': 'There is a syntax error in the code.',
        'RangeError': 'A value is outside the allowable range.'
    };

    const defaultMsg = 'An unknown error occurred.';

    const errorMessage = errorTypes[error.name] || defaultMsg;
    console.error(`Error: ${errorMessage} \n Details: ${error.message}`);
    return { success: false, error: errorMessage };
}

function performAction(data) {
    try {
        if (!data) throw new TypeError('Data is required.');
        if (typeof data !== 'string') throw new TypeError('Data must be a string.');

        // simulate action
        console.log(`Performing action on: ${data}`);
        return { success: true, result: `Action performed on ${data}` };
    } catch (error) {
        return handleError(error);
    }
}

module.exports = { performAction };