# Mike's AI Plugin

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

Mike's AI Plugin is a plugin for [Obsidian](https://obsidian.md/) that serves as an artificial intelligence assistant for daily note-taking and interacting with the OpenAI model. With this plugin, you can chat with an expert assistant using the OpenAI API to answer your questions and automatically create daily notes.

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [Configuration](#configuration)
- [Development](#development)
- [Contributing](#contributing)
- [License](#license)
- [Author](#author)

## Requirements

- Obsidian v1.0 or later
- A valid OpenAI API key
- (Optional) Node.js >= 14 and npm (only required for development)

## Features

- **AI Chat**: Interact with the OpenAI model (default `GPT-4o`) directly from Obsidian.
- **Daily Note Creation**: Automatically create and open a daily note organized by year, month, and day.
- **Markdown Editor Integration**: Insert AI responses directly into the Markdown editor.
- **KaTeX Support**: For mathematical formulas, the AI uses KaTeX notation with proper delimiters.
- **User-Friendly Interface**: Includes a chat panel with a clean interface and intuitive controls.

## Installation

1. Download or clone this repository to your local machine:
   ```bash
   git clone <REPOSITORY_URL>
   ```
2. Copy the plugin folder to your vault's plugin directory:
   ```bash
   cp -r mikes-ia-plugin <YOUR_VAULT>/.obsidian/plugins/
   ```
3. Open Obsidian, go to **Settings > Community Plugins**, and enable **Mike's AI Plugin**.
4. (Optional) Restart Obsidian or reload plugins to apply changes.

## Usage

### Open the AI Chat
- Click the message icon (📩) in the sidebar to open the chat panel.
- Type your message in the input area and press **Enter** (or click the send button) to receive a response from the AI.
- To insert the response into the Markdown editor, use the transfer button (arrow icon).

### Create a Daily Note
- Click the document icon (📄) in the sidebar to automatically create and open the daily note.
- The note is created in a folder structure organized by year, month, and day.

## Configuration

### API Key and Model
- Go to **Settings > Plugins > Mike's AI Plugin**.
- Enter your **OpenAI API Key**.
- Select the **model** to use (e.g., `GPT-4o` or `o3-mini`).

> **Note:** If you do not configure your API Key, the plugin will display a warning and requests to the OpenAI API will not be sent.

## Development

### Prerequisites

- Node.js >= 14
- npm

### Install Dependencies

```bash
npm install
```

### Build for Development

```bash
npm run dev
```

### Build for Production

```bash
npm run build
```

### Project Structure

- **manifest.json**: Defines the basic plugin information (name, version, description, etc.).
- **main.ts**: Contains the main logic of the plugin, including chat panel creation, OpenAI API integration, and daily note functionality.
- **styles.css**: Styles for the chat panel and buttons.

## Contributing

Contributions are welcome. If you would like to improve the plugin, please follow these steps:

1. **Fork the repository**
2. **Make your changes**
3. **Submit a Pull Request**

## License

This project is licensed under the [MIT License](LICENSE).

## Author

**Mike Ballesteros**  
[https://maballesteros.com](https://maballesteros.com)

---

Enjoy using Mike's AI Plugin to boost your productivity in Obsidian!