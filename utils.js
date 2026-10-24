class FluentDataLens {
  constructor(target = {}) {
    this.target = target;
  }

  static wrap(obj) {
    return new FluentDataLens(obj);
  }

  *query(pathPattern) {
    const segments = typeof pathPattern === 'string' ? pathPattern.split('.') : pathPattern;
    
    function* walk(curr, depth) {
      if (depth === segments.length) {
        yield curr;
        return;
      }
      if (!curr || typeof curr !== 'object') return;

      const seg = segments[depth];
      if (seg === '*') {
        for (const key of Object.keys(curr)) {
          yield* walk(curr[key], depth + 1);
        }
      } else if (seg in curr) {
        yield* walk(curr[seg], depth + 1);
      }
    }

    yield* walk(this.target, 0);
  }

  findAll(pathPattern) {
    return Array.from(this.query(pathPattern));
  }

  transform(pathPattern, mapper) {
    const segments = typeof pathPattern === 'string' ? pathPattern.split('.') : pathPattern;
    const mutate = (curr, depth) => {
      if (!curr || typeof curr !== 'object') return curr;
      const seg = segments[depth];

      if (depth === segments.length - 1) {
        if (seg === '*') {
          Object.keys(curr).forEach(k => { curr[k] = mapper(curr[k], k); });
        } else if (seg in curr) {
          curr[seg] = mapper(curr[seg], seg);
        }
        return curr;
      }

      if (seg === '*') {
        Object.keys(curr).forEach(k => mutate(curr[k], depth + 1));
      } else if (seg in curr) {
        mutate(curr[seg], depth + 1);
      }
      return curr;
    };

    mutate(this.target, 0);
    return this.target;
  }
}

module.exports = {
  lens: (obj) => FluentDataLens.wrap(obj),
  FluentDataLens
};