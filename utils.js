/**
 * @typedef {Object} ExecutionContext
 * @property {number} timestamp - Epoch start time.
 * @property {Record<string, unknown>} payload - Dynamic task state memory.
 */

/**
 * @callback StepFunction
 * @param {ExecutionContext} ctx - Current execution context.
 * @returns {Promise<unknown>|unknown}
 */

/**
 * Reactive task chain orchestrator using Proxy-backed execution steps.
 */
export class ReactiveTaskChain {
  /**
   * Creates an instance of ReactiveTaskChain.
   * @param {Record<string, unknown>} [initialPayload={}] - Initial state payload.
   */
  constructor(initialPayload = {}) {
    /** @type {ExecutionContext} */
    this.context = {
      timestamp: Date.now(),
      payload: { ...initialPayload }
    };
    /** @type {Array<StepFunction>} */
    this._steps = [];
  }

  /**
   * Registers a transformation step into the pipeline.
   * @param {string} label - Descriptive tag for debugging/tracking.
   * @param {StepFunction} fn - Async or sync execution logic.
   * @returns {this} Fluent chain instance.
   */
  pipe(label, fn) {
    const wrappedStep = async (ctx) => {
      const result = await fn(ctx);
      ctx.payload[label] = result;
      return ctx;
    };
    this._steps.push(wrappedStep);
    return this;
  }

  /**
   * Executes all piped functions sequentially over the context.
   * @returns {Promise<ExecutionContext>} Final execution state.
   */
  async run() {
    return this._steps.reduce(
      (promise, step) => promise.then((ctx) => step(ctx)),
      Promise.resolve(this.context)
    );
  }

  /**
   * Creates a proxy wrapper that allows dynamically invoking unknown steps.
   * @returns {Object} Proxy-wrapped instance accepting dynamic step names.
   */
  static autoWrap() {
    return new Proxy(new ReactiveTaskChain(), {
      get(target, prop) {
        if (typeof prop === 'string' && !(prop in target)) {
          return (/** @type {StepFunction} */ fn) => target.pipe(prop, fn);
        }
        return Reflect.get(target, prop);
      }
    });
  }
}