import { MessageTypes } from '../utils/constants.js';
import { SessionManager } from '../utils/session-manager.js';
import { GeminiAPIHandler } from '../utils/gemini-api.js';
import { GEMINI_API_KEY } from '../utils/constants.js';

console.log('Background service worker loaded');

// Track active optimization processes
const activeOptimizations = new Map();

// Initialize extension
chrome.runtime.onInstalled.addListener(() => {
  console.log('Smart Context Generator installed');
});

// Handle messages from popup, extension page, and content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Received message:', message.type);
  
  handleMessage(message, sender)
    .then(response => {
      sendResponse({ success: true, data: response });
    })
    .catch(error => {
      console.error('Message handler error:', error);
      sendResponse({ success: false, error: error.message });
    });
  
  // Return true to indicate async response
  return true;
});

/**
 * Main message handler
 */
async function handleMessage(message, sender) {
  const { type, payload } = message;

  switch (type) {
    // Session management
    case MessageTypes.CREATE_SESSION:
      return await handleCreateSession(payload);
    
    case MessageTypes.GET_ACTIVE_SESSION:
      return await handleGetActiveSession(payload);
    
    case MessageTypes.GET_ALL_SESSIONS:
      return await handleGetAllSessions();
    
    case MessageTypes.UPDATE_SESSION:
      return await handleUpdateSession(payload);
    
    case MessageTypes.DELETE_SESSION:
      return await handleDeleteSession(payload);
    
    case MessageTypes.SET_ACTIVE_SESSION:
      return await handleSetActiveSession(payload);
    
    // Context operations
    case MessageTypes.ADD_CONTEXT_ITEM:
      return await handleAddContextItem(payload);
    
    case MessageTypes.REMOVE_CONTEXT_ITEM:
      return await handleRemoveContextItem(payload);
    
    case MessageTypes.CAPTURE_SCREENSHOT:
      return await handleCaptureScreenshot(payload);
    
    case MessageTypes.EXTRACT_TAB_CONTENT:
      return await handleExtractTabContent(payload);
    
    // Optimization
    case MessageTypes.START_OPTIMIZATION:
      return await handleStartOptimization(payload);
    
    default:
      throw new Error(`Unknown message type: ${type}`);
  }
}

/**
 * Session management handlers
 */
async function handleCreateSession(payload) {
  const { windowId, name, taskDescription } = payload;
  return await SessionManager.createSession(windowId, name, taskDescription);
}

async function handleGetActiveSession(payload) {
  const { windowId } = payload;
  return await SessionManager.getActiveSession(windowId);
}

async function handleGetAllSessions() {
  return await SessionManager.getAllSessions();
}

async function handleUpdateSession(payload) {
  const { sessionId, updates } = payload;
  return await SessionManager.updateSession(sessionId, updates);
}

async function handleDeleteSession(payload) {
  const { sessionId } = payload;
  return await SessionManager.deleteSession(sessionId);
}

async function handleSetActiveSession(payload) {
  const { windowId, sessionId } = payload;
  return await SessionManager.setActiveSession(windowId, sessionId);
}

/**
 * Context operation handlers
 */
async function handleAddContextItem(payload) {
  const { sessionId, contextItem } = payload;
  return await SessionManager.addContextItem(sessionId, contextItem);
}

async function handleRemoveContextItem(payload) {
  const { sessionId, itemId } = payload;
  return await SessionManager.removeContextItem(sessionId, itemId);
}

async function handleCaptureScreenshot(payload) {
  try {
    // Get active tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    // Capture visible tab
    const dataUrl = await chrome.tabs.captureVisibleTab(null, { format: 'png' });
    
    return {
      content: dataUrl,
      metadata: {
        url: tab.url,
        title: tab.title,
        timestamp: Date.now()
      }
    };
  } catch (error) {
    console.error('Screenshot capture error:', error);
    throw new Error('Failed to capture screenshot: ' + error.message);
  }
}

async function handleExtractTabContent(payload) {
  try {
    // Get active tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    // Inject content script if needed and extract content
    const results = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: extractPageContent
    });
    
    if (!results || !results[0]) {
      throw new Error('Failed to extract content');
    }
    
    return {
      content: results[0].result.content,
      metadata: {
        url: tab.url,
        title: results[0].result.title,
        timestamp: Date.now()
      }
    };
  } catch (error) {
    console.error('Tab content extraction error:', error);
    throw new Error('Failed to extract tab content: ' + error.message);
  }
}

/**
 * Function to be injected into page for content extraction
 */
function extractPageContent() {
  // Remove script and style tags
  const clone = document.body.cloneNode(true);
  const scripts = clone.querySelectorAll('script, style, noscript');
  scripts.forEach(el => el.remove());
  
  // Get main content
  let content = '';
  
  // Try to find main content area
  const mainSelectors = ['main', 'article', '[role="main"]', '.content', '#content'];
  for (const selector of mainSelectors) {
    const main = clone.querySelector(selector);
    if (main) {
      content = main.innerText;
      break;
    }
  }
  
  // Fallback to body text
  if (!content) {
    content = clone.innerText;
  }
  
  // Clean up whitespace
  content = content.replace(/\s+/g, ' ').trim();
  
  // Limit content length
  const maxLength = 10000;
  if (content.length > maxLength) {
    content = content.substring(0, maxLength) + '...';
  }
  
  return {
    content: content,
    title: document.title
  };
}

/**
 * Optimization handler
 */
async function handleStartOptimization(payload) {
  const { sessionId } = payload;
  
  try {
    // Get session
    const session = await SessionManager.getSession(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }
    
    // Send status update
    broadcastOptimizationStatus(sessionId, 'Checking context sufficiency...');
    
    // Initialize Gemini API
    const gemini = new GeminiAPIHandler(GEMINI_API_KEY);
    
    // Stage 1: Sufficiency Check
    const sufficiencyResult = await checkContextSufficiency(gemini, session);
    
    let additionalContext = '';
    
    // Stage 2: Web Research (if needed)
    if (!sufficiencyResult.is_sufficient) {
      broadcastOptimizationStatus(sessionId, 'Gathering additional information from the web...');
      additionalContext = await performWebResearch(gemini, session, sufficiencyResult);
    }
    
    // Stage 3: Final Optimization
    broadcastOptimizationStatus(sessionId, 'Generating optimized prompt...');
    const optimizedPrompt = await generateOptimizedPrompt(gemini, session, additionalContext);
    
    // Save result
    const result = await SessionManager.addOptimizationResult(sessionId, {
      optimizedPrompt,
      usedWebResearch: !sufficiencyResult.is_sufficient,
      searchQueries: sufficiencyResult.suggested_queries || []
    });
    
    // Broadcast completion
    broadcastOptimizationComplete(sessionId, result);
    
    return result;
  } catch (error) {
    console.error('Optimization error:', error);
    broadcastOptimizationError(sessionId, error.message);
    throw error;
  }
}

/**
 * Check context sufficiency using Gemini function calling
 */
async function checkContextSufficiency(gemini, session) {
  const contextSummary = session.contextItems.map(item => {
    return `[${item.type}] ${item.metadata?.fileName || item.metadata?.url || 'Content'}: ${
      item.content.substring(0, 200)
    }...`;
  }).join('\n');
  
  const prompt = `
Task/Issue: ${session.taskDescription}

Available Context:
${contextSummary}

Evaluate if this context is sufficient to create an optimized prompt for the task.
`;
  
  const functions = [{
    name: 'evaluate_context_sufficiency',
    description: 'Evaluates whether the provided context is sufficient to optimize the prompt for the given task',
    parameters: {
      type: 'object',
      properties: {
        is_sufficient: {
          type: 'boolean',
          description: 'Whether the context is sufficient for the task'
        },
        confidence: {
          type: 'number',
          description: 'Confidence level from 0 to 1'
        },
        reasoning: {
          type: 'string',
          description: 'Explanation of the sufficiency determination'
        },
        suggested_queries: {
          type: 'array',
          items: { type: 'string' },
          description: 'Search queries to gather missing information (only if insufficient)'
        },
        missing_aspects: {
          type: 'array',
          items: { type: 'string' },
          description: 'Specific aspects of information that are missing'
        }
      },
      required: ['is_sufficient', 'confidence', 'reasoning']
    }
  }];
  
  const systemInstruction = 'You are an expert at evaluating context sufficiency for LLM prompts. Analyze the task and available context to determine if additional information is needed.';
  
  const result = await gemini.generateContentWithFunctions(prompt, functions, systemInstruction);
  
  return result.args;
}

/**
 * Perform web research using Gemini with Google Search
 */
async function performWebResearch(gemini, session, sufficiencyResult) {
  const prompt = `
Task: ${session.taskDescription}
Missing Aspects: ${sufficiencyResult.missing_aspects.join(', ')}

Search the web and gather relevant information to fill the gaps in the context.
Provide a comprehensive summary of findings.
`;
  
  const systemInstruction = 'You are a research assistant. Search for and synthesize relevant information to help complete the context for the given task.';
  
  const result = await gemini.generateContentWithGoogleSearch(prompt, systemInstruction);
  
  return result.text;
}

/**
 * Generate optimized prompt
 */
async function generateOptimizedPrompt(gemini, session, additionalContext) {
  const contextSummary = session.contextItems.map(item => {
    return `[${item.type}] ${item.metadata?.fileName || item.metadata?.url || 'Content'}:\n${item.content}\n`;
  }).join('\n---\n');
  
  const prompt = `
Original Task: ${session.taskDescription}

Available Context:
${contextSummary}

${additionalContext ? `Additional Research:\n${additionalContext}\n` : ''}

Create an optimized, comprehensive prompt that incorporates all relevant context in a well-structured format.
`;
  
  const systemInstruction = `You are an expert prompt engineer. Your task is to transform the user's basic task description and gathered context into a highly effective, detailed prompt for an LLM.

Guidelines:
1. Structure the prompt clearly with sections
2. Include all relevant context from files, screenshots, and research
3. Make implicit requirements explicit
4. Add helpful constraints and expectations
5. Format code snippets and technical details properly
6. Ensure the prompt is self-contained and comprehensive`;
  
  const result = await gemini.generateContent(prompt, { systemInstruction });
  
  return result.candidates[0].content.parts[0].text;
}

/**
 * Broadcast optimization status to all listeners
 */
function broadcastOptimizationStatus(sessionId, status) {
  chrome.runtime.sendMessage({
    type: MessageTypes.OPTIMIZATION_STATUS,
    payload: { sessionId, status }
  }).catch(() => {
    // Ignore errors if no listeners
  });
}

/**
 * Broadcast optimization completion
 */
function broadcastOptimizationComplete(sessionId, result) {
  chrome.runtime.sendMessage({
    type: MessageTypes.OPTIMIZATION_COMPLETE,
    payload: { sessionId, result }
  }).catch(() => {
    // Ignore errors if no listeners
  });
}

/**
 * Broadcast optimization error
 */
function broadcastOptimizationError(sessionId, error) {
  chrome.runtime.sendMessage({
    type: MessageTypes.OPTIMIZATION_ERROR,
    payload: { sessionId, error }
  }).catch(() => {
    // Ignore errors if no listeners
  });
}

// Track window closures
chrome.windows.onRemoved.addListener((windowId) => {
  console.log('Window closed:', windowId);
  // Session data persists even after window closes
});
