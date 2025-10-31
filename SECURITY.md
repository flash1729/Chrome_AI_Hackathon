# Security Guidelines

## API Key Management

This extension requires a Gemini API key to function. **IMPORTANT**: Your API key is stored securely in Chrome's local storage and is never transmitted anywhere except to Google's Gemini API.

### Setting Up Your API Key

1. Get your API key from [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Open the extension popup
3. Enter your API key in the provided field
4. Click "Save API Key"

### Security Best Practices

- **Never commit API keys to version control**: The `utils/constants.js` file is now in `.gitignore` to prevent accidental commits
- **Keep your API key private**: Don't share it with anyone
- **Rotate your keys regularly**: Generate new API keys periodically from Google AI Studio
- **Monitor usage**: Check your API usage in Google Cloud Console to detect any unauthorized use

### How Your API Key is Stored

- Stored in Chrome's `chrome.storage.local` API
- Only accessible by this extension
- Not synced across devices
- Encrypted by Chrome's built-in security

### Removing Your API Key

To remove your API key:
1. Click the settings button (⚙️) in the extension popup
2. Choose to remove the API key
3. Confirm the action

### For Developers

If you're contributing to this project:
- Never hardcode API keys in the source code
- Use the `StorageManager.getApiKey()` method to retrieve the API key at runtime
- Test with your own API key
- Don't commit any files containing API keys

### Reporting Security Issues

If you discover a security vulnerability, please email the maintainer directly rather than opening a public issue.
