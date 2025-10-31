# Smart Context Generator - Chrome Extension

A Chrome extension for the Google Chrome Built-in AI Challenge 2025 that intelligently optimizes prompts for LLMs by gathering and organizing contextual information across browser tabs.

## Features

- **Session Management**: Create separate sessions for different tasks/issues
- **Context Capture**: Upload files, take screenshots, and extract tab content
- **Smart Optimization**: AI-powered context sufficiency checking and web research
- **Cross-Tab Persistence**: Sessions remain consistent across all tabs in a window
- **Dual Interface**: Quick popup and comprehensive full-page view

## Setup Instructions

### Prerequisites

1. Google Chrome browser
2. Gemini API key from [Google AI Studio](https://makersuite.google.com/app/apikey)

### Installation

1. **Clone or download this repository**

2. **Add your Gemini API key**
   - Open `utils/constants.js`
   - Replace `YOUR_GEMINI_API_KEY_HERE` with your actual Gemini API key

3. **Create placeholder icons** (temporary for MVP)
   - Create three PNG files in the `icons/` directory:
     - `icon16.png` (16x16 pixels)
     - `icon48.png` (48x48 pixels)
     - `icon128.png` (128x128 pixels)
   - You can use any simple colored squares or generate icons online

4. **Load the extension in Chrome**
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top right)
   - Click "Load unpacked"
   - Select the extension directory

5. **Start using the extension**
   - Click the extension icon in the toolbar to open the popup
   - Create a new session
   - Add context (files, screenshots, tab content)
   - Click "Optimize Context" to generate an optimized prompt

## Usage

### Creating a Session

1. Click the extension icon
2. Click "+ New" to create a session
3. Enter a descriptive name for your task/issue

### Adding Context

- **Upload Files**: Click "📁 Upload Files" to add code files, documentation, etc.
- **Screenshot**: Click "📸 Screenshot" to capture the current tab
- **Extract Tab**: Click "📄 Extract Tab Content" to extract text from the current page

### Optimizing Context

1. Enter your task/issue description
2. Add relevant context items
3. Click "🚀 Optimize Context"
4. Wait for the AI to analyze and optimize your prompt
5. Copy the optimized prompt to use with any LLM

### Full Page View

Click "📋 Open Full Page" for a comprehensive view with:
- All sessions in a sidebar
- Detailed context management
- Optimization history
- Better organization for complex tasks

## How It Works

1. **Sufficiency Check**: Gemini AI analyzes if your context is sufficient
2. **Web Research** (if needed): Automatically searches for missing information
3. **Optimization**: Generates a comprehensive, well-structured prompt

## Project Structure

```
├── manifest.json           # Extension configuration
├── popup/                  # Popup interface
│   ├── popup.html
│   ├── popup.css
│   └── popup.js
├── extension-page/         # Full page interface
│   ├── extension-page.html
│   ├── extension-page.css
│   └── extension-page.js
├── background/             # Background service worker
│   └── background.js
├── content/                # Content scripts
│   └── content.js
├── utils/                  # Utility modules
│   ├── constants.js
│   ├── storage.js
│   ├── session-manager.js
│   ├── gemini-api.js
│   └── helpers.js
└── icons/                  # Extension icons
```

## Technologies Used

- **Chrome Extension Manifest V3**
- **Google Gemini API** (with function calling and Google Search grounding)
- **Chrome Storage API** for data persistence
- **Chrome Tabs API** for screenshot and content extraction
- **Vanilla JavaScript** (ES6 modules)

## API Reference

### Gemini API Features Used

- **Function Calling**: For structured sufficiency evaluation
- **Google Search Grounding**: For web research when context is insufficient
- **System Instructions**: For consistent prompt optimization

## Troubleshooting

### Extension doesn't load
- Make sure all icon files exist in the `icons/` directory
- Check the Chrome Extensions page for error messages

### API errors
- Verify your Gemini API key is correct in `utils/constants.js`
- Check your API quota at [Google AI Studio](https://makersuite.google.com/)

### Context extraction fails
- Some websites may block content extraction due to security policies
- Try using file upload or screenshot instead

## Future Enhancements

- Settings UI for API key configuration
- Export/import sessions
- Advanced filtering and search
- Collaborative sessions
- Custom templates
- Analytics dashboard

## License

MIT License - Built for Google Chrome Built-in AI Challenge 2025

## Credits

Developed for the Google Chrome Built-in AI Challenge 2025
