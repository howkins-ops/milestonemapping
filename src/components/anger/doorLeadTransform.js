/* ════════════════════════════════════════════════════════════════════════
   THE LEAD TRANSFORM — where the flyer run becomes The Door's difficulty.

   You threw a door hanger at this house an hour ago. Where it landed is the
   only thing that changes about the fight you are walking into now.

       hooked the handle   he half expects you        the door goes down faster
       on the door         baseline                   plays exactly as it always did
       on the mat          he half noticed            slightly longer
       through the window  he opens swinging          longer, and it drains
       in the bushes       he never saw it            longest, and it drains
       never threw         baseline                   plays exactly as it always did

   ── ONE LAW: THIS IS A DATA TRANSFORM, NOT A DOORLEVEL CHANGE ────────────
   `DoorLevel.jsx` is 1969 lines of shipped, working game and it does not get
   rewritten for this. It takes `{ level, onClose, onComplete }`; we hand it a
   DIFFERENT `level` object and it never learns why. Pure function, new object,
   never mutates `DOOR_LEVELS` — a mutated level would compound every time the
   player replayed a house.

   ── AND ONE INVARIANT: `none` AND `warm` ARE THE IDENTITY ────────────────
   A player who skips the flyer run, or who simply lands one on the door, must
   get byte-identical gameplay to what shipped. That is what makes this safe
   to add to a live game.
   ════════════════════════════════════════════════════════════════════════ */

/* Three invariants DoorLevel dereferences UNCONDITIONALLY in its render body,
   in every phase including `brief` and `seal`. Break one and the whole level
   throws before it draws:
     · level.rounds must stay a non-empty array        (DoorLevel.jsx:210)
     · level.finale.bout must survive                  (DoorLevel.jsx:213)
     · round.taps must stay > 0 — `p = prog / taps` drives every mask hole,
       the interior bleed and the slab rotation via `--p`. Zero is NaN. */

export const LEAD_TABLE = Object.freeze({
  none: { taps: 1.0, hp: 1.0, drain: null, skin: 0, label: "", blurb: "" },
  warm: {
    taps: 1.0, hp: 1.0, drain: null, skin: 0,
    label: "ON THE DOOR",
    blurb: "He picked it up. He read the first line.",
  },
  hot: {
    taps: 0.70, hp: 0.70, drain: "strip-first", skin: 0,
    label: "HOOKED IT",
    blurb: "It's been swinging on his handle since eight. He half expects you.",
  },
  lukewarm: {
    taps: 1.10, hp: 1.0, drain: null, skin: 0,
    label: "ON THE MAT",
    blurb: "He stepped over it twice. He'd have to think to remember it.",
  },
  hostile: {
    taps: 1.35, hp: 1.50, drain: "force-all", skin: 1,
    label: "THROUGH THE WINDOW",
    blurb: "There's plywood where the glass was. He's been waiting for you.",
  },
  dead: {
    taps: 1.50, hp: 1.25, drain: "force-all", skin: 1,
    label: "IN THE BUSHES",
    blurb: "It's face-down in his hedge. As far as he knows you never came.",
  },
});

export const LEAD_KEYS = Object.keys(LEAD_TABLE);

/* Skin darkening is WHITELISTED, never a blind index shift. `DoorForSkin`
   branches on `steel` and `gate` to pick a different slab entirely, so
   shifting one of those would swap a steel door for a wooden one mid-level.
   `night` is already the darkest. */
const SKIN_DARKER = Object.freeze({ day: "dusk", dusk: "eve", eve: "night" });

/* The chainsaw's progress is +0.5 per 5px of finger travel, so `taps` scales
   the LENGTH OF THE CUT, not a number of presses. ×1.5 on a 20-tap round is a
   genuinely punishing drag, so it gets its own ceiling. */
const CHAINSAW_TAPS_CAP = 1.2;

const clampTaps = (n) => Math.max(1, Math.round(n));

/**
 * @param {object} level  a level from doorLevels.js — never mutated
 * @param {string} lead   "hot"|"warm"|"lukewarm"|"hostile"|"dead"|"none"
 * @returns {object}      a new level object safe to hand to <DoorLevel/>
 */
export function applyLead(level, lead = "none") {
  if (!level) return level;
  const t = LEAD_TABLE[lead] || LEAD_TABLE.none;

  /* Fast path AND correctness path: the identity leads return the original
     object by reference, so `none`/`warm` cannot possibly drift from shipped
     behaviour no matter what gets added below this line later. */
  if (t.taps === 1 && t.hp === 1 && !t.drain && !t.skin) return level;

  const rounds = level.rounds.map((r, i) => {
    const out = { ...r };

    /* `special: "gallery"` owns its own 90-second clock and ignores `taps`
       entirely — scaling that would do nothing at all. Scale the clock. */
    if (r.special === "gallery" && r.gallery) {
      out.gallery = { ...r.gallery, seconds: Math.max(30, Math.round((r.gallery.seconds || 90) / t.taps)) };
    } else {
      const mul = r.special === "chainsaw" ? Math.min(t.taps, CHAINSAW_TAPS_CAP) : t.taps;
      out.taps = clampTaps((r.taps || 1) * mul);
    }

    /* `special: "bout"` rounds carry `taps: 1` as a placeholder and are
       intercepted by `enterRound` before they ever render — but that 1 is
       still the denominator, so clampTaps above is load-bearing, not defensive. */

    if (t.drain === "force-all") out.drain = true;
    else if (t.drain === "strip-first" && i === 0) out.drain = false;

    if (t.skin > 0 && SKIN_DARKER[r.skin]) out.skin = SKIN_DARKER[r.skin];

    return out;
  });

  const finale = { ...level.finale };
  /* Steele's morning HP is ALREADY arithmetic — `max(floor, hp × objectionLeft
     × wallPct)` — computed from how much of the night gallery he survived.
     Layering a lead multiplier on top would double-scale the payoff of that
     entire phase, so the flyer run simply does not get a vote there. It has
     already had one, at the door, hours earlier. */
  if (t.hp !== 1 && finale.hpFrom !== "objection") finale.hpMul = t.hp;

  return {
    ...level,
    rounds,
    finale,
    /* Carried for the HUD and the approach card. DoorLevel ignores it. */
    lead,
    leadInfo: t,
  };
}

/** Copy for the approach card, so the player knows what they walked into. */
export function leadBadge(lead) {
  const t = LEAD_TABLE[lead];
  if (!t || !t.label) return null;
  return { key: lead, label: t.label, blurb: t.blurb };
}

export default applyLead;
