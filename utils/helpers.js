/**
 * Generate a unique ID
 */
export function generateId() {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Format timestamp to readable date
 */
export function formatDate(timestamp) {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now - date;
  
  // Less than 1 minute
  if (diff < 60000) {
    return 'Just now';
  }
  
  // Less than 1 hour
  if (diff < 3600000) {
    const minutes = Math.floor(diff / 60000);
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  }
  
  // Less than 1 day
  if (diff < 86400000) {
    const hours = Math.floor(diff / 3600000);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  }
  
  // Less than 7 days
  if (diff < 604800000) {
    const days = Math.floor(diff / 86400000);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  }
  
  // Default format
  return date.toLocaleDateString();
}

/**
 * Format file size to human readable
 */
export function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Truncate text to specified length
 */
export function truncateText(text, maxLength = 50) {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

/**
 * Get icon emoji for context item type
 */
export function getContextItemIcon(type, fileName = '') {
  const icons = {
    'file': '📁',
    'screenshot': '📸',
    'tab-content': '📄'
  };
  
  // Special icons for specific file types
  if (type === 'file' && fileName) {
    if (fileName.endsWith('.dart')) return '🎯';
    if (fileName.endsWith('.js') || fileName.endsWith('.ts')) return '📜';
    if (fileName.endsWith('.py')) return '🐍';
    if (fileName.endsWith('.java')) return '☕';
    if (fileName.endsWith('.json')) return '📋';
    if (fileName.endsWith('.md')) return '📝';
  }
  
  return icons[type] || '📄';
}

/**
 * Sanitize HTML to prevent XSS
 */
export function sanitizeHTML(html) {
  const div = document.createElement('div');
  div.textContent = html;
  return div.innerHTML;
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    // Fallback method
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    const success = document.execCommand('copy');
    document.body.removeChild(textarea);
    return success;
  }
}

/**
 * Read file as text
 */
export function readFileAsText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = (e) => reject(e);
    reader.readAsText(file);
  });
}

/**
 * Read file as data URL
 */
export function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = (e) => reject(e);
    reader.readAsDataURL(file);
  });
}

/**
 * Validate file type and size
 */
export function validateFile(file, maxSizeMB = 10) {
  const maxSize = maxSizeMB * 1024 * 1024; // Convert to bytes
  
  if (file.size > maxSize) {
    throw new Error(`File size exceeds ${maxSizeMB}MB limit`);
  }
  
  // Allow common text and code file types
  const allowedTypes = [
    'text/',
    'application/json',
    'application/javascript',
    'application/xml',
    'application/dart'
  ];
  
  const isAllowed = allowedTypes.some(type => file.type.startsWith(type)) ||
                    file.name.match(/\.(txt|md|js|ts|jsx|tsx|json|xml|html|css|py|java|cpp|c|h|go|rs|rb|php|sql|sh|yaml|yml|dart)$/i);
  
  if (!isAllowed) {
    throw new Error('File type not supported. Supported types: .txt, .md, .js, .ts, .jsx, .tsx, .json, .xml, .html, .css, .py, .java, .cpp, .c, .h, .go, .rs, .rb, .php, .sql, .sh, .yaml, .yml, .dart');
  }
  
  return true;
}
