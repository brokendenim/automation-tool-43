class UltraFastQueue {
  constructor(capacity = 1024) {
    this.capacity = capacity;
    this.buffer = new Array(capacity);
    this.pointers = new Uint32Array(2); // [head, tail]
    this.mask = capacity - 1;
    if ((capacity & this.mask) !== 0) {
      throw new Error("Capacity must be a power of 2");
    }
  }

  enqueue(item) {
    const head = this.pointers[0];
    const tail = this.pointers[1];
    if (tail - head === this.capacity) {
      this._resize();
    }
    const writeIdx = this.pointers[1] & this.mask;
    this.buffer[writeIdx] = item;
    this.pointers[1]++;
    return true;
  }

  dequeue() {
    const head = this.pointers[0];
    const tail = this.pointers[1];
    if (head === tail) return null;
    const readIdx = head & this.mask;
    const item = this.buffer[readIdx];
    this.buffer[readIdx] = null;
    this.pointers[0]++;
    return item;
  }

  _resize() {
    const oldCapacity = this.capacity;
    const newCapacity = oldCapacity * 2;
    const newBuffer = new Array(newCapacity);
    const head = this.pointers[0];
    for (let i = 0; i < oldCapacity; i++) {
      newBuffer[i] = this.buffer[(head + i) & this.mask];
    }
    this.buffer = newBuffer;
    this.capacity = newCapacity;
    this.mask = newCapacity - 1;
    this.pointers[0] = 0;
    this.pointers[1] = oldCapacity;
  }

  get size() {
    return this.pointers[1] - this.pointers[0];
  }
}

module.exports = { UltraFastQueue };