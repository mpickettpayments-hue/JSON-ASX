// engine/asx.js — add ECS world + expose in ASX
import { createWorld } from './ecs.js';

export const asx = {
  dom: {
    width: () => window.innerWidth || document.documentElement.clientWidth,
    height: () => window.innerHeight || document.documentElement.clientHeight,
  },

  vdom: (() => {
    let currentTree = null;
    const h = (tag, props = {}, children = []) => ({ tag, props, children });
    const setProp = (el, k, v) => {
      if (k === "style") el.setAttribute("style", v);
      else if (k.startsWith("on") && typeof v === "function") el.addEventListener(k.substring(2).toLowerCase(), v);
      else if (v === false || v === null || v === undefined) el.removeAttribute(k);
      else el.setAttribute(k, v);
    };
    const createDom = (node) => {
      if (typeof node === "string" || typeof node === "number") return document.createTextNode(String(node));
      const el = document.createElement(node.tag);
      for (const k in node.props) setProp(el, node.props[k] !== undefined ? k : k, node.props[k]);
      (node.children || []).forEach(ch => el.appendChild(createDom(ch)));
      return el;
    };
    const patchNode = (parent, newNode, oldNode, index = 0) => {
      const existing = parent.childNodes[index];
      if (!oldNode) { parent.appendChild(createDom(newNode)); return; }
      if (!newNode) { parent.removeChild(existing); return; }
      const isTextNew = typeof newNode === "string" || typeof newNode === "number";
      const isTextOld = typeof oldNode === "string" || typeof oldNode === "number";
      if (isTextNew && isTextOld) { if (String(newNode) !== String(oldNode)) existing.nodeValue = String(newNode); return; }
      if (isTextNew !== isTextOld || (!isTextNew && newNode.tag !== oldNode.tag)) {
        parent.replaceChild(createDom(newNode), existing); return;
      }
      if (!isTextNew) {
        const el = existing;
        const newProps = newNode.props || {};
        const oldProps = oldNode.props || {};
        for (const k in oldProps) if (!(k in newProps)) el.removeAttribute(k);
        for (const k in newProps) setProp(el, k, newProps[k]);
        const len = Math.max((newNode.children || []).length, (oldNode.children || []).length);
        for (let i = 0; i < len; i++) patchNode(el, newNode.children[i], oldNode.children[i], i);
      }
    };
    const patch = (newTree, rootEl = document.getElementById("app")) => {
      if (!rootEl) throw new Error("asx.vdom.patch: root #app not found");
      if (!currentTree) { rootEl.innerHTML = ""; rootEl.appendChild(createDom(newTree)); currentTree = newTree; return; }
      patchNode(rootEl, newTree, currentTree, 0);
      currentTree = newTree;
    };
    return { h, patch };
  })(),

  AI: {
    generateEnemy: (difficulty = "easy") => {
      const speed = difficulty === "hard" ? 2.2 : 1.2;
      return { x: Math.random() * (window.innerWidth - 30), y: -40, vy: speed };
    },
  },

  // NEW: ECS
  ecs: (() => {
    const world = createWorld();
    // Common components
    const Transform = world.defineComponent('Transform'); // { x, y, z?, rot?, sx?, sy? }
    const Velocity  = world.defineComponent('Velocity');  // { vx, vy, vz? }
    const RenderTag = world.defineComponent('RenderTag'); // { kind, color?, size? } — consumed by WebGL adapter
    const Lifetime  = world.defineComponent('Lifetime');  // { t, max }

    // Helpful API
    function create(kind, data = {}) {
      const id = world.createEntity();
      Transform.add(id, { x: 0, y: 0, ...(data.transform || {}) });
      if (data.velocity) Velocity.add(id, data.velocity);
      RenderTag.add(id, { kind, ...(data.render || {}) });
      if (data.lifetime) Lifetime.add(id, { t: 0, max: data.lifetime });
      return id;
    }

    // Default systems (movement, lifetime)
    world.registerSystem(({ dt }) => {
      for (const id of world.query(Transform, Velocity)) {
        const tr = Transform.get(id); const v = Velocity.get(id);
        tr.x += (v.vx || 0) * dt; tr.y += (v.vy || 0) * dt;
      }
    }, 10);

    world.registerSystem(({ dt }) => {
      for (const id of world.query(Lifetime)) {
        const life = Lifetime.get(id);
        life.t += dt;
        if (life.t >= life.max) world.destroyEntity(id);
      }
    }, 20);

    return { world, Transform, Velocity, RenderTag, Lifetime, create };
  })(),

  runtime: (() => {
    const inputHandlers = new Map();
    const tickHandlers = new Set();

    const onInput = (name, fn) => { if (!inputHandlers.has(name)) inputHandlers.set(name, []); inputHandlers.get(name).push(fn); };
    const onTick  = (fn) => tickHandlers.add(fn);
    const dispatchInput = (name, ...args) => (inputHandlers.get(name) || []).forEach(fn => fn(...args));
    const dispatchTick  = () => tickHandlers.forEach(fn => fn());

    window.addEventListener("keydown", (e) => {
      if (e.repeat) return;
      if (e.key === "ArrowLeft")  dispatchInput("move", -10, 0);
      if (e.key === "ArrowRight") dispatchInput("move", 10, 0);
      if (e.key === " ")          dispatchInput("shoot");
    });

    // Main loop now drives ECS, then user ticks
    const loop = () => {
      asx.ecs.world.update();   // ECS systems
      dispatchTick();           // ASX tick hooks
      requestAnimationFrame(loop);
    };

    const loadASX = async (url) => {
      const code = await (await fetch(url)).text();
      const runner = new Function("asx", "AI", "onTick", "onInput", "console", code);
      runner(asx, asx.AI, onTick, onInput, console);
    };

    return { onInput, onTick, dispatchInput, dispatchTick, loadASX, loop };
  })(),
};

// Global helpers for inline ASX
window.asx = asx;
window.onTick = (fn) => asx.runtime.onTick(fn);
window.onInput = (evt, fn) => asx.runtime.onInput(evt, fn);
