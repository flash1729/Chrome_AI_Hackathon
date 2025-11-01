# Icon Creation Guide

## Design Concept

A modern, professional icon featuring layered documents with an AI sparkle, using Kiro's purple gradient theme.

## Quick Option: Use the SVG

I've created `icon.svg` in this folder. You can convert it to PNG using:

### Online Tools (Easiest)

1. Go to https://cloudconvert.com/svg-to-png
2. Upload `icon.svg`
3. Convert to PNG at these sizes:
   - 128x128 (icon128.png)
   - 48x48 (icon48.png)
   - 16x16 (icon16.png)

### Using Inkscape (Free Desktop Tool)

1. Download Inkscape: https://inkscape.org/
2. Open `icon.svg`
3. File → Export PNG Image
4. Set width/height and export each size

### Using ImageMagick (Command Line)

```bash
magick icon.svg -resize 128x128 icon128.png
magick icon.svg -resize 48x48 icon48.png
magick icon.svg -resize 16x16 icon16.png
```

## Design Specifications

### Colors

- **Primary Purple**: #8B5CF6
- **Dark Purple**: #6D28D9
- **Light Purple**: #a78bfa
- **Lightest Purple**: #c4b5fd
- **White**: #ffffff

### Icon Elements

1. **Background**: Purple gradient circle with rounded corners (radius 28)
2. **Main Element**: Three layered documents showing depth
3. **Accent**: AI sparkle/star symbol on front document
4. **Details**: Document lines suggesting text content
5. **Corner Accent**: Small white circles for visual interest

### Sizes Required

- **128x128**: Main icon for Chrome Web Store and extension management
- **48x48**: Toolbar icon
- **16x16**: Favicon and small displays

## Alternative: Design in Figma/Canva

If you prefer to design from scratch:

### Figma Instructions

1. Create 128x128 artboard
2. Add rounded rectangle (radius 28) with purple gradient
3. Add three overlapping rectangles (documents) with decreasing opacity
4. Add sparkle/star icon
5. Export as PNG at 1x, 2x, 3x for different sizes

### Canva Instructions

1. Create custom size: 128x128px
2. Add rounded square with purple gradient
3. Add document shapes with layers
4. Add sparkle element
5. Download as PNG

## Icon Concept Variations

If you want to try different designs:

### Option 1: Context Layers (Current)

- Layered documents with sparkle
- Represents multiple context sources

### Option 2: Brain + Code

- Brain icon with code brackets
- Represents AI intelligence

### Option 3: Puzzle Pieces

- Interlocking puzzle pieces
- Represents context assembly

### Option 4: Magic Wand + Document

- Magic wand over document
- Represents prompt optimization

## Testing Your Icons

After creating the icons:

1. Replace files in the `icons/` folder
2. Reload extension in Chrome
3. Check appearance in:
   - Extension toolbar
   - Extension management page (chrome://extensions/)
   - Extension popup
   - Chrome Web Store (if publishing)

## Tips for Best Results

- **Keep it simple**: Icons should be recognizable at 16x16
- **High contrast**: Ensure elements are visible at small sizes
- **Consistent style**: Match Kiro's modern, clean aesthetic
- **Test at all sizes**: What looks good at 128px might not work at 16px
- **Use gradients wisely**: They can look muddy at small sizes

## Current Icon Status

The current icons are placeholder white dots. Replace them with the new design for a professional appearance that matches the extension's premium UI.
