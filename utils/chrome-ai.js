/**
 * Chrome AI Utility Module
 * Handles interactions with Chrome's built-in AI APIs (Prompt API)
 */

/**
 * Check if Chrome AI is available
 */
export function isChromeAIAvailable() {
  return typeof window !== 'undefined' && 
         'ai' in window && 
         'languageModel' in window.ai;
}

/**
 * Create a summarization session for generating short content descriptions
 */
export async function createSummarizationSession() {
  if (!isChromeAIAvailable()) {
    throw new Error('Chrome AI not available');
  }

  try {
    const session = await window.ai.languageModel.create({
      systemPrompt: `You are a content summarizer. Your task is to create very short, descriptive summaries of web page content.

Rules:
- Use exactly 3-5 words
- Be descriptive and specific
- Focus on the main topic or purpose
- Use title case (capitalize first letters)
- No punctuation at the end
- Examples: "React Documentation Guide", "News Article Politics", "Recipe Chocolate Cake", "GitHub Repository Code"

Respond with only the summary, nothing else.`
    });

    return session;
  } catch (error) {
    console.error('Failed to create AI session:', error);
    throw new Error('Failed to initialize Chrome AI session');
  }
}

/**
 * Generate a short summary of content using Chrome AI
 */
export async function generateContentSummary(content, title = '', url = '') {
  if (!content || content.trim().length === 0) {
    return null;
  }

  try {
    const session = await createSummarizationSession();
    
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
    
    // If summary doesn't meet criteria, return null to use fallback
    return null;
  } catch (error) {
    console.error('Failed to generate content summary:', error);
    return null;
  }
}

/**
 * Generate fallback summary from title and URL
 */
export function generateFallbackSummary(title, url) {
  if (title && title.trim().length > 0) {
    // Extract meaningful words from title
    const words = title
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 2)
      .slice(0, 4);
    
    if (words.length >= 2) {
      return words.join(' ');
    }
  }

  if (url) {
    try {
      const urlObj = new URL(url);
      const domain = urlObj.hostname.replace('www.', '');
      const pathParts = urlObj.pathname.split('/').filter(part => part.length > 0);
      
      if (pathParts.length > 0) {
        const mainPath = pathParts[0].replace(/[-_]/g, ' ');
        return `${domain} ${mainPath}`.substring(0, 20);
      }
      
      return domain;
    } catch {
      return 'Web Content';
    }
  }

  return 'Web Content';
}

/**
 * Get display name for content with AI enhancement and fallbacks
 */
export async function getContentDisplayName(content, metadata = {}) {
  const { title, url, fileName } = metadata;

  // If it's a file, use filename
  if (fileName) {
    return fileName;
  }

  // Try AI summarization first
  try {
    const aiSummary = await generateContentSummary(content, title, url);
    if (aiSummary) {
      return aiSummary;
    }
  } catch (error) {
    console.warn('AI summarization failed, using fallback:', error);
  }

  // Use fallback methods
  const fallbackSummary = generateFallbackSummary(title, url);
  return fallbackSummary;
}