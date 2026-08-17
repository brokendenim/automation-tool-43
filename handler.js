class InputValidator {
    static isValid(input) {
        return typeof input === 'string' && input.trim() !== ''; 
    }
}

class Processor {
    constructor() {
        this.data = [];
    }

    processInput(input) {
        if (!InputValidator.isValid(input)) {
            console.error('Invalid input:', input);
            return;
        }
        this.data.push(input);
        console.log('Processed input:', input);
    }

    run(inputs) {
        inputs.forEach((input) => {
            this.processInput(input);
        });
    }
}

const inputs = ['valid', ' ', null, 'another valid', ''];
const processor = new Processor();
processor.run(inputs);