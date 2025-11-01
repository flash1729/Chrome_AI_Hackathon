import { MessageTypes, ContextItemTypes } from '../utils/constants.js';
import { getContextItemIcon, copyToClipboard, readFileAsText, validateFile } from '../utils/helpers.js';

// DOM elements
let sessionSelect, newSessionBtn, taskInput, proofreadBtn, uploadFileBtn, fileInput;
let screenshotBtn, extractTabBtn, contextItemsList, contextCount;
let optimizeBtn, openPageBtn, statusSection, statusText, resultSection, resultContent, copyBtn;

// Current state
let currentWindowId = null;
let currentSession = null;

// Initialize popup
document.addEventListener('DOMContentLoaded', async () => {
  initializeElements();
  attachEventListeners();
  await loadCurrentWindow();
  await loadSessions();
  await loadActiveSession();
  setupMessageListener();
});

/**
 * Initialize DOM element references
 */
function initializeElements() {
  sessionSelect = document.getElementById('session-select');
  newSessionBtn = document.getElementById('new-session-btn');
  taskInput = document.getElementById('task-input');
  proofreadBtn = document.getElementById('proofread-btn');
  uploadFileBtn = document.getElementById('upload-file-btn');
  fileInput = document.getElementById('file-input');
  screenshotBtn = document.getElementById('screenshot-btn');
  extractTabBtn = document.getElementById('extract-tab-btn');
  contextItemsList = document.getElementById('context-items-list');
  contextCount = document.getElementById('context-count');
  optimizeBtn = document.getElementById('optimize-btn');
  openPageBtn = document.getElementById('open-page-btn');
  statusSection = document.getElementById('status-section');
  statusText = document.getElementById('status-text');
  resultSection = document.getElementById('result-section');
  resultContent = document.getElementById('result-content');
  copyBtn = document.getElementById('copy-btn');
}

/**
 * Attach event listeners
 */
function attachEventListeners() {
  sessionSelect.addEventListener('change', handleSessionChange);
  newSessionBtn.addEventListener('click', handleNewSession);
  taskInput.addEventListener('input', handleTaskInput);
  proofreadBtn.addEventListener('click', handleProofread);
  uploadFileBtn.addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', handleFileUpload);
  screenshotBtn.addEventListener('click', handleScreenshot);
  extractTabBtn.addEventListener('click', handleExtractTab);
  optimizeBtn.addEventListener('click', handleOptimize);
  openPageBtn.addEventListener('click', handleOpenPage);
  copyBtn.addEventListener('click', handleCopy);
}



/**
 * Load current window ID
 */
async function loadCurrentWindow() {
  const window = await chrome.windows.getCurrent();
  currentWindowId = window.id;
}

/**
 * Load all sessions
 */
async function loadSessions() {
  try {
    const response = await sendMessage(MessageTypes.GET_ALL_SESSIONS);
    const sessions = response.data || [];

    // Clear existing options except first
    sessionSelect.innerHTML = '<option value="">Select a session...</option>';

    // Add sessions
    sessions.forEach(session => {
      const option = document.createElement('option');
      option.value = session.id;
      option.textContent = session.name;
      sessionSelect.appendChild(option);
    });
  } catch (error) {
    console.error('Failed to load sessions:', error);
    showError('Failed to load sessions');
  }
}

/**
 * Load active session for current window
 */
async function loadActiveSession() {
  try {
    const response = await sendMessage(MessageTypes.GET_ACTIVE_SESSION, {
      windowId: currentWindowId
    });

    if (response.data) {
      currentSession = response.data;
      sessionSelect.value = currentSession.id;
      updateUI();
    }
  } catch (error) {
    console.error('Failed to load active session:', error);
  }
}

/**
 * Handle session change
 */
async function handleSessionChange() {
  const sessionId = sessionSelect.value;

  if (!sessionId) {
    currentSession = null;
    updateUI();
    return;
  }

  try {
    // Set as active session
    await sendMessage(MessageTypes.SET_ACTIVE_SESSION, {
      windowId: currentWindowId,
      sessionId: sessionId
    });

    // Load session data
    const response = await sendMessage(MessageTypes.GET_ACTIVE_SESSION, {
      windowId: currentWindowId
    });

    currentSession = response.data;
    updateUI();
  } catch (error) {
    console.error('Failed to change session:', error);
    showError('Failed to change session');
  }
}

/**
 * Handle new session creation
 */
async function handleNewSession() {
  const name = prompt('Enter session name:');
  if (!name) return;

  try {
    const response = await sendMessage(MessageTypes.CREATE_SESSION, {
      windowId: currentWindowId,
      name: name,
      taskDescription: ''
    });

    currentSession = response.data;
    await loadSessions();
    sessionSelect.value = currentSession.id;
    updateUI();
  } catch (error) {
    console.error('Failed to create session:', error);
    showError('Failed to create session');
  }
}

/**
 * Handle task input
 */
async function handleTaskInput() {
  if (!currentSession) return;

  try {
    await sendMessage(MessageTypes.UPDATE_SESSION, {
      sessionId: currentSession.id,
      updates: {
        taskDescription: taskInput.value
      }
    });

    currentSession.taskDescription = taskInput.value;
    updateOptimizeButton();
  } catch (error) {
    console.error('Failed to update task:', error);
  }
}







/**
 * Handle proofreading task text using Chrome Proofreader API directly in popup
 */
async function handleProofread() {
  const originalText = taskInput.value;
  
  if (!originalText.trim()) {
    showError('Please enter some text to proofread');
    return;
  }

  // Show loading state
  proofreadBtn.disabled = true;
  proofreadBtn.classList.add('processing');
  proofreadBtn.textContent = '🔄 Proofreading...';

  try {
    // Use Chrome Proofreader API directly in popup context
    const result = await proofreadWithChromeAPI(originalText);
    
    if (result.success) {
      const correctedText = result.correctedText;
      
      // Check if text actually changed
      if (correctedText !== originalText) {
        // Update the input field
        taskInput.value = correctedText;
        
        // Update session if we have one
        if (currentSession) {
          await sendMessage(MessageTypes.UPDATE_SESSION, {
            sessionId: currentSession.id,
            updates: { taskDescription: correctedText }
          });
          currentSession.taskDescription = correctedText;
          updateOptimizeButton();
        }
        
        // Show success
        proofreadBtn.textContent = '✅ Corrected!';
      } else {
        // No changes needed
        proofreadBtn.textContent = '✅ Looks good!';
      }
    } else {
      // Proofreader API failed, show helpful error message
      console.error('Proofreading failed:', result.error);
      
      // Show more user-friendly error message
      if (result.error.includes('Chrome AI not available')) {
        showError('Chrome AI not available. Please use Chrome Canary/Dev with AI flags enabled.');
      } else if (result.error.includes('proofreader-api-for-gemini-nano')) {
        showError('Enable "proofreader-api-for-gemini-nano" flag in chrome://flags/');
      } else if (result.error.includes('downloading')) {
        showError('AI model is downloading. Please wait and try again later.');
      } else {
        showError('Proofreading unavailable: ' + result.error);
      }
      
      proofreadBtn.textContent = '❌ Setup Required';
    }
    
  } catch (error) {
    console.error('Proofreading request failed:', error);
    showError('Proofreading failed: ' + error.message);
    proofreadBtn.textContent = '❌ Failed';
  }

  // Reset button after 2 seconds
  setTimeout(() => {
    proofreadBtn.textContent = '✏️ Proofread';
    proofreadBtn.disabled = false;
    proofreadBtn.classList.remove('processing');
  }, 2000);
}

/**
 * Proofread text using Chrome Proofreader API directly in popup context
 */
async function proofreadWithChromeAPI(text) {
  try {
    // Check if Chrome AI is available
    if (!('ai' in window)) {
      return {
        correctedText: text,
        success: false,
        error: 'Chrome AI not available. Please use Chrome Canary/Dev and enable AI flags in chrome://flags/'
      };
    }

    if (!('proofreader' in window.ai)) {
      return {
        correctedText: text,
        success: false,
        error: 'Proofreader API not available. Enable "proofreader-api-for-gemini-nano" flag in chrome://flags/'
      };
    }

    // Check proofreader capabilities
    let capabilities;
    try {
      capabilities = await window.ai.proofreader.capabilities();
      
      if (capabilities.available === 'no') {
        return {
          correctedText: text,
          success: false,
          error: 'Proofreader API not available on this device. Try enabling "bypass-perf-requirement" flag.'
        };
      }
      
      if (capabilities.available === 'after-download') {
        return {
          correctedText: text,
          success: false,
          error: 'Proofreader model is downloading. Check chrome://components/ for "Optimization Guide On Device Model".'
        };
      }
    } catch (capError) {
      return {
        correctedText: text,
        success: false,
        error: 'Failed to check Proofreader capabilities. Make sure Chrome AI flags are enabled.'
      };
    }

    // Create proofreader session
    let proofreader;
    try {
      proofreader = await window.ai.proofreader.create();
    } catch (createError) {
      return {
        correctedText: text,
        success: false,
        error: 'Failed to create Proofreader session. The model may still be downloading.'
      };
    }

    // Proofread the text
    let correctedText;
    try {
      correctedText = await proofreader.proofread(text);
    } catch (proofreadError) {
      return {
        correctedText: text,
        success: false,
        error: 'Proofreading failed. The text may be too long or contain unsupported content.'
      };
    }

    // Clean up and return result
    const cleanedText = correctedText ? correctedText.trim() : text;
    
    return {
      correctedText: cleanedText,
      success: true,
      error: null
    };

  } catch (error) {
    return {
      correctedText: text,
      success: false,
      error: 'Unexpected error: ' + error.message
    };
  }
}

/**
 * Handle file upload
 */
async function handleFileUpload() {
  if (!currentSession) {
    showError('Please select or create a session first');
    return;
  }

  const files = Array.from(fileInput.files);
  if (files.length === 0) return;

  for (const file of files) {
    try {
      // Validate file
      validateFile(file);

      // Read file content
      const content = await readFileAsText(file);

      // Add to session
      await sendMessage(MessageTypes.ADD_CONTEXT_ITEM, {
        sessionId: currentSession.id,
        contextItem: {
          type: ContextItemTypes.FILE,
          content: content,
          metadata: {
            fileName: file.name,
            size: file.size
          }
        }
      });
    } catch (error) {
      console.error('Failed to upload file:', error);
      showError(`Failed to upload ${file.name}: ${error.message}`);
    }
  }

  // Clear file input
  fileInput.value = '';

  // Reload session
  await reloadSession();
}

/**
 * Handle screenshot capture
 */
async function handleScreenshot() {
  if (!currentSession) {
    showError('Please select or create a session first');
    return;
  }

  try {
    const response = await sendMessage(MessageTypes.CAPTURE_SCREENSHOT);
    const { content, metadata } = response.data;

    await sendMessage(MessageTypes.ADD_CONTEXT_ITEM, {
      sessionId: currentSession.id,
      contextItem: {
        type: ContextItemTypes.SCREENSHOT,
        content: content,
        metadata: metadata
      }
    });

    await reloadSession();
  } catch (error) {
    console.error('Failed to capture screenshot:', error);
    showError('Failed to capture screenshot');
  }
}

/**
 * Handle tab content extraction
 */
async function handleExtractTab() {
  if (!currentSession) {
    showError('Please select or create a session first');
    return;
  }

  // Show loading state
  extractTabBtn.disabled = true;
  extractTabBtn.textContent = '🔄 Analyzing...';

  try {
    const response = await sendMessage(MessageTypes.EXTRACT_TAB_CONTENT);
    const { content, metadata } = response.data;

    await sendMessage(MessageTypes.ADD_CONTEXT_ITEM, {
      sessionId: currentSession.id,
      contextItem: {
        type: ContextItemTypes.TAB_CONTENT,
        content: content,
        metadata: metadata
      }
    });

    await reloadSession();
  } catch (error) {
    console.error('Failed to extract tab content:', error);
    showError('Failed to extract tab content');
  } finally {
    // Reset button state
    extractTabBtn.disabled = false;
    extractTabBtn.textContent = '📄 Extract Tab Content';
  }
}

/**
 * Handle optimize button click
 */
async function handleOptimize() {
  if (!currentSession) return;

  try {
    optimizeBtn.disabled = true;
    resultSection.style.display = 'none';
    statusSection.style.display = 'block';
    statusText.textContent = 'Starting optimization...';

    await sendMessage(MessageTypes.START_OPTIMIZATION, {
      sessionId: currentSession.id
    });
  } catch (error) {
    console.error('Optimization failed:', error);
    showError('Optimization failed: ' + error.message);
    statusSection.style.display = 'none';
    optimizeBtn.disabled = false;
  }
}

/**
 * Handle open full page
 */
function handleOpenPage() {
  chrome.tabs.create({
    url: chrome.runtime.getURL('extension-page/extension-page.html')
  });
}

/**
 * Handle copy to clipboard
 */
async function handleCopy() {
  const text = resultContent.textContent;
  const success = await copyToClipboard(text);

  if (success) {
    copyBtn.textContent = '✓ Copied!';
    setTimeout(() => {
      copyBtn.textContent = '📋 Copy to Clipboard';
    }, 2000);
  } else {
    showError('Failed to copy to clipboard');
  }
}

/**
 * Handle context item removal
 */
async function handleRemoveItem(itemId) {
  if (!currentSession) return;

  try {
    await sendMessage(MessageTypes.REMOVE_CONTEXT_ITEM, {
      sessionId: currentSession.id,
      itemId: itemId
    });

    await reloadSession();
  } catch (error) {
    console.error('Failed to remove item:', error);
    showError('Failed to remove item');
  }
}

/**
 * Reload current session
 */
async function reloadSession() {
  if (!currentSession) return;

  try {
    const response = await sendMessage(MessageTypes.GET_ACTIVE_SESSION, {
      windowId: currentWindowId
    });

    currentSession = response.data;
    updateUI();
  } catch (error) {
    console.error('Failed to reload session:', error);
  }
}

/**
 * Update UI based on current session
 */
function updateUI() {
  if (!currentSession) {
    taskInput.value = '';
    taskInput.disabled = true;
    contextItemsList.innerHTML = '<p class="empty-state">No context items yet</p>';
    contextCount.textContent = '0';
    optimizeBtn.disabled = true;
    uploadFileBtn.disabled = true;
    screenshotBtn.disabled = true;
    extractTabBtn.disabled = true;
    return;
  }

  // Enable inputs
  taskInput.disabled = false;
  uploadFileBtn.disabled = false;
  screenshotBtn.disabled = false;
  extractTabBtn.disabled = false;

  // Update task input
  taskInput.value = currentSession.taskDescription || '';

  // Update context items
  updateContextItems();

  // Update optimize button
  updateOptimizeButton();
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
 * Update context items list
 */
function updateContextItems() {
  const items = currentSession.contextItems || [];
  contextCount.textContent = items.length;

  if (items.length === 0) {
    contextItemsList.innerHTML = '<p class="empty-state">No context items yet</p>';
    return;
  }

  contextItemsList.innerHTML = '';

  items.forEach(item => {
    const div = document.createElement('div');
    div.className = 'context-item';

    const info = document.createElement('div');
    info.className = 'context-item-info';
    
    const displayName = getContextItemDisplayName(item);
    const icon = getContextItemIcon(item.type, item.metadata?.fileName);
    
    info.textContent = `${icon} ${displayName}`;

    const removeBtn = document.createElement('button');
    removeBtn.className = 'context-item-remove';
    removeBtn.textContent = '×';
    removeBtn.onclick = () => handleRemoveItem(item.id);

    div.appendChild(info);
    div.appendChild(removeBtn);
    contextItemsList.appendChild(div);
  });
}

/**
 * Update optimize button state
 */
function updateOptimizeButton() {
  const hasTask = currentSession?.taskDescription?.trim().length > 0;
  
  // Enable button if user has entered a task, even without explicit context
  // The API call flow will handle context searching automatically
  optimizeBtn.disabled = !hasTask;
}

/**
 * Setup message listener for optimization updates
 */
function setupMessageListener() {
  chrome.runtime.onMessage.addListener((message) => {
    if (message.type === MessageTypes.OPTIMIZATION_STATUS) {
      statusText.textContent = message.payload.status;
    }

    if (message.type === MessageTypes.OPTIMIZATION_COMPLETE) {
      const result = message.payload.result;
      statusSection.style.display = 'none';
      resultSection.style.display = 'block';
      resultContent.textContent = result.optimizedPrompt;
      optimizeBtn.disabled = false;
    }

    if (message.type === MessageTypes.OPTIMIZATION_ERROR) {
      statusSection.style.display = 'none';
      showError('Optimization failed: ' + message.payload.error);
      optimizeBtn.disabled = false;
    }
  });
}

/**
 * Send message to background script
 */
function sendMessage(type, payload = {}) {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage({ type, payload }, (response) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
        return;
      }

      if (response && response.success) {
        resolve(response);
      } else {
        reject(new Error(response?.error || 'Unknown error'));
      }
    });
  });
}

/**
 * Show error message
 */
function showError(message) {
  alert('❌ ' + message);
}


