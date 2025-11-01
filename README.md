# 🚀 Smart Context Generator

> A Chrome extension that intelligently optimizes prompts for Large Language Models (LLMs) by gathering contextual information and leveraging Chrome's built-in AI APIs for enhanced productivity.

![Chrome Extension](https://img.shields.io/badge/Chrome-Extension-4285F4?style=for-the-badge&logo=googlechrome&logoColor=white)
![Chrome AI](https://img.shields.io/badge/Chrome-AI%20APIs-34A853?style=for-the-badge&logo=google&logoColor=white)
![Gemini](https://img.shields.io/badge/Google-Gemini%20API-FF6F00?style=for-the-badge&logo=google&logoColor=white)

## 📋 Table of Contents

- [✨ Features](#-features)
- [🤖 Chrome AI Integration](#-chrome-ai-integration)
- [⚡ Quick Start](#-quick-start)
- [📖 How to Use](#-how-to-use)
- [🛠️ Installation Guide](#️-installation-guide)
- [🔧 Configuration](#-configuration)
- [📁 Project Structure](#-project-structure)
- [🚨 Troubleshooting](#-troubleshooting)
- [🔮 Future Enhancements](#-future-enhancements)

## ✨ Features

### 🎯 Core Functionality
- **Multi-Session Management**: Create and manage separate context sessions for different projects
- **Smart Context Collection**: Gather information from multiple sources automatically
- **AI-Powered Proofreading**: Real-time grammar and spelling correction using Chrome's Proofreader API
- **Intelligent Content Summarization**: Auto-generate concise summaries of web pages using Chrome's Prompt API
- **Advanced Prompt Optimization**: Transform basic prompts into structured, effective LLM prompts using Gemini API
- **Cross-Tab Context**: Maintain context across different browser tabs and windows

### 🧠 AI-Enhanced Features
- **Real-time Text Correction**: Fix grammar and spelling errors instantly with the "✏️ Proofread" button
- **Smart Web Content Analysis**: Generate meaningful 3-5 word summaries like "Mobile Application Developer Delhi"
- **Context Sufficiency Analysis**: Automatically determine if more information is needed
- **Web Research Integration**: Fetch additional context from the web when required
- **Structured Prompt Generation**: Transform simple requests into comprehensive prompts like the career advisor example shown

## 🤖 Chrome AI Integration

This extension leverages two powerful Chrome AI APIs:

### 1. 🔍 Chrome Proofreader API
```javascript
// Real-time grammar and spelling correction
const proofreader = await window.ai.proofreader.create();
const correctedText = await proofreader.proofread(originalText);
```

**Features:**
- ✅ Instant grammar correction
- ✅ Spelling error detection
- ✅ Context-aware suggestions
- ✅ Works offline after model download

### 2. 💬 Chrome Prompt API (Language Model)
```javascript
// Intelligent content summarization
const session = await window.ai.languageModel.create({
  systemPrompt: "You are a content summarizer..."
});
const summary = await session.prompt(content);
```

**Features:**
- ✅ Generate concise content summaries
- ✅ Context-aware analysis
- ✅ Customizable system prompts
- ✅ Fast local processing

## ⚡ Quick Start

### Prerequisites Checklist
- [ ] Chrome Canary or Chrome Dev installed
- [ ] Chrome AI flags enabled
- [ ] AI model downloaded
- [ ] Extension loaded

### 30-Second Setup
1. **Download Chrome Canary**: [Get Chrome Canary](https://www.google.com/chrome/canary/)
2. **Enable AI Flags**: Go to `chrome://flags/` and enable required flags
3. **Download AI Model**: Visit `chrome://components/` and update "Optimization Guide On Device Model"
4. **Load Extension**: Go to `chrome://extensions/` and load this project folder

## 📖 How to Use

### 🎬 Visual Walkthrough

Here's a complete visual guide showing the extension in action:

#### 🚀 Starting Fresh
![Extension Popup - Initial State](https://github.com/user-attachments/assets/popup-initial-state.png)
*Clean interface ready for your first session - just click "+ New" to get started*

#### 📝 Working with Tasks
![Extension Popup - With Task](https://github.com/user-attachments/assets/popup-with-task.png)
*Job application example showing task description and extracted context from a job posting*

#### 🖥️ Full-Featured Interface
![Full Page Interface](https://github.com/user-attachments/assets/full-page-interface.png)
*Complete workspace with session management, context organization, and optimization history*

#### ✨ The Final Result
![Optimized Prompt Result](https://github.com/user-attachments/assets/optimized-prompt-result.png)
*Professional-grade prompt generated from your task and context - ready to use with any LLM*

### 🎬 Getting Started

#### Step 1: Create Your First Session
1. **Click the extension icon** in your Chrome toolbar
2. **Click "+ New"** to create a new session
3. **Enter a descriptive name** (e.g., "React Project Help", "Marketing Campaign")

![Extension Popup - Initial State](https://github.com/user-attachments/assets/popup-initial-state.png)
*The extension popup showing the initial interface with session selection and context options*

#### Step 2: Describe Your Task
1. **Enter your task** in the text area (e.g., "Help me debug this React component")
2. **Click "✏️ Proofread"** to automatically fix any grammar or spelling errors
3. **Watch the magic happen** as Chrome AI corrects your text in real-time

![Extension Popup - With Task](https://github.com/user-attachments/assets/popup-with-task.png)
*Extension popup showing a job application task with context items ready for optimization*

### 🔄 Adding Context

#### 📁 Upload Files
Perfect for code files, documentation, or any text-based content:
1. **Click "📁 Upload Files"**
2. **Select multiple files** (supports .txt, .js, .py, .md, etc.)
3. **Files are automatically processed** and added to your context

#### 📸 Capture Screenshots
Great for visual context like UI mockups, error messages, or designs:
1. **Navigate to the relevant tab**
2. **Click "📸 Screenshot"**
3. **Screenshot is automatically captured** and added to context

#### 📄 Extract Web Content
Intelligent web page analysis with AI-powered summarization:
1. **Navigate to any web page** (documentation, articles, tutorials)
2. **Click "📄 Extract Tab Content"**
3. **Chrome AI automatically generates** a 3-5 word summary
4. **Full content is extracted** and organized for context

![Full Page Interface](https://github.com/user-attachments/assets/full-page-interface.png)
*Full-page interface showing session management, context items, and optimization history*

### 🚀 Generate Optimized Prompts

#### The Magic Happens Here
1. **Click "🚀 Optimize Context"** when you have enough information
2. **Watch the progress** as the system:
   - ✅ Analyzes context sufficiency
   - ✅ Performs web research if needed
   - ✅ Generates structured prompt
3. **Copy the result** and use it with any LLM

![Optimized Prompt Result](https://github.com/user-attachments/assets/optimized-prompt-result.png)
*The extension showing a fully optimized prompt ready to copy and use with any LLM*

#### What You Get
The system transforms this:
```
"I want to apply for this job what should be my resume and application look like"
```

Into this professional prompt (as shown in the screenshot):
```
You are an expert career advisor and application strategist, specializing in tailoring job applications to specific roles and company cultures. Your task is to provide comprehensive, actionable advice on how a user should structure and populate their resume and application for the specified "Mobile Application Developer" role at Melon Infotech.

<CONTEXT>
<RAW_USER_PROMPT>
I want to apply for this job what should be my resume and application look like
</RAW_USER_PROMPT>

<JOB_POSTING_DATA>
Mobile Application Developer Delhi - [extracted job requirements, company info, and role details]
</JOB_POSTING_DATA>
</CONTEXT>

Please provide:
1. Resume structure recommendations
2. Key skills to highlight
3. Application strategy
4. Company-specific customizations

Format your response with clear sections and actionable steps.
```

### 🎯 Interface Overview

#### 🔸 Popup Interface (Quick Access)
The compact popup interface provides:
- **Session Management**: Dropdown to select or create sessions
- **Task Input**: Large text area with proofreading capability
- **Context Buttons**: Three main options for adding context
- **Context Items**: Live preview of collected information
- **Optimize Button**: One-click prompt generation

#### 🔸 Full-Page Interface (Advanced Features)
The expanded interface includes:
- **Session Sidebar**: Complete session history and management
- **Detailed Context View**: Full content preview and organization
- **Optimization History**: Track all generated prompts
- **Advanced Controls**: Upload, screenshot, and extraction tools

### 🔄 Managing Sessions

#### Session Features
- **Multiple Sessions**: Work on different projects simultaneously
- **Auto-Save**: All changes are saved automatically
- **Cross-Window**: Sessions persist across browser windows
- **Context Management**: Add, remove, and organize context items easily

#### Best Practices
- **Use descriptive names** for sessions (e.g., "E-commerce Bug Fix", "API Integration")
- **Keep related context together** in the same session
- **Remove outdated context** to keep sessions clean
- **Create new sessions** for different projects or topics

## 🛠️ Installation Guide

### Step 1: Install Chrome Canary/Dev
Chrome AI APIs are currently only available in experimental Chrome versions:

- **Chrome Canary**: [Download here](https://www.google.com/chrome/canary/)
- **Chrome Dev**: [Download here](https://www.google.com/chrome/dev/)

### Step 2: Enable Chrome AI Flags
1. **Open Chrome Canary/Dev**
2. **Navigate to** `chrome://flags/`
3. **Search and enable these flags**:
   ```
   ✅ proofreader-api-for-gemini-nano
   ✅ prompt-api-for-gemini-nano
   ✅ bypass-perf-requirement-for-gemini-nano (if needed)
   ```
4. **Restart Chrome** when prompted

### Step 3: Download AI Model
1. **Navigate to** `chrome://components/`
2. **Find** "Optimization Guide On Device Model"
3. **Click "Check for update"**
4. **Wait for download** (may take several minutes)
5. **Verify status** shows "Up to date"

### Step 4: Install Extension
1. **Clone or download** this repository
2. **Open Chrome** and go to `chrome://extensions/`
3. **Enable "Developer mode"** (top-right toggle)
4. **Click "Load unpacked"**
5. **Select the project folder**
6. **Verify** the extension appears in your toolbar

### Step 5: Verify Installation
1. **Click the extension icon**
2. **Create a test session**
3. **Try the proofreading feature** with some text containing errors
4. **If it works**, you're all set! 🎉

## 🔧 Configuration

### API Keys
The extension uses a hardcoded Gemini API key for demonstration. For production use:

1. **Get your API key** from [Google AI Studio](https://makersuite.google.com/app/apikey)
2. **Replace the key** in `utils/constants.js`:
   ```javascript
   export const GEMINI_API_KEY = "your-api-key-here";
   ```

### Permissions
The extension requires these Chrome permissions:
- **storage**: Save sessions and context data
- **tabs**: Access tab information for screenshots
- **activeTab**: Extract content from current tab
- **scripting**: Inject content scripts for AI processing
- **aiProofreaderOriginTrial**: Access Chrome Proofreader API
- **<all_urls>**: Extract content from any website

## 📁 Project Structure

```
Chrome_AI_Hackathon/
├── 📄 manifest.json              # Extension configuration
├── 📖 README.md                  # This documentation
├── 🚫 .gitignore                 # Git ignore rules
│
├── 🔧 background/
│   └── background.js             # Service worker + Chrome Prompt API
│
├── 🎨 popup/
│   ├── popup.html               # Extension popup interface
│   ├── popup.js                 # Popup logic + Proofreader API
│   └── popup.css                # Popup styling
│
├── 📝 content/
│   └── content.js               # Content script for page interaction
│
├── 📱 extension-page/
│   ├── extension-page.html      # Full-page interface
│   ├── extension-page.js        # Full-page logic
│   └── extension-page.css       # Full-page styling
│
├── 🛠️ utils/
│   ├── constants.js             # Configuration constants
│   ├── session-manager.js       # Session management
│   ├── gemini-api.js           # Gemini API integration
│   ├── helpers.js              # Utility functions
│   └── storage.js              # Chrome storage utilities
│
└── 🎨 icons/
    ├── icon16.png              # 16x16 extension icon
    ├── icon48.png              # 48x48 extension icon
    └── icon128.png             # 128x128 extension icon
```

## 🚨 Troubleshooting

### Chrome AI Issues

#### ❌ "Chrome AI not available"
**Solution:**
1. Ensure you're using Chrome Canary or Chrome Dev
2. Check that AI flags are enabled in `chrome://flags/`
3. Restart Chrome after enabling flags

#### ❌ "Proofreader API not available"
**Solution:**
1. Enable `proofreader-api-for-gemini-nano` flag
2. Restart Chrome
3. Try enabling `bypass-perf-requirement-for-gemini-nano` if still not working

#### ❌ "Model downloading" or "After download"
**Solution:**
1. Go to `chrome://components/`
2. Find "Optimization Guide On Device Model"
3. Click "Check for update"
4. Wait for download to complete (can take 10-30 minutes)
5. Restart Chrome after download

#### ❌ "Not available on this device"
**Solution:**
1. Enable `bypass-perf-requirement-for-gemini-nano` flag
2. Restart Chrome
3. If still not working, your device may not meet minimum requirements

### Extension Issues

#### ❌ Extension not loading
**Solution:**
1. Check that Developer mode is enabled in `chrome://extensions/`
2. Verify all files are present in the project folder
3. Check browser console for error messages
4. Try reloading the extension

#### ❌ Proofreading not working
**Solution:**
1. Verify Chrome AI setup is complete
2. Check that you're using the popup interface (not content script)
3. Try with simple text first
4. Check browser console for errors

#### ❌ Context extraction failing
**Solution:**
1. Ensure you're on a webpage with content
2. Check that the tab is fully loaded
3. Try refreshing the page and extracting again
4. Some sites may block content extraction

### Performance Issues

#### 🐌 Slow AI responses
**Causes & Solutions:**
- **Model still downloading**: Wait for complete download
- **Large content**: Try with smaller text samples first
- **Device limitations**: Enable bypass flags or use a more powerful device

#### 🐌 Extension feels sluggish
**Solutions:**
1. Clear browser cache and restart
2. Disable other extensions temporarily
3. Check available system memory
4. Try creating a new Chrome profile

### Getting Help

If you're still experiencing issues:

1. **Check the browser console** (`F12` → Console) for error messages
2. **Verify your Chrome version** supports the required APIs
3. **Test with minimal content** to isolate the issue
4. **Create a GitHub issue** with detailed error information

## 🔮 Future Enhancements

### Planned Features
- 🎯 **More Chrome AI APIs** as they become available
- 🔄 **Offline functionality** using local Chrome AI models
- 🌐 **Multi-language support** for international users
- 📊 **Analytics dashboard** for prompt optimization insights
- 🔗 **Integration with popular LLM platforms**
- 📱 **Mobile companion app** for cross-device context

### Experimental Features
- 🧪 **Voice input** for task descriptions
- 🎨 **Visual context analysis** using Chrome's vision APIs
- 🤖 **Auto-prompt suggestions** based on context patterns
- 📈 **Performance metrics** for prompt effectiveness

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🤝 Contributing

Contributions are welcome! Please feel free to submit issues and pull requests.

### Development Setup
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly with Chrome AI APIs
5. Submit a pull request

---

**⚠️ Important Note**: This extension requires Chrome Canary or Chrome Dev with experimental AI features enabled. Chrome AI APIs are currently in development and may change.

**🎉 Ready to supercharge your LLM prompts?** Install the extension and start creating better prompts with AI assistance!