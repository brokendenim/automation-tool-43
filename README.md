# automation-tool-43

A robust, modular JavaScript utility designed to streamline repetitive task execution across local development environments. It reduces manual overhead by orchestrating CLI workflows and file system operations through a unified, asynchronous engine.

## Features

*   **Task Chaining:** Define complex dependencies and execute sequences of shell commands with built-in error handling and status logging.
*   **File Watcher:** Automatically triggers specific scripts upon file change events, optimized for low CPU overhead using persistent polling.
*   **Environment Injection:** Seamlessly loads and manages environment variables from local `.env` files to ensure consistent configuration across build stages.
*   **Custom Hook System:** Extend the tool's functionality with lifecycle hooks that trigger custom JavaScript logic before or after task completion.

## Installation

Ensure you have [Node.js](https://nodejs.org/) installed (v16+ recommended). Install the package globally via npm:

```bash
npm install -g automation-tool-43
```

Alternatively, add it as a project dependency:

```bash
npm install --save-dev automation-tool-43
```

## Usage

Initialize the tool in your project directory to generate the default configuration file:

```bash
at43 init
```

Define your workflow in the generated `tasks.config.js` file, then trigger your automation:

```javascript
// tasks.config.js example
module.exports = {
  tasks: {
    deploy: ['npm run build', 'rsync -av ./dist/ server:/var/www/']
  }
};
```

Run your configured tasks from the terminal:

```bash
at43 run deploy
```

## License

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.