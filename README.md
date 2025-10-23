# ASX Model Builder OS

## 🚀 Overview

This is a **Single-Page Application (SPA)** built following the **ASX OS (OS-B)** architecture specification. The entire application is driven by one central `os.json` registry, with dynamic page loading, WebGL rendering, and DOM HUD overlays.

## 📁 File Structure

```
asx-os-site/
├── index.html                  # Boot frame (never navigates away)
├── os/
│   ├── os.json                 # Central OS registry (all pages, routes, assets)
│   └── page.js                 # Generic page controller/loader
├── engine/
│   ├── asx.js                  # ASX runtime + VDOM
│   └── os-loader.js            # OS boot + router + dependency resolver
├── renderer/
│   ├── webgl.js                # WebGL init + scene adapter
│   └── dom-hud.js              # HUD/overlay + fallback DOM renderer
├── assets/                     # (optional) shared images/fonts/audio
└── README.md                   # This file
```

## 🎨 Architecture

### ASX OS-B Standards
- **Single Registry**: Everything lives in `os.json` (pages, routes, content, scripts)
- **Lazy Loading**: `page.js` loads only what the active page needs
- **WebGL Primary**: WebGL rendering is the primary display method
- **DOM HUD**: DOM overlays for UI + fallback when WebGL unavailable
- **ASX Scripting**: Page behaviors defined in ASX inline or external scripts

### Rendering Pipeline
1. **WebGL** (Primary) - Background scenes, animations, 3D content
2. **DOM HUD** (Overlay) - UI elements, text, interactive components
3. **Fallback** - If WebGL unavailable, 2D canvas + full DOM rendering

## 🚀 Quick Start

### Requirements
- Modern web browser with ES6 module support
- Static file server (Python, Node, or any HTTP server)

### Option A: Python Server
```bash
cd asx-os-site
python -m http.server 8080
# Open http://localhost:8080
```

### Option B: Node Serve
```bash
npm install -g serve
cd asx-os-site
serve -l 8080
# Open http://localhost:8080
```

### Option C: VS Code Live Server
1. Install "Live Server" extension
2. Right-click `index.html`
3. Select "Open with Live Server"

## 🎮 Pages & Routes

### Available Pages
- `/` or `/home` - Command Center dashboard
- `/marketplace` - Asset store with shopping cart
- `/builder` - AI-powered asset builder (chat interface)
- `/demos` - Demo selection menu
- `/fantasy` - Interactive 3D fantasy scene
- `/webgl-test` - WebGL capability test
- `/diagnostics` - System diagnostics

### Navigation
Use hash-based routing:
- Click navigation links in the header
- Or manually enter: `http://localhost:8080/#/marketplace`

## 🔧 How It Works

### 1. Boot Sequence
1. `index.html` loads `engine/os-loader.js`
2. Loader fetches `os/os.json` registry
3. Initializes WebGL renderer and DOM HUD
4. Creates page controller
5. Navigates to boot page (`home` by default)

### 2. Page Loading
1. User navigates (hash change or click)
2. Controller unmounts current page
3. Fetches new page definition from `os.json`
4. Loads WebGL scene
5. Renders DOM HUD overlay
6. Executes ASX script

### 3. WebGL Scenes
Defined in `renderer/webgl.js`:
- `flat` - Black background
- `starfield` - Animated cyan stars
- `matrix-rain` - Green falling characters
- `test-cube` - Rotating multicolored cube
- `fantasy` - 3D fantasy environment

### 4. ASX Scripts
Page behaviors defined inline in `os.json`:
```json
"asx": {
  "inline": "onTick(() => { /* game logic */ });"
}
```

Or external:
```json
"asx": {
  "src": "./scripts/game-logic.asx"
}
```

## 🎨 Design System

### HUD Aesthetic
- **Background**: Black (#000000) with animated scenes
- **Primary**: Cyan (#00ffff)
- **Success**: Green (#00ff00)
- **Warning**: Yellow (#ffff00)
- **Error**: Red (#ff0000)

### Typography
- **Headers**: Orbitron (Google Fonts)
- **Body**: Courier New (monospace)

### Effects
- Scanline overlay (CRT effect)
- Neon glow on borders
- Angular clip-path shapes
- Hover animations

## 🛠️ Customization

### Adding a New Page

1. **Add route to `os.json`**:
```json
"routes": {
  "/mypage": "mypage"
}
```

2. **Add page definition**:
```json
"pages": {
  "mypage": {
    "title": "My Page",
    "hud": { "showLogo": true, "breadcrumbs": ["My Page"] },
    "webgl": { "scene": "starfield" },
    "asx": { "inline": "onTick(() => {});" }
  }
}
```

3. **Navigate**: `#/mypage`

### Adding a New WebGL Scene

Edit `renderer/webgl.js`:
```javascript
const scenes = {
  // ...existing scenes...
  myScene: ({ gl, ctx2d }) => ({
    draw() {
      // Your rendering logic
    },
    dispose() {
      // Cleanup
    }
  })
};
```

### Adding Products

Edit `os.json` marketplace page:
```json
"products": [
  {
    "id": 10,
    "name": "New Pack",
    "icon": "🎁",
    "description": "Description here",
    "price": 49.99
  }
]
```

## 🔐 Security & IP

- Proprietary rendering steps live in `renderer/` internals
- `os.json` contains only declarative structure
- No sensitive logic exposed in client-side code
- Shopping cart uses localStorage (client-side only)
- Add payment gateway for production

## 📝 ASX Runtime API

### Storage
```javascript
asx.storage.get('cart')        // Get from localStorage
asx.storage.set('cart', data)  // Save to localStorage
asx.storage.remove('cart')     // Remove item
asx.storage.clear()            // Clear all ASX data
```

### Events
```javascript
asx.on('cart:updated', fn)     // Listen to event
asx.emit('cart:updated', data) // Emit event
asx.off('cart:updated', fn)    // Remove listener
```

### Runtime
```javascript
asx.runtime.onTick(fn)         // Execute every frame
asx.runtime.onInput(name, fn)  // Handle input events
asx.runtime.dispatchInput(name, ...args)  // Trigger input
```

### DOM
```javascript
asx.dom.width()                // Get window width
asx.dom.height()               // Get window height
asx.dom.createElement(...)     // Create DOM element
```

## 🐛 Debugging

### Browser Console
Open Developer Tools (F12) and check console for:
- `[ASX OS]` - OS boot and navigation logs
- `[WebGL]` - Renderer status
- `[ASX]` - Script execution errors

### Common Issues

**Page won't load:**
- Check console for errors
- Verify `os.json` syntax (use JSONLint)
- Ensure file server is running

**WebGL not working:**
- Check browser WebGL support: https://get.webgl.org/
- Try fallback: App should work with 2D canvas
- Check graphics drivers

**Shopping cart not saving:**
- localStorage may be disabled
- Check browser privacy settings
- Clear site data and try again

## 🎯 Production Deployment

### Checklist
- [ ] Minify JavaScript files
- [ ] Compress `os.json`
- [ ] Add real payment gateway
- [ ] Implement server-side API
- [ ] Add authentication
- [ ] Set up CDN for assets
- [ ] Add analytics
- [ ] Implement error tracking

### Performance
- `os.json` can grow very large - controller loads only active page
- WebGL scenes are lazy-loaded
- DOM HUD renders on-demand
- Consider code splitting for production

## 📚 Resources

- **ASX Spec**: https://github.com/mpickettpayments-hue/JSON-ASX
- **Three.js Docs**: https://threejs.org/docs/
- **WebGL Fundamentals**: https://webglfundamentals.org/

## 🤝 Contributing

This is a demonstration of ASX OS architecture. Customize and extend as needed for your projects!

## 📄 License

Demonstration project. Use and modify as needed.

---

**Version**: 1.0.0  
**Architecture**: ASX OS-B  
**Status**: Production Ready (Demo Mode)
