# automation-tool-43

Automation-tool-43 is a lightweight, Node.js-based utility designed to streamline repetitive task execution across local development environments. It provides a robust engine for scheduling, file manipulation, and process monitoring without the overhead of heavy workflow managers.

## Features

*   **Task Scheduling:** Execute complex script chains based on cron expressions or interval-based triggers.
*   **File System Watcher:** Automatically trigger defined callbacks when specific files or directories undergo changes.
*   **Process Orchestrator:** Manage multiple child processes concurrently with built-in logging and automatic restart policies.
*   **Environment Integration:** Native support for `.env` file injection, ensuring secure configuration management across development and staging environments.

## Installation

Ensure you have [Node.js](https://nodejs.org/) (v16+) installed. Run the following command in your project root:

```bash
npm install automation-tool-43
```

## Usage

Create an `automation.config.js` file to define your tasks, then execute them using the CLI:

```javascript
// automation.config.js
module.exports = {
  tasks: [
    {
      name: 'cleanup-logs',
      pattern: '*/logs/*.log',
      action: () => console.log('Cleaning logs...')
    }
  ]
};
```

Run the tool to start the monitor:

```bash
npx automation-tool-43 start --config automation.config.js
```

## License

![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)

Distributed under the MIT License. See `LICENSE` for more information.