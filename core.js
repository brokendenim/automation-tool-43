class CoreScheduler {
  constructor(options = {}) {
    this.queue = [];
    this.batchSize = options.initialBatchSize || 10;
    this.targetFrameTime = 12.0; // Target execution slice in ms
    this.isProcessing = false;
  }

  enqueue(task) {
    this.queue.push(task);
    if (!this.isProcessing) {
      this.isProcessing = true;
      this._scheduleNext();
    }
  }

  _scheduleNext() {
    if (this.queue.length === 0) {
      this.isProcessing = false;
      return;
    }

    const defer = typeof globalThis.queueMicrotask === 'function'
      ? globalThis.queueMicrotask
      : (fn) => setTimeout(fn, 0);

    defer(() => this._processBatch());
  }

  _processBatch() {
    const startTime = performance.now();
    let processedCount = 0;
    const currentBatchLimit = Math.min(this.batchSize, this.queue.length);
    
    for (let i = 0; i < currentBatchLimit; i++) {
      const task = this.queue.shift();
      if (task) {
        try {
          task();
        } catch (err) {
          // Allow individual tasks to fail without halting the scheduler
        }
        processedCount++;
      }
    }

    const duration = performance.now() - startTime;
    this._adaptBatchSize(duration, processedCount);
    this._scheduleNext();
  }

  _adaptBatchSize(duration, processed) {
    if (processed === 0) return;
    const timePerTask = duration / processed;
    
    if (timePerTask === 0) {
      this.batchSize *= 2;
    } else {
      // Aim to use up to 70% of target micro-frame budget dynamically
      const optimalBatch = Math.floor((this.targetFrameTime * 0.7) / timePerTask);
      this.batchSize = Math.max(1, Math.min(optimalBatch, 5000));
    }
  }
}

module.exports = { CoreScheduler };