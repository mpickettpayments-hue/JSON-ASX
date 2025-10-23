// engine/os-loader.js
import { asx } from './asx.js';
import { createGLRenderer } from '../renderer/webgl.js';
import { createHud } from '../renderer/dom-hud.js';
import { makePageController } from '../os/page.js';

export async function bootOS({ osUrl, canvasId, hudRootId, routeLabelId }) {
  const os = await (await fetch(osUrl)).json();
  const canvas = document.getElementById(canvasId);
  const hudRoot = document.getElementById(hudRootId);
  const routeLabel = document.getElementById(routeLabelId);

  const webgl = createGLRenderer(canvas);
  const domHud = createHud(hudRoot);
  const controller = makePageController({ asx, webgl, domHud });
  const ctx = { asx, webgl, domHud, canvas, hudRoot };

  const routeToKey = (path) => os.routes[path] || os.meta.boot || 'home';
  async function navigate(path) {
    const key = routeToKey(path);
    routeLabel.textContent = `/${key}`;
    await controller.mount(key, os, ctx);
  }

  window.addEventListener('hashchange', () => {
    const path = location.hash.replace('#', '') || '/';
    controller.unmount(ctx);
    navigate(path);
  });

  // Drive ECS + render each frame
  const tick = () => {
    webgl.render(asx.ecs.world);
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);

  // Also keep user-defined onTick hooks running
  requestAnimationFrame(asx.runtime.loop);

  const initial = location.hash.replace('#', '') || '/';
  await navigate(initial);
}
