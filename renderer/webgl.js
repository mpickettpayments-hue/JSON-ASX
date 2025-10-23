// renderer/webgl.js — ECS-aware WebGL adapter (stub-friendly)

export function createGLRenderer(canvas) {
  let gl = null;
  let scene = null;

  function init() {
    gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) console.warn('[ASX/WebGL] Unavailable; relying on DOM HUD fallback.');
    resize();
    window.addEventListener('resize', resize);
  }

  function resize() {
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = Math.floor(canvas.clientWidth * dpr);
    canvas.height = Math.floor(canvas.clientHeight * dpr);
    if (gl) gl.viewport(0, 0, canvas.width, canvas.height);
  }

  // simple “scenes” registry (you will replace with your renderer entry point)
  const scenes = {
    flat: ({ gl }) => ({
      draw(world) {
        if (!gl) return;
        gl.clearColor(0.07, 0.07, 0.12, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT);
      },
      dispose() {}
    }),
    space: ({ gl }) => ({
      t: 0,
      draw(world) {
        if (!gl) return;
        this.t += 0.016;
        gl.clearColor(0.02, 0.02, 0.06, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT);

        // NOTE: Placeholder — read ECS and render something symbolic.
        // Replace with your proprietary pipeline / buffers / shaders.
        // Example: iterate “RenderTag + Transform” and draw instanced quads.
        // Here we just clear — keeping secrets intact by design.
      },
      dispose() {}
    }),
    starscape: ({ gl }) => ({
      t: 0,
      draw() {
        if (!gl) return;
        this.t += 0.01;
        gl.clearColor(0.03 + Math.sin(this.t) * 0.01, 0.03, 0.08, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT);
      },
      dispose() {}
    })
  };

  function loadScene(desc /* { scene: 'flat'|'space'|'starscape', ... } */) {
    if (!gl) init();
    if (scene && scene.dispose) scene.dispose();
    const make = scenes[desc.scene] || scenes.flat;
    scene = make({ gl, ...desc });
  }

  // Called from the main loop by os-loader via your existing RAF
  function render(world) {
    if (!scene) return;
    scene.draw(world);
  }

  function unload() {
    if (scene && scene.dispose) scene.dispose();
    scene = null;
  }

  return { loadScene, render, unload };
}
