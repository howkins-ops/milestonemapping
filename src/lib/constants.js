export const STORAGE_KEYS = {
  projects: "milestone_mapping_projects",
  milestones: "milestone_mapping_milestones",
  dailyLogs: "milestone_mapping_daily_logs",
  weeklyReviews: "milestone_mapping_weekly_reviews",
  visionBoard: "milestone_mapping_vision_board",
  identity: "milestone_mapping_identity",
  settings: "milestone_mapping_settings",
  achievements: "milestone_mapping_achievements",
  xp: "milestone_mapping_xp",
  toasts: "milestone_mapping_toasts"
};

export const APP_NAME = "Milestone Mapping";
export const TAGLINE = "Map the mission. Execute the day. Unlock the reward.";

export const MOTIVATIONAL_COPY = [
  {
    text: "Small proof beats big promises. 138 studies agree.",
    stat: "138 studies, 19,951 participants. Progress tracking has a d = 0.40 effect size.",
    source: "Progress Monitoring Meta-Analysis"
  },
  {
    text: "You are one checked box away from momentum.",
    stat: "Forward progress in meaningful work is the #1 driver of motivation.",
    source: "Harvard Business School — The Progress Principle"
  },
  {
    text: "Gratitude rewires what you notice. It rewires who you become.",
    stat: "64 randomized clinical trials proved gratitude interventions reduce anxiety and depression.",
    source: "Gratitude Intervention Meta-Analysis, 2023"
  },
  {
    text: "The map only works if you move.",
    stat: "Written goals with action commitments achieve nearly double unwritten goals (7.6 vs 4.28).",
    source: "Dominican University Goals Research"
  },
  {
    text: "Don't wake up negotiating with yourself. Plan tonight. Execute tomorrow.",
    stat: "If-then planning improves goal attainment with a medium-to-large effect (d = 0.65).",
    source: "Implementation Intentions Meta-Analysis"
  },
  {
    text: "Today is a vote for the future version of you.",
    stat: "Habit-identity links are associated with higher self-esteem and striving toward an ideal self.",
    source: "Habit and Identity — Frontiers in Psychology"
  },
  {
    text: "76% who reported progress achieved their goals. 43% who didn't report, didn't.",
    stat: "Weekly progress reporting was the single highest-predictor of goal achievement.",
    source: "Michigan State / Dominican University Goals Research"
  },
  {
    text: "Review the week. Reload the mission.",
    stat: "Self-regulation depends on checking the gap between current progress and the goal.",
    source: "Progress Monitoring Meta-Analysis"
  },
  {
    text: "A goal without a milestone is just a wish with coordinates.",
    stat: "Harvard analyzed 11,637 diary entries. Progress — even small — creates the best inner work life.",
    source: "Harvard Business School — The Progress Principle"
  },
  {
    text: "The old version of you waits in comfort. The new version moves.",
    stat: "Self-affirmation has reliable positive effects on behavior change (d = 0.32 across 144 experiments).",
    source: "Self-Affirmation Meta-Analysis — PubMed"
  },
  {
    text: "You are not behind. You are building.",
    stat: "Habits took an average of 66 days to form — ranging from 18 to 254 days. You're on track.",
    source: "Modelling Habit Formation in the Real World — Lally, 2010"
  },
  {
    text: "Execution creates evidence. Evidence rewires identity.",
    stat: "When habits connect to identity, they become self-sustaining — not willpower-dependent.",
    source: "Habit and Identity — Frontiers in Psychology"
  },
  {
    text: "See the future. Spot the obstacle. Script the response. Then move.",
    stat: "Mental contrasting with if-then planning improved goal attainment (g = 0.336).",
    source: "Mental Contrasting Meta-Analysis"
  },
  {
    text: "The future respects receipts.",
    stat: "Progress recorded publicly or physically has stronger effects than tracking alone.",
    source: "Progress Monitoring Meta-Analysis"
  },
  {
    text: "The reward is not the prize. The new identity is.",
    stat: "Rewards attached to execution — not avoidance — create the strongest behavioral loops.",
    source: "Behavioral Science — Progress Monitoring Research"
  },
  {
    text: "Your dream needs coordinates, not excuses.",
    stat: "Written goals with weekly reports nearly double achievement rates.",
    source: "Dominican University Goals Research"
  },
  {
    text: "A milestone is a promise with a path.",
    stat: "Every completed action toward a meaningful goal is progress — and progress is medicine.",
    source: "Harvard Business School — The Progress Principle"
  },
  {
    text: "Discipline is more exciting when it pays you back.",
    stat: "Visible wins and reinforcement are among the most reliable behavior change mechanisms.",
    source: "Progress Monitoring Meta-Analysis"
  }
];

export const CATEGORIES = [
  "Business",
  "Fitness",
  "Money",
  "Faith",
  "Relationships",
  "Personal Growth",
  "Sales",
  "Health"
];

export const PROJECT_ICONS = ["🚀", "🔥", "💰", "🏔️", "📖", "🏠", "🧠", "❤️", "🏆", "⚔️", "🌊", "👑"];

export const PROJECT_COLORS = [
  { key: "cyan", hex: "#00F0FF", label: "Cyan" },
  { key: "green", hex: "#00FFBF", label: "Green" },
  { key: "pink", hex: "#FF3EDB", label: "Pink" },
  { key: "purple", hex: "#8B5CF6", label: "Purple" },
  { key: "gold", hex: "#FACC15", label: "Gold" },
  { key: "red", hex: "#FF3B5C", label: "Red" }
];

export function getProjectColorHex(key) {
  const c = PROJECT_COLORS.find((p) => p.key === key);
  return c ? c.hex : "#00F0FF";
}

export const PRIORITIES = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "mission_critical", label: "Mission Critical" }
];

export const MILESTONE_STATUSES = [
  { value: "not_started", label: "Not Started" },
  { value: "active", label: "Active" },
  { value: "paused", label: "Paused" },
  { value: "completed", label: "Completed" }
];

export const NAV_ITEMS = [
  // CORE
  { id: "dashboard", label: "Command", icon: "🛰️", group: "core" },
  { id: "daily", label: "Daily", icon: "⚡", group: "core" },
  { id: "milestones", label: "Map", icon: "🗺️", group: "core" },
  { id: "weekly", label: "Review", icon: "🧭", group: "core" },
  { id: "rewards", label: "Rewards", icon: "🏆", group: "core" },
  // BELIEF SYSTEM
  { id: "vision", label: "Vision", icon: "🔭", group: "belief" },
  { id: "identity", label: "Identity", icon: "🧬", group: "belief" },
  // TOOLS
  { id: "stats", label: "Stats", icon: "📊", group: "tools" },
  { id: "formula", label: "Formula", icon: "🧪", group: "tools" },
  // EXTRAS
  { id: "training", label: "5 Shifts", icon: "🌀", group: "extras" },
  { id: "essence", label: "Shadow Work", icon: "🌑", group: "extras" },
  { id: "anger", label: "Anger Gym", icon: "🔥", group: "extras" },
  // CONFIG
  { id: "settings", label: "Settings", icon: "⚙️", group: "config" }
];

export const MOBILE_NAV_IDS = ["dashboard", "daily", "milestones", "weekly", "settings"];

export const THEMES = [
  { value: "dark_neon", label: "Dark Neon" },
  { value: "gold_warrior", label: "Gold Warrior" },
  { value: "cyber_phoenix", label: "Cyber Phoenix" },
  { value: "clean_focus", label: "Clean Focus" },
  { value: "bloodline", label: "Bloodline Mode" },
  { value: "empire", label: "Empire Mode" }
];

export const VISION_CATEGORIES = [
  "Dream Life",
  "Body",
  "Money",
  "Career",
  "Faith",
  "Relationships",
  "Home",
  "Travel",
  "Freedom",
  "Legacy"
];

export const TOP_FIVE_STATES = {
  0: "Set the mission.",
  1: "Momentum started.",
  2: "You're moving.",
  3: "Pressure is building.",
  4: "Finish the fight.",
  5: "Day conquered. Momentum earned."
};

export const IDENTITY_RULE_EXAMPLES = [
  "I keep promises to myself.",
  "I review my goals every Sunday.",
  "I finish my Top 5 before distractions.",
  "I attach rewards to execution.",
  "I do not negotiate with the old version of me.",
  "I act before motivation arrives.",
  "I turn pressure into proof."
];

export const DEFAULT_POWER_STATEMENT =
  "I am the kind of person who maps the mission, executes the day, and follows through until the reward is earned.";

export const DEFAULT_TRANSMISSION = "I am becoming the person who follows through.";

export const DEFAULT_SETTINGS = {
  soundEnabled: true,
  introEnabled: true,
  reducedMotion: false,
  theme: "dark_neon"
};

export const DEFAULT_IDENTITY = {
  currentIdentity: "",
  futureIdentity: "",
  powerStatement: "",
  rules: [],
  myWhy: "",
  coreBeliefs: []
};

export const TRAINERS = [
  {
    id: "blaze",
    name: "BLAZE",
    title: "The Ignitor",
    icon: "🔥",
    color: "#FF3EDB",
    specialty: "Momentum & Fire",
    vibe: "Energy. Intensity. Now.",
    hudMessage: "You came to burn — so burn."
  },
  {
    id: "sage",
    name: "SAGE",
    title: "The Strategist",
    icon: "🧠",
    color: "#00F0FF",
    specialty: "Systems & Clarity",
    vibe: "Think. Build. Execute.",
    hudMessage: "Clarity is the weapon. Use it."
  },
  {
    id: "nova",
    name: "NOVA",
    title: "The Motivator",
    icon: "⚡",
    color: "#D11EFF",
    specialty: "Identity & Belief",
    vibe: "You are already who you need to be.",
    hudMessage: "Identity first. Everything else follows."
  },
  {
    id: "titan",
    name: "TITAN",
    title: "The Executor",
    icon: "⚔️",
    color: "#FFD166",
    specialty: "Discipline & Action",
    vibe: "No excuses. No negotiations.",
    hudMessage: "Discipline is the only freedom."
  },
  {
    id: "ember",
    name: "EMBER",
    title: "The Coach",
    icon: "🌱",
    color: "#00FFBF",
    specialty: "Compassion & Growth",
    vibe: "Progress over perfection. Always.",
    hudMessage: "Every step forward counts."
  },
  {
    id: "storm",
    name: "STORM",
    title: "The Challenger",
    icon: "🌀",
    color: "#7B2CFF",
    specialty: "Pressure & Grit",
    vibe: "Pressure reveals who you really are.",
    hudMessage: "The edge is where you grow."
  }
];

export const BOOT_LINES = [
  "Initializing Milestone Mapping...",
  "Scanning Future Identity...",
  "Loading Daily Execution System...",
  "Connecting Milestone Coordinates...",
  "Activating Reward Vault...",
  "Mission Control Online.",
  "Welcome back, Builder."
];

export const SCORECARD_LABELS = [
  { min: 0, max: 15, label: "Reset Week" },
  { min: 16, max: 25, label: "Learning Week" },
  { min: 26, max: 35, label: "Momentum Week" },
  { min: 36, max: 45, label: "Strong Week" },
  { min: 46, max: 50, label: "Legendary Week" }
];

export function getScorecardLabel(total) {
  const band = SCORECARD_LABELS.find((b) => total >= b.min && total <= b.max);
  return band ? band.label : "Reset Week";
}

export function getRandomCopy(seed) {
  const i =
    typeof seed === "number"
      ? seed % MOTIVATIONAL_COPY.length
      : Math.floor(Math.random() * MOTIVATIONAL_COPY.length);
  return MOTIVATIONAL_COPY[i];
}
