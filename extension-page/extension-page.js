import { MessageTypes, ContextItemTypes } from '../utils/constants.js';
import { formatDate, getContextItemIcon, copyToClipboard, readFileAsText, validateFile, formatFileSize } from '../utils/helpers.js';

// DOM elements
let sessionsList, newSessionBtn, noSessionView, sessionDetailView;
let sessionNameInput, sessionCreated, sessionItems, taskDescription, proofreadBtn;
let uploadFileBtn, screenshotBtn, extractTabBtn, fileInput, contextItemsGrid;
let optimizeBtn, statusSection, statusText, resultSection, resultContent, copyBtn;
let historyList;

// Current state
let currentSession = null;
let allSessions = [];

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
  initializeElements();
  attachEventListeners();
  await loadAllSessions();
  setupMessageListener();
});

/**
 * Initialize DOM elements
 */
function initializeElements() {
  sessionsList = document.getElementById('sessions-list');
  newSessionBtn = document.getElementById('new-session-btn');
  noSessionView = document.getElementById('no-session-view');
  sessionDetailView = document.getElementById('session-detail-view');
  sessionNameInput = document.getElementById('session-name');
  sessionCreated = document.getElementById('session-created');
  sessionItems = document.getElementById('session-items');
  taskDescription = document.getElementById('task-description');
  proofreadBtn = document.getElementById('proofread-btn');
  uploadFileBtn = document.getElementById('upload-file-btn');
  screenshotBtn = document.getElementById('screenshot-btn');
  extractTabBtn = document.getElementById('extract-tab-btn');
  fileInput = document.getElementById('file-input');
  contextItemsGrid = document.getElementById('context-items-grid');
  optimizeBtn = document.getElementById('optimize-btn');
  statusSection = document.getElementById('status-section');
  statusText = document.getElementById('status-text');
  resultSection = document.getElementById('result-section');
  resultContent = document.getElementById('result-content');
  copyBtn = document.getElementById('copy-btn');
  historyList = document.getElementById('history-list');
}

/**
 * Attach event listeners
 */
function attachEventListeners() {
  newSessionBtn.addEventListener('click', handleNewSession);
  sessionNameInput.addEventListener('blur', handleSessionNameUpdate);
  taskDescription.addEventListener('blur', handleTaskUpdate);
  proofreadBtn.addEventListener('click', handleProofread);
  uploadFileBtn.addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', handleFileUpload);
  screenshotBtn.addEventListener('click', handleScreenshot);
  extractTabBtn.addEventListener('click', handleExtractTab);
  optimizeBtn.addEventListener('click', handleOptimize);
  copyBtn.addEventListener('click', handleCopy);
}

/**
 * Load all sessions
 */
async function loadAllSessions() {
  try {
    const response = await sendMessage(MessageTypes.GET_ALL_SESSIONS);
    allSessions = response.data || [];
    renderSessionsList();
    
    // Load first session if available
    if (allSessions.length > 0 && !currentSession) {
      selectSession(allSessions[0].id);
    }
  } catch (error) {
    console.error('Failed to load sessions:', error);
    showError('Failed to load sessions');
  }
}

/**
 * Render sessions list
 */
function renderSessionsList() {
  if (allSessions.length === 0) {
    sessionsList.innerHTML = '<p class="empty-state">No sessions yet</p>';
    return;
  }
  
  sessionsList.innerHTML = '';
  
  allSessions.forEach(session => {
    const div = document.createElement('div');
    div.className = 'session-item';
    if (currentSession && session.id === currentSession.id) {
      div.classList.add('active');
    }
    
    div.onclick = () => selectSession(session.id);
    
    const name = document.createElement('div');
    name.className = 'session-item-name';
    name.textContent = session.name;
    
    const meta = document.createElement('div');
    meta.className = 'session-item-meta';
    meta.textContent = `${formatDate(session.createdAt)} • ${session.contextItems.length} items`;
    
    div.appendChild(name);
    div.appendChild(meta);
    sessionsList.appendChild(div);
  });
}

/**
 * Select a session
 */
async function selectSession(sessionId) {
  try {
    const session = allSessions.find(s => s.id === sessionId);
    if (!session) return;
    
    currentSession = session;
    renderSessionsList();
    renderSessionDetail();
  } catch (error) {
    console.error('Failed to select session:', error);
    showError('Failed to select session');
  }
}

/**
 * Render session detail
 */
function renderSessionDetail() {
  if (!currentSession) {
    noSessionView.style.display = 'flex';
    sessionDetailView.style.display = 'none';
    return;
  }
  
  noSessionView.style.display = 'none';
  sessionDetailView.style.display = 'block';
  
  // Update header
  sessionNameInput.value = currentSession.name;
  sessionCreated.textContent = `Created: ${formatDate(currentSession.createdAt)}`;
  sessionItems.textContent = `Items: ${currentSession.contextItems.length}`;
  
  // Update task description
  taskDescription.value = currentSession.taskDescription || '';
  
  // Update context items
  renderContextItems();
  
  // Update history
  renderHistory();
  
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
 * Render context items
 */
function renderContextItems() {
  const items = currentSession.contextItems || [];
  
  if (items.length === 0) {
    contextItemsGrid.innerHTML = '<p class="empty-state">No context items yet</p>';
    return;
  }
  
  contextItemsGrid.innerHTML = '';
  
  items.forEach(item => {
    const card = document.createElement('div');
    card.className = 'context-item-card';
    
    const icon = document.createElement('div');
    icon.className = 'context-item-type';
    icon.textContent = getContextItemIcon(item.type, item.metadata?.fileName);
    
    const name = document.createElement('div');
    name.className = 'context-item-name';
    
    const displayName = getContextItemDisplayName(item);
    name.textContent = displayName;
    name.title = displayName;
    
    const meta = document.createElement('div');
    meta.className = 'context-item-meta';
    meta.textContent = formatDate(item.timestamp);
    if (item.metadata?.size) {
      meta.textContent += ` • ${formatFileSize(item.metadata.size)}`;
    }
    
    const removeBtn = document.createElement('button');
    removeBtn.className = 'context-item-remove';
    removeBtn.textContent = '×';
    removeBtn.onclick = () => handleRemoveItem(item.id);
    
    card.appendChild(icon);
    card.appendChild(name);
    card.appendChild(meta);
    card.appendChild(removeBtn);
    contextItemsGrid.appendChild(card);
  });
}

/**
 * Render optimization history
 */
function renderHistory() {
  const history = currentSession.optimizationHistory || [];
  
  if (history.length === 0) {
    historyList.innerHTML = '<p class="empty-state">No optimization history yet</p>';
    return;
  }
  
  historyList.innerHTML = '';
  
  // Show most recent first
  const sortedHistory = [...history].reverse();
  
  sortedHistory.forEach(item => {
    const div = document.createElement('div');
    div.className = 'history-item';
    
    const header = document.createElement('div');
    header.className = 'history-item-header';
    
    const date = document.createElement('span');
    date.textContent = formatDate(item.timestamp);
    
    const badge = document.createElement('span');
    badge.textContent = item.usedWebResearch ? '🔍 With Research' : '✓ Direct';
    badge.style.color = item.usedWebResearch ? '#1967d2' : '#0d652d';
    
    header.appendChild(date);
    header.appendChild(badge);
    
    const content = document.createElement('div');
    content.className = 'history-item-content';
    content.textContent = item.optimizedPrompt.substring(0, 200) + '...';
    content.style.cursor = 'pointer';
    content.onclick = () => {
      resultSection.style.display = 'block';
      resultContent.textContent = item.optimizedPrompt;
      resultSection.scrollIntoView({ behavior: 'smooth' });
    };
    
    div.appendChild(header);
    div.appendChild(content);
    historyList.appendChild(div);
  });
}

/**
 * Handle new session
 */
async function handleNewSession() {
  const name = prompt('Enter session name:');
  if (!name) return;
  
  try {
    const window = await chrome.windows.getCurrent();
    const response = await sendMessage(MessageTypes.CREATE_SESSION, {
      windowId: window.id,
      name: name,
      taskDescription: ''
    });
    
    await loadAllSessions();
    selectSession(response.data.id);
  } catch (error) {
    console.error('Failed to create session:', error);
    showError('Failed to create session');
  }
}

/**
 * Handle session name update
 */
async function handleSessionNameUpdate() {
  if (!currentSession) return;
  
  const newName = sessionNameInput.value.trim();
  if (!newName || newName === currentSession.name) return;
  
  try {
    await sendMessage(MessageTypes.UPDATE_SESSION, {
      sessionId: currentSession.id,
      updates: { name: newName }
    });
    
    currentSession.name = newName;
    renderSessionsList();
  } catch (error) {
    console.error('Failed to update session name:', error);
    showError('Failed to update session name');
  }
}

/**
 * Handle task description update
 */
async function handleTaskUpdate() {
  if (!currentSession) return;
  
  const newTask = taskDescription.value.trim();
  if (newTask === currentSession.taskDescription) return;
  
  try {
    await sendMessage(MessageTypes.UPDATE_SESSION, {
      sessionId: currentSession.id,
      updates: { taskDescription: newTask }
    });
    
    currentSession.taskDescription = newTask;
    updateOptimizeButton();
  } catch (error) {
    console.error('Failed to update task:', error);
    showError('Failed to update task');
  }
}



/**
 * Handle proofreading task text using Chrome Proofreader API
 */
async function handleProofread() {
  const originalText = taskDescription.value;
  
  if (!originalText.trim()) {
    showError('Please enter some text to proofread');
    return;
  }

  // Show loading state
  proofreadBtn.disabled = true;
  proofreadBtn.classList.add('processing');
  proofreadBtn.textContent = '🔄 Proofreading...';

  try {
    // Send text to background script for proofreading
    const response = await sendMessage(MessageTypes.PROOFREAD_TEXT, { text: originalText });
    
    if (response.data.success) {
      const correctedText = response.data.correctedText;
      
      // Check if text actually changed
      if (correctedText !== originalText) {
        // Update the input field
        taskDescription.value = correctedText;
        
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
      console.error('Proofreading failed:', response.data.error);
      
      // Show more user-friendly error message
      if (response.data.error.includes('window.ai not found')) {
        showError('Chrome AI not available. Please use Chrome Canary/Dev with AI flags enabled.');
      } else if (response.data.error.includes('proofreader-api-for-gemini-nano')) {
        showError('Enable "proofreader-api-for-gemini-nano" flag in chrome://flags/');
      } else if (response.data.error.includes('downloading')) {
        showError('AI model is downloading. Please wait and try again later.');
      } else {
        showError('Proofreading unavailable: ' + response.data.error);
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
      validateFile(file);
      const content = await readFileAsText(file);
      
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
  
  fileInput.value = '';
  await reloadSession();
}

/**
 * Handle screenshot
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
 * Handle extract tab
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
 * Handle optimize
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
 * Handle copy
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
 * Handle remove item
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
  
  await loadAllSessions();
  selectSession(currentSession.id);
}

/**
 * Update optimize button
 */
function updateOptimizeButton() {
  const hasTask = currentSession?.taskDescription?.trim().length > 0;
  
  // Enable button if user has entered a task, even without explicit context
  // The API call flow will handle context searching automatically
  optimizeBtn.disabled = !hasTask;
}

/**
 * Setup message listener
 */
function setupMessageListener() {
  chrome.runtime.onMessage.addListener((message) => {
    if (message.type === MessageTypes.OPTIMIZATION_STATUS) {
      if (currentSession && message.payload.sessionId === currentSession.id) {
        statusText.textContent = message.payload.status;
      }
    }
    
    if (message.type === MessageTypes.OPTIMIZATION_COMPLETE) {
      if (currentSession && message.payload.sessionId === currentSession.id) {
        const result = message.payload.result;
        statusSection.style.display = 'none';
        resultSection.style.display = 'block';
        resultContent.textContent = result.optimizedPrompt;
        optimizeBtn.disabled = false;
        
        // Reload to show in history
        reloadSession();
      }
    }
    
    if (message.type === MessageTypes.OPTIMIZATION_ERROR) {
      if (currentSession && message.payload.sessionId === currentSession.id) {
        statusSection.style.display = 'none';
        showError('Optimization failed: ' + message.payload.error);
        optimizeBtn.disabled = false;
      }
    }
  });
}

/**
 * Send message to background
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
 * Show error
 */
function showError(message) {
  alert(message);
}
