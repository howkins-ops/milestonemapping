// ════════════════════════════════════════════════════════════════════════
// MILESTONE CITY — Citizen titles
// Pure derivation of earned honorifics from cross-feature progress.
// No React, no side effects. Every ctx field is optional / null-tolerant.
//
// ctx = {
//   rankName,           string  — current XP rank name (gamification)
//   identityTitle,      string  — Zone identity title chosen by the player
//   phoenixStageLabel,  string  — Zone phoenix stage label ("Wing", ...)
//   phoenixStageIndex,  number  — index into PHOENIX_STAGES (0 = Egg)
//   essences,           number  — shadow essences recovered
//   questCompleted,     number  — Alchemist quest chapters completed
//   totalForged,        number  — Anger Gym total forged count
//   shadowStreak,       number  — shadow practice streak (reserved; no title yet)
//   achievementsCount,  number  — unlocked achievements
// }
// ════════════════════════════════════════════════════════════════════════

function toCount(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function toText(value) {
  return typeof value === "string" ? value.trim() : "";
}

/**
 * Derive every title the citizen has earned, sorted by weight descending.
 * Returns an array of { id, label, weight }. Never throws on missing ctx.
 */
export function deriveTitles(ctx) {
  const c = ctx || {};
  const titles = [];

  // Rank name is always earned once a rank exists (fresh users are "Starter").
  const rankName = toText(c.rankName);
  if (rankName) {
    titles.push({ id: "rank", label: rankName, weight: 10 });
  }

  // Zone identity title — the player chose it, so it outranks most badges.
  const identityTitle = toText(c.identityTitle);
  if (identityTitle) {
    titles.push({ id: "identity", label: identityTitle, weight: 60 });
  }

  // Phoenix stage — meaningful from "Wing" (index 2) upward, scales with stage.
  const phoenixLabel = toText(c.phoenixStageLabel);
  const phoenixIndex = toCount(c.phoenixStageIndex);
  if (phoenixLabel && phoenixIndex >= 2) {
    titles.push({ id: "phoenix", label: phoenixLabel, weight: 40 + phoenixIndex });
  }

  // Shadow work — essences recovered.
  const essences = toCount(c.essences);
  if (essences >= 3) {
    titles.push({ id: "essence-collector", label: "Essence Collector", weight: 30 });
  }
  if (essences >= 5) {
    titles.push({ id: "shadow-alchemist", label: "Shadow Alchemist", weight: 45 });
  }

  // Alchemist quest — chapters completed.
  const questCompleted = toCount(c.questCompleted);
  if (questCompleted >= 10) {
    titles.push({ id: "signal-bearer", label: "Signal Bearer", weight: 50 });
  }
  if (questCompleted >= 19) {
    titles.push({ id: "vault-opener", label: "Vault Opener", weight: 65 });
  }

  // Anger Gym — total forged.
  if (toCount(c.totalForged) >= 25) {
    titles.push({ id: "forgemaster", label: "Forgemaster", weight: 35 });
  }

  // Achievements sweep.
  if (toCount(c.achievementsCount) >= 15) {
    titles.push({ id: "completionist-rising", label: "Completionist Rising", weight: 25 });
  }

  // Note: ctx.shadowStreak is accepted but not yet mapped to a title.

  // Highest honor first; Array.prototype.sort is stable for equal weights.
  return titles.sort((a, b) => b.weight - a.weight);
}

/**
 * The single highest-weight title, or null when nothing is earned yet.
 */
export function getPrimaryTitle(ctx) {
  const titles = deriveTitles(ctx);
  return titles.length > 0 ? titles[0] : null;
}
