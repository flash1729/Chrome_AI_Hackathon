/**
 * Content script for Smart Context Generator
 * Handles content extraction from web pages
 */

console.log('Smart Context Generator content script loaded');

// Listen for messages from background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'extractContent') {
    try {
      const content = extractPageContent();
      sendResponse({
        success: true,
        content: content.content,
        title: content.title
      });
    } catch (error) {
      console.error('Content extraction error:', error);
      sendResponse({
        success: false,
        error: error.message
      });
    }
  }
  
  return true; // Keep message channel open for async response
});

/**
 * Extract main content from the page
 */
function extractPageContent() {
  // Remove script and style tags
  const clone = document.body.cloneNode(true);
  const unwantedElements = clone.querySelectorAll('script, style, noscript, iframe, nav, header, footer, aside');
  unwantedElements.forEach(el => el.remove());
  
  let content = '';
  
  // Try to find main content area
  const mainSelectors = [
    'main',
    'article',
    '[role="main"]',
    '.main-content',
    '#main-content',
    '.content',
    '#content',
    '.post-content',
    '.article-content'
  ];
  
  for (const selector of mainSelectors) {
    const main = clone.querySelector(selector);
    if (main && main.innerText.trim().length > 100) {
      content = main.innerText;
      break;
    }
  }
  
  // Fallback to body text
  if (!content) {
    content = clone.innerText;
  }
  
  // Extract code blocks separately if present
  const codeBlocks = document.querySelectorAll('pre code, pre, code');
  const codeContent = [];
  codeBlocks.forEach((block, index) => {
    const code = block.innerText.trim();
    if (code.length > 20) { // Only include substantial code blocks
      codeContent.push(`\n\n[Code Block ${index + 1}]:\n${code}`);
    }
  });
  
  // Combine content
  if (codeContent.length > 0) {
    content += '\n\n--- Code Blocks ---' + codeContent.join('');
  }
  
  // Clean up whitespace
  content = content.replace(/\s+/g, ' ').trim();
  content = content.replace(/\n\s+\n/g, '\n\n');
  
  // Limit content length
  const maxLength = 15000;
  if (content.length > maxLength) {
    content = content.substring(0, maxLength) + '\n\n[Content truncated due to length...]';
  }
  
  return {
    content: content,
    title: document.title
  };
}

/**
 * Extract specific elements by selector (for future use)
 */
function extractBySelector(selector) {
  const elements = document.querySelectorAll(selector);
  const results = [];
  
  elements.forEach(el => {
    results.push({
      tag: el.tagName.toLowerCase(),
      text: el.innerText.trim(),
      html: el.innerHTML
    });
  });
  
  return results;
}
