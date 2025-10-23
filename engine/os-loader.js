// engine/os-loader.js — boots OS, handles routing, wires WebGL + HUD + ASX
import { asx } from './asx.js';
import { createGLRenderer } from '../renderer/webgl.js';
import { createHud } from '../renderer/dom-hud.js';
import { makePageController } from '../os/page.js';

export async function bootOS({ osUrl, canvasId, hudRootId, routeLabelId }) {
  console.log('[ASX OS] Booting...');
  
  try {
    // Load OS registry
    const response = await fetch(osUrl);
    if (!response.ok) {
      throw new Error(`Failed to load OS registry: ${response.statusText}`);
    }
    const os = await response.json();
    console.log('[ASX OS] Registry loaded:', os.meta);
    
    // Get DOM elements
    const canvas = document.getElementById(canvasId);
    const hudRoot = document.getElementById(hudRootId);
    const routeLabel = document.getElementById(routeLabelId);
    
    if (!canvas) throw new Error(`Canvas element not found: ${canvasId}`);
    if (!hudRoot) throw new Error(`HUD root element not found: ${hudRootId}`);
    if (!routeLabel) throw new Error(`Route label element not found: ${routeLabelId}`);
    
    // Initialize renderers
    const webgl = createGLRenderer(canvas);
    const domHud = createHud(hudRoot);
    
    // Create page controller
    const controller = makePageController({ asx, webgl, domHud });
    
    // Context object passed to all systems
    const ctx = { asx, webgl, domHud, canvas, hudRoot, os };
    
    // Router functions
    const routeToKey = (path) => {
      const normalized = path.startsWith('/') ? path : `/${path}`;
      return os.routes[normalized] || os.meta.boot || 'home';
    };
    
    async function navigate(path) {
      const key = routeToKey(path);
      console.log(`[ASX OS] Navigating to: ${path} -> ${key}`);
      
      // Update route label
      routeLabel.textContent = os.pages[key]?.title || key.toUpperCase();
      
      // Mount new page
      try {
        await controller.mount(key, os, ctx);
      } catch (err) {
        console.error('[ASX OS] Navigation error:', err);
        routeLabel.textContent = 'ERROR';
        domHud.showError(err.message);
      }
    }
    
    // Hash change listener
    window.addEventListener('hashchange', () => {
      const path = location.hash.replace('#', '') || '/';
      controller.unmount(ctx);
      navigate(path);
    });
    
    // Keyboard input forwarding
    window.addEventListener('keydown', (e) => {
      if (e.key === ' ') {
        e.preventDefault();
        asx.runtime.dispatchInput('shoot');
      }
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        asx.runtime.dispatchInput('move', -10, 0);
      }
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        asx.runtime.dispatchInput('move', 10, 0);
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        asx.runtime.dispatchInput('move', 0, -10);
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        asx.runtime.dispatchInput('move', 0, 10);
      }
    });
    
    // Start animation loop
    console.log('[ASX OS] Starting animation loop...');
    requestAnimationFrame(asx.runtime.loop);
    
    // Initial navigation
    const initialPath = location.hash.replace('#', '') || '/';
    await navigate(initialPath);
    
    console.log('[ASX OS] Boot complete!');
    
    // Return OS control interface
    return {
      navigate,
      getController: () => controller,
      getContext: () => ctx,
      getOS: () => os
    };
    
  } catch (err) {
    console.error('[ASX OS] Boot failed:', err);
    throw err;
  }
}
