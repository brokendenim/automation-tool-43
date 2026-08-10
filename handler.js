class CustomError extends Error {
    constructor(message, code) {
        super(message);
        this.code = code;
    }
}

function processInput(input) {
    if (typeof input !== 'string') {
        throw new CustomError('Invalid input type', 'INVALID_TYPE');
    }
    if (input.trim() === '') {
        throw new CustomError('Input cannot be empty', 'EMPTY_INPUT');
    }
    return input.toUpperCase();
}

function handleRequest(req) {
    try {
        const result = processInput(req.body);
        return { status: 200, data: result };
    } catch (error) {
        if (error instanceof CustomError) {
            return { status: 400, error: error.message, code: error.code };
        }
        return { status: 500, error: 'Internal Server Error' };
    }
}

module.exports = { handleRequest };