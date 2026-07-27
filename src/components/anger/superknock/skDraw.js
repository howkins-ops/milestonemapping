/* ════════════════════════════════════════════════════════════════════════
   SUPER KNOCK — THE RIDE, DRAWN. Canvas-2d, one pass, no allocation in the
   hot loop, no text (all text lives in DOM above the canvas so it stays
   crisp and selectable-free at any zoom).

   ── THE PROJECTION ───────────────────────────────────────────────────────
   The street runs UP the screen. Three world axes, two screen axes:

       world y (along the street)  →  screen Y     (scrolls)
       world x (across the street) →  screen X     (lanes)
       world z (height)            →  screen X too, pushed AWAY from the road

   That last line is the whole trick, and it is Paperboy's own oblique view.
   A house's height is drawn as horizontal depth back from its facade plane,
   so the door, the handle and the window all land at a specific (screenX,
   screenY) that the player can see, aim at, and hit. A hanger's arc climbs
   the wall as it rises. It reads instantly and it costs one multiply.

   `zDir` is −1 on the left of the street and +1 on the right: height leans
   away from the road on both sides, which is what makes the two rows of
   houses look like they face each other.

   ── WHY EVERYTHING IS HERE AND NOT IN REACT ──────────────────────────────
   Twenty houses, their props, traffic, hangers in flight and a cart, at 60fps.
   Nothing in this file ever touches React. The scene owns one rAF, calls
   drawRide() once, and React re-renders only when a discrete thing changes
   (ammo, lives, a score popup).

   PERF LAW: budget is 8ms/frame (PERF.drawBudgetMs). DoorFX rides a second
   stacked canvas and halves its own particle cap after 30 slow frames — it
   has no idea this canvas exists, so going over budget here silently strips
   the juice and looks like an art bug.
   ════════════════════════════════════════════════════════════════════════ */
import {
  BANDS, LANE_TOTAL_M, DRAW_PAD_M, FACADE_L_X, FACADE_R_X, HOUSE_H_M,
  RIDER_SCREEN_Y, SEGWAY, FACADE, MAILBOX, HAZARDS, WINDOWS,
} from "./skTuning.js";
import { targetBoxes, mailboxBox, DOOR_COLORS, PROPS } from "./skStreet.js";

/* ── palette ──────────────────────────────────────────────────────────────
   Dark, warm, neon-accented — the Anger Gym's register, not a sunny Sunday.
   Sky tints per day-window so MIDDAY and GOLDEN read as different places. */
const P = {
  road: "#26262C",
  roadEdge: "#33333B",
  line: "#C8B15E",
  walk: "#4A4A52",
  walkLine: "#3B3B43",
  lawn: "#2F4230",
  lawnAlt: "#35492F",
  dirt: "#4A3B2A",
  rut: "#5A4A33",
  roofDark: "#1C1C22",
  shade: "rgba(0,0,0,0.34)",
  hangerA: "#FFD65A",
  hangerB: "#FF8A3D",
  ghostOk: "rgba(0,255,191,0.85)",
  ghostBad: "rgba(255,59,92,0.85)",
  rider: "#00F0FF",
  riderDark: "#0B5C68",
  cart: "#E2C044",
  car: ["#8E3B3B", "#3B5A8E", "#5A5A62", "#7A6A3B", "#3B7A63"],
};

const SKY = {
  morning: ["#1A2038", "#3C3350"],
  midday: ["#243049", "#4A4560"],
  golden: ["#3A2233", "#7A4230"],
};

/* ── the view transform ───────────────────────────────────────────────────*/

/**
 * Build the frame's transform. One object, rebuilt per frame, read everywhere.
 * `scale` is px per metre INCLUDING zoom, so nothing downstream multiplies twice.
 */
export function makeView({ w, h, camY, zoom = 1, dpr = 1 }) {
  /* The projectors read `v.camY` and `v.scale` OFF THE OBJECT, never off the
     destructured parameters. That looks like a style choice and is not: the
     scene mutates `view.camY = sim.y` every frame, and a closure over the
     parameter would keep projecting against the camera's position at the
     moment the view was built — the rider would ride and the street would
     never move. Same trap for `zoom`, which the porch dolly animates. */
  const v = { w, h, camY, zoom, dpr, scale: 0 };
  v.setZoom = (z) => { v.zoom = z; v.scale = (w / (LANE_TOTAL_M + DRAW_PAD_M * 2)) * z; };
  v.setZoom(zoom);

  /* world x → screen x. x=0 (left facade) sits DRAW_PAD_M in from the edge. */
  v.sx = (x) => (x + DRAW_PAD_M) * v.scale;
  /* world y → screen y. Bigger y is further up the street, so further up the
     screen. The rider is pinned at RIDER_SCREEN_Y. */
  v.sy = (y) => h * RIDER_SCREEN_Y - (y - v.camY) * v.scale;
  /* height, as horizontal depth away from the road. */
  v.zx = (z, side) => (side === "L" ? -1 : 1) * z * v.scale;
  v.m = (n) => n * v.scale;
  return v;
}

const visible = (v, y, pad = 24) => {
  const s = v.sy(y);
  return s > -pad && s < v.h + pad;
};

/* ── ground ───────────────────────────────────────────────────────────────*/

function drawGround(ctx, v, s, tint) {
  const g = ctx.createLinearGradient(0, 0, 0, v.h);
  g.addColorStop(0, tint[0]);
  g.addColorStop(1, tint[1]);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, v.w, v.h);

  for (const b of BANDS) {
    const x0 = v.sx(b.from), x1 = v.sx(b.to);
    ctx.fillStyle = b.key === "road" ? P.road : b.key === "walk" ? P.walk : P.lawn;
    ctx.fillRect(x0, 0, x1 - x0, v.h);
  }
  /* Mown stripes on the lawns — the cheapest possible cue that this surface
     is someone's property and not just green tarmac. Costs one fill each. */
  ctx.fillStyle = P.lawnAlt;
  const stripe = v.m(2.4);
  if (stripe > 3) {
    const off = ((v.camY * v.scale) % (stripe * 2));
    for (let y = -stripe * 2 + off; y < v.h + stripe; y += stripe * 2) {
      ctx.fillRect(v.sx(0), y, v.m(5), stripe);
      ctx.fillRect(v.sx(19), y, v.m(5), stripe);
    }
  }

  /* road edges + centre line */
  ctx.fillStyle = P.roadEdge;
  ctx.fillRect(v.sx(7) - 1, 0, 2, v.h);
  ctx.fillRect(v.sx(17) - 1, 0, 2, v.h);
  ctx.fillStyle = P.walkLine;
  ctx.fillRect(v.sx(5), 0, 1, v.h);
  ctx.fillRect(v.sx(19) - 1, 0, 1, v.h);

  const dash = v.m(3.2), gap = v.m(3.2);
  const off2 = (v.camY * v.scale) % (dash + gap);
  ctx.fillStyle = P.line;
  ctx.globalAlpha = 0.55;
  const cx = v.sx(LANE_TOTAL_M / 2) - 1;
  for (let y = -dash + off2; y < v.h + dash; y += dash + gap) ctx.fillRect(cx, y, 2, dash);
  ctx.globalAlpha = 1;
}

/* ── ruts ─────────────────────────────────────────────────────────────────
   Stroked from segments every frame, never rasterised into a decal buffer.
   A world-space buffer for an 850m street would be ~84MB at DPR2; a
   screen-space one (all DoorFX offers) would smear static marks across a
   scrolling street. Forty strokes a frame is free. */
function drawRuts(ctx, v, ruts) {
  if (!ruts || !ruts.length) return;
  ctx.strokeStyle = P.rut;
  ctx.lineWidth = Math.max(1.5, v.m(0.28));
  ctx.globalAlpha = 0.5;
  for (const r of ruts) {
    if (!visible(v, r.y0, 400) && !visible(v, r.y1, 400)) continue;
    const x = v.sx(r.x != null ? r.x : (r.side === "L" ? 2.4 : 21.6));
    ctx.beginPath();
    ctx.moveTo(x - v.m(0.35), v.sy(r.y0));
    ctx.lineTo(x - v.m(0.35), v.sy(r.y1));
    ctx.moveTo(x + v.m(0.35), v.sy(r.y0));
    ctx.lineTo(x + v.m(0.35), v.sy(r.y1));
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
}

/* ── houses ───────────────────────────────────────────────────────────────*/

function drawHouse(ctx, v, house, state) {
  const side = house.side;
  const f = house.facade;
  const y0 = v.sy(house.y);
  const y1 = v.sy(house.y + f.frontageM);
  if (Math.min(y0, y1) > v.h + 60 || Math.max(y0, y1) < -60) return;

  const gx = v.sx(side === "L" ? FACADE_L_X : FACADE_R_X); // ground line
  const depth = v.zx(HOUSE_H_M, side); // negative on the left
  const top = Math.min(y0, y1), bot = Math.max(y0, y1);
  const hgt = bot - top;

  /* body */
  ctx.fillStyle = f.siding;
  ctx.fillRect(Math.min(gx, gx + depth), top, Math.abs(depth), hgt);

  /* a darker roof band at the far edge sells the third axis for one fill */
  ctx.fillStyle = P.roofDark;
  const roofW = Math.abs(depth) * 0.3;
  ctx.fillRect(side === "L" ? gx + depth : gx + depth - roofW, top, roofW, hgt);

  /* siding courses — horizontal in world terms, so vertical-ish here */
  ctx.strokeStyle = "rgba(0,0,0,0.14)";
  ctx.lineWidth = 1;
  const cs = Math.abs(depth) / 6;
  for (let i = 1; i < 6; i++) {
    const x = gx + (depth / 6) * i;
    ctx.beginPath(); ctx.moveTo(x, top); ctx.lineTo(x, bot); ctx.stroke();
  }

  /* ── the targets. Drawn from targetBoxes() — the SAME function the
     collision uses — so the thing you aim at is the thing you hit. ─────── */
  const boxes = targetBoxes(house);
  const rect = (b, fill, stroke) => {
    const by0 = v.sy(b.y0), by1 = v.sy(b.y1);
    const bx0 = gx + v.zx(b.z0, side), bx1 = gx + v.zx(b.z1, side);
    const x = Math.min(bx0, bx1), yy = Math.min(by0, by1);
    const ww = Math.abs(bx1 - bx0), hh = Math.abs(by1 - by0);
    ctx.fillStyle = fill;
    ctx.fillRect(x, yy, ww, hh);
    if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = 1; ctx.strokeRect(x + 0.5, yy + 0.5, ww - 1, hh - 1); }
    return { x, y: yy, w: ww, h: hh };
  };

  const st = state || {};
  for (const b of boxes) {
    if (b.key === "mat") rect(b, "#3B342C");
    else if (b.key === "door") rect(b, st.plywood ? "#6B5638" : f.doorColor, "rgba(0,0,0,0.35)");
    else if (b.key === "window") rect(b, st.smashed ? "#141418" : "#8FB6C9", "rgba(0,0,0,0.3)");
    else if (b.key === "handle") {
      /* The BOX is 0.55m so a thumb can earn it; the DRAWN handle is a few
         centimetres, at the box's centre. Art size and collision size are
         decoupled here exactly as they are in The Door's night gallery. */
      const cy = v.sy((b.y0 + b.y1) / 2);
      const cx = gx + v.zx((b.z0 + b.z1) / 2, side);
      ctx.fillStyle = "#D8C78A";
      ctx.beginPath(); ctx.arc(cx, cy, Math.max(1.6, v.m(0.11)), 0, 6.2832); ctx.fill();
    }
  }

  /* the hanger you actually threw, still on the door. THE promise of the
     whole game: phase 2 reads the street by looking at the doors. */
  if (st.lead) drawHangerOnDoor(ctx, v, house, st.lead, gx, side);

  /* NO SOLICITING */
  if (house.noSolicit || st.noSolicit) {
    const cy = v.sy(house.y + 8.6);
    const cx = gx + v.zx(0.9, side);
    ctx.fillStyle = "#D9D2C4";
    ctx.fillRect(cx - v.m(0.18), cy - v.m(0.5), v.m(0.36), v.m(1.0));
    ctx.fillStyle = "#B4342F";
    ctx.fillRect(cx - v.m(0.13), cy - v.m(0.38), v.m(0.26), v.m(0.2));
  }

  /* yard sign — you closed this one */
  if (st.sold) {
    const cy = v.sy(house.y + 2.0);
    const cx = v.sx(side === "L" ? 3.4 : 20.6);
    ctx.fillStyle = "#00FFBF";
    ctx.fillRect(cx - v.m(0.5), cy - v.m(0.36), v.m(1.0), v.m(0.72));
    ctx.fillStyle = "#0B2620";
    ctx.fillRect(cx - v.m(0.34), cy - v.m(0.2), v.m(0.68), v.m(0.12));
  }

  drawMailbox(ctx, v, house, st);
  drawYardProps(ctx, v, house);
}

function drawHangerOnDoor(ctx, v, house, lead, gx, side) {
  const boxes = targetBoxes(house);
  let b, tilt = 0;
  if (lead === "hot") { b = boxes.find((x) => x.key === "handle"); }
  else if (lead === "warm" || lead === "lukewarm") { b = boxes.find((x) => x.key === "mat"); }
  else if (lead === "hostile") { b = boxes.find((x) => x.key === "window"); }
  else if (lead === "dead") { b = null; }
  else return;

  /* DEAD reads as a hanger lying out on the lawn — visible, wrong, and yours. */
  const cy = b ? v.sy((b.y0 + b.y1) / 2) : v.sy(house.y + 3);
  const cx = b ? gx + v.zx((b.z0 + b.z1) / 2, side) : v.sx(side === "L" ? 2.6 : 21.4);
  if (!b) tilt = 0.6;

  const w = Math.max(3, v.m(0.34)), h = Math.max(5, v.m(0.62));
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(tilt);
  /* Bright rect on the handle, dark one in the bushes. The lead state has to
     read by SILHOUETTE AND COLOUR ALONE at 20px — that is the hedge against
     the canvas street and the SVG porch ever drifting apart on art. */
  ctx.fillStyle = lead === "dead" ? "#4A4436" : lead === "hostile" ? "#FF6B4A" : P.hangerA;
  ctx.fillRect(-w / 2, -h / 2, w, h);
  if (lead !== "dead") {
    ctx.fillStyle = "rgba(0,0,0,0.4)";
    ctx.fillRect(-w * 0.18, -h / 2 + 1, w * 0.36, Math.max(1, h * 0.16));
  }
  ctx.restore();
}

function drawMailbox(ctx, v, house, st) {
  const mb = mailboxBox(house);
  const cy = v.sy((mb.y0 + mb.y1) / 2);
  if (cy < -30 || cy > v.h + 30) return;
  const cx = v.sx(mb.facadeX);
  const side = house.side;
  const postH = v.zx(MAILBOX.z, side);
  ctx.strokeStyle = "#4A4038";
  ctx.lineWidth = Math.max(1.5, v.m(0.12));
  ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + postH, cy); ctx.stroke();
  const bw = Math.abs(v.zx(MAILBOX.h, side)), bh = v.m(MAILBOX.w);
  ctx.fillStyle = st && st.mailed ? "#00FFBF" : "#7E7A72";
  ctx.fillRect(Math.min(cx + postH, cx + postH + (side === "L" ? -bw : bw)), cy - bh / 2, bw, bh);
}

function drawYardProps(ctx, v, house) {
  const side = house.side;
  for (let i = 0; i < house.props.length; i++) {
    const key = house.props[i];
    const spec = PROPS[key];
    const py = house.y + 1.6 + i * 3.1;
    const cy = v.sy(py);
    if (cy < -40 || cy > v.h + 40) continue;
    const cx = v.sx(side === "L" ? 1.2 + i * 0.9 : LANE_TOTAL_M - 1.2 - i * 0.9);
    const w = v.m(spec.size[1]), h = v.m(spec.size[0]);
    ctx.fillStyle = "rgba(0,0,0,0.3)";
    ctx.fillRect(cx - w / 2 + 2, cy - h / 2 + 2, w, h);
    ctx.fillStyle = spec.big ? "#5E5A66" : "#4C5647";
    ctx.fillRect(cx - w / 2, cy - h / 2, w, h);
  }
  for (const sc of house.scatter) {
    const cy = v.sy(house.y + sc.y);
    if (cy < -20 || cy > v.h + 20) continue;
    const cx = v.sx(side === "L" ? sc.x : LANE_TOTAL_M - sc.x);
    const r = v.m(0.34 * sc.s);
    ctx.fillStyle = sc.k === "tree" ? "#22371F" : "#2C4028";
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, 6.2832); ctx.fill();
  }
}

/* ── hazards ──────────────────────────────────────────────────────────────*/

function drawProps(ctx, v, props, camY) {
  for (const p of props) {
    if (p.dead) continue;
    if (p.y < camY - 30) continue;
    if (p.y > camY + 100) break;
    const cy = v.sy(p.y);
    if (cy < -60 || cy > v.h + 60) continue;
    const cx = v.sx(p.x);
    const w = v.m(p.w), h = v.m(p.l);

    if (p.kind === "car" || p.kind === "parked") {
      ctx.fillStyle = P.shade;
      ctx.fillRect(cx - w / 2 + 2, cy - h / 2 + 3, w, h);
      ctx.fillStyle = P.car[p.id % P.car.length];
      ctx.fillRect(cx - w / 2, cy - h / 2, w, h);
      ctx.fillStyle = "rgba(180,220,255,0.35)";
      ctx.fillRect(cx - w * 0.36, cy - h * 0.22, w * 0.72, h * 0.26);
      if (p.kind === "car") {
        ctx.fillStyle = "rgba(255,240,190,0.5)";
        ctx.fillRect(cx - w * 0.34, cy - h / 2 - 2, w * 0.2, 3);
        ctx.fillRect(cx + w * 0.14, cy - h / 2 - 2, w * 0.2, 3);
      }
    } else if (p.kind === "can") {
      ctx.fillStyle = "#3E4A3E";
      ctx.beginPath(); ctx.arc(cx, cy, Math.max(3, w / 2), 0, 6.2832); ctx.fill();
    } else if (p.kind === "walker") {
      ctx.fillStyle = "#C9B79B";
      ctx.beginPath(); ctx.arc(cx, cy, Math.max(3, w / 2), 0, 6.2832); ctx.fill();
    } else if (p.kind === "ramp") {
      ctx.fillStyle = P.dirt;
      ctx.fillRect(cx - w / 2, cy - h / 2, w, h);
      ctx.fillStyle = "#6B5540";
      ctx.beginPath();
      ctx.moveTo(cx - w / 2, cy + h / 2);
      ctx.lineTo(cx + w / 2, cy + h / 2);
      ctx.lineTo(cx, cy - h / 2);
      ctx.closePath(); ctx.fill();
    } else if (p.kind === "bundle") {
      ctx.fillStyle = P.hangerB;
      ctx.fillRect(cx - w / 2, cy - h / 2, w, h);
      ctx.fillStyle = "#2A1A0C";
      ctx.fillRect(cx - w / 2, cy - 1, w, 2);
    }
  }
}

/* ── the rider ────────────────────────────────────────────────────────────*/

function drawRider(ctx, v, s) {
  const cx = v.sx(s.x);
  const cy = v.h * RIDER_SCREEN_Y;
  const air = s.airLeft > 0 ? s.airLeft / HAZARDS.ramp.airS : 0;
  const lift = air * v.m(1.4);
  const scale = 1 + air * 0.22;

  /* shadow stays on the ground — the only unambiguous read for "airborne"
     in a projection that already spends screen-x on height */
  ctx.fillStyle = P.shade;
  ctx.beginPath();
  ctx.ellipse(cx, cy + v.m(0.35), v.m(0.5), v.m(0.26), 0, 0, 6.2832);
  ctx.fill();

  ctx.save();
  ctx.translate(cx, cy - lift);
  ctx.rotate((s.lean * Math.PI) / 180 * 0.5);
  ctx.scale(scale, scale);
  if (s.invulnLeft > 0 && Math.floor(s.invulnLeft * 14) % 2 === 0) ctx.globalAlpha = 0.4;

  const rw = v.m(SEGWAY.collideHalfM * 2 * SEGWAY.drawScale);
  const rh = rw * 1.5;
  /* segway column */
  ctx.fillStyle = P.riderDark;
  ctx.fillRect(-rw * 0.14, -rh * 0.1, rw * 0.28, rh * 0.5);
  ctx.fillRect(-rw * 0.5, rh * 0.36, rw, rh * 0.16);
  /* body */
  ctx.fillStyle = P.rider;
  ctx.fillRect(-rw * 0.3, -rh * 0.52, rw * 0.6, rh * 0.5);
  /* head */
  ctx.beginPath(); ctx.arc(0, -rh * 0.62, rw * 0.22, 0, 6.2832); ctx.fill();
  /* the branded polo, which is also the thing you can ditch to lose heat */
  ctx.fillStyle = "#0B2A30";
  ctx.fillRect(-rw * 0.3, -rh * 0.36, rw * 0.6, rh * 0.1);
  ctx.restore();
  ctx.globalAlpha = 1;
}

function drawCart(ctx, v, cart) {
  if (!cart) return;
  const cy = v.sy(cart.y);
  if (cy < -60 || cy > v.h + 80) return;
  const cx = v.sx(cart.x);
  const w = v.m(1.7), h = v.m(2.6);
  ctx.fillStyle = P.shade;
  ctx.fillRect(cx - w / 2 + 2, cy - h / 2 + 3, w, h);
  ctx.fillStyle = P.cart;
  ctx.fillRect(cx - w / 2, cy - h / 2, w, h);
  ctx.fillStyle = "#2A2410";
  ctx.fillRect(cx - w / 2, cy - h * 0.1, w, h * 0.12);
}

/* ── hangers in flight ────────────────────────────────────────────────────*/

function drawHangers(ctx, v, list) {
  for (const h of list) {
    const side = h.side;
    const cx = v.sx(h.x) + v.zx(h.z, side);
    const cy = v.sy(h.y);
    /* ground shadow, at z=0 — the depth cue that makes the arc readable */
    ctx.fillStyle = "rgba(0,0,0,0.28)";
    ctx.beginPath();
    ctx.ellipse(v.sx(h.x), cy, Math.max(2, v.m(0.2)), Math.max(1.2, v.m(0.1)), 0, 0, 6.2832);
    ctx.fill();

    const w = Math.max(3, v.m(0.3)), hh = Math.max(5, v.m(0.55));
    ctx.save();
    ctx.translate(cx, cy);
    /* An offset hole means it helicopters rather than fluttering — which is
       what makes a thrown card readable at speed and satisfying to lead. */
    ctx.rotate((h.spin * Math.PI) / 180);
    ctx.fillStyle = P.hangerA;
    ctx.fillRect(-w / 2, -hh / 2, w, hh);
    ctx.fillStyle = "rgba(0,0,0,0.45)";
    ctx.beginPath(); ctx.arc(0, -hh * 0.32, Math.max(1, w * 0.2), 0, 6.2832); ctx.fill();
    ctx.restore();
  }
}

/* ── the aim ghost ────────────────────────────────────────────────────────
   Calls the same resolver the real throw does, so it is incapable of lying.
   Without it I do not believe the lead is learnable inside a 90-second run,
   and 90 seconds is all the game gives you. It is also the difficulty dial:
   on for street 1, off for street 3. */
function drawGhost(ctx, v, g, side, alpha) {
  if (!g || alpha <= 0.01) return;
  const cx = v.sx(g.x) + v.zx(g.z, side);
  const cy = v.sy(g.y);
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = g.kills ? P.ghostBad : g.good ? P.ghostOk : "rgba(255,255,255,0.6)";
  ctx.lineWidth = 2;
  const r = Math.max(7, v.m(0.6));
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, 6.2832); ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx - r * 1.5, cy); ctx.lineTo(cx - r * 0.6, cy);
  ctx.moveTo(cx + r * 0.6, cy); ctx.lineTo(cx + r * 1.5, cy);
  ctx.stroke();
  ctx.restore();
}

/* ── the whole frame ──────────────────────────────────────────────────────*/

export function drawRide(ctx, s, view, opts = {}) {
  const v = view;
  ctx.clearRect(0, 0, v.w, v.h);
  const win = WINDOWS.find((w) => w.key === opts.window) || WINDOWS[0];
  drawGround(ctx, v, s, SKY[win.key] || SKY.morning);
  drawRuts(ctx, v, opts.oldRuts);
  drawRuts(ctx, v, s.ruts);

  /* Far side first so the near side overlaps it — with only 31m of world
     there is no real depth sort to do, just a stable order. */
  for (const house of s.street.houses) {
    if (!visible(v, house.y + FACADE.frontageM / 2, 300)) continue;
    const st = (opts.houseState && opts.houseState[house.idx]) || {};
    drawHouse(ctx, v, house, { ...st, lead: s.leads[house.idx] || st.lead });
  }

  drawProps(ctx, v, s.props, s.camY != null ? s.camY : s.y);
  drawCart(ctx, v, s.cart);
  drawHangers(ctx, v, opts.hangers || []);
  drawGhost(ctx, v, opts.ghostL, "L", opts.ghostAlphaL || 0);
  drawGhost(ctx, v, opts.ghostR, "R", opts.ghostAlphaR || 0);
  drawRider(ctx, v, s);

  /* Rain is a full-screen pass and stays OUT of any filtered subtree. */
  if (opts.rain) drawRain(ctx, v, opts.t || 0);
}

function drawRain(ctx, v, t) {
  ctx.strokeStyle = "rgba(180,210,255,0.28)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let i = 0; i < 90; i++) {
    const x = ((i * 137.5 + t * 40) % (v.w + 40)) - 20;
    const y = ((i * 89.3 + t * 900) % (v.h + 60)) - 30;
    ctx.moveTo(x, y); ctx.lineTo(x - 3, y + 14);
  }
  ctx.stroke();
}

export default drawRide;
