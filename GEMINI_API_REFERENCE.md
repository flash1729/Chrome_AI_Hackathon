# Gemini API Integration Reference

This document explains how the Smart Context Generator uses Google's Gemini API.

## API Configuration

Located in `utils/constants.js`:

```javascript
export const GEMINI_API_KEY = 'YOUR_GEMINI_API_KEY_HERE';

export const GEMINI_CONFIG = {
  model: 'gemini-1.5-pro',
  baseUrl: 'https://generativelanguage.googleapis.com/v1beta',
  temperature: 0.7,
  maxOutputTokens: 2048
};
```

## Three API Patterns Used

### 1. Function Calling (Sufficiency Check)

**Purpose**: Get structured output to determine if context is sufficient

**Implementation** (`utils/gemini-api.js`):
```javascript
async generateContentWithFunctions(prompt, functions, systemInstruction)
```

**Function Declaration** (`background/background.js`):
```javascript
const sufficiencyCheckFunction = {
  name: 'evaluate_context_sufficiency',
  description: 'Evaluates whether the provided context is sufficient...',
  parameters: {
    type: 'object',
    properties: {
      is_sufficient: { type: 'boolean', ... },
      confidence: { type: 'number', ... },
      reasoning: { type: 'string', ... },
      suggested_queries: { type: 'array', ... },
      missing_aspects: { type: 'array', ... }
    },
    required: ['is_sufficient', 'confidence', 'reasoning']
  }
};
```

**Response Format**:
```javascript
{
  name: 'evaluate_context_sufficiency',
  args: {
    is_sufficient: false,
    confidence: 0.85,
    reasoning: "The context lacks specific error messages...",
    suggested_queries: ["API timeout error solutions", "..."],
    missing_aspects: ["Error logs", "API documentation"]
  }
}
```

**Documentation**: https://ai.google.dev/gemini-api/docs/function-calling

### 2. Google Search Grounding (Web Research)

**Purpose**: Automatically search the web for missing information

**Implementation** (`utils/gemini-api.js`):
```javascript
async generateContentWithGoogleSearch(prompt, systemInstruction)
```

**Request Format**:
```javascript
{
  contents: [{ parts: [{ text: prompt }] }],
  tools: [{ googleSearch: {} }],
  systemInstruction: { parts: [{ text: systemInstruction }] }
}
```

**Response Format**:
```javascript
{
  text: "Based on web search results, here's what I found...",
  groundingMetadata: {
    webSearchQueries: ["query1", "query2"],
    searchEntryPoint: { ... },
    groundingChunks: [ ... ]
  }
}
```

**Documentation**: https://ai.google.dev/gemini-api/docs/grounding

### 3. Standard Generation (Final Optimization)

**Purpose**: Generate the optimized prompt with all context

**Implementation** (`utils/gemini-api.js`):
```javascript
async generateContent(prompt, options)
```

**Request Format**:
```javascript
{
  contents: [{ parts: [{ text: prompt }] }],
  generationConfig: {
    temperature: 0.7,
    maxOutputTokens: 2048,
    topP: 0.95,
    topK: 40
  },
  systemInstruction: { parts: [{ text: systemInstruction }] }
}
```

**Response Format**:
```javascript
{
  candidates: [{
    content: {
      parts: [{ text: "Optimized prompt here..." }]
    }
  }]
}
```

**Documentation**: https://ai.google.dev/gemini-api/docs/text-generation

## Complete Optimization Flow

### Stage 1: Sufficiency Check

```javascript
const sufficiencyResult = await gemini.generateContentWithFunctions(
  sufficiencyPrompt,
  [sufficiencyCheckFunction],
  'You are an expert at evaluating context sufficiency...'
);

const evaluation = sufficiencyResult.args;
// { is_sufficient: true/false, confidence: 0-1, reasoning: "...", ... }
```

### Stage 2: Web Research (Conditional)

```javascript
if (!evaluation.is_sufficient) {
  const searchResult = await gemini.generateContentWithGoogleSearch(
    researchPrompt,
    'You are a research assistant...'
  );
  
  additionalContext = searchResult.text;
  // Contains synthesized information from web searches
}
```

### Stage 3: Final Optimization

```javascript
const optimizationResult = await gemini.generateContent(
  optimizationPrompt,
  {
    systemInstruction: 'You are an expert prompt engineer...',
    temperature: 0.7,
    maxOutputTokens: 2048
  }
);

const optimizedPrompt = optimizationResult.candidates[0].content.parts[0].text;
```

## Error Handling

### Common Errors

1. **401 Unauthorized**
   - Invalid API key
   - Solution: Check API key in `utils/constants.js`

2. **429 Rate Limit**
   - Too many requests
   - Solution: Wait and retry, or upgrade quota

3. **400 Bad Request**
   - Invalid request format
   - Solution: Check request structure

4. **Network Errors**
   - Connection issues
   - Solution: Retry with exponential backoff

### Retry Logic

Implemented in `utils/gemini-api.js`:

```javascript
async makeRequest(endpoint, data, retries = 0) {
  try {
    // Make request
  } catch (error) {
    if (retries < this.maxRetries && this.isRetryableError(error)) {
      await this.delay(1000 * Math.pow(2, retries)); // Exponential backoff
      return this.makeRequest(endpoint, data, retries + 1);
    }
    throw error;
  }
}
```

## System Instructions

### Sufficiency Check
```
You are an expert at evaluating context sufficiency for LLM prompts. 
Analyze the task and available context to determine if additional 
information is needed.
```

### Web Research
```
You are a research assistant. Search for and synthesize relevant 
information to help complete the context for the given task.
```

### Prompt Optimization
```
You are an expert prompt engineer. Your task is to transform the 
user's basic task description and gathered context into a highly 
effective, detailed prompt for an LLM.

Guidelines:
1. Structure the prompt clearly with sections
2. Include all relevant context from files, screenshots, and research
3. Make implicit requirements explicit
4. Add helpful constraints and expectations
5. Format code snippets and technical details properly
6. Ensure the prompt is self-contained and comprehensive
```

## API Quotas and Limits

### Free Tier (as of 2024)
- 60 requests per minute
- 1,500 requests per day
- 1 million tokens per day

### Rate Limiting Strategy
- Implement exponential backoff
- Queue requests if needed
- Show clear error messages to users

### Token Management
- Input tokens: Count context + prompt
- Output tokens: Limited by maxOutputTokens (2048)
- Monitor usage in Google AI Studio

## Best Practices

1. **Use Appropriate Models**
   - `gemini-1.5-pro`: Complex reasoning, function calling
   - `gemini-1.5-flash`: Faster, simpler tasks

2. **Optimize Prompts**
   - Be specific and clear
   - Provide examples when needed
   - Use system instructions effectively

3. **Handle Errors Gracefully**
   - Show user-friendly messages
   - Provide retry options
   - Log errors for debugging

4. **Manage Context Size**
   - Truncate very long content
   - Summarize when possible
   - Stay within token limits

5. **Security**
   - Never expose API key in client code
   - Validate all inputs
   - Sanitize outputs

## Testing API Integration

### Test with curl

```bash
curl "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=YOUR_API_KEY" \
  -H 'Content-Type: application/json' \
  -d '{
    "contents": [{
      "parts": [{"text": "Hello, Gemini!"}]
    }]
  }'
```

### Test in Extension

1. Open Chrome DevTools
2. Go to background service worker console
3. Check for API request/response logs
4. Verify function calling responses
5. Check for errors

## Useful Resources

- **Gemini API Docs**: https://ai.google.dev/gemini-api/docs
- **Function Calling Guide**: https://ai.google.dev/gemini-api/docs/function-calling
- **Grounding Guide**: https://ai.google.dev/gemini-api/docs/grounding
- **System Instructions**: https://ai.google.dev/gemini-api/docs/system-instructions
- **API Key Management**: https://makersuite.google.com/app/apikey
- **Pricing**: https://ai.google.dev/pricing

## Troubleshooting

### API Key Issues
```javascript
// Validate API key format
GeminiAPIHandler.validateApiKey(apiKey);
// Returns: { valid: true/false, error: "..." }
```

### Request Debugging
```javascript
// Enable detailed logging
console.log('Request:', JSON.stringify(requestBody, null, 2));
console.log('Response:', JSON.stringify(response, null, 2));
```

### Common Mistakes
1. Forgetting to replace dummy API key
2. Not handling async/await properly
3. Exceeding token limits
4. Not implementing retry logic
5. Poor error messages to users

## Future Enhancements

1. **Streaming Responses**: Show progress as content generates
2. **Caching**: Cache common queries to reduce API calls
3. **Batch Processing**: Process multiple sessions together
4. **Model Selection**: Let users choose between pro/flash
5. **Token Counting**: Show estimated costs before optimization
