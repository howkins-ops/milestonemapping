import { safeLoad, safeSave } from "../lib/storage.js";

export const ESSENCE_ENTRIES_KEY = "essenceReturnEntries";
export const ESSENCE_PROFILE_KEY = "essenceReturnProfile";

export const XP_REWARDS = {
  maskIdentified: 25,
  awarenessCompleted: 50,
  breathingCompleted: 50,
  essenceChosen: 50,
  identityCompleted: 100,
  proofCompleted: 150
};

const defaultProfile = {
  xp: 0,
  level: 1,
  badges: []
};

export function getEssenceEntries() {
  return safeLoad(ESSENCE_ENTRIES_KEY, []);
}

export function saveEssenceEntries(entries) {
  safeSave(ESSENCE_ENTRIES_KEY, entries);
}

export function appendEssenceEntry(entry) {
  const entries = getEssenceEntries();
  const nextEntries = [entry, ...entries];
  saveEssenceEntries(nextEntries);
  return nextEntries;
}

export function getEssenceProfile() {
  return safeLoad(ESSENCE_PROFILE_KEY, defaultProfile);
}

export function saveEssenceProfile(profile) {
  safeSave(ESSENCE_PROFILE_KEY, profile);
}

export function getLevelFromXp(xp) {
  return Math.max(1, Math.floor(xp / 250) + 1);
}

export function mergeBadges(currentBadges, newBadges) {
  return Array.from(new Set([...(currentBadges || []), ...newBadges]));
}
