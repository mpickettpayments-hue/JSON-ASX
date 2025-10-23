// os/page.js — hydrates a page view from os.json fragments
export function makePageController({ asx, webgl, domHud }) {
  const state = { current: null, unloadFns: [] };

  async function mount(pageKey, os, ctx) {
    const page = os.pages[pageKey];
    if (!page) throw new Error(`Page not found: ${pageKey}`);

    console.log(`[ASX OS] Loading page: ${pageKey}`);

    // Update document title
    document.title = `${page.title} - ASX Model Builder`;

    // HUD (DOM VDOM) — overlay content
    if (page.hud) {
      const cleanup = domHud.renderHUD(page.hud, ctx);
      if (cleanup) state.unloadFns.push(cleanup);
    }

    // WebGL scene — primary renderer
    if (page.webgl) {
      const cleanup = webgl.loadScene(page.webgl, ctx);
      if (cleanup) state.unloadFns.push(cleanup);
    }

    // ASX script — executes behavior (inline or external)
    if (page.asx) {
      const code = page.asx.inline
        ? String(page.asx.inline)
        : (page.asx.src ? await (await fetch(page.asx.src)).text() : '');
      
      if (code.trim()) {
        try {
          // Create sandboxed ASX runtime for this page
          const runner = new Function(
            'asx',
            'AI', 
            'onTick',
            'onInput',
            'console',
            code
          );
          
          // Execute with proper context
          runner(
            asx, 
            asx.AI || {}, 
            asx.runtime.onTick || (() => {}),
            asx.runtime.onInput || (() => {}),
            console
          );
        } catch (err) {
          console.error(`[ASX] Script execution error on page ${pageKey}:`, err);
        }
      }
    }

    state.current = pageKey;
    console.log(`[ASX OS] Page loaded: ${pageKey}`);
  }

  function unmount(ctx) {
    console.log(`[ASX OS] Unmounting page: ${state.current}`);
    
    // Run all cleanup functions
    state.unloadFns.forEach(fn => {
      try {
        fn();
      } catch (err) {
        console.warn('[ASX OS] Cleanup error:', err);
      }
    });
    state.unloadFns = [];

    // Clear renderers
    webgl.unload(ctx);
    domHud.clear(ctx);
    
    state.current = null;
  }

  return { mount, unmount, getState: () => state };
}
