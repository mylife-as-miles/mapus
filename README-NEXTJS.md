# Mapus - Next.js Conversion

This is the Next.js version of Mapus. The basic structure has been set up, but the full conversion from vanilla JavaScript/jQuery to React is still in progress.

## What's Been Done

✅ Next.js project structure set up
✅ IndexedDB wrapper migrated to Next.js compatible version
✅ Basic page layout and routing
✅ Assets copied to public directory
✅ CSS styles copied
✅ Basic map component structure

## What Still Needs to Be Done

The original application uses jQuery and vanilla JavaScript extensively. To complete the conversion, the following needs to be implemented:

1. **Full Map Component** - Complete Leaflet integration with all drawing tools
2. **UI Components** - Convert sidebar, toolbars, popups to React components
3. **Drawing Tools** - Convert pen, eraser, marker, line, area tools to React
4. **Event Handlers** - Convert all jQuery event handlers to React hooks
5. **Form Handling** - Convert all form inputs and validations
6. **State Management** - Properly manage map state, objects, and UI state

## Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Run development server:**
   ```bash
   npm run dev
   ```

3. **Open [http://localhost:3000](http://localhost:3000)**

## Project Structure

```
├── app/
│   ├── layout.js          # Root layout
│   └── page.js            # Main page
├── components/
│   └── MapComponent.js    # Map component (in progress)
├── lib/
│   └── db.js              # IndexedDB wrapper
├── public/
│   └── assets/            # SVG icons and images
└── styles/
    └── globals.css        # Global styles
```

## Next Steps

To complete the conversion, you'll need to:

1. Install react-leaflet properly and set up the map
2. Convert all the jQuery selectors and event handlers
3. Create React components for each UI element
4. Implement proper state management (consider using Context API or Zustand)
5. Handle all the Leaflet Geoman drawing interactions
6. Convert all the form handling and validation

## Notes

- The original codebase is ~1500 lines of jQuery/vanilla JS
- Leaflet Geoman integration needs special handling in React
- IndexedDB operations are client-side only (already handled)
- Consider using a state management library for complex state

## Original Files

The original vanilla JS version is preserved in the `src/` directory for reference.

