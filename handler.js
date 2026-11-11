/**
 * @typedef {Object} AutomationContext
 * @property {string} id - Unique payload execution identifier.
 * @property {Record<string, unknown>} state - Shared operational state.
 * @property {number} timestamp - Epoch timestamp when handling initiated.
 */

/**
 * @template T
 * @typedef {function(AutomationContext): Promise<T> | T} StepFunction
 */

/**
 * Event-driven handler for orchestrating dynamic automation steps.
 */
class AutomationHandler {
  /**
   * @param {AutomationContext} [initialContext] - Pre-configured execution context.
   */
  constructor(initialContext) {
    /** @type {AutomationContext} */
    this.context = initialContext || {
      id: Math.random().toString(36).substring(2, 9),
      state: {},
      timestamp: Date.now()
    };
    
    /** @type {Map<string, StepFunction<any>>} */
    this.pipeline = new Map();
  }

  /**
   * Registers a named transformer step into the handler execution map.
   * 
   * @template T
   * @param {string} stepName - Unique identifier for the step.
   * @param {StepFunction<T>} fn - Executable task logic receiving context.
   * @returns {this} Fluent interface instance.
   */
  register(stepName, fn) {
    if (typeof fn !== 'function') {
      throw new TypeError(`Handler for step "${stepName}" must be executable.`);
    }
    this.pipeline.set(stepName, fn);
    return this;
  }

  /**
   * Dispatches execution across registered steps sequentially via dynamic Proxy facade.
   * 
   * @param {Array<string>} stepSequence - List of registered steps to run.
   * @returns {Promise<AutomationContext>} Mutated automation context after sequence completion.
   */
  async dispatch(stepSequence) {
    const runner = new Proxy(this, {
      get(target, prop) {
        if (typeof prop === 'string' && target.pipeline.has(prop)) {
          return () => target.pipeline.get(prop)(target.context);
        }
        return Reflect.get(target, prop);
      }
    });

    for (const name of stepSequence) {
      if (typeof runner[name] === 'function') {
        const result = await runner[name]();
        if (result !== undefined) {
          targetContextUpdate(this.context, name, result);
        }
      }
    }

    return this.context;
  }
}

/**
 * Internal helper to safely update context state.
 * @param {AutomationContext} ctx 
 * @param {string} key 
 * @param {unknown} val 
 */
function targetContextUpdate(ctx, key, val) {
  ctx.state[key] = val;
}

module.exports = { AutomationHandler };