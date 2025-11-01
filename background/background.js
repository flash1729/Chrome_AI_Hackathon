import { MessageTypes, GEMINI_API_KEY, ContextItemTypes } from '../utils/constants.js';
import { SessionManager } from '../utils/session-manager.js';
import { GeminiAPIHandler } from '../utils/gemini-api.js';

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
 * Function to be injected into page for AI content summarization using Chrome Prompt API
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
    return `[${item.type}] ${displayName}: ${item.content.substring(0, 200)}...`;
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
 * Generate optimized prompt using ideal LLM prompt structure
 */
async function generateOptimizedPrompt(gemini, session, additionalContext) {
  const contextSummary = session.contextItems.map(item => {
    const displayName = getContextItemDisplayName(item);
    return `[${item.type}] ${displayName}:\n${item.content}\n`;
  }).join('\n---\n');

  const prompt = `
Original User Task: ${session.taskDescription}

Available Context:
${contextSummary}

${additionalContext ? `Additional Research:\n${additionalContext}\n` : ''}

Transform this into an ideal LLM prompt using the 5-component structure: Role/Persona, Task/Instruction, Context, Examples (if applicable), and Format/Output Constraints.
`;

  const systemInstruction = `You are an expert prompt engineer specializing in creating highly effective, structured prompts for large language models. Your task is to transform basic user requests into comprehensive, well-structured prompts that maximize LLM performance.

## Core Prompt Structure Requirements

An ideal prompt must include these 5 components:

### 1. ROLE/PERSONA 
- Assign a specific, relevant role to the LLM (e.g., "You are a senior software architect", "You are an expert financial analyst")
- The role should match the expertise needed for the task
- Set the appropriate tone, style, and knowledge level

### 2. TASK/INSTRUCTION 
- State the core instruction clearly and unambiguously
- Use action verbs and be direct
- Make implicit requirements explicit
- Break down complex tasks into clear steps if needed

### 3. CONTEXT 
- Provide all necessary background information using clear delimiters
- Structure context with XML-like tags: <RAW_USER_PROMPT>, <FILE_DATA>, <WEB_RESEARCH_DATA>
- Include the original user query verbatim in <RAW_USER_PROMPT> tags
- **IMPORTANT**: For file data, include only the relevant sections/excerpts needed for the task, NOT complete file contents
- Organize file contents with clear file names and relevant sections
- Add web research data with source attribution when available
- Ensure context is comprehensive but focused

### 4. EXAMPLES (Few-Shot Prompting) 
- Include 1-2 input-output examples when the task benefits from demonstration
- Show the exact format and style expected
- Use <EXAMPLES><EXAMPLE>Input:...Output:...</EXAMPLE></EXAMPLES> structure
- Only include if examples would significantly improve output quality

### 5. FORMAT/OUTPUT CONSTRAINTS 
- Specify exact output format (Markdown, JSON, word count, etc.)
- Define structure requirements (headings, sections, bullet points)
- Set length constraints and style guidelines
- Include any specific formatting requirements

## Prompt Generation Guidelines:

1. **Analyze the Task**: Determine what type of expertise and output format would be most effective
2. **Structure Context**: Organize all provided information using clear delimiters and logical grouping
3. **Be Specific**: Replace vague instructions with precise, actionable directions
4. **Include Constraints**: Always specify output format and any limitations
5. **Preserve User Intent**: Keep the original user query intact within the context section
6. **Optimize for Clarity**: Use clear headings, proper formatting, and logical flow

## Output Format:
Generate the optimized prompt as a complete, ready-to-use prompt that follows the 5-component structure. DO NOT include structural headings like "# ROLE", "# TASK", etc. in the final output. Instead, seamlessly integrate all components into a natural, flowing prompt that contains the role assignment, clear task instructions, well-organized context, examples (if needed), and output format specifications without explicit section markers.`;

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