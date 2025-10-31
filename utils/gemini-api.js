import { GEMINI_CONFIG } from "./constants.js";

/**
 * Gemini API Handler
 * Handles all interactions with Google's Gemini API
 * Reference: https://ai.google.dev/gemini-api/docs
 */
export class GeminiAPIHandler {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseUrl = GEMINI_CONFIG.baseUrl;
    this.model = GEMINI_CONFIG.model;
    this.maxRetries = 3;
  }

  /**
   * Generate content with Gemini
   * Reference: https://ai.google.dev/gemini-api/docs/text-generation
   */
  async generateContent(prompt, options = {}) {
    const endpoint = `${this.baseUrl}/models/${this.model}:generateContent`;

    const requestBody = {
      contents: [
        {
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: {
        temperature: options.temperature || GEMINI_CONFIG.temperature,
        maxOutputTokens:
          options.maxOutputTokens || GEMINI_CONFIG.maxOutputTokens,
        topP: options.topP || 0.95,
        topK: options.topK || 40,
      },
    };

    // Add system instruction if provided
    if (options.systemInstruction) {
      requestBody.systemInstruction = {
        parts: [{ text: options.systemInstruction }],
      };
    }

    // Add tools if provided
    if (options.tools) {
      requestBody.tools = options.tools;
    }

    return await this.makeRequest(endpoint, requestBody);
  }

  /**
   * Generate content with function calling
   * Reference: https://ai.google.dev/gemini-api/docs/function-calling
   */
  async generateContentWithFunctions(prompt, functions, systemInstruction) {
    const endpoint = `${this.baseUrl}/models/${this.model}:generateContent`;

    const requestBody = {
      contents: [
        {
          parts: [{ text: prompt }],
        },
      ],
      tools: [
        {
          functionDeclarations: functions,
        },
      ],
    };

    // Add system instruction
    if (systemInstruction) {
      requestBody.systemInstruction = {
        parts: [{ text: systemInstruction }],
      };
    }

    const response = await this.makeRequest(endpoint, requestBody);

    // Extract function call from response
    if (response.candidates?.[0]?.content?.parts?.[0]?.functionCall) {
      return response.candidates[0].content.parts[0].functionCall;
    }

    // If no function call, return text response
    if (response.candidates?.[0]?.content?.parts?.[0]?.text) {
      return {
        name: "text_response",
        args: {
          text: response.candidates[0].content.parts[0].text,
        },
      };
    }

    throw new Error("No valid response from Gemini API");
  }

  /**
   * Generate content with Google Search grounding
   * Reference: https://ai.google.dev/gemini-api/docs/grounding
   */
  async generateContentWithGoogleSearch(prompt, systemInstruction) {
    const endpoint = `${this.baseUrl}/models/${this.model}:generateContent`;

    const requestBody = {
      contents: [
        {
          parts: [{ text: prompt }],
        },
      ],
      tools: [
        {
          googleSearch: {},
        },
      ],
    };

    // Add system instruction
    if (systemInstruction) {
      requestBody.systemInstruction = {
        parts: [{ text: systemInstruction }],
      };
    }

    const response = await this.makeRequest(endpoint, requestBody);

    return {
      text: response.candidates[0].content.parts[0].text,
      groundingMetadata: response.candidates[0].groundingMetadata || null,
    };
  }

  /**
   * Make HTTP request to Gemini API with retry logic
   */
  async makeRequest(endpoint, data, retries = 0) {
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": this.apiKey,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();

        // Handle specific error cases
        if (response.status === 429) {
          throw new Error("Rate limit exceeded. Please try again later.");
        }

        if (response.status === 401) {
          throw new Error("Invalid API key. Please check your Gemini API key.");
        }

        if (response.status === 400) {
          throw new Error(
            `Bad request: ${error.error?.message || "Invalid request"}`
          );
        }

        throw new Error(
          `Gemini API error (${response.status}): ${
            error.error?.message || "Unknown error"
          }`
        );
      }

      return await response.json();
    } catch (error) {
      console.error("Gemini API request error:", error);

      // Retry logic for network errors
      if (retries < this.maxRetries && this.isRetryableError(error)) {
        console.log(
          `Retrying request (attempt ${retries + 1}/${this.maxRetries})...`
        );
        await this.delay(1000 * Math.pow(2, retries)); // Exponential backoff
        return this.makeRequest(endpoint, data, retries + 1);
      }

      throw error;
    }
  }

  /**
   * Check if error is retryable
   */
  isRetryableError(error) {
    // Retry on network errors, but not on API errors like invalid key or bad request
    return (
      error.message.includes("fetch") ||
      error.message.includes("network") ||
      error.message.includes("timeout")
    );
  }

  /**
   * Delay helper for retry logic
   */
  delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Validate API key format
   */
  static validateApiKey(apiKey) {
    if (!apiKey || apiKey.trim() === "") {
      return { valid: false, error: "API key is required" };
    }

    if (apiKey === "YOUR_GEMINI_API_KEY_HERE") {
      return {
        valid: false,
        error:
          "Please replace the dummy API key with your actual Gemini API key",
      };
    }

    // Basic format check (Gemini API keys typically start with 'AI')
    if (!apiKey.startsWith("AI")) {
      return {
        valid: false,
        error:
          'Invalid API key format. Gemini API keys typically start with "AI"',
      };
    }

    return { valid: true };
  }
}
