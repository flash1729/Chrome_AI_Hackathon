# Get Started Checklist

Follow these steps to get your Smart Context Generator extension up and running!

## ☐ Step 1: Get Gemini API Key (5 minutes)

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key" button
4. Copy the API key (starts with "AIza...")
5. Keep it safe - you'll need it in the next step

**✓ Done when**: You have your API key copied

---

## ☐ Step 2: Configure API Key (2 minutes)

1. Open the project in your code editor
2. Navigate to `utils/constants.js`
3. Find line 2:
   ```javascript
   export const GEMINI_API_KEY = 'YOUR_GEMINI_API_KEY_HERE';
   ```
4. Replace `YOUR_GEMINI_API_KEY_HERE` with your actual API key:
   ```javascript
   export const GEMINI_API_KEY = 'AIzaSy...your-actual-key';
   ```
5. Save the file

**✓ Done when**: Your API key is in `utils/constants.js`

---

## ☐ Step 3: Create Extension Icons (3 minutes)

### Option A: Use the Icon Generator (Recommended)
1. Open `create-icons.html` in your web browser
2. You'll see three colored squares with "SC" text
3. Click "Download 16x16" button → Save as `icon16.png` in `icons/` folder
4. Click "Download 48x48" button → Save as `icon48.png` in `icons/` folder
5. Click "Download 128x128" button → Save as `icon128.png` in `icons/` folder

### Option B: Use Any Image
1. Create or find any PNG image
2. Resize to 16x16, 48x48, and 128x128 pixels
3. Save them in the `icons/` folder with exact names:
   - `icon16.png`
   - `icon48.png`
   - `icon128.png`

**✓ Done when**: Three icon files exist in `icons/` folder

---

## ☐ Step 4: Load Extension in Chrome (2 minutes)

1. Open Google Chrome
2. Type `chrome://extensions/` in the address bar and press Enter
3. Look for "Developer mode" toggle in the top-right corner
4. Turn ON "Developer mode"
5. Click "Load unpacked" button (top-left)
6. Navigate to your project folder (the one with `manifest.json`)
7. Click "Select" or "Open"
8. The extension should appear in your extensions list

**✓ Done when**: Extension appears in Chrome with no errors

---

## ☐ Step 5: Pin the Extension (1 minute)

1. Click the puzzle piece icon (🧩) in Chrome toolbar
2. Find "Smart Context Generator" in the list
3. Click the pin icon (📌) next to it
4. The extension icon should now appear in your toolbar

**✓ Done when**: Extension icon is visible in Chrome toolbar

---

## ☐ Step 6: Test Basic Functionality (5 minutes)

### Test 1: Create a Session
1. Click the extension icon in toolbar
2. Click "+ New" button
3. Enter a name like "Test Session"
4. Click OK

**✓ Pass**: Session appears in dropdown

### Test 2: Add Task Description
1. In the "Task/Issue" field, type:
   ```
   Help me fix a bug in my JavaScript code where the API call times out
   ```
2. Notice the "Optimize Context" button is now enabled

**✓ Pass**: Task is saved, button is enabled (context is optional)

### Test 3: Upload a File
1. Create a simple text file on your computer:
   ```
   // test.js
   async function fetchData() {
     const response = await fetch('https://api.example.com/data');
     return response.json();
   }
   ```
2. Click "📁 Upload Files" button
3. Select your test file
4. File should appear in "Context Items" list

**✓ Pass**: File appears, "Optimize Context" button is now enabled

### Test 4: Run Optimization
1. Click "🚀 Optimize Context" button
2. Watch the status messages:
   - "Checking context sufficiency..."
   - Possibly "Gathering additional information..."
   - "Generating optimized prompt..."
3. Wait for the optimized prompt to appear (10-30 seconds)
4. Click "📋 Copy to Clipboard"

**✓ Pass**: Optimized prompt appears and copies successfully

---

## ☐ Step 7: Test Advanced Features (5 minutes)

### Test Screenshot
1. Open any website (e.g., Stack Overflow)
2. Click extension icon
3. Click "📸 Screenshot" button
4. Screenshot should appear in context items

**✓ Pass**: Screenshot captured

### Test Tab Extraction
1. Open a documentation page or article
2. Click extension icon
3. Click "📄 Extract Tab Content" button
4. Content should appear in context items

**✓ Pass**: Content extracted

### Test Full Page
1. Click "📋 Open Full Page" button
2. Full page interface opens in new tab
3. See your session in the sidebar
4. See all context items in detail view
5. See optimization history (if you ran optimization)

**✓ Pass**: Full page works correctly

---

## ☐ Step 8: Test Cross-Tab Persistence (3 minutes)

1. With a session active, note the session name
2. Open a new tab (Ctrl/Cmd + T)
3. Click the extension icon
4. Verify the same session is active
5. Add a context item in this new tab
6. Switch back to the first tab
7. Click extension icon
8. Verify the new context item appears

**✓ Pass**: Session persists across tabs

---

## Troubleshooting

### Extension won't load
- **Check**: All three icon files exist in `icons/` folder
- **Check**: `manifest.json` is in the root folder
- **Fix**: Look at errors in `chrome://extensions/` page

### API Key Error
- **Check**: API key is correctly pasted in `utils/constants.js`
- **Check**: No extra spaces or quotes
- **Check**: Key starts with "AIza"
- **Fix**: Get a new key from Google AI Studio

### Optimization Fails
- **Check**: Internet connection is working
- **Check**: API key is valid
- **Check**: You haven't exceeded API quota
- **Fix**: Check browser console (F12) for error details

### Context Extraction Fails
- **Note**: Some websites block content extraction
- **Fix**: Try screenshot or file upload instead

### Icons Don't Show
- **Check**: Files are named exactly: `icon16.png`, `icon48.png`, `icon128.png`
- **Check**: Files are in the `icons/` folder
- **Fix**: Reload extension after adding icons

---

## Next Steps

Once everything works:

1. **Read the docs**:
   - `README.md` - Full feature documentation
   - `GEMINI_API_REFERENCE.md` - API integration details
   - `ARCHITECTURE.md` - System design

2. **Try real tasks**:
   - Debug actual code issues
   - Research new technologies
   - Write documentation
   - Plan features

3. **Explore features**:
   - Multiple sessions
   - Different context types
   - Optimization history
   - Full page interface

4. **Customize** (optional):
   - Adjust API settings in `utils/constants.js`
   - Modify UI styles in CSS files
   - Add new features

---

## Quick Reference

### File Locations
- API Key: `utils/constants.js` (line 2)
- Icons: `icons/` folder
- Manifest: `manifest.json` (root)

### Chrome URLs
- Extensions: `chrome://extensions/`
- Extension Console: Click "service worker" link on extension card

### Important Commands
- Reload Extension: Click reload icon on extension card
- View Errors: Click "Errors" button on extension card
- Open DevTools: Right-click extension icon → "Inspect popup"

### API Resources
- Get API Key: https://makersuite.google.com/app/apikey
- API Docs: https://ai.google.dev/gemini-api/docs
- Check Quota: https://makersuite.google.com/

---

## Completion Checklist

- [ ] API key configured
- [ ] Icons created
- [ ] Extension loaded in Chrome
- [ ] Extension pinned to toolbar
- [ ] Session created successfully
- [ ] File upload works
- [ ] Screenshot works
- [ ] Tab extraction works
- [ ] Optimization works
- [ ] Copy to clipboard works
- [ ] Full page opens
- [ ] Cross-tab persistence works

**When all checked**: You're ready to use the extension! 🎉

---

## Need Help?

1. Check `SETUP.md` for detailed setup instructions
2. Check `TESTING.md` for comprehensive testing checklist
3. Check `README.md` for feature documentation
4. Check browser console (F12) for error messages
5. Check `chrome://extensions/` for extension errors

**Happy optimizing!** 🚀
