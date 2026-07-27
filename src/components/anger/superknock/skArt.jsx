import React from "react";
import { FACADE, HOUSE_H_M, MAILBOX } from "./skTuning.js";
import { targetBoxes, PROPS, PORCH, porchProject, porchRect } from "./skStreet.js";

/* ════════════════════════════════════════════════════════════════════════
   SUPER KNOCK — SVG ART. The porch, the block strip, and the icon sheet.

   ── THE ONE RULE ─────────────────────────────────────────────────────────
   Nothing in this file invents geometry. Every rectangle on the porch is
   `targetBoxes(house)` — the SAME function the collision runs on — pushed
   through `porchProject()`. The ride canvas draws those boxes at ride scale;
   this draws them at full fidelity. If they ever disagree, the game's best
   idea ("the hanger you threw on Monday IS the lead state you read on
   Tuesday") is dead, and it would die silently.

   The self-test asserts the two projections agree.

   ── ZERO EMOJI ───────────────────────────────────────────────────────────
   Icons are `<symbol>`s consumed via `<use>`, the GameIcons.jsx pattern. One
   sheet mounts per scene; each icon then costs a single `<use>` no matter how
   many times it appears.

   ── ONE FILTER ───────────────────────────────────────────────────────────
   There is exactly one `drop-shadow` on this porch and it is on the static
   facade group. Never one per element, and never on anything containing an
   infinite animation.
   ════════════════════════════════════════════════════════════════════════ */

/* PORCH / porchProject / porchRect live in skStreet.js beside targetBoxes,
   so the one module that owns the geometry owns every mapping of it — and so
   the headless self-test can prove the canvas and this SVG agree. Re-exported
   here only for convenience. */
export { PORCH, porchProject, porchRect };

/* ── the icon sheet ───────────────────────────────────────────────────────*/

export function SkIconSheet() {
  return (
    <svg width="0" height="0" aria-hidden="true" style={{ position: "absolute" }}>
      <defs>
        <symbol id="ski-hanger" viewBox="0 0 24 24">
          <rect x="7" y="6" width="10" height="15" rx="1.6" fill="none" stroke="currentColor" strokeWidth="1.8" />
          <circle cx="12" cy="9.5" r="1.8" fill="none" stroke="currentColor" strokeWidth="1.6" />
          <path d="M12 7.7V3.6" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </symbol>
        <symbol id="ski-door" viewBox="0 0 24 24">
          <rect x="6" y="3" width="12" height="18" rx="1" fill="none" stroke="currentColor" strokeWidth="1.8" />
          <circle cx="14.6" cy="12" r="1" fill="currentColor" />
        </symbol>
        <symbol id="ski-knock" viewBox="0 0 24 24">
          <path d="M8 13c0-2 1-3 2.4-3l4.6.2" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M9 13.4l-1.6 1.8a2 2 0 0 0 .3 2.8l2.1 1.6a3 3 0 0 0 4-.4l3.4-3.6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
          <path d="M18.6 6.4l1.8-1.6M20.4 10.2h2.2M16.6 4.4l.5-2.2" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </symbol>
        <symbol id="ski-clock" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="8.6" fill="none" stroke="currentColor" strokeWidth="1.8" />
          <path d="M12 7.2V12l3.2 2" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </symbol>
        <symbol id="ski-sign" viewBox="0 0 24 24">
          <rect x="4.5" y="5" width="15" height="9" rx="1.2" fill="none" stroke="currentColor" strokeWidth="1.8" />
          <path d="M12 14v6M7 8.6h10M7 11h6" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </symbol>
        <symbol id="ski-sold" viewBox="0 0 24 24">
          <path d="M4 12.6l5 5L20 6.4" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
        </symbol>
        <symbol id="ski-dog" viewBox="0 0 24 24">
          <path d="M5 14.5l1.6-6 3 2.4h4.8l3-2.4 1.6 6-2 5.5H7z" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
          <circle cx="9.8" cy="14" r="0.9" fill="currentColor" />
          <circle cx="14.2" cy="14" r="0.9" fill="currentColor" />
        </symbol>
        <symbol id="ski-heat" viewBox="0 0 24 24">
          <path d="M12 3c3 4 5.4 5.6 5.4 9.4A5.4 5.4 0 0 1 12 21a5.4 5.4 0 0 1-5.4-8.6C6.6 8.6 9 7 12 3z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
        </symbol>
        <symbol id="ski-strike" viewBox="0 0 24 24">
          <path d="M5.5 5.5l13 13M18.5 5.5l-13 13" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
        </symbol>
        <symbol id="ski-chev" viewBox="0 0 24 24">
          <path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        </symbol>
      </defs>
    </svg>
  );
}

export const SK_ICONS = ["hanger", "door", "knock", "clock", "sign", "sold", "dog", "heat", "strike", "chev"];

export function SkIcon({ name, size = 16, className = "", style, title }) {
  return (
    <svg
      width={size} height={size} className={className} style={style}
      role={title ? "img" : undefined} aria-hidden={title ? undefined : true}
      focusable="false"
    >
      {title ? <title>{title}</title> : null}
      <use href={`#ski-${name}`} />
    </svg>
  );
}

/* ── the porch ────────────────────────────────────────────────────────────*/

const LEAD_TINT = {
  hot: "#FFD65A",
  warm: "#E8DCC0",
  lukewarm: "#C9BFA6",
  hostile: "#FF6B4A",
  dead: "#4A4436",
};

/**
 * The front-on porch. Every rect comes from targetBoxes().
 * `state` is the week's houseState for this door; `lead` is today's.
 */
export function Porch({ house, state = {}, lead, stance = "square", knocking = false, peek = false }) {
  const boxes = targetBoxes(house);
  const f = house.facade;
  const R = (key) => {
    const b = boxes.find((x) => x.key === key);
    return b ? porchRect(b, house) : null;
  };
  const door = R("door");
  const win = R("window");
  const mat = R("mat");
  const handle = R("handle");

  /* stance shifts the whole viewport a little — you are standing further back
     or crowding the step, and it should FEEL like it before it's a modifier */
  const zoom = stance === "back" ? 1.14 : stance === "crowd" ? 0.9 : 1;
  const vb = `${(PORCH.w * (1 - 1 / zoom)) / 2} ${(PORCH.h * (1 - 1 / zoom)) / 2} ${PORCH.w / zoom} ${PORCH.h / zoom}`;

  return (
    <svg className="sk-porch" viewBox={vb} preserveAspectRatio="xMidYMax slice" aria-hidden="true">
      <defs>
        <linearGradient id="skPorchWall" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={f.siding} stopOpacity="0.95" />
          <stop offset="1" stopColor="#14141A" stopOpacity="0.95" />
        </linearGradient>
        <linearGradient id="skPorchDoor" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={f.doorColor} />
          <stop offset="1" stopColor="#0F0F14" stopOpacity="0.55" />
        </linearGradient>
        <radialGradient id="skPorchLight" cx="0.5" cy="0.2" r="0.7">
          <stop offset="0" stopColor="#FFD98A" stopOpacity="0.5" />
          <stop offset="1" stopColor="#FFD98A" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* ONE filter, on the static group. Never one per element. */}
      <g className="sk-porch__facade">
        <rect x="-10" y="-10" width="120" height="160" fill="url(#skPorchWall)" />
        {f.porchLight && <rect x="-10" y="-10" width="120" height="120" fill="url(#skPorchLight)" />}

        {/* siding courses */}
        {Array.from({ length: 9 }, (_, i) => (
          <rect key={i} x="-10" y={i * 16} width="120" height="1" fill="rgba(0,0,0,0.16)" />
        ))}

        {/* window — or the plywood you nailed over it on Monday */}
        {win && (state.plywood
          ? (
            <g>
              <rect x={win.x} y={win.y} width={win.w} height={win.h} fill="#6B5638" />
              <rect x={win.x - 1} y={win.y + win.h * 0.3} width={win.w + 2} height="2.4" fill="#4A3A24" transform={`rotate(-8 ${win.x + win.w / 2} ${win.y + win.h / 2})`} />
            </g>
          )
          : (
            <g>
              <rect x={win.x} y={win.y} width={win.w} height={win.h} fill="#8FB6C9" opacity="0.85" />
              <rect x={win.x} y={win.y} width={win.w} height={win.h} fill="none" stroke="#2A2A32" strokeWidth="1.4" />
              <rect x={win.x + win.w / 2 - 0.6} y={win.y} width="1.2" height={win.h} fill="#2A2A32" />
              {peek && <circle cx={win.x + win.w * 0.35} cy={win.y + win.h * 0.5} r="3.4" fill="#FFD65A" opacity="0.6" />}
            </g>
          ))}

        {/* the door */}
        {door && (
          <g className={knocking ? "sk-porch__door is-knocking" : "sk-porch__door"}>
            <rect x={door.x} y={door.y} width={door.w} height={door.h} fill="url(#skPorchDoor)" />
            <rect x={door.x} y={door.y} width={door.w} height={door.h} fill="none" stroke="rgba(0,0,0,0.5)" strokeWidth="1.4" />
            <rect x={door.x + door.w * 0.14} y={door.y + door.h * 0.09} width={door.w * 0.72} height={door.h * 0.3} fill="none" stroke="rgba(0,0,0,0.3)" strokeWidth="1" />
            <rect x={door.x + door.w * 0.14} y={door.y + door.h * 0.48} width={door.w * 0.72} height={door.h * 0.38} fill="none" stroke="rgba(0,0,0,0.3)" strokeWidth="1" />
          </g>
        )}

        {/* the mat */}
        {mat && <rect x={mat.x} y={mat.y} width={mat.w} height={mat.h} fill="#3B342C" />}

        {/* the handle — drawn small, hit big, exactly as on the street */}
        {handle && <circle cx={handle.x + handle.w / 2} cy={handle.y + handle.h / 2} r="1.9" fill="#D8C78A" />}
      </g>

      {/* YOUR HANGER, where you actually put it this morning. */}
      {lead && lead !== "none" && (
        <Hanger lead={lead} handle={handle} mat={mat} win={win} />
      )}

      {state.noSolicit && (
        <g>
          <rect x="6" y="30" width="17" height="12" rx="1.4" fill="#D9D2C4" />
          <rect x="8.5" y="33" width="12" height="1.8" fill="#B4342F" />
          <rect x="8.5" y="36.4" width="9" height="1.4" fill="#8A8378" />
          <rect x="8.5" y="38.8" width="11" height="1.4" fill="#8A8378" />
        </g>
      )}
    </svg>
  );
}

function Hanger({ lead, handle, mat, win }) {
  let cx, cy, rot = 0;
  if (lead === "hot" && handle) { cx = handle.x + handle.w / 2; cy = handle.y + handle.h / 2 + 5; }
  else if (lead === "hostile" && win) { cx = win.x + win.w / 2; cy = win.y + win.h / 2; rot = 18; }
  else if (lead === "dead") { cx = 12; cy = 128; rot = 72; }
  else if (mat) { cx = mat.x + mat.w / 2; cy = mat.y + mat.h / 2; rot = 6; }
  else return null;

  const tint = LEAD_TINT[lead] || "#E8DCC0";
  return (
    <g className={lead === "hot" ? "sk-porch__hanger is-swinging" : "sk-porch__hanger"} transform={`translate(${cx} ${cy}) rotate(${rot})`}>
      <rect x="-3.4" y="-6.2" width="6.8" height="12.4" rx="1" fill={tint} />
      <circle cx="0" cy="-3.4" r="1.5" fill="rgba(0,0,0,0.45)" />
      <rect x="-2.2" y="0.4" width="4.4" height="0.9" fill="rgba(0,0,0,0.25)" />
      <rect x="-2.2" y="2.4" width="3.2" height="0.9" fill="rgba(0,0,0,0.2)" />
    </g>
  );
}

/* ── the block strip ──────────────────────────────────────────────────────
   Twenty doors, each showing the hanger you actually threw. The lead state
   MUST read by silhouette and colour alone at this size — that is the hedge
   against the canvas street and this SVG ever drifting apart on art. */
export function BlockDoor({ house, state = {}, lead, size = 44 }) {
  const f = house.facade;
  const tint = lead ? LEAD_TINT[lead] : null;
  return (
    <svg width={size} height={size * 1.3} viewBox="0 0 30 39" aria-hidden="true">
      <rect x="0" y="0" width="30" height="39" rx="3" fill={f.siding} opacity="0.55" />
      <rect x="8" y="7" width="14" height="28" rx="1.4" fill={state.sold ? "#1E3A30" : f.doorColor} />
      <circle cx="19" cy="22" r="1.1" fill="#D8C78A" />
      {state.plywood && <rect x="2" y="9" width="5" height="8" fill="#6B5638" />}
      {state.noSolicit && <rect x="2" y="20" width="5" height="4" rx="0.6" fill="#D9D2C4" />}
      {state.sold && (
        <g transform="translate(15 20)"><SoldTick /></g>
      )}
      {tint && (
        <g transform={lead === "hot" ? "translate(19 22)" : lead === "hostile" ? "translate(4.5 12)" : lead === "dead" ? "translate(4 34) rotate(70)" : "translate(15 34)"}>
          <rect x="-2.2" y="-4" width="4.4" height="8" rx="0.8" fill={tint} />
          <circle cx="0" cy="-2.2" r="0.9" fill="rgba(0,0,0,0.5)" />
        </g>
      )}
    </svg>
  );
}

const SoldTick = () => (
  <path d="M-5 0l3.4 3.4L5-4.6" fill="none" stroke="#00FFBF" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
);

/* ── the yard, as a briefing ──────────────────────────────────────────────
   What you can see from the step, and therefore what he is about to throw.
   This is the pre-knock read, and it is why the props in skStreet are data
   and not decoration. */
export function YardTells({ house, revealed = 99 }) {
  return (
    <ul className="sk-tells">
      {house.props.slice(0, revealed).map((p) => (
        <li key={p} className="sk-tells__row">
          <span className="sk-tells__prop">{PROPS[p].label}</span>
          <span className="sk-tells__arrow">→</span>
          <span className="sk-tells__fam" data-fam={PROPS[p].family}>{PROPS[p].family.toUpperCase()}</span>
        </li>
      ))}
    </ul>
  );
}

export default Porch;
