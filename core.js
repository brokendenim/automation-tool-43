class OptimizedCore {
  constructor(capacity = 4096) {
    this.capacity = capacity;
    this.ringBuffer = new Array(capacity);
    this.states = new Uint8Array(capacity); // 0: empty, 1: pending, 2: processing
    this.head = 0;
    this.tail = 0;
    this.scheduled = false;
  }

  submit(action, ...payload) {
    let nextTail = (this.tail + 1) % this.capacity;
    if (nextTail === this.head) {
      this._resize();
      nextTail = (this.tail + 1) % this.capacity;
    }
    this.ringBuffer[this.tail] = { action, payload };
    this.states[this.tail] = 1;
    this.tail = nextTail;
    this._tick();
  }

  _resize() {
    const oldCap = this.capacity;
    this.capacity *= 2;
    const newBuffer = new Array(this.capacity);
    const newStates = new Uint8Array(this.capacity);
    let idx = 0;
    while (this.head !== this.tail) {
      newBuffer[idx] = this.ringBuffer[this.head];
      newStates[idx] = this.states[this.head];
      this.head = (this.head + 1) % oldCap;
      idx++;
    }
    this.ringBuffer = newBuffer;
    this.states = newStates;
    this.head = 0;
    this.tail = idx;
  }

  _tick() {
    if (this.scheduled) return;
    this.scheduled = true;
    queueMicrotask(() => {
      const start = performance.now();
      while (this.head !== this.tail) {
        if (performance.now() - start > 8) {
          this.scheduled = false;
          this._tick();
          return;
        }
        const current = this.head;
        this.head = (this.head + 1) % this.capacity;
        if (this.states[current] === 1) {
          this.states[current] = 2;
          try {
            const item = this.ringBuffer[current];
            if (item) item.action(...item.payload);
          } catch (err) {
            // Supressed downstream failures
          } finally {
            this.ringBuffer[current] = null;
            this.states[current] = 0;
          }
        }
      }
      this.scheduled = false;
    });
  }
}

module.exports = { OptimizedCore };