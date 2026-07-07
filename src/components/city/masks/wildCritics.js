// ════════════════════════════════════════════════════════════════════════
// MASK ENCOUNTERS — the Wild Critics (the commons)
// Eight street-level inner critics that ambush from the fog banks. Each is
// a 60-second micro-fight: one attack line, three fear chips, one win line.
// Drawn as hooded wisps (WispSprite.jsx) — much lighter than boss rigs.
// Copy is law (§5.3 of MASK-ENCOUNTERS-BUILD-PROMPT.md).
// ════════════════════════════════════════════════════════════════════════

export const WILD_CRITICS = [
  {
    id: "snooze",
    name: "THE SNOOZE",
    color: "#B06DFF",
    attack: "Five more minutes. The dream can wait.",
    chips: ["losing the morning", "another wasted year", "being behind forever"],
    win: "NAMED. The morning is yours.",
  },
  {
    id: "scroll",
    name: "THE SCROLL",
    color: "#00F0FF",
    attack: "Just check it real quick. Everyone else is.",
    chips: ["missing out", "being bored with myself", "the silence"],
    win: "NAMED. Eyes back on the road.",
  },
  {
    id: "comparison",
    name: "THE COMPARISON",
    color: "#FF3EDB",
    attack: "Look how far ahead they are. Why bother?",
    chips: ["never catching up", "being ordinary", "starting too late"],
    win: "NAMED. Your lane. Your pace.",
  },
  {
    id: "imposter",
    name: "THE IMPOSTER",
    color: "#D11EFF",
    attack: "They're going to find out you're faking it.",
    chips: ["being exposed", "not deserving it", "being found out as average"],
    win: "NAMED. You were never faking.",
  },
  {
    id: "perfectionist",
    name: "THE PERFECTIONIST",
    color: "#FFD166",
    attack: "It's not ready. YOU'RE not ready.",
    chips: ["being judged", "shipping something flawed", "it being ignored"],
    win: "NAMED. Done beats perfect.",
  },
  {
    id: "tomorrow-man",
    name: "THE TOMORROW MAN",
    color: "#00a6ff",
    attack: "Start Monday. Fresh week, fresh you.",
    chips: ["actually starting", "finding out I can't", "no more excuses"],
    win: "NAMED. Today heard that.",
  },
  {
    id: "pleaser",
    name: "THE PEOPLE PLEASER",
    color: "#00FFBF",
    attack: "They'll be upset. Just say yes.",
    chips: ["being disliked", "the conflict", "being alone if I say no"],
    win: "NAMED. No is a full sentence.",
  },
  {
    id: "cynic",
    name: "THE CYNIC",
    color: "#ff5b3d",
    attack: "None of this works. You've tried before.",
    chips: ["hoping again", "being disappointed", "looking naive"],
    win: "NAMED. Hope with receipts.",
  },
];

export function getCritic(id) {
  return WILD_CRITICS.find((c) => c.id === id) || null;
}
