# Quick Setup Guide

## Step 1: Get Your Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy your API key

## Step 2: Configure the Extension

1. Open `utils/constants.js` in a text editor
2. Find this line:
   ```javascript
   export const GEMINI_API_KEY = 'YOUR_GEMINI_API_KEY_HERE';
   ```
3. Replace `YOUR_GEMINI_API_KEY_HERE` with your actual API key:
   ```javascript
   export const GEMINI_API_KEY = 'AIza...your-key-here';
   ```
4. Save the file

## Step 3: Create Icons

### Option A: Use the Icon Generator (Easiest)
1. Open `create-icons.html` in your browser
2. Click each download button to get the three icon files
3. Save them in the `icons/` directory with these exact names:
   - `icon16.png`
   - `icon48.png`
   - `icon128.png`

### Option B: Use Any Image Editor
1. Create three PNG files with solid colors or simple designs:
   - 16x16 pixels → save as `icons/icon16.png`
   - 48x48 pixels → save as `icons/icon48.png`
   - 128x128 pixels → save as `icons/icon128.png`

### Option C: Use Online Tools
1. Visit https://www.favicon-generator.org/
2. Upload any image
3. Download the generated icons
4. Rename and place them in the `icons/` directory

## Step 4: Load Extension in Chrome

1. Open Chrome browser
2. Go to `chrome://extensions/`
3. Enable "Developer mode" (toggle switch in top-right corner)
4. Click "Load unpacked" button
5. Select the extension folder (the folder containing `manifest.json`)
6. The extension should now appear in your extensions list

## Step 5: Test the Extension

1. Click the extension icon in Chrome toolbar (puzzle piece icon → Smart Context Generator)
2. Click "+ New" to create your first session
3. Enter a task description
4. Try adding context:
   - Upload a text file
   - Take a screenshot
   - Extract content from a webpage
5. Click "🚀 Optimize Context"
6. Wait for the optimized prompt to appear
7. Click "📋 Copy to Clipboard" to use it

## Troubleshooting

### Extension won't load
- **Check icons**: Make sure all three icon files exist in the `icons/` directory
- **Check manifest**: Verify `manifest.json` is in the root directory
- **Check console**: Look for errors in `chrome://extensions/` (click "Errors" button)

### API errors
- **Invalid API key**: Double-check your API key in `utils/constants.js`
- **Rate limit**: You may have exceeded your API quota. Check [Google AI Studio](https://makersuite.google.com/)
- **Network error**: Check your internet connection

### Context extraction doesn't work
- Some websites block content extraction for security reasons
- Try using file upload or screenshot instead
- Check the browser console (F12) for error messages

### Optimization takes too long
- This is normal for the first request (cold start)
- Web research mode takes longer than direct optimization
- Check your internet connection

## Next Steps

1. **Try different tasks**: Test with various types of problems
2. **Experiment with context**: See how different context types affect results
3. **Use the full page**: Click "📋 Open Full Page" for better organization
4. **Check history**: View past optimizations in the full page view

## Tips for Best Results

1. **Be specific**: Write clear, detailed task descriptions
2. **Add relevant context**: Include code, documentation, error messages
3. **Use multiple sources**: Combine files, screenshots, and web content
4. **Iterate**: Try optimizing multiple times with different context

## Need Help?

- Check the main README.md for more details
- Review the code in the project files
- Check Chrome extension documentation: https://developer.chrome.com/docs/extensions/
- Check Gemini API documentation: https://ai.google.dev/gemini-api/docs

Happy optimizing! 🚀
