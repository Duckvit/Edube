# Edube Theme System Guide

## Overview
This guide explains the unified color theme system used throughout the Edube platform for consistent design.

## Color Palette

### Primary Colors (Sky Blue)
- **Main Brand Color**: `sky-600` (#0284c7)
- **Variations**: `sky-500` to `sky-900` for different contexts
- **Usage**: Primary buttons, links, brand elements, headings

### Secondary Colors (Amber/Yellow)
- **Accent Color**: `amber-500` (#f59e0b)
- **Variations**: `amber-400` to `amber-900` for different contexts
- **Usage**: Secondary buttons, highlights, call-to-action elements

### Neutral Colors (Gray)
- **Range**: `gray-50` to `gray-900`
- **Usage**: Backgrounds, borders, text (secondary/muted)

## Common Usage Patterns

### Gradients
```jsx
// Primary gradient (sky to sky)
className="bg-gradient-to-r from-sky-600 to-sky-700"

// Primary to secondary gradient (sky to amber)
className="bg-gradient-to-r from-sky-600 to-amber-500"

// Hero background
className="bg-gradient-to-br from-sky-900 via-sky-800 to-amber-900"

// Text gradient
className="bg-gradient-to-r from-sky-600 to-amber-600 bg-clip-text text-transparent"
```

### Buttons
```jsx
// Primary button
className="bg-gradient-to-r from-sky-600 to-sky-700 text-white hover:from-sky-700 hover:to-sky-800"

// Secondary button (with amber)
className="bg-gradient-to-r from-amber-500 to-amber-600 text-white hover:from-amber-600 hover:to-amber-700"

// Accent button (sky to amber)
className="bg-gradient-to-r from-sky-600 to-amber-500 text-white hover:from-sky-700 hover:to-amber-600"
```

### Cards
```jsx
// Default card
className="bg-white rounded-xl shadow-md border border-gray-200"

// Gradient card
className="bg-gradient-to-br from-sky-50 to-amber-50 rounded-xl border border-sky-100"
```

### Text Colors
```jsx
// Primary text
className="text-gray-900"

// Secondary text
className="text-gray-600"

// Accent text
className="text-sky-600"

// Gradient text
className="bg-gradient-to-r from-sky-600 to-amber-600 bg-clip-text text-transparent"
```

## Using Theme Config

Import the theme configuration:
```jsx
import { theme, themeClasses, componentStyles } from '../utils/theme';
```

Example usage:
```jsx
// Using theme colors
const primaryColor = theme.primary[600]; // #0284c7

// Using theme classes
<button className={themeClasses.button.primary}>
  Click Me
</button>

// Using component styles
<input className={componentStyles.input} />
```

## Migration Notes

### Changed Color Mappings
- `blue-600` → `sky-600`
- `yellow-600` → `amber-500` or `amber-600`
- `purple-*` → `sky-*` or `amber-*` (depending on context)
- `indigo-*` → `sky-*`

### Before and After Examples

**Before:**
```jsx
className="bg-gradient-to-r from-blue-600 to-yellow-600"
```

**After:**
```jsx
className="bg-gradient-to-r from-sky-600 to-amber-500"
```

## Best Practices

1. **Always use theme colors** from the defined palette
2. **Maintain consistency** - use the same color combinations throughout
3. **Use gradients sparingly** - primarily for hero sections and primary buttons
4. **Follow accessibility** - ensure sufficient contrast ratios
5. **Use semantic colors** - use `success`, `error`, `warning`, `info` for appropriate contexts

## Files Updated

- `src/pages/public/HomePage.jsx`
- `src/pages/public/PublicNavigate.jsx`
- `src/pages/public/PublicFooter.jsx`
- `src/components/banner/Navigation.jsx`
- `src/components/common/Chat.jsx`
- `src/pages/public/ChangePass.jsx`
- `src/utils/theme.js` (new file)

## Future Improvements

- [ ] Add dark mode support
- [ ] Create React components for buttons, cards using theme
- [ ] Add Tailwind CSS plugin for custom theme colors
- [ ] Create Storybook stories showcasing theme components
