export function saveToCache(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

export function getFromCache(key) {
  const item = localStorage.getItem(key);
  try {
    return item ? JSON.parse(item) : null;
  } catch {
    return null;
  }
}