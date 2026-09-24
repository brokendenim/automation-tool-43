# automation-tool-43

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A lightweight, asynchronous task runner designed to streamline repetitive local workflows and file processing routines. Built on Node.js, it combines time-based triggers with declarative pipelines to automate daily development overhead without complex configuration.

## Features

- **Event-Driven Pipelines:** Chain file transformations, network requests, and system commands using simple JavaScript functions.
- **Flexible Triggers:** Execute workflows on cron schedules, file system changes, or manual CLI invocations.
- **Zero-Dependency Core:** Highly optimized execution runtime ensuring fast startup times and low memory consumption.
- **Structured JSON Logging:** Built-in logging format compatible with standard log collectors and terminal outputs.

## Installation

Install the package via npm:

```bash
npm install automation-tool-43
```

To use the command-line interface globally:

```bash
npm install -g automation-tool-43
```

## Quick Start

Create an `automation.js` file to define and start your automated tasks:

```javascript
const { Pipeline, triggers } = require('automation-tool-43');

const runner = new Pipeline();

// Register a scheduled file cleanup task
runner.register('clean-temp-files', {
  trigger: triggers.cron('0 0 * * *'), // Runs daily at midnight
  async execute() {
    console.log('Cleaning temporary directory...');
    // Automation logic goes here
  }
});

// Start listening for triggers
runner.start();
```

Run your script using Node.js:

```bash
node automation.js
```

## License

Distributed under the MIT License. See `LICENSE` for details.