import { MessageTypes, GEMINI_API_KEY, ContextItemTypes } from '../utils/constants.js';
import { SessionManager } from '../utils/session-manager.js';
import { GeminiAPIHandler } from '../utils/gemini-api.js';
import { StorageManager } from '../utils/storage.js';

console.log('Background service worker loaded');

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

    const extractedContent = results[0].result.content;
    const extractedTitle = results[0].result.title;

    // Generate AI summary for better display
    let displayName = null;
    try {
      // Inject AI summarization script into the tab
      const aiResults = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: generateContentSummaryInTab,
        args: [extractedContent, extractedTitle, tab.url]
      });

      if (aiResults && aiResults[0] && aiResults[0].result) {
        displayName = aiResults[0].result;
      }
    } catch (aiError) {
      console.warn('AI summarization failed:', aiError);
      // Will use fallback in the UI
    }

    return {
      content: extractedContent,
      metadata: {
        url: tab.url,
        title: extractedTitle,
        displayName: displayName,
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
 * Function to be injected into page for AI content summarization
 */
async function generateContentSummaryInTab(content, title, url) {
  // Check if Chrome AI is available
  if (!('ai' in window) || !('languageModel' in window.ai)) {
    return null;
  }

  try {
    const session = await window.ai.languageModel.create({
      systemPrompt: `You are a content summarizer. Create very short, descriptive summaries of web page content.

Rules:
- Use exactly 3-5 words
- Be descriptive and specific
- Focus on the main topic or purpose
- Use title case (capitalize first letters)
- No punctuation at the end
- Examples: "React Documentation Guide", "News Article Politics", "Recipe Chocolate Cake", "GitHub Repository Code"

Respond with only the summary, nothing else.`
    });

    // Prepare content for summarization (limit length for better performance)
    const maxLength = 2000;
    const truncatedContent = content.length > maxLength
      ? content.substring(0, maxLength) + '...'
      : content;

    // Create a prompt with context
    const prompt = `Title: ${title || 'Unknown'}
URL: ${url || 'Unknown'}
Content: ${truncatedContent}

Summarize this web page content in 3-5 words:`;

    const summary = await session.prompt(prompt);

    // Clean up the response
    const cleanSummary = summary.trim().replace(/[.!?]+$/, '');

    // Validate summary length (should be 3-5 words)
    const wordCount = cleanSummary.split(/\s+/).length;
    if (wordCount >= 3 && wordCount <= 5 && cleanSummary.length > 0) {
      return cleanSummary;
    }

    return null;
  } catch (error) {
    console.error('AI summarization failed:', error);
    return null;
  }
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

    // Use hardcoded API key
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

    // Log complexity level for debugging
    const complexity = analyzePromptComplexity(session.taskDescription, session.contextItems, additionalContext);
    console.log(`Prompt optimization completed with complexity level: ${complexity}`);

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
 * Generate display name for context item with AI enhancement and fallbacks
 */
function getContextItemDisplayName(item) {
  const { type, metadata } = item;

  // For files, always use filename
  if (type === ContextItemTypes.FILE && metadata?.fileName) {
    return metadata.fileName;
  }

  // For tab content, use AI-generated displayName first
  if (type === ContextItemTypes.TAB_CONTENT) {
    if (metadata?.displayName) {
      return metadata.displayName;
    }

    // Fallback to title-based summary
    if (metadata?.title) {
      const words = metadata.title
        .replace(/[^\w\s]/g, ' ')
        .split(/\s+/)
        .filter(word => word.length > 2)
        .slice(0, 4);

      if (words.length >= 2) {
        return words.join(' ');
      }
    }

    // Fallback to domain name
    if (metadata?.url) {
      try {
        const urlObj = new URL(metadata.url);
        const domain = urlObj.hostname.replace('www.', '');
        return `${domain} Content`;
      } catch {
        return 'Web Content';
      }
    }

    return 'Web Content';
  }

  // For screenshots, use URL or title
  if (type === ContextItemTypes.SCREENSHOT) {
    if (metadata?.title) {
      return `Screenshot: ${metadata.title.substring(0, 20)}`;
    }
    if (metadata?.url) {
      try {
        const urlObj = new URL(metadata.url);
        return `Screenshot: ${urlObj.hostname.replace('www.', '')}`;
      } catch {
        return 'Screenshot';
      }
    }
    return 'Screenshot';
  }

  // Default fallback
  return metadata?.fileName || metadata?.title || metadata?.url || 'Content';
}

/**
 * Check context sufficiency using Gemini function calling
 */
async function checkContextSufficiency(gemini, session) {
  const contextSummary = session.contextItems.map(item => {
    const displayName = getContextItemDisplayName(item);
    return `[${item.type}] ${displayName}: ${item.content.substring(0, 200)
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
 * Analyze prompt complexity to determine optimization approach
 */
function analyzePromptComplexity(taskDescription, contextItems, additionalContext) {
  const factors = {
    taskLength: taskDescription.length,
    contextCount: contextItems.length,
    hasFiles: contextItems.some(item => item.type === 'file'),
    hasWebResearch: additionalContext && additionalContext.length > 0,
    totalContextLength: contextItems.reduce((sum, item) => sum + item.content.length, 0) + (additionalContext?.length || 0)
  };

  // Simple prompt criteria
  const isSimple = (
    factors.taskLength < 100 &&
    factors.contextCount === 0 &&
    !factors.hasFiles &&
    !factors.hasWebResearch &&
    factors.totalContextLength === 0
  );

  // Medium complexity criteria
  const isMedium = (
    factors.taskLength < 300 &&
    factors.contextCount <= 2 &&
    factors.totalContextLength < 5000
  );

  if (isSimple) return 'simple';
  if (isMedium) return 'medium';
  return 'complex';
}

/**
 * Generate optimized prompt using adaptive complexity-based approach
 */
async function generateOptimizedPrompt(gemini, session, additionalContext) {
  const contextSummary = session.contextItems.map(item => {
    const displayName = getContextItemDisplayName(item);
    return `[${item.type}] ${displayName}:\n${item.content}\n`;
  }).join('\n---\n');

  const complexity = analyzePromptComplexity(session.taskDescription, session.contextItems, additionalContext);

  let prompt, systemInstruction;

  if (complexity === 'simple') {
    // For simple prompts, minimal optimization
    prompt = `
Original User Task: ${session.taskDescription}

This is a simple, straightforward question. Provide a clear, direct response without unnecessary complexity.
`;

    systemInstruction = `You are a helpful assistant. The user has asked a simple question that doesn't require complex prompt engineering. Simply rephrase their question clearly and concisely if needed, or return it as-is if it's already well-formed. Keep it natural and conversational.`;

  } else if (complexity === 'medium') {
    // For medium complexity, basic structure
    prompt = `
Original User Task: ${session.taskDescription}

Available Context:
${contextSummary}

${additionalContext ? `Additional Research:\n${additionalContext}\n` : ''}

Create a well-structured prompt that includes the task, relevant context, and clear instructions.
`;

    systemInstruction = `You are a prompt optimizer. Create a clear, structured prompt that includes:
1. A brief role assignment if helpful
2. Clear task instructions
3. Relevant context in an organized way
4. Expected output format if specific

Keep it concise but complete. Don't over-engineer for medium complexity tasks.`;

  } else {
    // For complex prompts, full 5-component structure
    prompt = `
Original User Task: ${session.taskDescription}

Available Context:
${contextSummary}

${additionalContext ? `Additional Research:\n${additionalContext}\n` : ''}

Transform this into an ideal LLM prompt using the 5-component structure: Role/Persona, Task/Instruction, Context, Examples (if applicable), and Format/Output Constraints.
`;

    systemInstruction = `You are an expert prompt engineer. Your task is to transform a basic user request and a collection of context (files, web research) into a single, comprehensive, and highly effective prompt for a large language model.

Your generated prompt must follow this 5-component structure:

1.  **ROLE/PERSONA**: Assign a specific, expert role to the LLM (e.g., "You are a senior Flutter architect").
2.  **TASK/INSTRUCTION**: State the core task clearly. Be unambiguous. Break down complex tasks into steps.
3.  **CONTEXT**: Provide all necessary background information, clearly separated by XML-like tags.
    * Use <RAW_USER_PROMPT> for the original user query.
    * Use <FILE_CONTEXT file_name="..."> for file contents.
    * Use <WEB_RESEARCH> for supplemental information.
4.  **EXAMPLES** (Optional): If the task is novel or requires a specific output format, provide 1-2 concise input/output examples.
5.  **FORMAT/OUTPUT CONSTRAINTS**: Define the exact expected output format (e.g., "Provide only the code snippet," "Respond in Markdown," "Your answer must be a JSON object").

---
## Key Directives

* **GOAL**: The final prompt must be 100% complete, functional, and ready to be used.
* **COMPLETENESS**: **Your response must be complete and NOT truncated.** Ensure all code blocks, instructions, and sections are fully generated.
* **CONTEXT INTEGRITY**: You MUST include the context (files, web research) **in its entirety** inside the designated XML tags. Do NOT summarize or use excerpts unless the original context is excessively large (e.t., >20,000 tokens).
* **CLARITY**: The prompt's instructions must be precise, actionable, and leave no room for ambiguity.
* **NO HEADERS**: The final output prompt should be a single, seamless block of text. **Do not** use markdown headings (# ROLE, # TASK) to label the components. Integrate them naturally.
`;
  }

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
