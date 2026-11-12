class TaskDispatcher {
  constructor(capacity = 1024) {
    this.capacity = capacity;
    this.ring = new Array(capacity);
    this.head = 0;
    this.tail = 0;
    this.scheduled = false;
    this.metrics = { executed: 0, dropped: 0 };
  }

  enqueue(fn, context = null) {
    const nextTail = (this.tail + 1) % this.capacity;
    if (nextTail === this.head) {
      this.metrics.dropped++;
      return false;
    }

    this.ring[this.tail] = { fn, context, ts: performance.now() };
    this.tail = nextTail;

    if (!this.scheduled) {
      this.scheduled = true;
      queueMicrotask(() => this.drain());
    }
    return true;
  }

  drain() {
    let processed = 0;
    const batchLimit = 128;

    while (this.head !== this.tail && processed < batchLimit) {
      const item = this.ring[this.head];
      this.ring[this.head] = undefined;
      this.head = (this.head + 1) % this.capacity;

      try {
        item.fn(item.context);
        this.metrics.executed++;
      } catch (error) {
        console.error('Task processing error:', error);
      }
      processed++;
    }

    if (this.head !== this.tail) {
      queueMicrotask(() => this.drain());
    } else {
      this.scheduled = false;
    }
  }

  get pendingCount() {
    return (this.tail - this.head + this.capacity) % this.capacity;
  }
}

module.exports = { TaskDispatcher };