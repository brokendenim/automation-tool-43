export function getStableHash(val) {
  const serialize = (item) => {
    if (item === null || typeof item !== 'object') {
      return String(item);
    }
    if (Array.isArray(item)) {
      return `[${item.map(serialize).join(',')}]`;
    }
    const sortedKeys = Object.keys(item).sort();
    return `{${sortedKeys.map(k => `${k}:${serialize(item[k])}`).join(',')}}`;
  };

  const raw = serialize(val);
  let hash = 0;
  for (let i = 0; i < raw.length; i++) {
    const char = raw.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash).toString(36);
}

export function deepTransform(data, transformer) {
  if (Array.isArray(data)) {
    return data.map(item => deepTransform(item, transformer));
  }
  if (data !== null && typeof data === 'object') {
    const processed = {};
    for (const [key, val] of Object.entries(data)) {
      const [newKey, newVal] = transformer(key, val);
      if (newKey !== undefined) {
        processed[newKey] = deepTransform(newVal, transformer);
      }
    }
    return processed;
  }
  return data;
}