// ════════════════════════════════════════════════════════════════════════
// MAPQUEST WORLD — determinism seed
// seedFor(dateStr, salt) → 0..1 via a tiny string hash. Drives the weather
// pick, ambient citizen offsets, the daily street event and collectible
// spawn positions. Same day = same city for everyone; tomorrow = fresh
// city. No Math.random() anywhere near a render path (§2.5).
// ════════════════════════════════════════════════════════════════════════

// Local-date key (not UTC — the city's day flips at the player's midnight).
export function todayKey(date = new Date()) {
  const d = date instanceof Date && !isNaN(date) ? date : new Date();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

// FNV-1a over the string — small, stable, good spread for our purposes.
function hash32(str) {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i += 1) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

// 0..1, deterministic for (dateStr, salt).
export function seedFor(dateStr, salt = "") {
  return hash32(`${dateStr}|${salt}`) / 4294967296;
}

// Convenience: an integer in [0, n) for (dateStr, salt).
export function seedIndex(dateStr, salt, n) {
  if (!n || n <= 0) return 0;
  return Math.floor(seedFor(dateStr, salt) * n) % n;
}
