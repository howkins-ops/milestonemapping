export const MAX_PTS = 100;

export const CATEGORIES = [
  {
    id: "physical", icon: "💪", label: "Physical", color: "#00F0FF",
    habits: [
      { label: "Drink 2 bottles of water", diff: "easy", pts: 5 },
      { label: "Eat a real breakfast", diff: "easy", pts: 5 },
      { label: "10-minute walk", diff: "easy", pts: 5 },
      { label: "Stretch hips/back", diff: "easy", pts: 5 },
      { label: "Protein meal", diff: "medium", pts: 10 },
      { label: "Take vitamins", diff: "medium", pts: 10 },
      { label: "Gym session", diff: "hard", pts: 20 },
      { label: "Sleep before midnight", diff: "medium", pts: 10 },
      { label: "No junk food today", diff: "hard", pts: 20 },
      { label: "Cold shower", diff: "hard", pts: 20 },
      { label: "Meal prep", diff: "hard", pts: 20 },
      { label: "Mobility routine", diff: "medium", pts: 10 },
    ],
  },
  {
    id: "mental", icon: "🧠", label: "Mental", color: "#D11EFF",
    habits: [
      { label: "5-minute breathing reset", diff: "easy", pts: 5 },
      { label: "Journal thoughts", diff: "medium", pts: 10 },
      { label: "Write what is stressing you", diff: "medium", pts: 10 },
      { label: "Clean your room or car", diff: "medium", pts: 10 },
      { label: "No doom scrolling", diff: "hard", pts: 20 },
      { label: "10 minutes alone, no phone", diff: "medium", pts: 10 },
      { label: "Listen to calming music", diff: "easy", pts: 5 },
      { label: "Write one thing you're proud of", diff: "easy", pts: 5 },
      { label: "Let go of one thing you can't control", diff: "identity", pts: 30 },
      { label: "Mental reset walk", diff: "medium", pts: 10 },
      { label: "Name the emotion instead of avoiding it", diff: "identity", pts: 30 },
    ],
  },
  {
    id: "faith", icon: "🙏", label: "Faith", color: "#FF3EDB",
    habits: [
      { label: "Pray for 5 minutes", diff: "easy", pts: 5 },
      { label: "Read one Bible verse", diff: "easy", pts: 5 },
      { label: "Gratitude prayer", diff: "easy", pts: 5 },
      { label: "Ask God for strength today", diff: "medium", pts: 10 },
      { label: "Listen to worship music", diff: "easy", pts: 5 },
      { label: "Go to church or community", diff: "hard", pts: 20 },
      { label: "Forgive someone internally", diff: "identity", pts: 30 },
      { label: "Speak life over yourself", diff: "medium", pts: 10 },
      { label: "Write one blessing", diff: "easy", pts: 5 },
      { label: "Surrender one worry", diff: "identity", pts: 30 },
    ],
  },
  {
    id: "money", icon: "💰", label: "Money", color: "#00FFBF",
    habits: [
      { label: "Check bank account", diff: "easy", pts: 5 },
      { label: "Track spending today", diff: "easy", pts: 5 },
      { label: "Save $5–$20", diff: "medium", pts: 10 },
      { label: "No impulse spending", diff: "hard", pts: 20 },
      { label: "Pay one bill", diff: "medium", pts: 10 },
      { label: "Review income goal", diff: "medium", pts: 10 },
      { label: "Write one money lesson", diff: "easy", pts: 5 },
      { label: "Set a small financial target", diff: "medium", pts: 10 },
      { label: "Plan tomorrow's lunch", diff: "easy", pts: 5 },
      { label: "Create a reward budget", diff: "hard", pts: 20 },
    ],
  },
  {
    id: "relationships", icon: "❤️", label: "Connect", color: "#FF3EDB",
    habits: [
      { label: "Call family", diff: "medium", pts: 10 },
      { label: "Text a friend", diff: "easy", pts: 5 },
      { label: "Encourage a teammate", diff: "medium", pts: 10 },
      { label: "Apologize where needed", diff: "identity", pts: 30 },
      { label: "Ask someone how they are doing", diff: "easy", pts: 5 },
      { label: "Be honest with someone", diff: "hard", pts: 20 },
      { label: "Do not isolate today", diff: "hard", pts: 20 },
      { label: "Compliment someone genuinely", diff: "easy", pts: 5 },
      { label: "Check in on another rep", diff: "medium", pts: 10 },
      { label: "Spend time without your phone", diff: "hard", pts: 20 },
    ],
  },
  {
    id: "professional", icon: "🎯", label: "Pro", color: "#00F0FF",
    habits: [
      { label: "Review your pitch", diff: "medium", pts: 10 },
      { label: "Practice objections", diff: "medium", pts: 10 },
      { label: "Watch one training clip", diff: "easy", pts: 5 },
      { label: "Write today's sales intention", diff: "medium", pts: 10 },
      { label: "Clean your gear", diff: "easy", pts: 5 },
      { label: "Ask for coaching", diff: "hard", pts: 20 },
      { label: "Roleplay with teammate", diff: "hard", pts: 20 },
      { label: "Track your numbers", diff: "medium", pts: 10 },
      { label: "Set one door goal", diff: "medium", pts: 10 },
      { label: "Celebrate one small win", diff: "easy", pts: 5 },
    ],
  },
  {
    id: "emotional", icon: "🌊", label: "Emotional", color: "#D11EFF",
    habits: [
      { label: "Write what you feel", diff: "medium", pts: 10 },
      { label: "Admit what is bothering you", diff: "hard", pts: 20 },
      { label: "Stop pretending you're fine", diff: "identity", pts: 30 },
      { label: "3 deep breaths before reacting", diff: "easy", pts: 5 },
      { label: "Talk to someone instead of bottling it", diff: "hard", pts: 20 },
      { label: "Write one thing you need", diff: "medium", pts: 10 },
      { label: "Release one resentment", diff: "identity", pts: 30 },
      { label: "Choose patience today", diff: "hard", pts: 20 },
      { label: "Name your survival mode", diff: "hard", pts: 20 },
      { label: "Choose your essence word", diff: "identity", pts: 30 },
    ],
  },
  {
    id: "discipline", icon: "⚔️", label: "Discipline", color: "#00FFBF",
    habits: [
      { label: "Make your bed", diff: "easy", pts: 5 },
      { label: "Show up on time", diff: "medium", pts: 10 },
      { label: "Do the hard thing first", diff: "hard", pts: 20 },
      { label: "No weed today", diff: "identity", pts: 30 },
      { label: "No porn today", diff: "identity", pts: 30 },
      { label: "No alcohol today", diff: "identity", pts: 30 },
      { label: "Finish one task completely", diff: "medium", pts: 10 },
      { label: "Keep one promise", diff: "hard", pts: 20 },
      { label: "Do not quit early", diff: "hard", pts: 20 },
      { label: "Walk one more street", diff: "medium", pts: 10 },
      { label: "Last 15 minutes strong", diff: "hard", pts: 20 },
    ],
  },
];

export const ENERGY_MSGS = [
  "Energy restored.",
  "Cup rising.",
  "Discipline deposited.",
  "Self-respect earned.",
  "You just chose yourself.",
  "That's how leaders recharge.",
  "Your future self felt that.",
  "Small action. Big energy.",
  "You are not pouring from empty today.",
];

export const MILESTONES = [
  { pct: 25, msg: "You're waking back up." },
  { pct: 50, msg: "Energy is returning." },
  { pct: 75, msg: "You're becoming dangerous again." },
  { pct: 100, msg: "Cup filled. Go lead." },
];

export const DIFF_PTS = { easy: 5, medium: 10, hard: 20, identity: 30 };

// Streak levels — the cup gets harder to fill as your discipline grows.
// threshold = energy points needed to reach 100%.
export const LEVELS = [
  { name: "Empty Cup",         icon: "💀", streakMin: 0,  threshold: 100, color: "#666",    tagline: "Start here. Everyone does." },
  { name: "Flicker",           icon: "🕯️", streakMin: 3,  threshold: 115, color: "#D11EFF", tagline: "Something is waking up in you." },
  { name: "Refilled",          icon: "⚡",  streakMin: 7,  threshold: 135, color: "#00F0FF", tagline: "You're no longer running on fumes." },
  { name: "Overflow",          icon: "🌊", streakMin: 14, threshold: 160, color: "#00FFBF", tagline: "Your energy is compounding now." },
  { name: "Phoenix State",     icon: "🔥", streakMin: 21, threshold: 190, color: "#FF3EDB", tagline: "You are rebuilt. You are dangerous." },
  { name: "Diamond Discipline",icon: "💎", streakMin: 30, threshold: 225, color: "#00F0FF", tagline: "Pressure made you. Now you can't break." },
  { name: "Unshakable",        icon: "◆",  streakMin: 60, threshold: 270, color: "#D11EFF", tagline: "They can't knock you down anymore." },
];

export function getLevel(streak) {
  let level = LEVELS[0];
  for (const l of LEVELS) {
    if (streak >= l.streakMin) level = l;
    else break;
  }
  return level;
}

export function getNextLevel(streak) {
  return LEVELS.find(l => l.streakMin > streak) || null;
}

// Kill-streak announcements — fire when streak hits these exact values.
export const KILL_STREAKS = [
  {
    streak: 3,
    name: "FIRST BLOOD",
    icon: "🩸",
    color: "#FF3EDB",
    tagline: "3 days. You didn't quit. Most people would have.",
    sub: "Most guys stop after day 2. You didn't.",
  },
  {
    streak: 5,
    name: "DOUBLE FILL",
    icon: "⚡",
    color: "#00F0FF",
    tagline: "5 days of choosing yourself. That's a streak, not a fluke.",
    sub: "You're building something real.",
  },
  {
    streak: 7,
    name: "KILLING SPREE",
    icon: "🔥",
    color: "#D11EFF",
    tagline: "A full week. Habits are starting to stick.",
    sub: "7 days of showing up for yourself.",
  },
  {
    streak: 10,
    name: "DOMINATING",
    icon: "💪",
    color: "#00FFBF",
    tagline: "10 days. You're not the same person who started.",
    sub: "Double digits. They're scared of you now.",
  },
  {
    streak: 14,
    name: "RAMPAGE",
    icon: "💥",
    color: "#FF3EDB",
    tagline: "Two weeks straight. This is no longer discipline. This is identity.",
    sub: "You're a different animal now.",
  },
  {
    streak: 21,
    name: "MEGA FILL",
    icon: "🌊",
    color: "#00F0FF",
    tagline: "21 days. You're running on actual energy now, not coffee and prayer.",
    sub: "The science says habits are formed. But you already knew that.",
  },
  {
    streak: 30,
    name: "UNSTOPPABLE",
    icon: "🌪️",
    color: "#D11EFF",
    tagline: "30 days. A month. This is now who you are.",
    sub: "They can't knock you off your routine anymore.",
  },
  {
    streak: 45,
    name: "WARLORD",
    icon: "👑",
    color: "#00FFBF",
    tagline: "45 days. Your cup doesn't empty anymore. It just overflows.",
    sub: "You're pouring into everyone around you and still have more.",
  },
  {
    streak: 60,
    name: "GODLIKE",
    icon: "🌟",
    color: "#FF3EDB",
    tagline: "60 days. Whatever you touch, you improve.",
    sub: "You are the case study everyone else needs to see.",
  },
  {
    streak: 90,
    name: "LEGENDARY",
    icon: "💎",
    color: "#00F0FF",
    tagline: "90 days. Three months of war against your old self. You won.",
    sub: "You are not the same person. You never will be again.",
  },
  {
    streak: 100,
    name: "CENTURY",
    icon: "◆",
    color: "#D11EFF",
    tagline: "100 DAYS. ONE HUNDRED DAYS OF FILLING YOUR CUP.",
    sub: "This is generational. You changed your bloodline.",
  },
];
