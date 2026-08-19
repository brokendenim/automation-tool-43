class CustomError extends Error {
    constructor(message, code) {
        super(message);
        this.code = code;
    }
}

function handleError(err) {
    if (err instanceof CustomError) {
        console.error(`Custom Error [${err.code}]: ${err.message}`);
    } else {
        console.error(`General Error: ${err.message}`);
    }
}

function riskyOperation(data) {
    try {
        if (!data) {
            throw new CustomError('No data provided', 'ERR_NO_DATA');
        }
        // Simulating operations that might fail
        if (typeof data !== 'string') {
            throw new CustomError('Invalid data type', 'ERR_INVALID_TYPE');
        }
        // More logic can go here
        console.log(`Operation successful with data: ${data}`);
    } catch (err) {
        handleError(err);
    }
}

riskyOperation(); // no data scenario
riskyOperation(42); // invalid type scenario
riskyOperation('Valid input'); // valid scenario