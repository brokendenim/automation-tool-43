/**
 * @typedef {Object} PipelineStep
 * @property {(input: any) => any | Promise<any>} fn - Execution unit for step.
 * @property {number} [retryLimit=0] - Maximum retries on step failure.
 * @property {number} [delayMs=0] - Execution delay in milliseconds.
 */

/**
 * Resilient dynamic pipeline for workflow data transformations.
 */
export class MorphicPipeline {
  /**
   * @param {any} [initialValue=null] - Initial seed data.
   */
  constructor(initialValue = null) {
    /** @type {any} */
    this.seed = initialValue;
    /** @type {PipelineStep[]} */
    this.steps = [];
  }

  /**
   * Appends a processing step with failure resilience.
   *
   * @param {(data: any) => any} transform - Transformation function.
   * @param {Object} [options] - Step execution flags.
   * @param {number} [options.retryLimit=0] - Allowed attempt count on error.
   * @param {number} [options.delayMs=0] - Milliseconds to sleep before run.
   * @returns {MorphicPipeline} Fluent pipeline instance.
   */
  pipe(transform, { retryLimit = 0, delayMs = 0 } = {}) {
    this.steps.push({ fn: transform, retryLimit, delayMs });
    return this;
  }

  /**
   * Sequentially runs all queued steps against current accumulator.
   *
   * @template T
   * @returns {Promise<T>} Transformed payload output.
   */
  async execute() {
    let acc = this.seed;
    for (const { fn, retryLimit, delayMs } of this.steps) {
      if (delayMs > 0) {
        await new Promise((res) => setTimeout(res, delayMs));
      }
      let attempts = 0;
      while (attempts <= retryLimit) {
        try {
          acc = await fn(acc);
          break;
        } catch (err) {
          attempts++;
          if (attempts > retryLimit) throw err;
        }
      }
    }
    return acc;
  }
}

/**
 * Instantiates a functional pipeline seed.
 *
 * @param {any} seed - Initial state.
 * @returns {MorphicPipeline} Pipeline instance.
 */
export const createPipeline = (seed) => new MorphicPipeline(seed);