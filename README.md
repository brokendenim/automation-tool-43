# automation-tool-43

Automation-tool-43 is a lightweight, high-performance Node.js utility designed to streamline repetitive task execution through customizable workflow configurations. It enables developers to orchestrate complex sequences of shell commands and file operations with minimal boilerplate.

## Features

*   **Task Chaining:** Execute multiple dependent scripts in a predefined sequence with automatic exit-on-failure handling.
*   **Dynamic Variable Injection:** Pass environment-specific variables directly into your automation pipelines via JSON configuration.
*   **Zero-Dependency Core:** Built using native Node.js modules to ensure a tiny footprint and maximum security.
*   **Watch Mode:** Automatically trigger predefined routines whenever local file changes are detected.

## Installation

Ensure you have [Node.js](https://nodejs.org/) (v16.x or higher) installed. Install the tool globally via npm:

```bash
npm install -g automation-tool-43
```

Alternatively, add it to your project as a development dependency:

```bash
npm install --save-dev automation-tool-43
```

## Usage

Create an `automation.config.json` file in your root directory:

```json
{
  "tasks": {
    "build": ["npm run clean", "npm run compile"],
    "deploy": ["npm run test", "node ./scripts/upload.js"]
  }
}
```

Run a specific task from your terminal:

```bash
# Run the build task
automation-tool-43 run build

# Run with watch mode enabled
automation-tool-43 watch deploy
```

## License

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.