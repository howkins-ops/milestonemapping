/* ════════════════════════════════════════════════════════════════════════
   SUPER KNOCK — THE TWENTY. Data only.

   One homeowner per house, assigned by house index so the person at number
   112 is the same person all week and on every replay of that street. You
   are meant to learn this street the way you learn a real one: by who lives
   where and what they always say.

   Their ATTACKS are not authored here — those come from what is in their
   yard (see skStreet's PROPS and skObjections.attacksFor). A boat means EGO;
   a minivan means DEFERRAL. That is deliberate: if the objection set were
   authored per person, the yard would be scenery. This way the yard is the
   briefing, and it is readable from a moving segway.

   `look` feeds door/Boxer.jsx directly — same skin/cloth/trim/hair/build
   contract The Door's bosses use, so twenty homeowners cost twenty data rows
   and zero new drawing code.
   ════════════════════════════════════════════════════════════════════════ */

const L = (skin, cloth, trim, hair, build) => ({ skin, cloth, trim, hair, build });

export const HOMEOWNERS = [
  { name: "GUS DELANEY", sub: "Been here since it was fields", look: L("#C89B72", "#4A5A6B", "#2E3A46", "#B8B2A6", 1.1), temper: 1.15 },
  { name: "MARISOL VEGA", sub: "Answers with the door on the chain", look: L("#A9784F", "#7A3B52", "#4A2233", "#221C1A", 0.92), temper: 0.9 },
  { name: "DOUG PRYOR", sub: "Knows what everything costs", look: L("#D6B08A", "#5A6B3B", "#36421F", "#7A6A4A", 1.2), temper: 1.05 },
  { name: "ANITA BOWE", sub: "Kids in the hallway, phone in hand", look: L("#8E6244", "#3B5A7A", "#22364A", "#1C1614", 0.88), temper: 0.85 },
  { name: "RAY OKONKWO", sub: "Has a guy for everything", look: L("#6B4630", "#2E5A4A", "#173A2E", "#171312", 1.05), temper: 0.95 },
  { name: "PATTI HALE", sub: "Opens it wide, says no anyway", look: L("#E0C0A0", "#7A5A3B", "#4A3620", "#C4B48A", 0.9), temper: 0.8 },
  { name: "VIC SORRENTINO", sub: "Thirty years in the trade", look: L("#C08E62", "#4A4A52", "#2A2A30", "#5A5048", 1.25), temper: 1.2 },
  { name: "JUNE ABARA", sub: "Talks to you through the screen", look: L("#7A5138", "#6B3B5A", "#3E2036", "#141110", 0.86), temper: 0.9 },
  { name: "KEITH MULVANEY", sub: "Sign on the door, dog in the yard", look: L("#D8B48E", "#5A2E2E", "#361A1A", "#8A7A62", 1.18), temper: 1.35 },
  { name: "SHAY CORMIER", sub: "Working from the front room", look: L("#B8865E", "#3B4A6B", "#1F2A42", "#3A2C22", 0.95), temper: 0.88 },
  { name: "OMAR HADID", sub: "Boat on the drive, opinions to match", look: L("#9E6E48", "#4A5A3B", "#2A361F", "#1A1512", 1.12), temper: 1.1 },
  { name: "BRENDA LISK", sub: "Never decides anything alone", look: L("#E2C4A6", "#7A4A6B", "#4A2A42", "#B49A72", 0.87), temper: 0.82 },
  { name: "TOMMY EARL", sub: "Contractor van, contractor answers", look: L("#C4926A", "#6B5A2E", "#42361A", "#4A3E30", 1.22), temper: 1.15 },
  { name: "NADIA PRESCOTT", sub: "Solar on the roof, already sorted", look: L("#8A5E3E", "#2E6B5A", "#173E33", "#181312", 0.93), temper: 0.9 },
  { name: "WALT BUCHANAN", sub: "Reads the sign back to you", look: L("#DCC0A2", "#4A4238", "#2A251E", "#CFC7B8", 1.08), temper: 1.3 },
  { name: "PRIYA RAJAN", sub: "Two cars, two decision-makers", look: L("#A0704A", "#5A3B6B", "#361F42", "#151110", 0.9), temper: 0.85 },
  { name: "CLINT HOOPER", sub: "Built the extension himself", look: L("#CE9C70", "#3B5A5A", "#1F3636", "#6A5A46", 1.2), temper: 1.12 },
  { name: "DEE FONTAINE", sub: "Boxes in the hall, moving out", look: L("#7E5436", "#6B4A3B", "#42291F", "#12100F", 0.89), temper: 0.95 },
  { name: "STAN KOVAL", sub: "Floodlight came on before you knocked", look: L("#D2AC88", "#3B3B4A", "#20202A", "#7E7468", 1.16), temper: 1.28 },
  {
    name: "MRS. ADAIR",
    sub: "The house at the end of the street",
    look: L("#E6D2BC", "#2E2E3B", "#16161F", "#DAD4CC", 0.95),
    temper: 1.0,
    /* The only authored homeowner in the game, and only because Sunday needs
       somewhere to arrive. She is not harder — she is longer, and she has
       heard every one of your cards from a neighbour by then. */
    boss: true,
    hpMul: 1.6,
    intro: "I've been watching you work this street all week.",
    coach: "She already knows the pitch. Give her the one thing nobody else did.",
  },
];

export const homeownerFor = (idx) => HOMEOWNERS[((idx % HOMEOWNERS.length) + HOMEOWNERS.length) % HOMEOWNERS.length];

/** Composure palettes. Six values written as CSS custom properties on the
    fight wrapper — a PALETTE SWAP, never a `filter`.

    A scene-level `filter: saturate()` would sit on an ancestor of the boxer's
    infinite bob animation (`door-bout.css:26`), which re-rasterises the whole
    filtered subtree every single frame. The palette does more anyway: the sky
    greys, the trim dulls, and the porch light goes cold, so the player reads
    their own composure off the world instead of off a bar that would break
    the "never a UI bar" rule outright. */
export const COMPOSURE_PALETTE = {
  steady: { sky: "#2A3350", wall: "#6E7A6A", trim: "#E8E2D6", light: "#FFD98A", ink: "#FFFFFF", edge: "#00F0FF" },
  tight: { sky: "#2A2E42", wall: "#67705F", trim: "#D8D2C6", light: "#F0C878", ink: "#F2F2F4", edge: "#8FD8E0" },
  rattled: { sky: "#26262F", wall: "#5A5F55", trim: "#B8B4AA", light: "#C8A468", ink: "#D8D6DA", edge: "#7A8A90" },
  gone: { sky: "#1C1C22", wall: "#4A4C48", trim: "#8E8A84", light: "#8A7048", ink: "#A8A6AA", edge: "#5A5A62" },
};

export function composureTier(v) {
  if (v >= 70) return "steady";
  if (v >= 40) return "tight";
  if (v >= 18) return "rattled";
  return "gone";
}

export default HOMEOWNERS;
