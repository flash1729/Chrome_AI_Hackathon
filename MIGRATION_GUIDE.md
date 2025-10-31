# Migration Guide: Secure API Key Management

## What Changed?

We've updated the extension to store API keys securely instead of hardcoding them in the source code. This makes it safe to commit your code to public repositories like GitHub.

## For Existing Users

If you've been using the extension with a hardcoded API key:

### Step 1: Update the Extension

1. Pull the latest changes from the repository
2. The extension will now show an API key setup screen on first use

### Step 2: Configure Your API Key

1. Click the extension icon
2. You'll see a warning: "⚠️ API Key Required"
3. Enter your Gemini API key (the same one you had in `utils/constants.js`)
4. Click "Save API Key"

### Step 3: Verify It Works

1. Create a test session
2. Add some context
3. Try optimizing - it should work exactly as before

## For Developers

### What Was Changed

1. **utils/constants.js**
   - `GEMINI_API_KEY` is now `null` (deprecated)
   - Added comment to use `StorageManager.getApiKey()` instead

2. **utils/storage.js**
   - Added `saveApiKey()` method
   - Added `getApiKey()` method
   - Added `removeApiKey()` method

3. **popup/popup.js**
   - Added API key input UI
   - Added API key validation
   - Added settings button for key management

4. **popup/popup.html**
   - Added API key section with input field
   - Added settings button

5. **background/background.js**
   - Now retrieves API key from storage before making API calls
   - Shows clear error if API key is not configured

6. **New Files**
   - `.gitignore` - Prevents committing sensitive files
   - `SECURITY.md` - Security guidelines and best practices

### Using the API Key in Your Code

**Old way (deprecated):**
```javascript
import { GEMINI_API_KEY } from './utils/constants.js';
const gemini = new GeminiAPIHandler(GEMINI_API_KEY);
```

**New way:**
```javascript
import { StorageManager } from './utils/storage.js';

const apiKey = await StorageManager.getApiKey();
if (!apiKey) {
  throw new Error('API key not configured');
}
const gemini = new GeminiAPIHandler(apiKey);
```

### Git Safety

The `.gitignore` file now includes:
```
# API Keys and Secrets
utils/constants.js
```

However, since `constants.js` is needed for the extension to work, we've kept it in the repository with the API key set to `null`. This is safe because:
- No actual API key is stored in the file
- Users must provide their own API key through the UI
- The file contains only configuration constants

## Troubleshooting

### "API key not configured" error

**Solution:** Open the extension popup and enter your API key in the setup screen.

### API key not saving

**Solution:** 
1. Check Chrome's extension permissions
2. Try removing and re-adding the extension
3. Check the browser console for errors

### Old API key still in code

**Solution:**
1. Make sure you've pulled the latest changes
2. Check that `utils/constants.js` has `GEMINI_API_KEY = null`
3. If you see your old key, replace it with `null` and save your API key through the UI

## Benefits of This Change

✅ **Safe to commit to GitHub** - No more API keys in source code
✅ **User-specific keys** - Each user uses their own API key
✅ **Better security** - Keys stored in Chrome's encrypted storage
✅ **Easy management** - Update or remove keys through the UI
✅ **No accidental exposure** - `.gitignore` prevents committing sensitive files

## Questions?

If you have any questions or issues with the migration, please open an issue on GitHub.
