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
//
//  ZERO EMOJI. Icons are DATA, never text: every round carries an `icon` key
//  naming a drawn <symbol> from door/GameIcons.jsx. Labels are words only —
//  if you find yourself typing a glyph into a string, add an icon instead.
// ════════════════════════════════════════════════════════════════════════
import {
  DOOR_TIERS, DOOR_REP_R1, DOOR_REP_R2, DOOR_OPEN,
  DOOR_FIGHT_THEM, DOOR_FIGHT_REP, DOOR_KO, DOOR_WIFE,
  L2_THEM_R1, L2_YOU_R1, L2_THEM_R2, L2_YOU_R2, L2_THEM_CRACK, L2_YOU_CRACK,
  L2_THEM_R3, L2_YOU_R3, L2_OPEN, L2_SLAP,
  L3_THEM_R1, L3_YOU_R1, L3_THEM_CAM, L3_YOU_CAM, L3_THEM_R2, L3_YOU_R2,
  L3_THEM_R3, L3_YOU_R3, L3_CHAINSAW, L3_FIGHT_THEM, L3_FIGHT_YOU, L3_KO,
  L4_THEM_MORN, L4_YOU_MORN, L4_THEM_AFT, L4_YOU_AFT, L4_THEM_EVE, L4_YOU_EVE,
  L4_THEM_NIGHT, L4_YOU_NIGHT, L4_THEM_LATE, L4_YOU_LATE,
  L4_KICK, L4_FIGHT_THEM, L4_FIGHT_YOU, L4_KO,
} from "../../data/angerVoiceLines";

/* DOOR_TIERS is authored as escalating tiers of homeowner rage; the round
   engine wants one flat pool per round. Early rounds pull the calm tiers,
   late rounds pull the nuclear ones. */
const tiers = (...idx) => idx.flatMap((i) => DOOR_TIERS[i].lines);

export const DOOR_LEVELS = [
  // ── LEVEL 1 ──────────────────────────────────────────────────────────
  // Was a separate 949-line component with its own copy of every system.
  // Folded in so it inherits the drawn art, the FX engine, native haptics
  // and the Punch-Out finale like every other level.
  {
    id: 1,
    key: "first",
    title: "The Door",
    relic: "The First Door",
    tag: "Persistence arcade · Level 1 · 18+",
    when: "He just won't answer",
    accent: "#FF3B5C",
    customerVoice: "harry",
    lesson: "The first no is a reflex, not a decision. Knock past the reflex and you meet the actual human being.",
    brief: {
      heading: "One door.\nOne stubborn man.",
      lead: "This is the whole job in one porch. He will say no before he knows what you're selling — because that no is a reflex. Out-knock the reflex, take the NOs on the chin, and stay until the door opens.",
      rounds: [
        { icon: "door", label: "R1 · THE KNOCK" },
        { icon: "moon", label: "R2 · THE MIDNIGHT CLOSE" },
        { icon: "glove", label: "R3 · THE PORCH" },
      ],
    },
    rounds: [
      {
        key: "knock", skin: "day", icon: "door", label: "THE KNOCK", taps: 24,
        them: tiers(0, 1), you: DOOR_REP_R1,
      },
      {
        key: "night", skin: "night", icon: "moon", label: "THE MIDNIGHT CLOSE", taps: 34,
        them: tiers(2, 3, 4), you: DOOR_REP_R2, bell: true, drain: true, openLine: DOOR_OPEN,
        cine: {
          eyebrow: "11:40 PM · STILL HERE",
          title: "The porch light went off an hour ago.",
          lines: ["He thought you'd quit at dinner.", "He was wrong about that.", "Ring it until the paint comes off."],
          cta: "Wake him up →",
        },
      },
    ],
    // No cold open — L1 goes straight to the bout, then his wife walks out.
    finale: {
      type: "brawl", bout: "homeowner",
      them: DOOR_FIGHT_THEM, you: DOOR_FIGHT_REP, ko: DOOR_KO, themName: "HAROLD",
      wife: DOOR_WIFE,
    },
    seal: {
      title: "SIGNED. On the first door.",
      line: "He said no five different ways and meant it none of them. That's the muscle you just built: the reflex no is not the real answer.",
    },
  },

  // ── LEVEL 2 ──────────────────────────────────────────────────────────
  {
    id: 2,
    key: "persist",
    title: "Always Be Persistent",
    relic: "The Throne",
    tag: "Persistence arcade · Level 2 · 18+",
    when: "They won't even answer",
    accent: "#FF7A00",
    customerVoice: "marcus",
    lesson: "A no-answer isn't a no — sometimes the man's just takin' a shit. Keep knocking.",
    brief: {
      heading: "He's not saying no.\nHe's on the toilet.",
      lead: "New house, new customer, same law: nobody answers on the first knock. Ring the bell until your thumb bleeds, out-stubborn a man mid-dump, and learn the only lesson that matters — always be persistent.",
      rounds: [
        { icon: "bell", label: "R1 · THE RING-A-THON" },
        { icon: "blood", label: "R2 · FIRST BLOOD" },
        { icon: "door", label: "R3 · THE CHAIN CRACK" },
        { icon: "throne", label: "R4 · THE THRONE" },
      ],
    },
    rounds: [
      { key: "ring", skin: "day", icon: "bell", label: "THE RING-A-THON", taps: 22, them: L2_THEM_R1, you: L2_YOU_R1, bell: true },
      { key: "vent", skin: "day", icon: "blood", label: "FIRST BLOOD", taps: 28, them: L2_THEM_R2, you: L2_YOU_R2, bell: true, drain: true },
      {
        key: "crack", skin: "day", icon: "door", label: "THE CHAIN CRACK", taps: 24, them: L2_THEM_CRACK, you: L2_YOU_CRACK, bell: true, drain: true,
        cine: {
          eyebrow: "TWO INCHES OF PROGRESS",
          title: "The chain is still ON.",
          lines: ["He cracked the door — barely.", "One eye on you. One eye on his business.", "A gap is an opening. Widen it."],
          cta: "Wedge your foot in →",
        },
      },
      {
        key: "throne", skin: "day", icon: "throne", label: "THE THRONE", taps: 18, them: L2_THEM_R3, you: L2_YOU_R3, openLine: L2_OPEN, drain: true,
        cine: {
          eyebrow: "A GENTLEMAN DOES NOT RUSH",
          title: "Still. Not. Answering.",
          lines: ["Your knuckles are hamburger.", "The doorbell is dying.", "And that man is not rushing a single thing."],
          cta: "Knock him off the throne →",
        },
      },
    ],
    // The slap is the COLD OPEN — it staggers him back into a fighting stance
    // and the bell rings. `bout` names a boss in door/punchOut.js.
    finale: { type: "powerslap", line: L2_SLAP, bout: "marcus", them: L2_THEM_R3, you: L2_YOU_R3, ko: L2_SLAP, themName: "MARCUS" },
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
    tag: "Persistence arcade · Level 3 · 18+",
    when: "He moved to escape you",
    accent: "#66E0FF",
    customerVoice: "harry",
    lesson: "The steel door is the fear in your head. In this cartoon — and only in this cartoon — nothing stops the knock.",
    brief: {
      heading: "He moved.\nGated community. Steel door.",
      lead: "Harold moved across the whole city to get away from you — behind a wall, a gate, and a reinforced steel door that says SALES REPS FUCK OFF. You breached the gate anyway. Now pound the steel, rev the chainsaw, and finish it on the porch.",
      rounds: [
        { icon: "barrier", label: "R1 · THE BREACH" },
        { icon: "cam", label: "R2 · THE RING CAM" },
        { icon: "shield", label: "R3 · SOLID STEEL" },
        { icon: "saw", label: "R4 · THE CHAINSAW → BRAWL" },
      ],
      disclaimer: "Cartoon revenge-comedy for rejection-proofing your nervous system. Fiction, obviously — never real-world doorstep advice.",
    },
    rounds: [
      {
        key: "breach", skin: "gate", icon: "barrier", label: "THE BREACH", taps: 20, them: L3_THEM_R1, you: L3_YOU_R1, special: "gate",
        cine: {
          eyebrow: "GATED COMMUNITY · UNIT 7",
          title: "You are not supposed to be here.",
          lines: ["There's a wall. A gate. A sign that says FUCK OFF.", "You climbed all three.", "Same customer. Same rep. Nowhere left to run."],
          cta: "Find his door →",
        },
      },
      {
        key: "cam", skin: "gate", icon: "cam", label: "THE RING CAM", taps: 22, them: L3_THEM_CAM, you: L3_YOU_CAM, bell: true, drain: true, special: "ringcam",
        cine: {
          eyebrow: "SMILE — YOU'RE ON 4K",
          title: "He's watching you on a doorbell.",
          lines: ["He won't open. But he'll TALK — through the camera.", "Every knock is uploaded to the cloud.", "Give the lens something worth recording."],
          cta: "Perform for the cloud →",
        },
      },
      { key: "steel", skin: "steel", icon: "shield", label: "SOLID STEEL", taps: 32, them: L3_THEM_R2, you: L3_YOU_R2, drain: true },
      {
        key: "chainsaw", skin: "steel", icon: "saw", label: "NO MORE DOOR", taps: 20, them: L3_THEM_R3, you: L3_YOU_R3, special: "chainsaw", chainsawLine: L3_CHAINSAW,
        cine: {
          eyebrow: "THE STEEL IS WINNING",
          title: "So there's no more door.",
          lines: ["Your fists can't beat reinforced steel.", "Good thing you brought a chainsaw.", "Hold to rev. Saw through. Meet Harold."],
          cta: "Start the saw →",
        },
      },
    ],
    finale: { type: "brawl", bout: "harold", them: L3_FIGHT_THEM, you: L3_FIGHT_YOU, ko: L3_KO, themName: "HAROLD" },
    seal: {
      title: "Through the STEEL.",
      line: "Wall, gate, reinforced door, and a man who did karate in 1987 — the cartoon threw everything at you and the knock kept coming. That's the muscle: no rejection in your head is thicker than that steel.",
    },
  },

  // ── LEVEL 4 ──────────────────────────────────────────────────────────
  {
    id: 4,
    key: "callback",
    title: "Never Do Call-Backs",
    relic: "The Reckoning",
    tag: "Persistence arcade · Level 4 · FINALE · 18+",
    when: "He said 'come back later'",
    accent: "#FF2D55",
    customerVoice: "deon",
    lesson: "Ask for the close the FIRST time — so this cartoon never has to happen. That's the whole lesson.",
    brief: {
      heading: "He said the two\nfatal words.",
      lead: "\"Come back later.\" So you come back. Morning, afternoon, dinner, and 11:59 PM with a fistful of rocks — four visits, escalating each time, until you kick the door clean off its hinges. The final. The bloodiest. A cautionary cartoon about what \"later\" costs everyone.",
      rounds: [
        { icon: "sun", label: "MORNING" },
        { icon: "sunhaze", label: "AFTERNOON" },
        { icon: "sunset", label: "DINNER" },
        { icon: "moon", label: "11:59 PM" },
        { icon: "night", label: "3 AM" },
      ],
      disclaimer: "An absurdist cautionary cartoon — the point is to never need a call-back. Fiction only; never real-world advice.",
    },
    rounds: [
      {
        key: "morn", skin: "day", icon: "sun", label: "MORNING — the mistake", taps: 18, them: L4_THEM_MORN, you: L4_YOU_MORN,
        cine: { eyebrow: "8:04 AM", title: "\"Come back later.\"", lines: ["He's half asleep.", "He says the two fatal words.", "You write them down."], cta: "Bank it →" },
      },
      {
        key: "aft", skin: "dusk", icon: "sunhaze", label: "AFTERNOON — it's later", taps: 24, them: L4_THEM_AFT, you: L4_YOU_AFT, drain: true,
        cine: { eyebrow: "2:17 PM", title: "It's later.", lines: ["You said later.", "It is, technically, later.", "He's hiding in his own house."], cta: "Knock again →" },
      },
      {
        key: "eve", skin: "eve", icon: "sunset", label: "DINNER — mid-bite", taps: 28, them: L4_THEM_EVE, you: L4_YOU_EVE, bell: true, drain: true,
        cine: { eyebrow: "6:45 PM", title: "Still later.", lines: ["He's eating dinner.", "This is later than the last later.", "He is furious now."], cta: "Ring the bell →" },
      },
      {
        key: "night", skin: "night", icon: "moon", label: "11:59 — the rocks", taps: 28, them: L4_THEM_NIGHT, you: L4_YOU_NIGHT, special: "rocks", drain: true,
        cine: { eyebrow: "11:59 PM", title: "It doesn't get later than this.", lines: ["Knocking isn't working.", "There are rocks in the flowerbed.", "There are windows in the house."], cta: "Wind up →" },
      },
      {
        key: "late", skin: "night", icon: "night", label: "3 AM — LAST CALL", taps: 26, them: L4_THEM_LATE, you: L4_YOU_LATE, bell: true, drain: true,
        cine: { eyebrow: "3:00 AM", title: "There's nothing left to break.", lines: ["No windows. No sleep. No neighbors on his side.", "Just a demon on the porch and a bell that won't die.", "One more push and the door comes OFF."], cta: "Finish him →" },
      },
    ],
    finale: { type: "kickdown", bout: "buddy", kickLine: L4_KICK, them: L4_FIGHT_THEM, you: L4_FIGHT_YOU, ko: L4_KO, themName: "BUDDY" },
    seal: {
      title: "Closed. In BLOOD.",
      line: "Four visits. A door off its hinges. He could've signed at 8 AM — that's the cautionary tale. Ask for the close the first time, and the cartoon stays a cartoon.",
    },
  },
];

export const getDoorLevel = (id) => DOOR_LEVELS.find((l) => l.id === id) || null;
