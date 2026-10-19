/**
 * @typedef {Object} ExecutionContext
 * @property {string} id - Unique payload identifier.
 * @property {Record<string, any>} payload - Dynamic task payload.
 * @property {number} timestamp - Epoch initiation time.
 */

/**
 * @typedef {Function} StepTransformer
 * @param {ExecutionContext} ctx - Current pipeline context.
 * @returns {Promise<ExecutionContext> | ExecutionContext} Updated context.
 */

/**
 * FlowHandler orchestrates dynamic task pipelines through Proxy traps.
 */
export class FlowHandler {
  /**
   * @param {Record<string, StepTransformer>} [initialSteps={}] - Pre-registered pipeline steps.
   */
  constructor(initialSteps = {}) {
    /** @type {Map<string, StepTransformer>} */
    this.registry = new Map(Object.entries(initialSteps));
    
    return new Proxy(this, {
      get: (target, prop) => {
        if (typeof prop === 'string' && prop in target) {
          return target[/** @type {keyof FlowHandler} */ (prop)];
        }
        if (typeof prop === 'string') {
          return (/** @type {ExecutionContext} */ ctx) => target.executeStep(prop, ctx);
        }
        return Reflect.get(target, prop);
      }
    });
  }

  /**
   * Register a dynamic transformer step.
   * @param {string} name - Step name identifier.
   * @param {StepTransformer} transformer - Processing function.
   * @returns {this} Fluent chain instance.
   */
  register(name, transformer) {
    this.registry.set(name, transformer);
    return this;
  }

  /**
   * Execute a single step by name safely.
   * @param {string} stepName - Target step name.
   * @param {ExecutionContext} ctx - Context object.
   * @returns {Promise<ExecutionContext>} Updated pipeline context.
   */
  async executeStep(stepName, ctx) {
    const fn = this.registry.get(stepName);
    if (!fn) {
      return { ...ctx, payload: { ...ctx.payload, [`_skipped_${stepName}`]: true } };
    }
    const result = await fn(ctx);
    return result || ctx;
  }

  /**
   * Stream context mutations through an async generator execution loop.
   * @param {ExecutionContext} initialCtx - Starting state context.
   * @param {Array<string>} pipeline - Sequence of step names.
   * @returns {AsyncGenerator<ExecutionContext, ExecutionContext, void>} Yields state at each step.
   */
  async *streamPipeline(initialCtx, pipeline) {
    let current = { ...initialCtx, timestamp: Date.now() };
    for (const step of pipeline) {
      current = await this.executeStep(step, current);
      yield current;
    }
    return current;
  }
}