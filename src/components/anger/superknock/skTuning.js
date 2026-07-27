/* ════════════════════════════════════════════════════════════════════════
   SUPER KNOCK — TUNING. One file, every dial. Nothing else may hardcode
   a threshold.

   ONE LAW ABOVE ALL: everything in here is authored in METRES and SECONDS.
   Not pixels. The moment a single threshold is written in px the game plays
   differently on a 320px SE than on a 430px Pro Max, and no amount of art
   fixes it. `pxPerM()` is the only bridge, and it is called exactly once
   per resize.

   ── THE ONE MECHANIC, STATED ONCE ────────────────────────────────────────
   The hanger's launch is FIXED: 12 m/s sideways, 1.05 m/s up, from a hand
   1.5 m off the ground, under a deliberately floaty 3.2 m/s² gravity
   (a die-cut card has an enormous drag-to-mass ratio — floaty is honest).

   Because the launch never changes, the arrival HEIGHT is a pure function
   of HOW FAR YOU ARE FROM THE HOUSE:

        z(T) = 1.5 + 1.05·T − 1.6·T²        T = distance / 12

        distance    arrival z     what you hit
        ─────────   ──────────    ─────────────────────────────────
        < 2.5 m     (placed)      you lean over and set it down
        2.5–9.7 m   1.30–1.67 m   WINDOW height
        10.6–13.2 m 0.73–1.18 m   THE HANDLE  ← only from the ROAD
        13.2–16.2 m 0.00–0.73 m   door face, sliding to the mat
        > 16.2 m    hits dirt     falls short

   So the LATERAL axis (slow, positional, legible) chooses WHAT you can hit,
   and the RELEASE TIMING (fast, twitchy) chooses WHETHER you hit it.

   And the consequence that makes the whole game work: **the handle can only
   be hooked from the middle of the road** — which is also the only lane with
   traffic in it. The best reward lives in the most dangerous place, and that
   falls straight out of one gravity constant rather than being bolted on.

   Riding the lawn to get closer makes you WORSE at the handle, not better.
   That is what closes the grass-camping exploit, and it costs nothing.
   ════════════════════════════════════════════════════════════════════════ */

/* ── THE STREET, LATERALLY ────────────────────────────────────────────────
   x runs 0 (left facades) → 24 (right facades). One screen width.

     0 ┃ left lawn 5m ┃ walk 2m ┃ ROAD 10m ┃ walk 2m ┃ right lawn 5m ┃ 24
       ^facade                    ^centre=12                    facade^   */
export const LANE_TOTAL_M = 24;
export const FACADE_L_X = 0;
export const FACADE_R_X = LANE_TOTAL_M;
export const ROAD_CENTER_X = LANE_TOTAL_M / 2;

/** Lateral bands, in metres from the left facade. Order matters: first match wins. */
export const BANDS = [
  { key: "lawn", from: 0.0, to: 5.0, mul: 0.70, side: "L" },
  { key: "walk", from: 5.0, to: 7.0, mul: 0.85, side: "L" },
  { key: "road", from: 7.0, to: 17.0, mul: 1.0, side: "-" },
  { key: "walk", from: 17.0, to: 19.0, mul: 0.85, side: "R" },
  { key: "lawn", from: 19.0, to: 24.0, mul: 0.70, side: "R" },
];

/** Surface speed multipliers. `dirt` is a patch inside a lawn, not a band. */
export const SURFACE = { street: 1.0, walk: 0.85, grass: 0.70, dirt: 0.75 };

/** Where the rider may physically go. He cannot ride through a wall. */
export const RIDE_X_MIN = 0.9;
export const RIDE_X_MAX = LANE_TOTAL_M - 0.9;

/* ── SCALE ────────────────────────────────────────────────────────────────
   The DRAWN span is wider than the rideable street, because the houses have
   to stand somewhere. x = −3.5 … 27.5 puts 3.5m of building depth outside
   each facade plane, which is what the oblique projection needs: a house's
   HEIGHT is drawn as horizontal distance back from its facade (see skDraw),
   and with the facade planes hard against the screen edge there would be
   nowhere to draw a house at all.

   No clamp. The full span always fits on every device, so nothing ever crops;
   a narrow phone simply sees a physically smaller world, which is how every
   2D game has handled this since 1985 and is far safer than cropping the
   two rows of facades the entire game is aimed at. */
export const DRAW_PAD_M = 3.5;
export const DRAW_SPAN_M = LANE_TOTAL_M + DRAW_PAD_M * 2;
export const pxPerM = (viewportW) => viewportW / DRAW_SPAN_M;
export const HOUSE_H_M = 2.9; // drawn height; becomes horizontal depth in the projection

/** Where the rider sits down the screen. 0.78 buys 4.2s of lead at cruise;
    0.72 only bought 3.9s, and recognition alone eats 0.8s of that. */
export const RIDER_SCREEN_Y = 0.78;

/* ── THE SEGWAY ───────────────────────────────────────────────────────────
   Straight from the bible. minSpeed 4.0 is the thesis: it NEVER stops. */
export const SEGWAY = {
  minSpeed: 4.0,
  cruise: 9.0,
  maxSpeed: 15.0,
  accel: 6.0,
  brake: 9.0,
  lateralSpeed: 7.0,
  lateralAccel: 22.0,
  leanMaxDeg: 22,
  leanOvershoot: 0.15,

  /* The rider is 0.7m wide — 11px, smaller than a fingernail. He is DRAWN at
     3.2× that. These two numbers are separate on purpose and must stay
     separate: the day drawn width feeds collision is the day every hitbox
     in the game is silently wrong. */
  drawScale: 3.2,
  collideHalfM: 0.4,

  /* Speed is clamped BEFORE the surface multiplier, never after. Applied the
     other way round, minSpeed 4.0 would float the grass penalty away at
     exactly the speed a grass-camper rides at, and ×0.70 would be decoration. */
  applyOrder: "clamp-then-multiply",
};

/* ── THE IDLE PUNISHMENT — the HOA golf cart ──────────────────────────────
   The bible says "below 20% of max". 20% of 15 is 3.0 m/s, and minSpeed is
   4.0 — on street, sidewalk and dirt the trigger could never once fire in
   the entire game. It would have been a "don't ride the grass" rule wearing
   a costume. 45% punishes actual dawdling, which is the thing it is for. */
export const CART = {
  triggerPct: 0.45, // of maxSpeed → 6.75 m/s
  triggerHoldS: 3.0,
  spawnBehindM: 10.0, // ON SCREEN. Off-screen it would appear 1.5s before contact.
  closingSpeed: 1.0, // → ~10s of visible dread instead of a jump-scare
  /* A cart that closes at "your speed + 1.5" is a timer, not a chase — you
     cannot escape it, so it is only a tax. This version cannot be outrun by
     crawling, but CAN be outrun by getting back above ~9. Counterplay. */
  speedOf: (playerSpeed) => Math.min(11.0, Math.max(playerSpeed, 6.0) + CART.closingSpeed),
  hitCash: -150,
  hitHeat: 1,
  recoverS: 1.5,
};

/* ── THE HANGER ───────────────────────────────────────────────────────────
   See the header. HANGER_G is the single most load-bearing number in the
   game: at real gravity the handle is a 33ms window on a 9px target, which
   on an Android WebView with 30–60ms of touch latency is a coin flip. */
export const HANGER = {
  G: 3.2,
  vLat: 12.0, // m/s sideways, constant
  vz0: 1.05, // m/s up, constant
  z0: 1.5, // hand height on a segway
  spinDegPerS: [540, 900], // offset hole ⇒ it helicopters, readable at speed
  ammo: 26, // for 40 targets. Every throw is a decision.
  cooldownS: 0.2,

  /* Closer than this and the throw becomes PLACED: you lean over and set it
     on the mat. Auto-LUKEWARM, 150pts, its own animation. Not a punishment —
     a legitimate low-risk play. It also makes point-blank window smashes
     impossible, which was a free 1000pts at ×3 payout. */
  minThrowM: 2.5,

  /* Replaces the bible's 6° auto-aim cone. At 15m of path length 6° displaces
     the arrival point by 1.58m — nearly 3× the width of the handle box. That
     is not an assist, it is an autohit, and degrees-at-range is a multiplier
     nobody can reason about. This is a flat metre snap in Y ONLY, applied
     ONLY to catch targets, and ONLY when the shot is already in the right Z
     band — so it can never turn a window-height throw into a handle hook.
     This is the single biggest feel lever in the game. */
  snapM: 0.3,
};

/** Arrival height for a throw of `d` metres. The whole mechanic, in one line. */
export function arrivalZ(d) {
  const T = d / HANGER.vLat;
  return HANGER.z0 + HANGER.vz0 * T - 0.5 * HANGER.G * T * T;
}
/** Flight time for a throw of `d` metres. */
export const flightTime = (d) => d / HANGER.vLat;
/** How far the hanger travels sideways before it hits the dirt. Beyond this it falls short. */
export const MAX_REACH_M = (() => {
  // 1.5 + 1.05T − 1.6T² = 0
  const a = 0.5 * HANGER.G, b = -HANGER.vz0, c = -HANGER.z0;
  const T = (-b + Math.sqrt(b * b - 4 * a * c)) / (2 * a);
  return T * HANGER.vLat;
})();

/* ── THE FACADE ───────────────────────────────────────────────────────────
   Target boxes in FACADE-LOCAL metres. y runs along the street frontage
   (0 = house's leading edge), z runs up from the ground.

   These are the authored truth. `skStreet.targetBoxes()` is the ONLY thing
   allowed to read them, and all three renderers read that. If the ride
   canvas and the SVG porch ever disagree about where the handle is, the
   game's best idea — "the hanger you threw IS the lead state" — is dead. */
export const FACADE = {
  frontageM: 11.0, // drawn width of one house along the street
  doorY: 5.2, // door's leading edge within the frontage
  boxes: {
    // z is set by distance, y by release timing. y is the tight axis.
    /* The hitbox is 0.55m; the DRAWN handle is a few centimetres. Art size
       and collision size are decoupled on purpose — the same call The Door's
       night gallery made with MIN_HIT, for the same reason: nobody hits a
       real door handle with a thumb, and inflating the art to match the box
       would look absurd. The box must stay strictly INSIDE the door rect,
       or the handle becomes hittable at a height the door isn't. */
    handle: { y: 5.72, w: 0.55, z: 0.725, h: 0.45, pts: 500, lead: "hot", catch: true },
    door: { y: 5.2, w: 1.1, z: 0.28, h: 1.77, pts: 250, lead: "warm" },
    mat: { y: 4.9, w: 1.6, z: 0.0, h: 0.28, pts: 150, lead: "lukewarm" },
    /* A single pane, and deliberately the TIGHTEST target in the game — it
       pays 2× the handle, so it cannot also be easier than the handle.

       `maxD` is the important number. Without it, window height was reachable
       from anywhere between 2.5m and 9.7m — seven metres of lane offering
       1000 points on a 100ms window, which made smashing glass the correct
       default play at every house rather than a decision. Capping the smash
       at 6m means the only lane that reaches a window is HIS LAWN: you have
       to ride onto the grass, which costs you speed (×0.70), leaves tyre
       ruts, raises his grudge, and puts you close enough that he sees you.

       The price of a window is paid in the lane, the fight and the week —
       never in the throw. But it IS paid. */
    window: { y: 2.4, w: 0.9, z: 1.3, h: 0.45, maxD: 6.0, pts: 1000, lead: "hostile", smash: true },
  },
};

/* ── THE MAILBOX, and the third lateral zone ──────────────────────────────
   The mailbox sits 6m in from the facade, so a hanger thrown at the door
   crosses its plane on the way past. That could have been a disaster — every
   door throw eaten by a mailbox — but the same distance→height rule that
   governs everything else resolves it for free, and turns it into the best
   structural idea in the game.

   The slot band is LOW (0.85–1.35m). At the mailbox plane:

     from the middle of the road   z ≈ 1.63  → SAILS OVER, on to the handle
     from the far side of the road z ≈ 1.12  → IN THE BOX
     from the far kerb, missed     z ≈ 0.06 at the facade → the mat

   So the lateral axis now has THREE non-overlapping zones and no new mechanic:

     playerX  2.5– 9.7 m from a facade → WINDOW height   (1000, HOSTILE)
     playerX 10.6–13.2 m              → THE HANDLE       (500, HOT)
     playerX 15.3–18.5 m              → THE MAILBOX      (75, no lead)

   Which lane you are in is the whole decision, twenty times a run, and
   crossing the road to line up a handle shot on the other side costs real
   time. That is the routing game the bible is built on, falling out of one
   gravity constant instead of being bolted on top. */
export const MAILBOX = {
  offsetX: 6.0, // metres in from the facade, i.e. at the kerb
  offsetY: 0.5, // near the house's LEADING edge, well clear of the door column
  /* The widest catch target in the game. It is the tutorial: it teaches the
     arc and the lead at 75 points a go, so the handle is never the first
     catch anyone attempts. It is only ever reachable from the far lane, and
     from the middle of the road the hanger sails clean over it — the height
     rule keeps them apart, so this width can be generous without ever
     stealing a handle shot. */
  w: 0.8,
  z: 0.85,
  h: 0.5, // the slot. Tall enough to be fair, low enough to be sailed over.
  pts: 75,
  lead: null, // scores, but never sets a lead state
};

/* ── OUTCOMES ─────────────────────────────────────────────────────────────
   `lead: null` means the door's state is UNTOUCHED and it can be thrown at
   again. A lead-by-two miss silently killing a house reads as a bug, so the
   two "you just wasted a hanger" cases are explicitly non-destructive. */
export const OUTCOMES = {
  hooked: { pts: 500, lead: "hot", label: "HOOKED IT" },
  door: { pts: 250, lead: "warm", label: "ON THE DOOR" },
  mat: { pts: 150, lead: "lukewarm", label: "ON THE MAT" },
  placed: { pts: 150, lead: "lukewarm", label: "PLACED IT" },
  nearmiss: { pts: 150, lead: "lukewarm", label: "OFF THE HANDLE" },
  window: { pts: 1000, lead: "hostile", label: "THROUGH THE WINDOW" },
  mailbox: { pts: 75, lead: null, label: "IN THE BOX" },
  lawn: { pts: 0, lead: "dead", label: "IN THE BUSHES" },
  hedge: { pts: 0, lead: null, label: "IN THE HEDGE" },
  dropped: { pts: 0, lead: null, label: "DROPPED IT" },
};

/* ── LEAD STATES → the fight, and the wait ────────────────────────────────
   Phase 1 accuracy IS phase 3 difficulty. This table is the entire link. */
export const LEAD = {
  hot: { hpMul: 0.7, dmgMul: 1.0, openS: 4, grace: true, payMul: 1.0, label: "HOT" },
  warm: { hpMul: 1.0, dmgMul: 1.0, openS: 8, grace: false, payMul: 1.0, label: "WARM" },
  lukewarm: { hpMul: 1.05, dmgMul: 1.0, openS: 12, grace: false, payMul: 1.0, label: "LUKEWARM" },
  hostile: { hpMul: 1.5, dmgMul: 2.0, openS: 2, grace: false, payMul: 3.0, label: "HOSTILE" },
  dead: { hpMul: 0, dmgMul: 0, openS: Infinity, grace: false, payMul: 0, label: "DEAD" },
  none: { hpMul: 0, dmgMul: 0, openS: Infinity, grace: false, payMul: 0, label: "NO HANGER" },
};

export const WAIT_S = 15; // how long you may stand there before it's your own fault

/* ── THE KNOCK ────────────────────────────────────────────────────────────
   The bible's Sunday numbers (1.8× rate, 11% width) give a 73ms window,
   which after touch latency is a coin flip at the end of a 7-minute clock.
   These land Sunday at 131ms — still brutal, still fair. */
export const KNOCK = {
  baseSweepS: 1.4,
  rateByDay: [1.0, 1.1, 1.2, 1.3, 1.45, 1.5, 1.6],
  widthByDay: [0.24, 0.225, 0.21, 0.195, 0.18, 0.165, 0.15],
  sweetCenter: 0.62, // where in the sweep the band sits
  /* The accepted band is offset EARLY by this much to eat touch latency.
     Without it every player is systematically late and blames themselves. */
  latencyOffsetS: 0.04,
  softRetry: true, // GUARANTEED, not "one retry" — see above
  softClockPenaltyS: 20,
  hardAggroMul: 1.2,
};

/** Sweep period and sweet-spot window (seconds) for a given day index 0..6. */
export function knockWindow(day) {
  const d = Math.max(0, Math.min(6, day | 0));
  const sweepS = KNOCK.baseSweepS / KNOCK.rateByDay[d];
  return { sweepS, widthPct: KNOCK.widthByDay[d], windowS: sweepS * KNOCK.widthByDay[d] };
}

/* ── THE APPROACH ─────────────────────────────────────────────────────────
   Stance is a drag, not a stick — one gesture, three stops. */
export const STANCE = {
  back: { openMul: 1.25, aggro: 0.85, label: "BACK, ANGLED" },
  square: { openMul: 1.0, aggro: 1.0, label: "SQUARE ON" },
  crowd: { openMul: 0.7, aggro: 1.3, label: "IN THEIR FACE" },
};
export const PEEK_COST_S = 3; // pay 3s of clock, learn one more objection family
export const LAWN_CUT_OPINION = -10;

/* ── THE DAY ──────────────────────────────────────────────────────────────
   The bible says 8 game-hours ≈ 20 real minutes. Seven of those is 2h20 of
   play for one week, which is not a phone game. A day here is ONE SITTING:
   a ~95s ride plus a 7-minute knock run ≈ 8 minutes, ≈1 hour for the week.

   The per-window dilation is kept, because it is load-bearing: a flat rate
   would make MIDDAY five real minutes of nobody answering the door, which is
   the single largest fun risk in the whole bible. Dilation keeps the lesson
   ("9-to-5 knocking fails") while GOLDEN gets the most real playtime. */
export const DAY_REAL_S = 420;
export const WINDOWS = [
  { key: "morning", label: "MORNING", fromH: 8, toH: 11, realS: 112, openMul: 1.0 },
  { key: "midday", label: "MIDDAY", fromH: 11, toH: 16, realS: 94, openMul: 0.55 },
  { key: "golden", label: "GOLDEN HOURS", fromH: 16, toH: 20, realS: 214, openMul: 1.25 },
];

/** Clock charge per door outcome, flat — never in real time. Charging a fight
    by its duration couples two systems and makes the reward feel like a fine. */
export const CLOCK_COST = { sale: 12, callback: 8, hostile: 6, dead: 4, walkaway: 4 };
export const TRAVEL_BASE_S = 6; // getting to any house at all
export const TRAVEL_PER_HOUSE_S = 2; // ...plus distance. Working a cluster is cheaper.
export const TRAVEL_MAX_S = 26;

/* ── THE WEEK ─────────────────────────────────────────────────────────────
   Missing quota costs A LIFE AND THE DAY — never the whole week. FIRED only
   happens at zero lives. A variance-heavy Sunday that deletes an hour of play
   is how a game gets uninstalled. */
export const QUOTA = [1, 2, 2, 3, 4, 3, 5];
export const LIVES_PER_DAY = 3;
export const SURPLUS_BANK_CAP = 2; // sales above quota carry forward, capped

export const DAYS = [
  { key: "mon", name: "MONDAY", tag: "Learn the street.", traffic: 0.6, knockDay: 0 },
  { key: "tue", name: "TUESDAY", tag: "The dog is loose.", traffic: 0.8, knockDay: 1, dog: true },
  { key: "wed", name: "WEDNESDAY", tag: "They put up signs.", traffic: 0.9, knockDay: 2, signs: true },
  { key: "thu", name: "THURSDAY", tag: "Rain. Everyone's inside.", traffic: 0.7, knockDay: 3, rain: true, speedMul: 0.85, openMul: 1.25 },
  { key: "fri", name: "FRIDAY", tag: "Everyone's home. So is he.", traffic: 1.0, knockDay: 4, rival: true, scoreMul: 2 },
  { key: "sat", name: "SATURDAY", tag: "Every grudge comes due.", traffic: 1.0, knockDay: 5, cops: true },
  { key: "sun", name: "SUNDAY", tag: "The house at the end opens.", traffic: 0.5, knockDay: 6, finalHouse: true },
];

/* ── GRUDGE ───────────────────────────────────────────────────────────────
   Per house, and it is what makes Wednesday read as YOUR Monday. */
export const GRUDGE = [
  { at: 0, key: "none", label: "", openMul: 1.0 },
  { at: 2, key: "watchful", label: "CURTAIN TWITCHES", openMul: 0.8 },
  { at: 5, key: "armed", label: "FLOODLIGHT", openMul: 0.55 },
  { at: 9, key: "hostile", label: "DOG OUT", openMul: 0.25 },
  { at: 14, key: "boss", label: "HE'S ON THE LAWN", openMul: 0.0 },
];
export const GRUDGE_GAIN = { window: 4, tracks: 1, flowers: 2, crowd: 1, nosolicit: 2 };

/* ── HEAT ─────────────────────────────────────────────────────────────────
   SUPER KNOCK keeps its OWN week-scoped heat and only ever READS The Door's.

   Sharing the write path looked elegant and is a trap: `door_heat_v1` rolls
   over on the real calendar day and caps at 8, so a player doing the whole
   week in one sitting gets no cooling at all — seven window smashes (the most
   REWARDED action in phase 1) would pin them at HUNTED and hard-lock phase 2
   by Wednesday. Meanwhile Sunday's five sales would refund 5 heat straight
   out of The Door's economy. Two independently-tuned meters, one number on
   screen, neither corrupting the other. */
export const HEAT = {
  max: 8,
  gain: { window: 1.0, noSolicitWindow: 3.0, flowers: 2.0, cartHit: 1.0, copSeen: 1.5 },
  coolPerCleanDay: 1.0,
  doorHeatWeight: 0.5, // Saturday = clamp(weekHeat + 0.5·doorHeat, 0, max)
  copPatrolAt: 3.0,
};

/* ── THE FIGHT ────────────────────────────────────────────────────────────
   Its OWN hp table. Importing BOSSES' 100hp would be a 40-second fight, and
   there are twenty of them in a week. 45 base lands at 25–30s. */
export const FIGHT = {
  baseHp: 45,
  hpFloor: 14,
  knockdownsToTko: 1,
  /* 220ms is the stock tell floor and it is FATAL here: the answer is a CARD
     you have to READ, not a direction you can flinch. BOSSES.steele already
     carries tellFloor 420 in production for exactly this reason — inherit
     the lesson rather than rediscovering it in play. */
  tellFloorMs: 440,
  tellBaseMs: 900,
  counterWindowMs: 480,
  deckSize: 3,
  closeStreak: 3, // clean counters in a row → THE CLOSE
  closeSlowMo: 0.35,
  closeMs: 500,
  eatItReduction: 0.45, // no card for this family? EAT IT. Costs you, never fatal.
  composureDrain: { hit: 9, wrongCard: 12, mash: 3, volume: 2 },
  composureTiers: [70, 40, 18], // → steady / tight / rattled / gone
};

/* ── THE THREE STREETS ────────────────────────────────────────────────────
   The replay ladder, exactly as the original. */
export const STREETS = [
  { n: 1, noSolicit: 6, mercy: true, aimGhost: true, traffic: 1.0, scoreMul: 1 },
  { n: 2, noSolicit: 10, mercy: false, aimGhost: true, traffic: 1.25, scoreMul: 2 },
  { n: 3, noSolicit: 14, mercy: false, aimGhost: false, traffic: 1.5, scoreMul: 3, copsFromMonday: true },
];

/* ── THE STREET, LONGITUDINALLY ───────────────────────────────────────────
   40m of frontage per house, ALTERNATING sides. Alternating is what turns
   the run into a rhythm: if both sides shared a y you would get two throws
   in one instant and then 4.4 seconds of nothing. With the mailboxes there
   is a target every ~2.2s at cruise, which is Paperboy's actual cadence. */
export const HOUSE_COUNT = 20;
export const HOUSE_SPACING_M = 40;
export const STREET_START_M = 60;
export const STREET_END_PAD_M = 70;
export const STREET_LENGTH_M = STREET_START_M + HOUSE_COUNT * HOUSE_SPACING_M + STREET_END_PAD_M;

/* ── CAMERA / PRESENTATION ────────────────────────────────────────────────
   Zooms are canvas scale factors, not FOVs. The dolly ends in a FLASH and a
   swap, never a cross-fade: an upscaled canvas facade dissolving into a
   vector porch reads as a resolution pop, because it literally is one. A
   dissolve invites the comparison; a wipe doesn't. */
export const CAM = {
  rideZoom: 1.0,
  blockZoom: 2.2,
  dollyZoom: 3.4,
  dollyMs: 450,
  flashMs: 90,
  porchSlideMs: 260,
  maxBlendMs: 400,
};

/* ── HAZARDS ──────────────────────────────────────────────────────────────
   Forty metres of frontage means a target every 4.4s at cruise. That gap is
   not dead time — it is where the LANE decision gets made, and it needs
   something in it or the run reads as empty. Everything here exists to make
   choosing a lane cost something.

   Note which lane each hazard lives in. The road is fastest and has traffic.
   The lawn is safest and is the only lane that reaches a window — and it is
   the only lane that leaves tyre ruts. Nothing here is decoration. */
export const HAZARDS = {
  /* Oncoming traffic, road only. The reason the handle lane is dangerous. */
  car: { everyM: [55, 130], speed: [7, 13], w: 1.9, l: 4.4, lanes: [8.2, 10.6, 13.4, 15.8] },
  parked: { everyM: [70, 190], w: 1.9, l: 4.4, atX: [7.9, 16.1] },
  /* Sidewalk clutter. Cheap to dodge, and the reason the sidewalk isn't free. */
  can: { everyM: [40, 95], w: 0.7, l: 0.7, atX: [5.9, 18.1] },
  walker: { everyM: [80, 200], w: 0.8, l: 0.8, speed: [0.7, 1.6], atX: [5.6, 18.4] },
  /* Dirt patches in the lawns. A ramp is pure upside — the reward for
     committing to the grass lane before you commit to a window. */
  ramp: { everyM: [110, 260], w: 2.6, l: 3.0, atX: [2.4, 21.6], airS: 0.95, boost: 2.4 },
  /* Hanger bundles. 26 hangers for 40 targets only works if the street
     refills you — and the bundles sit in the lanes you'd rather not be in. */
  bundle: { everyM: [95, 180], w: 1.2, l: 1.2, gives: 6, atX: [3.2, 6.4, 17.6, 20.8] },
};
export const CRASH = { invulnS: 1.6, recoverS: 0.9, speedAfter: 4.0 };
export const AIR = { throwOk: true, zBonus: 0.55 }; // a throw off a ramp arrives higher

/* ── PERF BUDGET ──────────────────────────────────────────────────────────
   DoorFX halves its own particle cap after 30 frames over 22ms, and it has
   no idea the world canvas exists. If skDraw goes over budget the juice
   silently strips itself and it looks like an art bug. */
export const PERF = { drawBudgetMs: 8, maxProps: 6 };

export default {
  LANE_TOTAL_M, BANDS, SURFACE, SEGWAY, CART, HANGER, FACADE, MAILBOX,
  OUTCOMES, LEAD, KNOCK, STANCE, WINDOWS, QUOTA, DAYS, GRUDGE, HEAT,
  FIGHT, STREETS, CAM, PERF,
};
