import { StorageKeys } from './constants.js';

/**
 * Storage utility for Chrome Storage API
 */
export class StorageManager {
  /**
   * Save data to chrome.storage.local
   */
  static async save(key, value) {
    try {
      await chrome.storage.local.set({ [key]: value });
      return true;
    } catch (error) {
      console.error('Storage save error:', error);
      throw new Error(`Failed to save ${key}: ${error.message}`);
    }
  }

  /**
   * Load data from chrome.storage.local
   */
  static async load(key) {
    try {
      const result = await chrome.storage.local.get(key);
      return result[key];
    } catch (error) {
      console.error('Storage load error:', error);
      throw new Error(`Failed to load ${key}: ${error.message}`);
    }
  }

  /**
   * Remove data from chrome.storage.local
   */
  static async remove(key) {
    try {
      await chrome.storage.local.remove(key);
      return true;
    } catch (error) {
      console.error('Storage remove error:', error);
      throw new Error(`Failed to remove ${key}: ${error.message}`);
    }
  }

  /**
   * Clear all data from chrome.storage.local
   */
  static async clear() {
    try {
      await chrome.storage.local.clear();
      return true;
    } catch (error) {
      console.error('Storage clear error:', error);
      throw new Error(`Failed to clear storage: ${error.message}`);
    }
  }

  /**
   * Get storage usage information
   */
  static async getUsage() {
    try {
      const bytesInUse = await chrome.storage.local.getBytesInUse();
      const quota = chrome.storage.local.QUOTA_BYTES || 10485760; // 10MB default
      return {
        used: bytesInUse,
        total: quota,
        percentage: (bytesInUse / quota) * 100
      };
    } catch (error) {
      console.error('Storage usage error:', error);
      return { used: 0, total: 0, percentage: 0 };
    }
  }

  /**
   * Save a session
   */
  static async saveSession(session) {
    const sessions = await this.load(StorageKeys.SESSIONS) || {};
    sessions[session.id] = session;
    await this.save(StorageKeys.SESSIONS, sessions);
    return session;
  }

  /**
   * Get a session by ID
   */
  static async getSession(sessionId) {
    const sessions = await this.load(StorageKeys.SESSIONS) || {};
    return sessions[sessionId] || null;
  }

  /**
   * Get all sessions
   */
  static async getAllSessions() {
    const sessions = await this.load(StorageKeys.SESSIONS) || {};
    return Object.values(sessions);
  }

  /**
   * Delete a session
   */
  static async deleteSession(sessionId) {
    const sessions = await this.load(StorageKeys.SESSIONS) || {};
    delete sessions[sessionId];
    await this.save(StorageKeys.SESSIONS, sessions);
    
    // Also remove from active sessions
    const activeSessions = await this.load(StorageKeys.ACTIVE_SESSIONS) || {};
    const windowId = Object.keys(activeSessions).find(
      key => activeSessions[key] === sessionId
    );
    if (windowId) {
      delete activeSessions[windowId];
      await this.save(StorageKeys.ACTIVE_SESSIONS, activeSessions);
    }
    
    return true;
  }

  /**
   * Set active session for a window
   */
  static async setActiveSession(windowId, sessionId) {
    const activeSessions = await this.load(StorageKeys.ACTIVE_SESSIONS) || {};
    activeSessions[windowId] = sessionId;
    await this.save(StorageKeys.ACTIVE_SESSIONS, activeSessions);
    return true;
  }

  /**
   * Get active session for a window
   */
  static async getActiveSession(windowId) {
    const activeSessions = await this.load(StorageKeys.ACTIVE_SESSIONS) || {};
    const sessionId = activeSessions[windowId];
    if (!sessionId) return null;
    
    return await this.getSession(sessionId);
  }

  /**
   * Save API key securely
   */
  static async saveApiKey(apiKey) {
    await this.save('gemini_api_key', apiKey);
    return true;
  }

  /**
   * Get API key
   */
  static async getApiKey() {
    return await this.load('gemini_api_key');
  }

  /**
   * Remove API key
   */
  static async removeApiKey() {
    await this.remove('gemini_api_key');
    return true;
  }
}
