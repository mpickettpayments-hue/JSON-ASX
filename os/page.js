// os/page.js
export function makePageController({ asx, webgl, domHud }) {
  const state = { current: null };

  async function mount(pageKey, os, ctx) {
    const page = os.pages[pageKey];
    if (!page) throw new Error(`Page not found: ${pageKey}`);

    if (page.hud) domHud.renderHUD(page.hud, ctx);
    if (page.webgl) webgl.loadScene(page.webgl, ctx);

    if (page.asx) {
      const code = page.asx.inline ? String(page.asx.inline) : '';
      if (code.trim()) {
        const run = new Function('asx','AI','onTick','onInput','console', code);
        run(asx, asx.AI, asx.runtime.onTick, asx.runtime.onInput, console);
      }
    }
    state.current = pageKey;
  }

  function unmount(ctx) {
    webgl.unload(ctx);
    domHud.clear(ctx);
  }

  return { mount, unmount };
}
