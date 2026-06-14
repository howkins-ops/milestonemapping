// Safe localStorage helpers — never crash on corrupted or unavailable storage.

export function safeLoad(key, fallback) {
  if (typeof window === "undefined") return fallback;

  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (error) {
    console.error(`Failed to load ${key}`, error);
    return fallback;
  }
}

export function safeSave(key, value) {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Failed to save ${key}`, error);
  }
}

export function safeRemove(key) {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.removeItem(key);
  } catch (error) {
    console.error(`Failed to remove ${key}`, error);
  }
}
