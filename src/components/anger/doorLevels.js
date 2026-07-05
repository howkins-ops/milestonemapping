// ════════════════════════════════════════════════════════════════════════
//  THE DOOR — LEVEL LADDER config. Data-only. DoorLevel.jsx renders any of
//  these; TheDoorHub.jsx picks which one. Level 1 is the original TheDoor.jsx
//  cinema (not described here — the hub mounts it directly).
//
//  Each level = a brief + N knock rounds + a finale. Rounds carry their own
//  banter pools (customer "them" / rep "you"), a skin, a tap target, and an
//  optional "special" (bell / rocks / chainsaw) and intro cine card. Finale is
//  one of: powerslap · brawl · kickdown. Shared systems (Bloody Knuckles, HEAT
//  meter, banter volleys) are handled by the engine for every level.
// ════════════════════════════════════════════════════════════════════════
import {
  L2_THEM_R1, L2_YOU_R1, L2_THEM_R2, L2_YOU_R2, L2_THEM_R3, L2_YOU_R3, L2_OPEN, L2_SLAP,
  L3_THEM_R1, L3_YOU_R1, L3_THEM_R2, L3_YOU_R2, L3_THEM_R3, L3_YOU_R3, L3_CHAINSAW,
  L3_FIGHT_THEM, L3_FIGHT_YOU, L3_KO,
  L4_THEM_MORN, L4_YOU_MORN, L4_THEM_AFT, L4_YOU_AFT, L4_THEM_EVE, L4_YOU_EVE,
  L4_THEM_NIGHT, L4_YOU_NIGHT, L4_KICK, L4_FIGHT_THEM, L4_FIGHT_YOU, L4_KO,
} from "../../data/angerVoiceLines";

export const DOOR_LEVELS = [
  // ── LEVEL 2 ──────────────────────────────────────────────────────────
  {
    id: 2,
    key: "persist",
    title: "Always Be Persistent",
    relic: "The Throne",
    tag: "Persistence arcade · Level 2 · 21+",
    when: "They won't even answer",
    accent: "#FF7A00",
    customerVoice: "marcus",
    lesson: "A no-answer isn't a no — sometimes the man's just takin' a shit. Keep knocking.",
    brief: {
      heading: "He's not saying no.\nHe's on the toilet.",
      lead: "New house, new customer, same law: nobody answers on the first knock. Ring the bell until your thumb bleeds, out-stubborn a man mid-dump, and learn the only lesson that matters — always be persistent.",
      rounds: ["R1 · THE RING-A-THON", "R2 · FIRST BLOOD", "R3 · THE THRONE"],
    },
    rounds: [
      { key: "ring", skin: "day", label: "🔔 THE RING-A-THON", taps: 16, them: L2_THEM_R1, you: L2_YOU_R1, bell: true },
      { key: "vent", skin: "day", label: "🩸 FIRST BLOOD", taps: 20, them: L2_THEM_R2, you: L2_YOU_R2, bell: true },
      {
        key: "throne", skin: "day", label: "🚽 THE THRONE", taps: 14, them: L2_THEM_R3, you: L2_YOU_R3, openLine: L2_OPEN,
        cine: {
          eyebrow: "A GENTLEMAN DOES NOT RUSH",
          title: "Still. Not. Answering.",
          lines: ["Your knuckles are hamburger.", "The doorbell is dying.", "And that man is not rushing a single thing."],
          cta: "Knock him off the throne →",
        },
      },
    ],
    finale: { type: "powerslap", line: L2_SLAP },
    seal: {
      title: "SIGNED. On the toilet.",
      line: "You out-waited a man mid-dump and closed him with a slap. That's the lesson: the no-answer was never a no.",
    },
  },

  // ── LEVEL 3 ──────────────────────────────────────────────────────────
  {
    id: 3,
    key: "steel",
    title: "The Steel Door",
    relic: "The Vault",
    tag: "Persistence arcade · Level 3 · 21+",
    when: "He moved to escape you",
    accent: "#66E0FF",
    customerVoice: "harry",
    lesson: "A gate is a suggestion. A wall is a suggestion. There is no door persistence can't get through.",
    brief: {
      heading: "He moved.\nGated community. Steel door.",
      lead: "Harold moved across the whole city to get away from you — behind a wall, a gate, and a reinforced steel door that says SALES REPS FUCK OFF. You breached the gate anyway. Now pound the steel, rev the chainsaw, and finish it on the porch.",
      rounds: ["R1 · THE BREACH", "R2 · SOLID STEEL", "R3 · THE CHAINSAW → BRAWL"],
    },
    rounds: [
      {
        key: "breach", skin: "gate", label: "🚧 THE BREACH", taps: 14, them: L3_THEM_R1, you: L3_YOU_R1,
        cine: {
          eyebrow: "GATED COMMUNITY · UNIT 7",
          title: "You are not supposed to be here.",
          lines: ["There's a wall. A gate. A sign that says FUCK OFF.", "You climbed all three.", "Same customer. Same rep. Nowhere left to run."],
          cta: "Find his door →",
        },
      },
      { key: "steel", skin: "steel", label: "🛡️ SOLID STEEL", taps: 24, them: L3_THEM_R2, you: L3_YOU_R2 },
      {
        key: "chainsaw", skin: "steel", label: "🪚 NO MORE DOOR", taps: 16, them: L3_THEM_R3, you: L3_YOU_R3, special: "chainsaw", chainsawLine: L3_CHAINSAW,
        cine: {
          eyebrow: "THE STEEL IS WINNING",
          title: "So there's no more door.",
          lines: ["Your fists can't beat reinforced steel.", "Good thing you brought a chainsaw.", "Hold to rev. Saw through. Meet Harold."],
          cta: "Start the saw →",
        },
      },
    ],
    finale: { type: "brawl", them: L3_FIGHT_THEM, you: L3_FIGHT_YOU, ko: L3_KO, themName: "HAROLD" },
    seal: {
      title: "Through the STEEL.",
      line: "Wall, gate, reinforced door, and a man who did karate in 1987 — none of it stopped the close. There's no door persistence can't get through.",
    },
  },

  // ── LEVEL 4 ──────────────────────────────────────────────────────────
  {
    id: 4,
    key: "callback",
    title: "Never Do Call-Backs",
    relic: "The Reckoning",
    tag: "Persistence arcade · Level 4 · FINALE · 21+",
    when: "He said 'come back later'",
    accent: "#FF2D55",
    customerVoice: "deon",
    lesson: "Never do call-backs. This is what a call-back becomes. Close it the FIRST time.",
    brief: {
      heading: "He said the two\nfatal words.",
      lead: "\"Come back later.\" So you come back. Morning, afternoon, dinner, and 11:59 PM with a fistful of rocks — four visits, escalating each time, until you kick the door clean off its hinges. The final. The bloodiest. The lesson written in windows.",
      rounds: ["☀️ MORNING", "🌤️ AFTERNOON", "🌆 DINNER", "🌑 11:59 PM"],
    },
    rounds: [
      {
        key: "morn", skin: "day", label: "☀️ MORNING — the mistake", taps: 12, them: L4_THEM_MORN, you: L4_YOU_MORN,
        cine: { eyebrow: "8:04 AM", title: "\"Come back later.\"", lines: ["He's half asleep.", "He says the two fatal words.", "You write them down."], cta: "Bank it →" },
      },
      {
        key: "aft", skin: "dusk", label: "🌤️ AFTERNOON — it's later", taps: 16, them: L4_THEM_AFT, you: L4_YOU_AFT,
        cine: { eyebrow: "2:17 PM", title: "It's later.", lines: ["You said later.", "It is, technically, later.", "He's hiding in his own house."], cta: "Knock again →" },
      },
      {
        key: "eve", skin: "eve", label: "🌆 DINNER — mid-bite", taps: 18, them: L4_THEM_EVE, you: L4_YOU_EVE,
        cine: { eyebrow: "6:45 PM", title: "Still later.", lines: ["He's eating dinner.", "This is later than the last later.", "He is furious now."], cta: "Ring the bell →" },
      },
      {
        key: "night", skin: "night", label: "🌑 11:59 — the rocks", taps: 20, them: L4_THEM_NIGHT, you: L4_YOU_NIGHT, special: "rocks",
        cine: { eyebrow: "11:59 PM", title: "It doesn't get later than this.", lines: ["Knocking isn't working.", "There are rocks in the flowerbed.", "There are windows in the house."], cta: "Wind up →" },
      },
    ],
    finale: { type: "kickdown", kickLine: L4_KICK, them: L4_FIGHT_THEM, you: L4_FIGHT_YOU, ko: L4_KO, themName: "BUDDY" },
    seal: {
      title: "Closed. In BLOOD.",
      line: "Four visits. A door off its hinges. He could've signed at 8 AM. Never do call-backs — close it the first time.",
    },
  },
];

export const getDoorLevel = (id) => DOOR_LEVELS.find((l) => l.id === id) || null;
