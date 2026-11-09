import { EventEmitter } from 'events';

const ACTION_MAP = new Map();
const HYDRATE_KEY = Symbol('hydrate_key');

export class TaskPipeline extends EventEmitter {
  #store = new Map();
  #cleanupRegistry = new FinalizationRegistry((id) => {
    this.emit('gc', { id, timestamp: Date.now() });
  });

  constructor(initialTasks = []) {
    super();
    this[HYDRATE_KEY](initialTasks);
  }

  [HYDRATE_KEY](tasks) {
    tasks.forEach((task, idx) => {
      const id = `task_${Date.now()}_${idx}_${Math.random().toString(36).slice(2, 7)}`;
      const payload = Object.freeze({ ...task, executed: false });
      this.#store.set(id, payload);
      this.#cleanupRegistry.register(payload, id);
    });
  }

  get handlerProxy() {
    return new Proxy(this.#store, {
      get: (target, prop) => {
        if (prop === 'flush') {
          return () => {
            const executed = [];
            for (const [id, task] of target.entries()) {
              executed.push({ id, status: 'purged', name: task.name });
            }
            target.clear();
            return executed;
          };
        }
        if (typeof prop === 'string' && target.has(prop)) {
          const item = target.get(prop);
          return (context = {}) => ({ ...item, executed: true, ctx: context });
        }
        return Reflect.get(target, prop);
      }
    });
  }

  dispatch(actionName, payload) {
    const handlerKey = String(actionName).toLowerCase().trim();
    const fn = ACTION_MAP.get(handlerKey) || ((data) => ({ status: 'unhandled', data }));
    const meta = { time: Date.now(), key: handlerKey };
    return fn(payload, meta);
  }

  static registerHandler(name, fn) {
    if (typeof fn !== 'function') throw new TypeError('Handler must be callable');
    ACTION_MAP.set(String(name).toLowerCase().trim(), fn);
    return true;
  }
}

TaskPipeline.registerHandler('transform', (data, meta) => {
  const result = Object.entries(data).reduce((acc, [k, v]) => {
    acc[`opt_${k}`] = typeof v === 'string' ? v.trim().toUpperCase() : v;
    return acc;
  }, {});
  return { status: 'processed', meta, result };
});

TaskPipeline.registerHandler('ping', (_, meta) => ({ status: 'pong', meta }));