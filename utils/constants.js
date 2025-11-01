// Gemini API Configuration
// This file can be auto-generated from .env file by running: npm run build
// For development: Replace YOUR_GEMINI_API_KEY_HERE with your actual API key
export const GEMINI_API_KEY = "AIzaSyD5GIkfzZSazRkapQuKxE8dHGYUu3aN31E";

export const GEMINI_CONFIG = {
  model: "gemini-2.5-flash", // Use flash initially, it's faster and cheaper for testing
  baseUrl: "https://generativelanguage.googleapis.com/v1beta",
  temperature: 0.7,
  maxOutputTokens: 4096,
  topK: 64,
  topP: 0.95,
};

// Helper to build full endpoint URL
export const getGeminiEndpoint = (streaming = false) => {
  const path = streaming
    ? GEMINI_CONFIG.streamGenerateContentPath
    : GEMINI_CONFIG.generateContentPath;
  return `${GEMINI_CONFIG.baseUrl}/models/${GEMINI_CONFIG.model}${path}`;
};

export const MessageTypes = {
  // Session management
  CREATE_SESSION: "create_session",
  GET_ACTIVE_SESSION: "get_active_session",
  GET_ALL_SESSIONS: "get_all_sessions",
  UPDATE_SESSION: "update_session",
  DELETE_SESSION: "delete_session",
  SET_ACTIVE_SESSION: "set_active_session",

  // Context operations
  ADD_CONTEXT_ITEM: "add_context_item",
  REMOVE_CONTEXT_ITEM: "remove_context_item",
  CAPTURE_SCREENSHOT: "capture_screenshot",
  EXTRACT_TAB_CONTENT: "extract_tab_content",



  // Optimization
  START_OPTIMIZATION: "start_optimization",
  OPTIMIZATION_STATUS: "optimization_status",
  OPTIMIZATION_COMPLETE: "optimization_complete",
  OPTIMIZATION_ERROR: "optimization_error",

  // Storage
  STORAGE_CHANGED: "storage_changed",
};

export const ContextItemTypes = {
  FILE: "file",
  SCREENSHOT: "screenshot",
  TAB_CONTENT: "tab-content",
};

export const StorageKeys = {
  ACTIVE_SESSIONS: "activeSessions",
  SESSIONS: "sessions",
  PREFERENCES: "preferences",
};
