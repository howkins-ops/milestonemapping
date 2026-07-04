// ════════════════════════════════════════════════════════════════════════
// MAPQUEST WORLD — world config contract + geometry helpers
// A world is pure data; WorldScene renders any world, useWorldEngine walks
// it. Future worlds (the forest, …) are new configs, not new engines.
//
// {
//   id: "city",
//   label: "MapQuest City",              // aria label for the scene
//   theme: "mqw-theme-city",             // CSS class on the viewport
//   width: 4600,                         // world width in px
//   spawnX: 560,                         // default spawn (px)
//   edges: {
//     left:  { type: "exit"|"wall", id, label },   // exit → walk-up prompt
//     right: { type: "exit"|"wall", id, label },
//   },
//   far: [{ x:%, w:px, h:% }],           // far silhouettes (parallax 0.18)
//   mid: [{ x:%, w:px, h:%, neon }],     // mid towers (parallax 0.45)
//   arches: [{ x:px, w:px, label, accent }],       // quarter signage
//   props: [{ type:"lamp"|"fountain"|"gate", x:px, color?, label? }],
//   buildings: [{ id, name, icon, color, glow, x:px, w:px, hPct,
//                 glowState, locked, next }],      // door = building center
//   npcs: [{ id, name, x:px, color, sprite:"guide" }],
// }
// ════════════════════════════════════════════════════════════════════════

// Height tier (1–5, same field as cityDistricts position.h) → % of scene.
// Much taller than the old banner scene — legibility is the whole point.
export const TIER_HEIGHT_PCT = { 1: 40, 2: 50, 3: 60, 4: 72, 5: 85 };

// Lay a row of items west→east from a cursor; returns items with x plus the
// advanced cursor. Each entry: { w, gap } → x is the item's left edge.
export function layoutRow(startX, entries) {
  let cursor = startX;
  const placed = entries.map((e) => {
    const x = cursor;
    cursor += (e.w || 0) + (e.gap || 0);
    return { ...e, x };
  });
  return { placed, end: cursor };
}

export function centerOf(item) {
  return Math.round(item.x + (item.w || 0) / 2);
}
