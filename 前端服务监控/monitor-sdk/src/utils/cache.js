const cache = new Map();

export function addCache(key, item) {
  cache.get(key) ? cache.get(key).push(item) : cache.set(key, [item]);
}

export function getCache() {
  return cache;
}

export function clearCache() {
  cache.clear();
}
