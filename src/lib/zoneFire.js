// Derived systems for The Accountability Zone.
// These mappings mirror the SQL in supabase/migrations — keep in sync.

export const FIRE_LEVELS = [
  { key: "cold",    label: "Cold",    min: 0, tint: "#00F0FF", glow: "rgba(0,240,255,0.35)" },
  { key: "warm",    label: "Warm",    min: 1, tint: "#FACC15", glow: "rgba(250,204,21,0.35)" },
  { key: "burning", label: "Burning", min: 3, tint: "#FF7A1A", glow: "rgba(255,122,26,0.4)" },
  { key: "inferno", label: "Inferno", min: 5, tint: "#FF3B5C", glow: "rgba(255,59,92,0.45)" },
  { key: "phoenix", label: "Phoenix", min: 7, tint: "#D11EFF", glow: "rgba(209,30,255,0.5)" },
];

export function getFireLevel(fireDays = 0) {
  let level = FIRE_LEVELS[0];
  for (const f of FIRE_LEVELS) {
    if (fireDays >= f.min) level = f;
  }
  return level;
}

export const PHOENIX_STAGES = [
  { key: "egg",       label: "Egg",               min: 0,   icon: "🥚", art: "/assets/phoenix-shrine/dormant-shrine.png" },
  { key: "spark",     label: "Spark",             min: 3,   icon: "✨", art: "/assets/phoenix-shrine/awakened-shrine.png" },
  { key: "wing",      label: "Wing",              min: 7,   icon: "🪽", art: "/assets/phoenix-shrine/phoenix-wings.png" },
  { key: "flight",    label: "Flight",            min: 14,  icon: "🕊️", art: "/assets/phoenix-shrine/phoenix-appears.png" },
  { key: "rising",    label: "Phoenix Rising",    min: 30,  icon: "🔥", art: "/assets/phoenix-shrine/phoenix-rising.png" },
  { key: "ascended",  label: "Ascended Phoenix",  min: 60,  icon: "🦅", art: "/assets/phoenix-shrine/phoenix-ascended.png" },
  { key: "legendary", label: "Legendary Phoenix", min: 100, icon: "👑", art: "/assets/phoenix-shrine/ascension-beam.png" },
];

export function getPhoenixStage(longestStreak = 0) {
  let stage = PHOENIX_STAGES[0];
  for (const s of PHOENIX_STAGES) {
    if (longestStreak >= s.min) stage = s;
  }
  return stage;
}

export function getNextPhoenixStage(longestStreak = 0) {
  return PHOENIX_STAGES.find((s) => s.min > longestStreak) || null;
}

// Mission categories for Declare. Icons are emoji by design (no asset deps).
export const MISSION_CATEGORIES = [
  { key: "gym",        label: "Train",         icon: "🏋️" },
  { key: "walk",       label: "Walk / Run",    icon: "👟" },
  { key: "read",       label: "Read",          icon: "📖" },
  { key: "journal",    label: "Journal",       icon: "✍️" },
  { key: "meditate",   label: "Meditate",      icon: "🧘" },
  { key: "prayer",     label: "Prayer",        icon: "🙏" },
  { key: "deep_work",  label: "Deep Work",     icon: "🎯" },
  { key: "sales",      label: "Sales Calls",   icon: "📞" },
  { key: "cold",       label: "Cold Shower",   icon: "🧊" },
  { key: "no_scroll",  label: "No Scrolling",  icon: "📵" },
  { key: "stretch",    label: "Stretch",       icon: "🤸" },
  { key: "custom",     label: "Custom",        icon: "⚡" },
];

export function getCategory(key) {
  return MISSION_CATEGORIES.find((c) => c.key === key) || MISSION_CATEGORIES[MISSION_CATEGORIES.length - 1];
}

export const REACTION_EMOJI = ["🔥", "💪", "⚡", "🦅", "👏", "❤️", "👀", "🏆", "✅"];

// Monday of the week containing `date` (local), as YYYY-MM-DD.
export function getWeekStartKey(date = new Date()) {
  const d = new Date(date);
  const day = (d.getDay() + 6) % 7; // 0 = Monday
  d.setDate(d.getDate() - day);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
}

// Friendly copy for RPC error codes — never surfaces raw Postgres errors.
const ERROR_COPY = {
  not_authenticated: "Sign in to enter the Zone.",
  username_taken: "That name is already claimed. Try another.",
  invalid_username: "3–20 characters: lowercase letters, numbers, underscores.",
  user_not_found: "No one found with that name.",
  cannot_add_self: "That's you. You're already on your side.",
  already_friends: "You're already connected.",
  request_pending: "Request already sent — they'll see it.",
  not_friends: "You need to be friends first.",
  invalid_code: "That code doesn't match a squad.",
  transfer_first: "Pass the torch first — transfer ownership before leaving.",
  link_exists: "One partner at a time — end the current link first.",
  not_member: "You're not part of that yet.",
  not_allowed: "That action isn't available.",
  bad_date: "Date out of range — check your device clock.",
  offline: "The Zone needs a connection.",
};

export function zoneErrorMessage(err) {
  const raw = String(err?.message || err || "");
  for (const code of Object.keys(ERROR_COPY)) {
    if (raw.includes(code)) return ERROR_COPY[code];
  }
  return "Something flickered. Try again.";
}
