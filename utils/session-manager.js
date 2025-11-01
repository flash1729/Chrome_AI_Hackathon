import { StorageManager } from "./storage.js";
import { generateId } from "./helpers.js";

/**
 * Session Manager - handles session lifecycle and operations
 */
export class SessionManager {
  /**
   * Create a new session
   */
  static async createSession(windowId, name, taskDescription = "") {
    const session = {
      id: generateId(),
      windowId: windowId,
      name: name || `Session ${new Date().toLocaleString()}`,
      taskDescription: taskDescription,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      contextItems: [],
      optimizationHistory: [],
      status: "active",
      // New fields for incremental prompt building
      currentPrompt: null,
      promptVersion: 0,
      lastOptimizedContextIds: [],
    };

    await StorageManager.saveSession(session);
    await StorageManager.setActiveSession(windowId, session.id);

    return session;
  }

  /**
   * Get active session for current window
   */
  static async getActiveSession(windowId) {
    return await StorageManager.getActiveSession(windowId);
  }

  /**
   * Get session by ID
   */
  static async getSession(sessionId) {
    return await StorageManager.getSession(sessionId);
  }

  /**
   * Get all sessions
   */
  static async getAllSessions() {
    return await StorageManager.getAllSessions();
  }

  /**
   * Update session
   */
  static async updateSession(sessionId, updates) {
    const session = await StorageManager.getSession(sessionId);
    if (!session) {
      throw new Error("Session not found");
    }

    const updatedSession = {
      ...session,
      ...updates,
      updatedAt: Date.now(),
    };

    await StorageManager.saveSession(updatedSession);
    return updatedSession;
  }

  /**
   * Add context item to session
   */
  static async addContextItem(sessionId, contextItem) {
    const session = await StorageManager.getSession(sessionId);
    if (!session) {
      throw new Error("Session not found");
    }

    const item = {
      id: generateId(),
      ...contextItem,
      timestamp: Date.now(),
    };

    session.contextItems.push(item);
    session.updatedAt = Date.now();

    await StorageManager.saveSession(session);
    return item;
  }

  /**
   * Remove context item from session
   */
  static async removeContextItem(sessionId, itemId) {
    const session = await StorageManager.getSession(sessionId);
    if (!session) {
      throw new Error("Session not found");
    }

    session.contextItems = session.contextItems.filter(
      (item) => item.id !== itemId
    );
    session.updatedAt = Date.now();

    await StorageManager.saveSession(session);
    return true;
  }

  /**
   * Add optimization result to session history
   */
  static async addOptimizationResult(sessionId, result) {
    const session = await StorageManager.getSession(sessionId);
    if (!session) {
      throw new Error("Session not found");
    }

    const optimizationResult = {
      id: generateId(),
      ...result,
      timestamp: Date.now(),
    };

    session.optimizationHistory.push(optimizationResult);

    // Update current prompt and tracking
    session.currentPrompt = result.optimizedPrompt;
    session.promptVersion = (session.promptVersion || 0) + 1;
    session.lastOptimizedContextIds = session.contextItems.map(
      (item) => item.id
    );
    session.updatedAt = Date.now();

    await StorageManager.saveSession(session);
    return optimizationResult;
  }

  /**
   * Get new context items that haven't been optimized yet
   */
  static async getNewContextItems(sessionId) {
    const session = await StorageManager.getSession(sessionId);
    if (!session) {
      throw new Error("Session not found");
    }

    const lastOptimizedIds = session.lastOptimizedContextIds || [];
    const newItems = session.contextItems.filter(
      (item) => !lastOptimizedIds.includes(item.id)
    );

    return newItems;
  }

  /**
   * Check if session has unoptimized context
   */
  static async hasNewContext(sessionId) {
    const newItems = await this.getNewContextItems(sessionId);
    return newItems.length > 0;
  }

  /**
   * Reset current prompt (force full rebuild on next optimization)
   */
  static async resetCurrentPrompt(sessionId) {
    const session = await StorageManager.getSession(sessionId);
    if (!session) {
      throw new Error("Session not found");
    }

    session.currentPrompt = null;
    session.promptVersion = 0;
    session.lastOptimizedContextIds = [];
    session.updatedAt = Date.now();

    await StorageManager.saveSession(session);
    return true;
  }

  /**
   * Archive a session
   */
  static async archiveSession(sessionId) {
    return await this.updateSession(sessionId, { status: "archived" });
  }

  /**
   * Delete a session
   */
  static async deleteSession(sessionId) {
    return await StorageManager.deleteSession(sessionId);
  }

  /**
   * Set active session for a window
   */
  static async setActiveSession(windowId, sessionId) {
    // Verify session exists
    const session = await StorageManager.getSession(sessionId);
    if (!session) {
      throw new Error("Session not found");
    }

    await StorageManager.setActiveSession(windowId, sessionId);
    return true;
  }

  /**
   * Get current window ID
   */
  static async getCurrentWindowId() {
    try {
      const window = await chrome.windows.getCurrent();
      return window.id;
    } catch (error) {
      console.error("Failed to get current window:", error);
      return null;
    }
  }
}
