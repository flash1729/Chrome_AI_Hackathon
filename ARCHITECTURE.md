# Architecture Overview

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Chrome Browser                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────┐         ┌──────────────┐                      │
│  │   Popup UI   │         │ Extension    │                      │
│  │              │         │   Page UI    │                      │
│  │ - Session    │         │ - Sessions   │                      │
│  │   Select     │         │   List       │                      │
│  │ - Task Input │         │ - Detail     │                      │
│  │ - Context    │         │   View       │                      │
│  │   Buttons    │         │ - History    │                      │
│  │ - Optimize   │         │ - Advanced   │                      │
│  └──────┬───────┘         └──────┬───────┘                      │
│         │                        │                               │
│         └────────────┬───────────┘                               │
│                      │                                           │
│              ┌───────▼────────┐                                  │
│              │   Background   │                                  │
│              │Service Worker  │                                  │
│              │                │                                  │
│              │ - Message      │                                  │
│              │   Router       │                                  │
│              │ - Session Mgmt │                                  │
│              │ - API Handler  │                                  │
│              │ - Storage Mgmt │                                  │
│              └───┬────────┬───┘                                  │
│                  │        │                                      │
│         ┌────────┘        └────────┐                            │
│         │                          │                             │
│  ┌──────▼──────┐          ┌────────▼────────┐                  │
│  │  Content    │          │  Chrome Storage │                  │
│  │  Scripts    │          │      API        │                  │
│  │             │          │                 │                  │
│  │ - Extract   │          │ - Sessions      │                  │
│  │   Content   │          │ - Context Items │                  │
│  │ - Capture   │          │ - Preferences   │                  │
│  │   Data      │          │ - History       │                  │
│  └─────────────┘          └─────────────────┘                  │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ HTTPS
                              ▼
                    ┌──────────────────┐
                    │   Gemini API     │
                    │                  │
                    │ - Function Call  │
                    │ - Google Search  │
                    │ - Generation     │
                    └──────────────────┘
```

## Data Flow

### 1. Session Creation Flow

```
User Action (Popup/Page)
    │
    ├─► CREATE_SESSION message
    │
    ▼
Background Worker
    │
    ├─► SessionManager.createSession()
    │
    ▼
Storage Manager
    │
    ├─► chrome.storage.local.set()
    │
    ▼
Session Created
    │
    └─► Response to UI
```

### 2. Context Capture Flow

```
User Clicks "Upload File"
    │
    ├─► File selected
    │
    ▼
Popup/Page JS
    │
    ├─► Read file content
    │
    ├─► ADD_CONTEXT_ITEM message
    │
    ▼
Background Worker
    │
    ├─► SessionManager.addContextItem()
    │
    ▼
Storage Manager
    │
    ├─► Update session in storage
    │
    ▼
Context Added
    │
    └─► UI updates
```

### 3. Screenshot Capture Flow

```
User Clicks "Screenshot"
    │
    ├─► CAPTURE_SCREENSHOT message
    │
    ▼
Background Worker
    │
    ├─► chrome.tabs.query() - Get active tab
    │
    ├─► chrome.tabs.captureVisibleTab()
    │
    ▼
Screenshot Data (base64)
    │
    ├─► ADD_CONTEXT_ITEM message
    │
    ▼
Storage Manager
    │
    └─► Saved to session
```

### 4. Tab Content Extraction Flow

```
User Clicks "Extract Tab"
    │
    ├─► EXTRACT_TAB_CONTENT message
    │
    ▼
Background Worker
    │
    ├─► chrome.scripting.executeScript()
    │
    ▼
Content Script (injected)
    │
    ├─► extractPageContent()
    │
    ├─► Remove unwanted elements
    │
    ├─► Find main content
    │
    ├─► Extract code blocks
    │
    ▼
Extracted Content
    │
    ├─► Return to background
    │
    ▼
Background Worker
    │
    ├─► ADD_CONTEXT_ITEM message
    │
    ▼
Storage Manager
    │
    └─► Saved to session
```

### 5. Optimization Flow (Complete)

```
User Clicks "Optimize Context"
    │
    ├─► START_OPTIMIZATION message
    │
    ▼
Background Worker
    │
    ├─► Get session from storage
    │
    ├─► Status: "Checking sufficiency..."
    │
    ▼
┌─────────────────────────────────────┐
│ STAGE 1: Sufficiency Check          │
├─────────────────────────────────────┤
│ Gemini API (Function Calling)       │
│                                     │
│ Input:                              │
│ - Task description                  │
│ - All context items                 │
│                                     │
│ Function: evaluate_context_sufficiency│
│                                     │
│ Output:                             │
│ {                                   │
│   is_sufficient: boolean,           │
│   confidence: number,               │
│   reasoning: string,                │
│   suggested_queries: string[],      │
│   missing_aspects: string[]         │
│ }                                   │
└─────────────────────────────────────┘
    │
    ├─► Decision: Sufficient?
    │
    ├─── YES ──────────────────┐
    │                           │
    └─── NO ───────────┐        │
                       │        │
                       ▼        │
        ┌──────────────────────────────┐
        │ STAGE 2: Web Research        │
        ├──────────────────────────────┤
        │ Gemini API (Google Search)   │
        │                              │
        │ Input:                       │
        │ - Task description           │
        │ - Missing aspects            │
        │                              │
        │ Tool: Google Search Grounding│
        │                              │
        │ Output:                      │
        │ {                            │
        │   text: "Research findings", │
        │   groundingMetadata: {...}   │
        │ }                            │
        └──────────────┬───────────────┘
                       │
                       └────────┐
                                │
                                ▼
                ┌───────────────────────────────┐
                │ STAGE 3: Final Optimization   │
                ├───────────────────────────────┤
                │ Gemini API (Generation)       │
                │                               │
                │ Input:                        │
                │ - Task description            │
                │ - All context items           │
                │ - Additional research (if any)│
                │                               │
                │ System Instruction:           │
                │ "You are an expert prompt     │
                │  engineer..."                 │
                │                               │
                │ Output:                       │
                │ - Optimized prompt (text)     │
                └───────────────┬───────────────┘
                                │
                                ▼
                        Save to History
                                │
                                ├─► OPTIMIZATION_COMPLETE
                                │
                                ▼
                        Display Result to User
```

## Component Interactions

### Message Passing Protocol

```
┌─────────┐                    ┌────────────┐                    ┌─────────┐
│ Popup/  │                    │ Background │                    │ Content │
│  Page   │                    │  Worker    │                    │ Script  │
└────┬────┘                    └─────┬──────┘                    └────┬────┘
     │                               │                                │
     │ chrome.runtime.sendMessage()  │                                │
     ├──────────────────────────────►│                                │
     │                               │                                │
     │                               │ chrome.tabs.sendMessage()      │
     │                               ├───────────────────────────────►│
     │                               │                                │
     │                               │◄───────────────────────────────┤
     │                               │         Response               │
     │                               │                                │
     │◄──────────────────────────────┤                                │
     │         Response              │                                │
     │                               │                                │
```

### Storage Operations

```
┌──────────────┐
│ Session Data │
├──────────────┤
│              │
│ sessions: {  │
│   "id1": {   │
│     id,      │
│     name,    │
│     task,    │
│     items[], │
│     history[]│
│   }          │
│ }            │
│              │
│ activeSessions: {│
│   windowId: sessionId│
│ }            │
│              │
│ preferences: {│
│   apiKey,    │
│   ...        │
│ }            │
└──────────────┘
```

## Module Dependencies

```
popup.js
  ├─► constants.js
  ├─► helpers.js
  └─► (sends messages to background)

extension-page.js
  ├─► constants.js
  ├─► helpers.js
  └─► (sends messages to background)

background.js
  ├─► constants.js
  ├─► session-manager.js
  │   └─► storage.js
  │       └─► constants.js
  ├─► gemini-api.js
  │   └─► constants.js
  └─► helpers.js

content.js
  └─► (standalone, no imports)
```

## API Integration Architecture

```
┌─────────────────────────────────────────────────────────┐
│                  GeminiAPIHandler                        │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  generateContent(prompt, options)                       │
│    │                                                     │
│    └─► POST /models/gemini-1.5-pro:generateContent     │
│                                                          │
│  generateContentWithFunctions(prompt, functions, sys)   │
│    │                                                     │
│    └─► POST /models/gemini-1.5-pro:generateContent     │
│        + tools: [{ functionDeclarations }]              │
│                                                          │
│  generateContentWithGoogleSearch(prompt, sys)           │
│    │                                                     │
│    └─► POST /models/gemini-1.5-pro:generateContent     │
│        + tools: [{ googleSearch: {} }]                  │
│                                                          │
│  makeRequest(endpoint, data, retries)                   │
│    │                                                     │
│    ├─► Try request                                      │
│    ├─► If error & retryable                            │
│    │   └─► Exponential backoff                         │
│    │       └─► Retry                                    │
│    └─► Return response                                  │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

## State Management

```
┌──────────────────────────────────────┐
│         Application State            │
├──────────────────────────────────────┤
│                                      │
│  Current Window ID                   │
│    ↓                                 │
│  Active Session ID                   │
│    ↓                                 │
│  Session Object                      │
│    ├─► Task Description              │
│    ├─► Context Items []              │
│    │   ├─► File                      │
│    │   ├─► Screenshot                │
│    │   └─► Tab Content               │
│    └─► Optimization History []       │
│        ├─► Optimized Prompt          │
│        ├─► Timestamp                 │
│        └─► Used Web Research?        │
│                                      │
└──────────────────────────────────────┘
```

## Security Boundaries

```
┌─────────────────────────────────────────────┐
│           Extension Sandbox                  │
│                                              │
│  ┌────────────────────────────────────┐    │
│  │  Popup/Page (User Interface)       │    │
│  │  - No direct API access            │    │
│  │  - No sensitive data               │    │
│  └────────────────────────────────────┘    │
│                                              │
│  ┌────────────────────────────────────┐    │
│  │  Background Worker                 │    │
│  │  - API key stored here             │    │
│  │  - Makes all API calls             │    │
│  │  - Validates all inputs            │    │
│  └────────────────────────────────────┘    │
│                                              │
│  ┌────────────────────────────────────┐    │
│  │  Content Script                    │    │
│  │  - Isolated from page              │    │
│  │  - Limited permissions             │    │
│  │  - Sanitizes extracted content     │    │
│  └────────────────────────────────────┘    │
│                                              │
└─────────────────────────────────────────────┘
                    │
                    │ HTTPS Only
                    ▼
            ┌──────────────┐
            │  Gemini API  │
            └──────────────┘
```

## Performance Considerations

```
┌─────────────────────────────────────────┐
│         Performance Strategy             │
├─────────────────────────────────────────┤
│                                          │
│  1. Lazy Loading                        │
│     - Extension page loads on demand    │
│     - Context items rendered as needed  │
│                                          │
│  2. Efficient Storage                   │
│     - Indexed by session ID             │
│     - Minimal data duplication          │
│                                          │
│  3. API Optimization                    │
│     - Retry with exponential backoff    │
│     - Content truncation (15KB limit)   │
│     - Batch operations where possible   │
│                                          │
│  4. Memory Management                   │
│     - Clean up old sessions             │
│     - Limit context item size           │
│     - Efficient data structures         │
│                                          │
└─────────────────────────────────────────┘
```

## Error Handling Flow

```
Error Occurs
    │
    ├─► Is it retryable?
    │   ├─── YES ──► Exponential backoff ──► Retry
    │   └─── NO ───┐
    │              │
    ▼              ▼
Log Error    Show User-Friendly Message
    │              │
    └──────┬───────┘
           │
           ▼
    Broadcast Error Event
           │
           ├─► Update UI
           ├─► Enable retry button
           └─► Log for debugging
```

This architecture ensures:
- ✅ Clean separation of concerns
- ✅ Secure API key handling
- ✅ Efficient data flow
- ✅ Robust error handling
- ✅ Scalable design
- ✅ Good performance
