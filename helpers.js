function validateInput(input) {
    if (typeof input !== 'string' || input.trim() === '') {
        throw new Error('Invalid input: must be a non-empty string.');
    }
    return true;
}

function processInput(input) {
    try {
        validateInput(input);
        console.log('Processing:', input);
        // Simulate processing steps
        // ...
    } catch (error) {
        console.error('Error:', error.message);
    }
}

const inputs = ['valid input', '', null, 'another valid input'];
inputs.forEach(input => processInput(input));
