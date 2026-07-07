// ════════════════════════════════════════════════════════════════════════
// MASK ENCOUNTERS — the Five Mask Bosses
// Attack lines, fear chips, essence weaknesses and ally roles ported
// VERBATIM from name-the-critic-2.html BOSSES[] — the copy is voice-locked.
// Sprites live in MaskSprite.jsx (dark + evolved rigs); this file is pure
// data, including each boss's Evolution payoff (§5.4) and where its final
// stage waits on the street (end arch of its chapter, §4.2).
// ════════════════════════════════════════════════════════════════════════

export const XP_PER_BOSS = 275;
export const XP_PER_WILD = 20;
export const XP_COURT = 500;

export const MASK_BOSSES = [
  {
    id: "broke-king",
    name: "THE BROKE KING",
    emoji: "👑",
    color: "#FFD84D",
    arena: "#3a2c05",
    tag: "POWERFUL · GIFTED · LIVING BELOW THE STANDARD",
    desc: "Dollar-store crown. Empty pockets. Still acting royal.",
    attacks: [
      "You know you're meant for more. So why is the account empty?",
      "A king? Look at how you actually live.",
      "All that potential. Still broke.",
    ],
    chips: [
      ["staying broke forever", "wasting the gift", "being ordinary"],
      ["being seen as a fraud", "losing respect", "the gap being noticed"],
      ["running out of time", "dying with it inside", "proving them right"],
    ],
    essences: ["power", "majesty"],
    ally: "GUARDS YOUR STANDARD",
    evolved: {
      name: "THE SOVEREIGN",
      role: "GUARDS YOUR STANDARD",
      notes: "true radiant crown · banner raised · posture unbent",
    },
    zone: "THE TERMINUS", // the standard-gap mask guards the Vault
  },
  {
    id: "addict-saint",
    name: "THE ADDICT SAINT",
    emoji: "😇",
    color: "#FF3EDB",
    arena: "#3a0a2c",
    tag: "LOVES GOD · WANTS HEALING · STILL ESCAPES",
    desc: "Halo flickering. Temptation behind his back.",
    attacks: [
      "One more time won't hurt. You've earned the escape.",
      "You'll change tomorrow. You always say tomorrow.",
      "God's tired of hearing the same apology.",
    ],
    chips: [
      ["facing the pressure sober", "feeling it all", "having no exit"],
      ["never actually changing", "being stuck forever", "who I am without it"],
      ["being unlovable", "being given up on", "being beyond grace"],
    ],
    essences: ["love", "power"],
    ally: "GUARDS YOUR PEACE",
    evolved: {
      name: "THE UNSHAKEN SAINT",
      role: "GUARDS YOUR PEACE",
      notes: "solid steady halo · the hidden hand open and empty · feet planted",
    },
    zone: "NEON HEIGHTS", // new identity + vision = maximum pull of the old escape
  },
  {
    id: "silent-prophet",
    name: "THE SILENT PROPHET",
    emoji: "🤐",
    color: "#00F0FF",
    arena: "#062e33",
    tag: "HAS THE MESSAGE · STILL MUTED",
    desc: "Glowing scroll. Unplugged mic. Legendary squeak.",
    attacks: [
      "You have the message. Nobody is listening.",
      "Post it? They'll laugh you off the platform.",
      "Your story doesn't matter yet. Wait.",
    ],
    chips: [
      ["not mattering", "being invisible", "dying unheard"],
      ["being laughed at", "public embarrassment", "being exposed"],
      ["never being ready", "waiting forever", "the message dying with me"],
    ],
    essences: ["radiance", "majesty"],
    ally: "CARRIES YOUR MESSAGE",
    evolved: {
      name: "THE HERALD",
      role: "CARRIES YOUR MESSAGE",
      notes: "mouth unstitched to glow · scroll blazing, held HIGH",
    },
    zone: "THE COMMONS", // you just went public — "nobody is listening" is the final gate
  },
  {
    id: "raging-victim",
    name: "THE RAGING VICTIM",
    emoji: "😡",
    color: "#ff5b3d",
    arena: "#3a0e08",
    tag: "USES THE PAIN AS PERMISSION",
    desc: "Baby Hulk tantrum. Smashes first, cries immediately.",
    attacks: [
      "After what they did? You have every right.",
      "Nobody knows what you survived. Nobody.",
      "Calm down? They should apologize first.",
    ],
    chips: [
      ["being hurt again", "dropping the shield", "being blamed"],
      ["the pain not counting", "being dismissed", "grieving it fully"],
      ["letting them off the hook", "losing the armor", "feeling it instead"],
    ],
    essences: ["love", "power"],
    ally: "GUARDS YOUR HEART",
    evolved: {
      name: "THE GUARDIAN",
      role: "GUARDS YOUR HEART",
      notes: "calm upright giant · fists open to guarding palms · shoulders down",
    },
    zone: "THE UNDERGLOW", // the descent chapter ends by facing the pain-as-permission mask
  },
  {
    id: "naive-warrior",
    name: "THE NAIVE WARRIOR",
    emoji: "⚔️",
    color: "#00a6ff",
    arena: "#082238",
    tag: "HUGE HEART · NO PLAN · PURE FORCE",
    desc: "Epic armor. Rubber sword. Gives the shield to the villain.",
    attacks: [
      "Just push harder. Plans are for cowards.",
      "You don't need help. You need effort.",
      "Slow down and you die. Keep charging.",
    ],
    chips: [
      ["being seen as weak", "stopping and feeling it", "thinking too long"],
      ["needing someone", "owing anyone", "being carried"],
      ["stillness", "what shows up in silence", "not being enough"],
    ],
    essences: ["joy", "power", "majesty"],
    ally: "HOLDS YOUR LINE",
    evolved: {
      name: "THE COMMANDER",
      role: "HOLDS YOUR LINE",
      notes: "true blade SHEATHED · glowing plan in the off-hand · visor up",
    },
    zone: "THE GRID", // you just learned to plan the campaign — "plans are for cowards" attacks exactly then
  },
];

export function getBoss(id) {
  return MASK_BOSSES.find((b) => b.id === id) || null;
}

// Chapter (street zone label) → its final boss. THE ARCHIVE ROW has no
// boss (densest wild stretch instead); THE SPIRE stays the Alchemist's.
export function getBossForZone(zoneLabel) {
  return MASK_BOSSES.find((b) => b.zone === zoneLabel) || null;
}
