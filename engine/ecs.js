// engine/ecs.js — Minimal ECS core (entities, components, systems, queries)

export function createWorld() {
  let nextId = 1;
  const entities = new Set();
  const comps = new Map();       // Map<ComponentName, Map<entityId, data>>
  const systems = [];            // [{ order, fn }]

  const now = () => performance.now();
  let last = now();

  function createEntity() {
    const id = nextId++;
    entities.add(id);
    return id;
  }

  function destroyEntity(id) {
    entities.delete(id);
    for (const store of comps.values()) store.delete(id);
  }

  function defineComponent(name) {
    if (!comps.has(name)) comps.set(name, new Map());
    const store = comps.get(name);
    const add = (id, data) => { store.set(id, data); return data; };
    const get = (id) => store.get(id);
    const has = (id) => store.has(id);
    const remove = (id) => store.delete(id);
    const entries = () => store.entries();
    return { name, add, get, has, remove, entries };
  }

  function query(...componentDefs) {
    // Yield entity ids that have ALL requested components
    return {
      *[Symbol.iterator]() {
        for (const id of entities) {
          let ok = true;
          for (const c of componentDefs) if (!c.has(id)) { ok = false; break; }
          if (ok) yield id;
        }
      }
    };
  }

  function registerSystem(fn, order = 0) {
    systems.push({ order, fn });
    systems.sort((a, b) => a.order - b.order);
    return fn;
  }

  function update() {
    const t = now();
    const dt = Math.min(0.05, (t - last) / 1000); // clamp to 50ms
    last = t;
    for (const s of systems) s.fn({ dt, world: api });
  }

  const api = {
    // entities
    createEntity, destroyEntity, entities,

    // components
    defineComponent, query,

    // systems
    registerSystem, update,

    // raw stores access (optional)
    _stores: comps
  };
  return api;
}
