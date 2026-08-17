function isValidInput(input) { return typeof input === 'string' && input.trim() !== ''; }

function processInputs(inputs) {
    const results = [];
    for (const input of inputs) {
        if (!isValidInput(input)) {
            console.error('Invalid input:', input);
            continue;
        }
        // Simulating processing of valid input
        results.push(`Processed: ${input}`);
    }
    return results;
}

const inputsToProcess = ['  hello  ', 'world', '', ' ', null, 'valid input'];
const output = processInputs(inputsToProcess);
console.log(output);