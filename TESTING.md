# Testing Checklist for MVP

## Pre-Testing Setup
- [ ] Gemini API key configured in `utils/constants.js`
- [ ] All three icon files exist in `icons/` directory
- [ ] Extension loaded in Chrome without errors

## Basic Functionality Tests

### Session Management
- [ ] Create a new session
- [ ] Session appears in dropdown
- [ ] Switch between sessions
- [ ] Session persists when switching tabs
- [ ] Session persists when closing and reopening popup

### File Upload
- [ ] Upload a single text file
- [ ] Upload multiple files at once
- [ ] File appears in context items list
- [ ] File can be removed
- [ ] Error shown for unsupported file types
- [ ] Error shown for files too large (>10MB)

### Screenshot Capture
- [ ] Capture screenshot of current tab
- [ ] Screenshot appears in context items
- [ ] Screenshot can be removed
- [ ] Works on different types of websites

### Tab Content Extraction
- [ ] Extract content from a documentation page
- [ ] Extract content from Stack Overflow
- [ ] Extract content from GitHub
- [ ] Content appears in context items
- [ ] Content can be removed
- [ ] Code blocks are captured correctly

### Task Description
- [ ] Enter task description
- [ ] Task description is saved
- [ ] Task description persists across tab switches
- [ ] Optimize button enables when task is present (context is optional)
- [ ] Optimize button disabled when task is missing

## Optimization Flow Tests

### Direct Optimization (Sufficient Context)
- [ ] Create session with clear task
- [ ] Add comprehensive context (files + docs)
- [ ] Click "Optimize Context"
- [ ] Status shows "Checking context sufficiency..."
- [ ] Status shows "Generating optimized prompt..."
- [ ] Optimized prompt appears
- [ ] Prompt is well-structured and comprehensive
- [ ] Copy button works

### Web Research Flow (Insufficient Context)
- [ ] Create session with vague task
- [ ] Add minimal context
- [ ] Click "Optimize Context"
- [ ] Status shows "Checking context sufficiency..."
- [ ] Status shows "Gathering additional information..."
- [ ] Status shows "Generating optimized prompt..."
- [ ] Optimized prompt includes researched information
- [ ] Copy button works

## Full Page Interface Tests

### Navigation
- [ ] Click "Open Full Page" from popup
- [ ] Full page opens in new tab
- [ ] Sessions list shows all sessions
- [ ] Click session to view details
- [ ] Active session is highlighted

### Session Management
- [ ] Create new session from full page
- [ ] Edit session name
- [ ] Session name updates in list
- [ ] Delete context items
- [ ] Add context items (all three types)

### Optimization History
- [ ] Run optimization
- [ ] History shows new entry
- [ ] Click history item to view prompt
- [ ] History shows correct timestamp
- [ ] History shows research badge if applicable

## Cross-Tab Persistence Tests

### Same Window
- [ ] Create session in tab 1
- [ ] Add context in tab 1
- [ ] Switch to tab 2
- [ ] Open popup - same session active
- [ ] Add more context in tab 2
- [ ] Switch back to tab 1
- [ ] Open popup - all context present

### Multiple Windows
- [ ] Create session in window 1
- [ ] Open new window (window 2)
- [ ] Create different session in window 2
- [ ] Switch back to window 1
- [ ] Verify original session still active
- [ ] Switch back to window 2
- [ ] Verify second session still active

## Error Handling Tests

### API Errors
- [ ] Test with invalid API key
- [ ] Error message is clear and helpful
- [ ] Test with no internet connection
- [ ] Appropriate error shown
- [ ] Test with rate limit exceeded
- [ ] Appropriate error shown

### Permission Errors
- [ ] Try to extract content from restricted page (chrome://)
- [ ] Appropriate error shown
- [ ] Try to capture screenshot of restricted page
- [ ] Appropriate error shown

### Storage Errors
- [ ] Add many large files to test storage limits
- [ ] Appropriate warning if approaching limit

## UI/UX Tests

### Popup Interface
- [ ] All buttons are clickable
- [ ] All text is readable
- [ ] Layout looks good at default size
- [ ] No visual glitches
- [ ] Loading states are clear
- [ ] Success states are clear

### Full Page Interface
- [ ] Responsive layout works
- [ ] Sidebar scrolls properly
- [ ] Detail view scrolls properly
- [ ] All buttons work
- [ ] No visual glitches
- [ ] Context items display correctly

## Performance Tests

### Speed
- [ ] Popup opens quickly (<100ms)
- [ ] Session switching is instant
- [ ] Context items load quickly
- [ ] Screenshot capture is fast (<1s)
- [ ] Tab extraction is reasonable (<2s)

### Memory
- [ ] Extension doesn't slow down browser
- [ ] Multiple sessions don't cause issues
- [ ] Large context items are handled

## Edge Cases

### Empty States
- [ ] No sessions created yet
- [ ] Session with no context items
- [ ] Session with no task description
- [ ] Session with no optimization history

### Large Data
- [ ] Session with 20+ context items
- [ ] Very long task description (1000+ chars)
- [ ] Very large file (near 10MB limit)
- [ ] Very long extracted content

### Special Characters
- [ ] Task with emojis
- [ ] File with special characters in name
- [ ] Content with code snippets
- [ ] Content with multiple languages

## Browser Compatibility

### Chrome Versions
- [ ] Works on Chrome Stable
- [ ] Works on Chrome Beta (if available)
- [ ] Works on Chrome Canary (if available)

## Final Checks

- [ ] No console errors in background page
- [ ] No console errors in popup
- [ ] No console errors in extension page
- [ ] No console errors in content script
- [ ] All features work as expected
- [ ] Ready for demo/submission

## Known Issues to Document

List any issues found during testing:

1. 
2. 
3. 

## Test Results Summary

- **Total Tests**: ___
- **Passed**: ___
- **Failed**: ___
- **Blocked**: ___
- **Date Tested**: ___
- **Tester**: ___

## Notes

Add any additional observations or comments:

