class FlowProcessor {
  constructor(iterable = []) {
    this.source = Symbol.iterator in Object(iterable) || Symbol.asyncIterator in Object(iterable)
      ? iterable
      : [iterable];
    this.pipeline = [];
  }

  map(fn) {
    this.pipeline.push(async function* (stream) {
      for await (const item of stream) {
        yield await fn(item);
      }
    });
    return this;
  }

  filter(predicate) {
    this.pipeline.push(async function* (stream) {
      for await (const item of stream) {
        if (await predicate(item)) yield item;
      }
    });
    return this;
  }

  flatten() {
    this.pipeline.push(async function* (stream) {
      for await (const item of stream) {
        if (item && (typeof item === 'object' || Array.isArray(item))) {
          if (Symbol.asyncIterator in item || Symbol.iterator in item) {
            for await (const inner of item) yield inner;
            continue;
          }
        }
        yield item;
      }
    });
    return this;
  }

  async collect() {
    let stream = (async function* (src) {
      for await (const chunk of src) yield chunk;
    })(this.source);

    for (const stage of this.pipeline) {
      stream = stage(stream);
    }

    const result = [];
    for await (const value of stream) {
      result.push(value);
    }
    return result;
  }
}

function createFlow(data) {
  return new FlowProcessor(data);
}

module.exports = { FlowProcessor, createFlow };