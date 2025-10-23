// engine/asx.js — ASX runtime + VDOM
export const asx = {
  version: '1.0.0',
  
  // Runtime state
  runtime: {
    frame: 0,
    time: 0,
    deltaTime: 0,
    lastTime: 0,
    tickHandlers: [],
    inputHandlers: {},
    
    // Register tick handler
    onTick(fn) {
      if (typeof fn === 'function') {
        asx.runtime.tickHandlers.push(fn);
      }
    },
    
    // Register input handler
    onInput(eventName, fn) {
      if (!asx.runtime.inputHandlers[eventName]) {
        asx.runtime.inputHandlers[eventName] = [];
      }
      asx.runtime.inputHandlers[eventName].push(fn);
    },
    
    // Dispatch input event
    dispatchInput(eventName, ...args) {
      const handlers = asx.runtime.inputHandlers[eventName];
      if (handlers) {
        handlers.forEach(fn => {
          try {
            fn(...args);
          } catch (err) {
            console.error(`[ASX] Input handler error (${eventName}):`, err);
          }
        });
      }
    },
    
    // Main loop
    loop(timestamp) {
      const now = timestamp || performance.now();
      asx.runtime.deltaTime = now - asx.runtime.lastTime;
      asx.runtime.lastTime = now;
      asx.runtime.time = now;
      asx.runtime.frame++;
      
      // Execute all tick handlers
      asx.runtime.tickHandlers.forEach(fn => {
        try {
          fn(asx.runtime.deltaTime, asx.runtime.frame);
        } catch (err) {
          console.error('[ASX] Tick handler error:', err);
        }
      });
      
      requestAnimationFrame(asx.runtime.loop);
    }
  },
  
  // Storage API (localStorage wrapper)
  storage: {
    get(key) {
      try {
        const val = localStorage.getItem(`asx:${key}`);
        return val ? JSON.parse(val) : null;
      } catch {
        return null;
      }
    },
    
    set(key, value) {
      try {
        localStorage.setItem(`asx:${key}`, JSON.stringify(value));
      } catch (err) {
        console.error('[ASX] Storage error:', err);
      }
    },
    
    remove(key) {
      localStorage.removeItem(`asx:${key}`);
    },
    
    clear() {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith('asx:')) {
          localStorage.removeItem(key);
        }
      });
    }
  },
  
  // DOM utilities
  dom: {
    width() {
      return window.innerWidth;
    },
    
    height() {
      return window.innerHeight;
    },
    
    createElement(tag, attrs = {}, children = []) {
      const el = document.createElement(tag);
      Object.entries(attrs).forEach(([key, val]) => {
        if (key === 'style' && typeof val === 'object') {
          Object.assign(el.style, val);
        } else if (key.startsWith('on')) {
          el.addEventListener(key.substring(2).toLowerCase(), val);
        } else {
          el.setAttribute(key, val);
        }
      });
      children.forEach(child => {
        if (typeof child === 'string') {
          el.appendChild(document.createTextNode(child));
        } else if (child instanceof Node) {
          el.appendChild(child);
        }
      });
      return el;
    }
  },
  
  // Event emitter
  events: {},
  
  emit(eventName, data) {
    const handlers = asx.events[eventName] || [];
    handlers.forEach(fn => {
      try {
        fn(data);
      } catch (err) {
        console.error(`[ASX] Event error (${eventName}):`, err);
      }
    });
  },
  
  on(eventName, fn) {
    if (!asx.events[eventName]) {
      asx.events[eventName] = [];
    }
    asx.events[eventName].push(fn);
  },
  
  off(eventName, fn) {
    if (asx.events[eventName]) {
      asx.events[eventName] = asx.events[eventName].filter(h => h !== fn);
    }
  },
  
  // AI stub (for builder page)
  AI: {
    generate(prompt) {
      // Simulated response for demo
      return {
        code: `{
  "name": "CustomAsset",
  "version": "1.0",
  "geometries": [{
    "type": "BoxGeometry",
    "args": [1, 1, 1]
  }],
  "materials": [{
    "type": "MeshStandardMaterial",
    "properties": {
      "color": "#00ffff",
      "metalness": 0.8,
      "roughness": 0.2
    }
  }],
  "mesh": {
    "geometry": 0,
    "material": 0
  }
}`,
        explanation: 'Generated a basic cube with cyan metallic material.'
      };
    }
  },
  
  // UI helpers
  ui: {
    alert(message) {
      alert(message);
    },
    
    confirm(message) {
      return confirm(message);
    },
    
    prompt(message, defaultValue) {
      return prompt(message, defaultValue);
    }
  },
  
  // Time utilities
  time: {
    get frame() { return asx.runtime.frame; },
    get time() { return asx.runtime.time; },
    get deltaTime() { return asx.runtime.deltaTime; }
  },
  
  // Data store (for passing page data to scripts)
  data: {}
};

// Initialize runtime
asx.runtime.lastTime = performance.now();

// Export for module usage
export default asx;
