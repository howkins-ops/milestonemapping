/* ════════════════════════════════════════════════════════════════════════
   THE ROUTE — THE FLYER RUN, DRAWN. Canvas-2d, Paperboy's oblique view.

   ── THE PROJECTION ───────────────────────────────────────────────────────
   Three world axes, two screen axes, and one shear:

       sx = PAD + x·s + (y − camY)·fy·K
       sy = BASE     − (y − camY)·fy      − z·s

   Check each axis, because getting this backwards is easy and silent:

     ALONG THE STREET  (x fixed, y up)  → (+fy·K, −fy)   up and to the RIGHT
        so kerbs, lane edges, the centre line and the row of facades all run
        DIAGONALLY, bottom-left to top-right. That diagonal IS the look.
     ACROSS THE STREET (y fixed, x up)  → (+s, 0)        flat
        so lot boundaries, driveways and porch steps run horizontally.
     HEIGHT            (z up)           → (0, −s)        straight up
        so houses STAND, with a front wall you can throw at and a roof.

   My first attempt put K on `sy` instead of `sx`. That shears the wrong axis:
   a lane edge is constant-x, so its screen x never changes and it draws as a
   VERTICAL line — the exact opposite of Paperboy.

   ── THE SHEAR BUDGET, WHICH DECIDES EVERYTHING ───────────────────────────
   Horizontal drift across the visible street is K·H — independent of fy. So

       W ≥ Lm·s + K·H

   is a hard constraint, and it is why the arcade's classic K = 0.5 cannot be
   used in portrait. At 390×620 a K of 0.5 spends 310px of the 390 on lean and
   leaves 80px for twenty-six metres of world — a doll's house.

       K = 0.50 → 310px lean →  80px world → impossible
       K = 0.30 → 186px lean → 204px world →  7.8 px/m
       K = 0.20 → 124px lean → 266px world → 10.2 px/m   ← ships

   124px of drift across 620px of street is a third of the screen width. It
   reads unmistakably diagonal, and it costs nothing: 10.2 px/m still puts
   ~47m of street ahead of the rider, which is 5.3 SECONDS of lead at cruise.

   `s` is SOLVED from that inequality on every resize. Dividing the width by a
   constant would silently break the lean on a narrow phone.

   ── AND THE THING THAT ACTUALLY BREAKS ───────────────────────────────────
   Draw order. While houses were flat bands, painting by category was fine.
   The moment they stand up, a house thirty metres ahead paints over a car
   five metres ahead. Everything now goes into y-buckets, painted far to near.
   World x does NOT participate — in this projection x is a screen axis, not a
   depth axis.

   A pleasant consequence: a hanger short of a facade now correctly disappears
   behind that house's roof, and one past it lands in front. Free, from the sort.

   PERF LAW: 8ms/frame (PERF.drawBudgetMs). DoorFX rides a second stacked
   canvas and halves its own particle cap after 30 slow frames — it cannot see
   this canvas, so going over budget silently strips the juice and reads as an
   art bug. The buckets are allocated once and reused.
   ════════════════════════════════════════════════════════════════════════ */
import {
  BANDS, LANE_TOTAL_M, DRAW_PAD_M, FACADE_L_X, FACADE_R_X,
  RIDER_SCREEN_Y, FACADE, MAILBOX, HAZARDS,
  SHEAR_K, HOUSE_WALL_M, HOUSE_RIDGE_M, HOUSE_DEPTH_M,
} from "./skTuning.js";
import { targetBoxes, mailboxBox, PROPS } from "./skStreet.js";

/* ── palette ──────────────────────────────────────────────────────────────
   Bright, flat, saturated — the arcade register. Paperboy has no gradients
   on the ground and neither does this. */
const P = {
  road: "#9C9CA4",
  line: "#F2DE5E",
  walk: "#D6D0BE",
  walkLine: "#BAB4A2",
  lawn: "#4CAE3E",
  lawnAlt: "#43A036",
  lawnSpeck: "#58BC48",
  dirt: "#A8783E",
  rut: "#7A5A34",
  kerb: "#E4DFCE",
  shade: "rgba(0,0,0,0.2)",
  roofA: "#C0392B",
  hangerA: "#FFD65A",
  ghostOk: "rgba(0,255,140,0.9)",
  ghostBad: "rgba(255,64,64,0.9)",
  rider: "#F2C230",   // the branded polo — high-contrast so you never lose him
  riderTop: "#D8443C",
  riderSkin: "#E8B98E",
  cart: "#E8D24A",
  car: ["#D8443C", "#3E6BD8", "#E8E8EC", "#E8A62E", "#3EA85E", "#B44ACC"],
};

const SKY = {
  morning: ["#5FA8DC", "#BFE0EE"],
  dusk: ["#3E4E86", "#E8935A"],
  night: ["#101833", "#2A2450"],
};

/* ── the view ─────────────────────────────────────────────────────────────*/

/** Total lateral metres that must fit on screen, including building depth. */
export const LM_DRAWN = LANE_TOTAL_M + DRAW_PAD_M * 2;

export function makeView({ w, h, camY, zoom = 1, dpr = 1 }) {
  /* Every projector reads `v.camY`, `v.s` and `v.fy` OFF THE OBJECT, never
     off the destructured parameters. The scene mutates `view.camY` every
     frame; a closure over the parameter would keep projecting against the
     camera position at the moment the view was built, and the rider would
     ride while the street stood still. */
  const v = { w, h, camY, zoom, dpr, s: 0, fy: 0, K: SHEAR_K };

  v.setZoom = (z) => {
    v.zoom = z;
    /* SOLVED, not divided: W ≥ Lm·s + K·H. Floored so a very short viewport
       cannot produce a negative or absurd scale. */
    v.s = Math.max(4, (w - v.K * h) / LM_DRAWN) * z;
    /* The receding axis may foreshorten. At 1.0 a square lot reads square. */
    v.fy = v.s * 1.0;
  };
  v.setZoom(zoom);
  v.base = h * RIDER_SCREEN_Y;

  /** THE projector. Everything goes through it. */
  v.P = (x, y, z) => {
    const dy = y - v.camY;
    return {
      x: (x + DRAW_PAD_M) * v.s + dy * v.fy * v.K,
      y: v.base - dy * v.fy - (z || 0) * v.s,
    };
  };
  /* Ground-plane convenience, used constantly. */
  v.g = (x, y) => v.P(x, y, 0);
  v.m = (n) => n * v.s;

  /** The y range that can possibly be on screen, padded for the shear and for
      houses tall enough to poke down from above. */
  v.yTop = () => v.camY + (v.base + HOUSE_RIDGE_M * v.s + 60) / v.fy;
  v.yBot = () => v.camY - (h - v.base + 40) / v.fy;
  return v;
}

/* ── THE FACADE TILT, and why it has to exist ─────────────────────────────
   A wall perpendicular to the street is nearly EDGE-ON in this projection.
   Its two edge directions are

       along the frontage  (fy·K, −fy)      ≈ (2.6, −12.8)
       up the wall         (0,    −s )      ≈ (0,   −12.8)

   which are only 11° apart, so the face renders at 20% of its true area. In
   numbers that matters: the door came out 2.3 PIXELS WIDE and the handle box
   1.1px. The 500-point target — the whole reason to ride the middle of the
   road — was invisible on the street.

   So the DRAWN facade is rotated toward the viewer. The collision plane does
   not move: `skThrow` still resolves against x = 0 or x = 24, and every one
   of the 567 assertions is untouched. Only the presentation fans out, which
   is exactly what the Paperboy houses do — their fronts are angled toward
   you, never edge-on.

   0.55 puts the far end of an 11m frontage six metres out, matching the
   house depth, and opens the face to ~37°: the door becomes ~11px wide and
   the handle ~5px with its dark ring. Both sides tilt the same way so the
   shear adds rather than cancels on one side and not the other.

   This is the same call The Door's night gallery made with MIN_HIT: art size
   and collision size are allowed to disagree, and the collision is the truth. */
export const FACADE_TILT = 0.55;

/** A facade-local (alongY, z) → world (x, y, z), tilted for drawing only. */
function facePt(v, house, y, z) {
  const xf = house.side === "L" ? FACADE_L_X : FACADE_R_X;
  const local = y - house.y;
  return v.P(xf + local * FACADE_TILT, y, z);
}

/* ── primitives ───────────────────────────────────────────────────────────*/

function quad(ctx, a, b, c, d, fill, stroke) {
  ctx.beginPath();
  ctx.moveTo(a.x, a.y);
  ctx.lineTo(b.x, b.y);
  ctx.lineTo(c.x, c.y);
  ctx.lineTo(d.x, d.y);
  ctx.closePath();
  if (fill) { ctx.fillStyle = fill; ctx.fill(); }
  if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = 1.2; ctx.stroke(); }
}

function tri(ctx, a, b, c, fill) {
  ctx.beginPath();
  ctx.moveTo(a.x, a.y);
  ctx.lineTo(b.x, b.y);
  ctx.lineTo(c.x, c.y);
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
}

/** A flat ground strip between two lateral positions, over a y range. */
function strip(ctx, v, x0, x1, y0, y1, fill) {
  quad(ctx, v.g(x0, y0), v.g(x1, y0), v.g(x1, y1), v.g(x0, y1), fill);
}

/* ── ground ───────────────────────────────────────────────────────────────*/

function drawGround(ctx, v, tint) {
  const g = ctx.createLinearGradient(0, 0, 0, v.h);
  g.addColorStop(0, tint[0]);
  g.addColorStop(1, tint[1]);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, v.w, v.h);

  const y0 = v.yBot(), y1 = v.yTop();

  for (const b of BANDS) {
    strip(ctx, v, b.from, b.to, y0, y1,
      b.key === "road" ? P.road : b.key === "walk" ? P.walk : P.lawn);
  }

  /* Mown stripes. Cheap, and the clearest possible cue that a lawn is
     somebody's property rather than green tarmac. They run ACROSS the lot, so
     they are flat strips — which also makes the street's diagonal obvious. */
  const step = 3.0;
  const first = Math.floor(y0 / (step * 2)) * step * 2;
  for (let y = first; y < y1; y += step * 2) {
    strip(ctx, v, 0, 5, y, y + step, P.lawnAlt);
    strip(ctx, v, 19, 24, y, y + step, P.lawnAlt);
  }

  /* SPECKLE. The reference's grass is dithered, not a flat fill, and at this
     scale two dozen dots per lawn is the difference between "turf" and
     "green paint". Positions come off a fixed lattice so they scroll WITH the
     world instead of crawling — a speckle that shimmers is worse than none. */
  ctx.fillStyle = P.lawnSpeck;
  const sp = 1.7;
  const sy0 = Math.floor(y0 / sp) * sp;
  for (let y = sy0; y < y1; y += sp) {
    for (let i = 0; i < 6; i++) {
      const h = ((y * 7.3 + i * 131.7) % 1);
      const lx = 0.4 + h * 4.2;
      const jy = y + ((y * 3.1 + i * 17.3) % 1) * sp;
      const a = v.g(lx, jy), b = v.g(lx + 21 - lx * 2 + 2.6, jy);
      ctx.fillRect(a.x, a.y, Math.max(1.5, v.m(0.22)), Math.max(1.5, v.m(0.16)));
      ctx.fillRect(b.x, b.y, Math.max(1.5, v.m(0.22)), Math.max(1.5, v.m(0.16)));
    }
  }

  strip(ctx, v, 6.8, 7.0, y0, y1, P.kerb);
  strip(ctx, v, 17.0, 17.2, y0, y1, P.kerb);
  strip(ctx, v, 4.9, 5.0, y0, y1, P.walkLine);
  strip(ctx, v, 19.0, 19.1, y0, y1, P.walkLine);

  /* The dashed centre line is what sells the perspective. */
  const dash = 4.0, gap = 4.0;
  const cx = LANE_TOTAL_M / 2;
  const start = Math.floor(y0 / (dash + gap)) * (dash + gap);
  for (let y = start; y < y1; y += dash + gap) strip(ctx, v, cx - 0.16, cx + 0.16, y, y + dash, P.line);
}

function drawRuts(ctx, v, ruts) {
  if (!ruts || !ruts.length) return;
  ctx.globalAlpha = 0.42;
  for (const r of ruts) {
    const x = r.x != null ? r.x : (r.side === "L" ? 2.4 : 21.6);
    strip(ctx, v, x - 0.45, x - 0.2, r.y0, r.y1, P.rut);
    strip(ctx, v, x + 0.2, x + 0.45, r.y0, r.y1, P.rut);
  }
  ctx.globalAlpha = 1;
}

/* ── the house, as four primitives ────────────────────────────────────────
     ROOF        the slope from the front wall up to the ridge. A
                 parallelogram, and the shape that says "Paperboy".
     GABLE END   the near side wall, plus the triangle under the ridge.
                 x is flat and z is vertical, so it is a rectangle — and it
                 is what gives the house volume for one extra fill.
     FRONT FACE  the plane at x = facade. A parallelogram leaning up-right,
                 because its along-street edges carry the shear. Every target
                 box lives on it. This is what you throw at.                */
function drawHouse(ctx, v, house, state) {
  const f = house.facade;
  const left = house.side === "L";
  const xf = left ? FACADE_L_X : FACADE_R_X;
  const xb = left ? xf - HOUSE_DEPTH_M : xf + HOUSE_DEPTH_M; // back wall, away from the road
  const xr = (xf + xb) / 2;                                   // the ridge
  const y0 = house.y, y1 = house.y + f.frontageM;
  const st = state || {};

  const roof = shade(f.roofColor || P.roofA, f.roofHue);
  const roofDark = darken(roof, 0.3);
  const wall = f.siding;
  const trim = f.trim;
  const EAVE = 0.55; // the overhang, and the thing that stops a house reading as a box

  /* ROOF first — furthest from the road, so the wall in front of it paints
     over it rather than the other way round. Both slopes overhang the gable
     ends; a roof flush with its walls reads as a carton. */
  quad(ctx,
    v.P(xb, y0 - EAVE, HOUSE_WALL_M), v.P(xb, y1 + EAVE, HOUSE_WALL_M),
    v.P(xr, y1 + EAVE, HOUSE_RIDGE_M), v.P(xr, y0 - EAVE, HOUSE_RIDGE_M),
    roofDark);

  const eaveX = left ? xf + EAVE : xf - EAVE; // the near slope hangs past the wall
  quad(ctx,
    v.P(eaveX, y0 - EAVE, HOUSE_WALL_M - 0.35), v.P(eaveX, y1 + EAVE, HOUSE_WALL_M - 0.35),
    v.P(xr, y1 + EAVE, HOUSE_RIDGE_M), v.P(xr, y0 - EAVE, HOUSE_RIDGE_M),
    roof);

  /* SHINGLE COURSES — four bands up the near slope. This is most of what
     makes the reference read as a ROOF and not a coloured triangle. */
  ctx.strokeStyle = "rgba(0,0,0,0.16)";
  ctx.lineWidth = 1;
  for (let i = 1; i < 5; i++) {
    const t = i / 5;
    const cx0 = eaveX + (xr - eaveX) * t;
    const cz = (HOUSE_WALL_M - 0.35) + (HOUSE_RIDGE_M - HOUSE_WALL_M + 0.35) * t;
    const a = v.P(cx0, y0 - EAVE, cz), b = v.P(cx0, y1 + EAVE, cz);
    ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
  }
  /* the ridge cap */
  ctx.strokeStyle = darken(roof, 0.45);
  ctx.lineWidth = Math.max(1.5, v.m(0.14));
  {
    const a = v.P(xr, y0 - EAVE, HOUSE_RIDGE_M), b = v.P(xr, y1 + EAVE, HOUSE_RIDGE_M);
    ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
  }

  /* CHIMNEY */
  {
    const cy = y1 - 2.2, cw = 0.8, ch = HOUSE_RIDGE_M + 0.9;
    const cxm = xr + (left ? -1.2 : 1.2);
    quad(ctx, v.P(cxm - 0.4, cy, 0), v.P(cxm + 0.4, cy, 0),
      v.P(cxm + 0.4, cy, ch), v.P(cxm - 0.4, cy, ch), darken("#9E5B44", 0.1));
    quad(ctx, v.P(cxm - 0.4, cy, ch - 0.25), v.P(cxm + 0.4, cy, ch - 0.25),
      v.P(cxm + 0.4, cy + cw, ch - 0.25), v.P(cxm - 0.4, cy + cw, ch - 0.25), "#7E4634");
    void cw;
  }

  /* GABLE END — the near side wall and its triangle. */
  quad(ctx,
    v.P(xf, y0, 0), v.P(xb, y0, 0), v.P(xb, y0, HOUSE_WALL_M), v.P(xf, y0, HOUSE_WALL_M),
    darken(wall, 0.26));
  tri(ctx, v.P(xf, y0, HOUSE_WALL_M), v.P(xb, y0, HOUSE_WALL_M), v.P(xr, y0, HOUSE_RIDGE_M), darken(wall, 0.4));

  /* FRONT FACE — tilted toward the viewer so it is not edge-on. See
     FACADE_TILT: the collision plane has not moved, only the drawing. */
  const F = (y, z) => facePt(v, house, y, z);
  quad(ctx, F(y0, 0), F(y1, 0), F(y1, HOUSE_WALL_M), F(y0, HOUSE_WALL_M), wall);

  /* SIDING COURSES. Horizontal in world terms, so they run along the
     frontage — the cheapest possible "this is clapboard, not a slab". */
  ctx.strokeStyle = "rgba(0,0,0,0.1)";
  ctx.lineWidth = 1;
  for (let z = 0.4; z < HOUSE_WALL_M; z += 0.42) {
    const a = F(y0, z), b = F(y1, z);
    ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
  }
  /* the trim board under the eave */
  quad(ctx, F(y0, HOUSE_WALL_M - 0.28), F(y1, HOUSE_WALL_M - 0.28),
    F(y1, HOUSE_WALL_M), F(y0, HOUSE_WALL_M), trim);

  /* PICTURE WINDOWS either side of the door column — pure decoration, not
     targets, and that is deliberate: the ONE breakable pane is the one
     `targetBoxes` knows about, so the player can never be confused about
     which glass counts. */
  const deco = (cy0, cy1, cz0, cz1) => {
    quad(ctx, F(cy0 - 0.1, cz0 - 0.1), F(cy1 + 0.1, cz0 - 0.1),
      F(cy1 + 0.1, cz1 + 0.1), F(cy0 - 0.1, cz1 + 0.1), trim);
    quad(ctx, F(cy0, cz0), F(cy1, cz0), F(cy1, cz1), F(cy0, cz1), "#8FC4DC");
    const my = (cy0 + cy1) / 2, mz = (cz0 + cz1) / 2;
    quad(ctx, F(my - 0.045, cz0), F(my + 0.045, cz0), F(my + 0.045, cz1), F(my - 0.045, cz1), trim);
    quad(ctx, F(cy0, mz - 0.045), F(cy1, mz - 0.045), F(cy1, mz + 0.045), F(cy0, mz + 0.045), trim);
  };
  deco(y0 + 8.0, y0 + 9.3, 1.35, 2.45);
  if (f.frontageM > 10) deco(y0 + 0.7, y0 + 1.9, 1.35, 2.45);

  /* ── the targets, straight from targetBoxes() — the SAME function the
     collision runs on, so the thing you aim at is the thing you hit. ───── */
  const boxes = targetBoxes(house);
  const byKey = (k) => boxes.find((b) => b.key === k);
  const box = (b, fill, stroke) => quad(ctx,
    F(b.y0, b.z0), F(b.y1, b.z0), F(b.y1, b.z1), F(b.y0, b.z1), fill, stroke);

  /* PAINT ORDER IS NOT COLLISION ORDER. targetBoxes returns [handle, window,
     door, mat] because the handle sits INSIDE the door and has to be
     hit-tested first or it could never be hit at all. Painting in that order
     drew the handle and then covered it with the door, which made the
     500-point target — the whole reason to ride the middle of the road —
     invisible on the street. Back to front, handle last. */
  const mat = byKey("mat"), door = byKey("door"), win = byKey("window"), handle = byKey("handle");

  if (mat) {
    /* A porch step slab under the mat, so the door stands on something. */
    quad(ctx, F(mat.y0 - 0.5, 0), F(mat.y1 + 0.5, 0),
      F(mat.y1 + 0.5, 0.16), F(mat.y0 - 0.5, 0.16), "#C8C2B2");
    box(mat, "#7E4A38");
  }

  if (door) {
    /* frame */
    quad(ctx, F(door.y0 - 0.14, door.z0), F(door.y1 + 0.14, door.z0),
      F(door.y1 + 0.14, door.z1 + 0.14), F(door.y0 - 0.14, door.z1 + 0.14), trim);
    box(door, st.plywood ? "#A07C4A" : f.doorColor);
    const dw = door.y1 - door.y0, dh = door.z1 - door.z0;
    const py0 = door.y0 + dw * 0.2, py1 = door.y1 - dw * 0.2;
    const panel = (a, b) => quad(ctx, F(py0, a), F(py1, a), F(py1, b), F(py0, b),
      lighten(f.doorColor, 0.14), "rgba(0,0,0,0.32)");
    if (!st.plywood) {
      panel(door.z1 - dh * 0.46, door.z1 - dh * 0.1);
      panel(door.z0 + dh * 0.08, door.z0 + dh * 0.4);
    }
    /* PORCH AWNING — a little roof on two posts. It is the single detail
       that stops the front reading as a painted flat and makes the door look
       like somewhere a person actually stands. */
    const aw0 = door.y0 - 0.7, aw1 = door.y1 + 0.7, az = door.z1 + 0.5;
    const out = left ? 1.5 : -1.5;
    quad(ctx, F(aw0, az), F(aw1, az),
      v.P(xf + out, aw1, az - 0.25), v.P(xf + out, aw0, az - 0.25), darken(roof, 0.05));
    ctx.strokeStyle = trim;
    ctx.lineWidth = Math.max(1.4, v.m(0.1));
    for (const py of [aw0 + 0.15, aw1 - 0.15]) {
      const a = v.P(xf + out, py, 0), b = v.P(xf + out, py, az - 0.25);
      ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
    }
  }

  if (win) {
    if (st.plywood) {
      box(win, "#A07C4A");
      /* two boards nailed across, so a boarded window reads from the street */
      const my = (win.y0 + win.y1) / 2;
      quad(ctx, F(win.y0 - 0.2, my - 0.1), F(win.y1 + 0.2, my - 0.1),
        F(win.y1 + 0.2, my + 0.12), F(win.y0 - 0.2, my + 0.12), "#7E5C32");
    } else {
      quad(ctx, F(win.y0 - 0.12, win.z0 - 0.12), F(win.y1 + 0.12, win.z0 - 0.12),
        F(win.y1 + 0.12, win.z1 + 0.12), F(win.y0 + -0.12, win.z1 + 0.12), trim);
      box(win, "#A8D8EC");
      /* a diagonal glint — the arcade shorthand for "this is glass" */
      tri(ctx, F(win.y0, win.z1), F(win.y1, win.z1), F(win.y0, win.z0 + (win.z1 - win.z0) * 0.35),
        "rgba(255,255,255,0.42)");
      const my = (win.y0 + win.y1) / 2, mz = (win.z0 + win.z1) / 2;
      quad(ctx, F(my - 0.05, win.z0), F(my + 0.05, win.z0), F(my + 0.05, win.z1), F(my - 0.05, win.z1), trim);
      quad(ctx, F(win.y0, mz - 0.05), F(win.y1, mz - 0.05), F(win.y1, mz + 0.05), F(win.y0, mz + 0.05), trim);
    }
  }
  if (handle) {
    /* The BOX is 0.55m so a thumb can earn it; the drawn knob is a few
       centimetres, ringed dark so it reads against any of the six door
       colours. A brass dot on a mustard door is a smudge, not a target. */
    const c = F((handle.y0 + handle.y1) / 2, (handle.z0 + handle.z1) / 2);
    const r = Math.max(2.2, v.m(0.14));
    ctx.fillStyle = "rgba(0,0,0,0.5)";
    ctx.beginPath(); ctx.arc(c.x, c.y, r * 1.8, 0, 6.2832); ctx.fill();
    ctx.fillStyle = "#FFE9A8";
    ctx.beginPath(); ctx.arc(c.x, c.y, r, 0, 6.2832); ctx.fill();
  }

  if (st.lead) drawHangerOnDoor(ctx, v, house, st.lead, xf);

  if (house.noSolicit || st.noSolicit) {
    const c = v.P(left ? 1.4 : LANE_TOTAL_M - 1.4, house.y + 9.0, 0.9);
    ctx.fillStyle = "#F0EADA";
    ctx.fillRect(c.x - v.m(0.28), c.y - v.m(0.34), v.m(0.56), v.m(0.5));
    ctx.fillStyle = "#C4342C";
    ctx.fillRect(c.x - v.m(0.2), c.y - v.m(0.22), v.m(0.4), v.m(0.12));
  }
  if (st.sold) {
    const c = v.P(left ? 3.2 : LANE_TOTAL_M - 3.2, house.y + 2.2, 0.8);
    ctx.fillStyle = "#18B85E";
    ctx.fillRect(c.x - v.m(0.6), c.y - v.m(0.4), v.m(1.2), v.m(0.7));
  }
}

function drawHangerOnDoor(ctx, v, house, lead, xf) {
  const boxes = targetBoxes(house);
  let y, z, tilt = 0, onWall = true;
  if (lead === "hot") { const b = boxes.find((k) => k.key === "handle"); y = (b.y0 + b.y1) / 2; z = b.z0 - 0.02; }
  else if (lead === "hostile") { const b = boxes.find((k) => k.key === "window"); y = (b.y0 + b.y1) / 2; z = (b.z0 + b.z1) / 2; tilt = 0.3; }
  else if (lead === "dead") { y = house.y + 2.4; z = 0.06; tilt = 1.2; onWall = false; }
  else { const b = boxes.find((k) => k.key === "mat"); y = (b.y0 + b.y1) / 2; z = 0.05; tilt = 0.12; }

  /* On the wall it must ride the SAME tilt the wall is drawn with, or it
     floats off the door. In the bushes it is on the ground, untilted. */
  const c = onWall
    ? facePt(v, house, y, z)
    : v.P(xf + (house.side === "L" ? 2.2 : -2.2), y, z);
  const w = Math.max(3, v.m(0.32)), hh = Math.max(5, v.m(0.6));
  ctx.save();
  ctx.translate(c.x, c.y);
  ctx.rotate(tilt);
  /* Reads by SILHOUETTE AND COLOUR ALONE at 20px — the hedge against the
     canvas street and the porch art ever drifting apart. */
  ctx.fillStyle = lead === "dead" ? "#6A6248" : lead === "hostile" ? "#FF6B4A" : P.hangerA;
  ctx.fillRect(-w / 2, -hh, w, hh);
  if (lead !== "dead") {
    ctx.fillStyle = "rgba(0,0,0,0.45)";
    ctx.beginPath(); ctx.arc(0, -hh + w * 0.5, Math.max(1, w * 0.2), 0, 6.2832); ctx.fill();
  }
  ctx.restore();
}

function drawMailbox(ctx, v, house) {
  const mb = mailboxBox(house);
  const my = (mb.y0 + mb.y1) / 2;
  const post = v.P(mb.facadeX, my, 0);
  const top = v.P(mb.facadeX, my, MAILBOX.z);
  ctx.strokeStyle = "#6A5A44";
  ctx.lineWidth = Math.max(1.6, v.m(0.1));
  ctx.beginPath(); ctx.moveTo(post.x, post.y); ctx.lineTo(top.x, top.y); ctx.stroke();
  quad(ctx,
    v.P(mb.facadeX, mb.y0, mb.z0), v.P(mb.facadeX, mb.y1, mb.z0),
    v.P(mb.facadeX, mb.y1, mb.z1), v.P(mb.facadeX, mb.y0, mb.z1),
    "#5E6A78", "rgba(0,0,0,0.35)");
}

/** A boxy world-space object: shaded footprint, near face, lit top. Enough to
    make a van read as a van at 12 px/m without becoming a modelling problem. */
function boxProp(ctx, v, x, y, w, len, h, col) {
  quad(ctx, v.g(x - w / 2, y), v.g(x + w / 2, y), v.g(x + w / 2, y + len), v.g(x - w / 2, y + len), P.shade);
  quad(ctx, v.P(x - w / 2, y, h), v.P(x + w / 2, y, h),
    v.P(x + w / 2, y + len, h), v.P(x - w / 2, y + len, h), col);
  quad(ctx, v.P(x - w / 2, y, 0), v.P(x + w / 2, y, 0),
    v.P(x + w / 2, y, h), v.P(x - w / 2, y, h), darken(col, 0.28));
}

function drawYardProps(ctx, v, house) {
  const left = house.side === "L";

  /* THE WALKWAY — kerb to porch. The reference has one at every house and it
     is what makes a lawn read as a front yard rather than a green field. */
  const wy = house.y + FACADE.doorY - 0.4;
  const wx0 = left ? 0.6 : LANE_TOTAL_M - 4.6;
  strip(ctx, v, wx0, wx0 + 4.0, wy, wy + 1.5, "#CFC9B8");

  /* A PICKET FENCE along the lot line, in two-metre runs. */
  ctx.strokeStyle = "#EDE7D6";
  ctx.lineWidth = Math.max(1.2, v.m(0.09));
  const fx = left ? 4.6 : LANE_TOTAL_M - 4.6;
  for (let py = house.y + 0.4; py < house.y + FACADE.frontageM; py += 0.5) {
    if (Math.abs(py - wy) < 1.6) continue; // the gate, where the path crosses
    const a = v.g(fx, py), b = v.P(fx, py, 0.62);
    ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
  }

  house.props.forEach((key, i) => {
    const spec = PROPS[key];
    if (!spec) return;
    const py = house.y + 1.6 + i * 3.1;
    const px = left ? 2.4 + i * 0.5 : LANE_TOTAL_M - 2.4 - i * 0.5;
    const [len, hgt] = spec.size;
    if (spec.big) {
      /* a vehicle: body, cabin, and a windscreen so it is not a brick */
      boxProp(ctx, v, px, py, 1.9, len, hgt * 0.62, PROP_COL[key] || "#C4453A");
      boxProp(ctx, v, px, py + len * 0.28, 1.6, len * 0.42, hgt, lighten(PROP_COL[key] || "#C4453A", 0.1));
      quad(ctx, v.P(px - 0.6, py + len * 0.28, hgt), v.P(px + 0.6, py + len * 0.28, hgt),
        v.P(px + 0.6, py + len * 0.66, hgt), v.P(px - 0.6, py + len * 0.66, hgt), "rgba(190,225,245,0.8)");
    } else {
      boxProp(ctx, v, px, py, 0.9, len, hgt, PROP_COL[key] || "#4C7A3E");
    }
  });

  house.scatter.forEach((sc) => {
    const px = left ? sc.x : LANE_TOTAL_M - sc.x;
    const py = house.y + sc.y;
    const base = v.g(px, py);
    if (sc.k === "tree") {
      const h = 2.4 * sc.s;
      const top = v.P(px, py, h);
      ctx.fillStyle = "rgba(0,0,0,0.18)";
      ctx.beginPath(); ctx.ellipse(base.x, base.y, v.m(0.8 * sc.s), v.m(0.34 * sc.s), 0, 0, 6.2832); ctx.fill();
      ctx.strokeStyle = "#7A5230";
      ctx.lineWidth = Math.max(2, v.m(0.2));
      ctx.beginPath(); ctx.moveTo(base.x, base.y); ctx.lineTo(top.x, top.y); ctx.stroke();
      /* three overlapping blobs, so a canopy is a canopy and not a circle */
      const r = Math.max(4, v.m(0.75 * sc.s));
      ctx.fillStyle = "#2F8A38";
      for (const [ox, oy, k] of [[-0.5, 0.2, 0.9], [0.5, 0.15, 0.85], [0, -0.35, 1]]) {
        ctx.beginPath(); ctx.arc(top.x + ox * r, top.y + oy * r, r * k, 0, 6.2832); ctx.fill();
      }
      ctx.fillStyle = "#48A84C";
      ctx.beginPath(); ctx.arc(top.x - r * 0.3, top.y - r * 0.4, r * 0.5, 0, 6.2832); ctx.fill();
    } else {
      const top = v.P(px, py, 0.72 * sc.s);
      const r = Math.max(3, v.m(0.46 * sc.s));
      ctx.fillStyle = "rgba(0,0,0,0.16)";
      ctx.beginPath(); ctx.ellipse(base.x, base.y, r, r * 0.4, 0, 0, 6.2832); ctx.fill();
      ctx.fillStyle = "#2E7A34";
      for (const [ox, oy] of [[-0.6, 0.1], [0.6, 0.1], [0, -0.3]]) {
        ctx.beginPath(); ctx.arc(top.x + ox * r, top.y + oy * r, r * 0.78, 0, 6.2832); ctx.fill();
      }
      ctx.fillStyle = "#3E9A42";
      ctx.beginPath(); ctx.arc(top.x - r * 0.25, top.y - r * 0.3, r * 0.44, 0, 6.2832); ctx.fill();
    }
  });
}

/* One colour per prop, so "the one with the boat" is a thing you can say. */
const PROP_COL = {
  minivan: "#C0453A", hoop: "#3A3A44", toys: "#E8A62E",
  dogbowl: "#B44ACC", chain: "#6A6A72", boat: "#E4E4E8",
  flag: "#E8E8EC", workvan: "#E8E8EC", solar: "#2A3A5A",
  seczign: "#E8C24A", weeds: "#7A9A3A", boxes: "#B08048",
};

/* ── hazards ──────────────────────────────────────────────────────────────*/

function drawProp(ctx, v, p) {
  const col = P.car[p.id % P.car.length];
  if (p.kind === "car" || p.kind === "parked") {
    const H = 1.35;
    const x0 = p.x - p.w / 2, x1 = p.x + p.w / 2;
    const y0 = p.y - p.l / 2, y1 = p.y + p.l / 2;
    quad(ctx, v.g(x0, y0), v.g(x1, y0), v.g(x1, y1), v.g(x0, y1), P.shade);
    quad(ctx, v.P(x0, y0, H), v.P(x1, y0, H), v.P(x1, y1, H), v.P(x0, y1, H), col, "rgba(0,0,0,0.3)");
    quad(ctx, v.P(x0, y0, 0), v.P(x1, y0, 0), v.P(x1, y0, H), v.P(x0, y0, H), darken(col, 0.3));
    quad(ctx,
      v.P(p.x - p.w * 0.34, p.y - p.l * 0.16, H + 0.01), v.P(p.x + p.w * 0.34, p.y - p.l * 0.16, H + 0.01),
      v.P(p.x + p.w * 0.34, p.y + p.l * 0.2, H + 0.01), v.P(p.x - p.w * 0.34, p.y + p.l * 0.2, H + 0.01),
      "rgba(180,225,255,0.72)");
  } else if (p.kind === "can") {
    const t = v.P(p.x, p.y, 0.8);
    ctx.fillStyle = "#4A6A44";
    ctx.beginPath(); ctx.ellipse(t.x, t.y, v.m(0.34), v.m(0.5), 0, 0, 6.2832); ctx.fill();
  } else if (p.kind === "walker") {
    const c = v.g(p.x, p.y);
    const t = v.P(p.x, p.y, 1.7);
    ctx.strokeStyle = "#3A3A46";
    ctx.lineWidth = Math.max(2, v.m(0.22));
    ctx.beginPath(); ctx.moveTo(c.x, c.y); ctx.lineTo(t.x, t.y); ctx.stroke();
    ctx.fillStyle = P.riderSkin;
    ctx.beginPath(); ctx.arc(t.x, t.y, Math.max(2.4, v.m(0.2)), 0, 6.2832); ctx.fill();
  } else if (p.kind === "ramp") {
    const x0 = p.x - p.w / 2, x1 = p.x + p.w / 2;
    const y0 = p.y - p.l / 2, y1 = p.y + p.l / 2;
    quad(ctx, v.g(x0, y0), v.g(x1, y0), v.g(x1, y1), v.g(x0, y1), P.dirt);
    quad(ctx, v.g(x0, y0), v.g(x1, y0), v.P(x1, y1, 0.85), v.P(x0, y1, 0.85), "#B08048", "rgba(0,0,0,0.3)");
  } else if (p.kind === "bundle") {
    quad(ctx, v.P(p.x - 0.5, p.y - 0.5, 0.35), v.P(p.x + 0.5, p.y - 0.5, 0.35),
      v.P(p.x + 0.5, p.y + 0.5, 0.35), v.P(p.x - 0.5, p.y + 0.5, 0.35),
      "#FF8A3D", "rgba(0,0,0,0.35)");
    quad(ctx, v.P(p.x - 0.5, p.y - 0.5, 0), v.P(p.x + 0.5, p.y - 0.5, 0),
      v.P(p.x + 0.5, p.y - 0.5, 0.35), v.P(p.x - 0.5, p.y - 0.5, 0.35), "#D86A28");
  }
}

/* ── the rider ────────────────────────────────────────────────────────────*/

function drawRider(ctx, v, s) {
  const air = s.airLeft > 0 ? s.airLeft / HAZARDS.ramp.airS : 0;
  const lift = air * 1.3;
  const ground = v.g(s.x, s.y);

  ctx.fillStyle = P.shade;
  ctx.beginPath();
  ctx.ellipse(ground.x, ground.y, v.m(0.55), v.m(0.26), 0, 0, 6.2832);
  ctx.fill();

  const wheel = v.P(s.x, s.y, lift);
  if (s.invulnLeft > 0 && Math.floor(s.invulnLeft * 14) % 2 === 0) ctx.globalAlpha = 0.4;

  ctx.save();
  /* The lean pivots about the wheel — that top-heavy wobble is the comedy. */
  ctx.translate(wheel.x, wheel.y);
  ctx.rotate((s.lean * Math.PI) / 180 * 0.5);
  ctx.translate(-wheel.x, -wheel.y);

  /* Everything below is drawn in world metres off the rider's own position,
     so he scales with the street instead of being a fixed pixel blob — but
     at 1.3× life size, because a true-scale rep on a 10 px/m street is a
     twenty-pixel smudge and he is the thing your eye has to track. Collision
     still uses SEGWAY.collideHalfM; drawn size never feeds a hitbox. */
  const U = v.m(1.3);
  const px = (dx, dz) => ({ x: wheel.x + dx * U, y: wheel.y - dz * U });
  const rect = (dx, dz, w, h, fill) => {
    const a = px(dx, dz);
    ctx.fillStyle = fill;
    ctx.fillRect(a.x - (w * U) / 2, a.y - h * U, w * U, h * U);
  };
  const dot = (dx, dz, r, fill) => {
    const a = px(dx, dz);
    ctx.fillStyle = fill;
    ctx.beginPath(); ctx.arc(a.x, a.y, Math.max(1.2, r * U), 0, 6.2832); ctx.fill();
  };

  /* THE SEGWAY — deck, column, handlebar */
  rect(0, 0.14, 0.9, 0.14, "#3A3A44");                        // deck
  rect(0, 1.05, 0.13, 0.95, "#4A4A56");                       // column
  rect(0, 1.12, 0.62, 0.1, "#2A2A32");                        // bar
  ctx.fillStyle = "#22222A";                                   // wheel
  { const a = px(0, 0.07); ctx.beginPath(); ctx.ellipse(a.x, a.y, 0.34 * U, 0.16 * U, 0, 0, 6.2832); ctx.fill(); }

  /* THE REP — legs, polo, arms out to the bar, head, cap. Small, but he has
     a silhouette now instead of being a two-pixel line. */
  rect(-0.14, 0.72, 0.17, 0.6, "#2B3A63");                     // legs
  rect(0.14, 0.72, 0.17, 0.6, "#2B3A63");
  rect(0, 1.34, 0.52, 0.64, P.rider);                          // the branded polo
  rect(0, 1.06, 0.54, 0.1, "#1A2540");                         // belt
  ctx.strokeStyle = P.riderSkin;                               // arms to the bar
  ctx.lineWidth = Math.max(1.6, 0.13 * U);
  ctx.lineCap = "round";
  {
    const sh = px(0, 1.3), hb = px(0.3, 1.14), hb2 = px(-0.3, 1.14);
    ctx.beginPath(); ctx.moveTo(sh.x, sh.y); ctx.lineTo(hb.x, hb.y);
    ctx.moveTo(sh.x, sh.y); ctx.lineTo(hb2.x, hb2.y); ctx.stroke();
  }
  ctx.lineCap = "butt";
  dot(0, 1.58, 0.21, P.riderSkin);                             // head
  { const a = px(0, 1.62);                                     // cap
    ctx.fillStyle = P.riderTop;
    ctx.beginPath(); ctx.arc(a.x, a.y, 0.22 * U, Math.PI, 0); ctx.fill();
    ctx.fillRect(a.x - 0.26 * U, a.y - 0.02 * U, 0.52 * U, 0.07 * U); }

  ctx.restore();
  ctx.globalAlpha = 1;
}

function drawCart(ctx, v, cart) {
  const H = 1.5;
  quad(ctx, v.P(cart.x - 0.85, cart.y - 1.3, H), v.P(cart.x + 0.85, cart.y - 1.3, H),
    v.P(cart.x + 0.85, cart.y + 1.3, H), v.P(cart.x - 0.85, cart.y + 1.3, H),
    P.cart, "rgba(0,0,0,0.35)");
  quad(ctx, v.P(cart.x - 0.85, cart.y - 1.3, 0), v.P(cart.x + 0.85, cart.y - 1.3, 0),
    v.P(cart.x + 0.85, cart.y - 1.3, H), v.P(cart.x - 0.85, cart.y - 1.3, H),
    darken(P.cart, 0.3));
}

/* ── hangers in flight ────────────────────────────────────────────────────*/

function drawHanger(ctx, v, hh) {
  const shadow = v.g(hh.x, hh.y);
  ctx.fillStyle = "rgba(0,0,0,0.24)";
  ctx.beginPath();
  ctx.ellipse(shadow.x, shadow.y, Math.max(2, v.m(0.22)), Math.max(1.2, v.m(0.1)), 0, 0, 6.2832);
  ctx.fill();

  const c = v.P(hh.x, hh.y, hh.z);
  const w = Math.max(3, v.m(0.3)), h = Math.max(5, v.m(0.56));
  ctx.save();
  ctx.translate(c.x, c.y);
  /* An offset hole means it helicopters instead of fluttering — readable at
     speed, and the reason leading a throw feels good. */
  ctx.rotate((hh.spin * Math.PI) / 180);
  ctx.fillStyle = P.hangerA;
  ctx.fillRect(-w / 2, -h / 2, w, h);
  ctx.fillStyle = "rgba(0,0,0,0.45)";
  ctx.beginPath(); ctx.arc(0, -h * 0.3, Math.max(1, w * 0.2), 0, 6.2832); ctx.fill();
  ctx.restore();
}

function drawGhost(ctx, v, g, alpha, street) {
  if (!g || alpha <= 0.01) return;
  /* The ghost has to land where the DRAWN door is, not where the collision
     plane is — otherwise the one thing whose entire job is telling the truth
     would be pointing at empty air a centimetre off the wall. Same tilt. */
  const house = g.houseIdx != null && street
    ? street.houses.find((h) => h.idx === g.houseIdx) : null;
  const onWall = house && g.z > 0.02 && g.key !== "mailbox";
  const c = onWall ? facePt(v, house, g.y, g.z) : v.P(g.x, g.y, g.z);
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = g.kills ? P.ghostBad : g.good ? P.ghostOk : "rgba(255,255,255,0.7)";
  ctx.lineWidth = 2.4;
  const r = Math.max(7, v.m(0.55));
  ctx.beginPath(); ctx.arc(c.x, c.y, r, 0, 6.2832); ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(c.x - r * 1.6, c.y); ctx.lineTo(c.x - r * 0.7, c.y);
  ctx.moveTo(c.x + r * 0.7, c.y); ctx.lineTo(c.x + r * 1.6, c.y);
  ctx.stroke();
  ctx.restore();
}

/* ── the painter ──────────────────────────────────────────────────────────
   Y-bucketed, far to near. Buckets are allocated once and reused, so a frame
   costs no garbage. Within a bucket, lower layer paints first. */
const BUCKET_M = 2;
const NBUCKET = 240;
const buckets = Array.from({ length: NBUCKET }, () => []);
const counts = new Int32Array(NBUCKET);
const LAYER = { prop: 0, house: 1, mailbox: 2, road: 3, hanger: 4, rider: 5 };
const MAXLAYER = LAYER.rider;

export function drawRide(ctx, s, v, opts = {}) {
  const s0 = s;
  ctx.clearRect(0, 0, v.w, v.h);
  drawGround(ctx, v, SKY[opts.sky] || SKY.morning);
  drawRuts(ctx, v, opts.oldRuts);
  drawRuts(ctx, v, s.ruts);

  const yBot = v.yBot(), yTop = v.yTop();
  const base = Math.floor(yBot / BUCKET_M);
  const at = (y) => Math.floor(y / BUCKET_M) - base;

  counts.fill(0);
  const push = (idx, l, fn) => {
    if (idx < 0 || idx >= NBUCKET) return;
    const b = buckets[idx];
    const n = counts[idx];
    if (n < b.length) { b[n].l = l; b[n].f = fn; } else b.push({ l, f: fn });
    counts[idx] = n + 1;
  };

  for (const house of s.street.houses) {
    if (house.y + FACADE.frontageM < yBot || house.y > yTop) continue;
    const st = (opts.houseState && opts.houseState[house.idx]) || {};
    const merged = { ...st, lead: s.leads[house.idx] || st.lead };
    push(at(house.y), LAYER.house, () => drawHouse(ctx, v, house, merged));
    push(at(house.y), LAYER.prop, () => drawYardProps(ctx, v, house));
    push(at(house.y + MAILBOX.offsetY), LAYER.mailbox, () => drawMailbox(ctx, v, house));
  }

  for (const p of s.props) {
    if (p.dead || p.y < yBot || p.y > yTop) continue;
    push(at(p.y), LAYER.road, () => drawProp(ctx, v, p));
  }
  if (s.cart) push(at(s.cart.y), LAYER.road, () => drawCart(ctx, v, s.cart));
  for (const hh of (opts.hangers || [])) push(at(hh.y), LAYER.hanger, () => drawHanger(ctx, v, hh));

  /* The rider has a y and a height now, so he can no longer be painted last
     unconditionally — a house behind him has to stay behind him. */
  push(at(s.y), LAYER.rider, () => drawRider(ctx, v, s));

  for (let i = NBUCKET - 1; i >= 0; i--) {
    const n = counts[i];
    if (!n) continue;
    const b = buckets[i];
    for (let pass = 0; pass <= MAXLAYER; pass++) {
      for (let j = 0; j < n; j++) if (b[j].l === pass) b[j].f();
    }
  }

  /* The aim ghost is UI, not world — it must never be occluded by a house. */
  drawGhost(ctx, v, opts.ghostL, opts.ghostAlphaL || 0, s0.street);
  drawGhost(ctx, v, opts.ghostR, opts.ghostAlphaR || 0, s0.street);
  if (opts.rain) drawRain(ctx, v, opts.t || 0);
}

function drawRain(ctx, v, t) {
  ctx.strokeStyle = "rgba(200,225,255,0.3)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let i = 0; i < 90; i++) {
    const x = ((i * 137.5 + t * 40) % (v.w + 40)) - 20;
    const y = ((i * 89.3 + t * 900) % (v.h + 60)) - 30;
    ctx.moveTo(x, y); ctx.lineTo(x - 3, y + 14);
  }
  ctx.stroke();
}

/* ── colour helpers ───────────────────────────────────────────────────────*/

const rgb = (hex) => {
  if (hex[0] !== "#") return null;
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};
function darken(hex, amt) {
  const c = rgb(hex);
  if (!c) return hex;
  return `rgb(${c.map((x) => Math.round(x * (1 - amt))).join(",")})`;
}
function lighten(hex, amt) {
  const c = rgb(hex);
  if (!c) return hex;
  return `rgb(${c.map((x) => Math.round(x + (255 - x) * amt)).join(",")})`;
}
function shade(hex, hue) {
  const n = parseInt(hex.slice(1), 16);
  const k = 0.85 + (hue || 0) * 2.2;
  const c = (x) => Math.max(0, Math.min(255, Math.round(x * k)));
  return `rgb(${c((n >> 16) & 255)},${c((n >> 8) & 255)},${c(n & 255)})`;
}

export default drawRide;
