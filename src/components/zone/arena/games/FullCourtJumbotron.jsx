// FULL COURT · JUMBOTRON — the arena spectacle layer. Pure presentation on top
// of the working game: nothing in here touches the engine, the clock, sound or
// persistence. FullCourt.jsx decides WHEN a moment fires (and plays its sfx);
// these components only render it big. Every class is prefixed `fcj-` and lives
// in FullCourtJumbotron.css. Transform/opacity animation only (perf law).
//
// Layers (z-index map — fc-balls 80, fc-cine 90, fc-locker 95):
//   fcj-clutch    65  ambient red vignette + final-10 count
//   fcj-callout   70  brief full-screen bonus call-outs ("BUZZER BEATER +15")
//   fcj-dunk      85  tiered combo-dunk takeover at score milestones
//
// Ownership: FullCourt game files only (FullCourt.jsx/.css, FullCourtStats.jsx,
// this file + its css).

import { QUARTER_TARGETS } from "../../../../lib/fullCourtEngine.js";
import "./FullCourtJumbotron.css";

/* ------------------------------------------------------------------ *
 * Combo dunk tiers — escalate at score milestones                    *
 * ------------------------------------------------------------------ */

// intensity 1..10 drives the visual escalation (rings, shake, flare).
export const DUNK_TIERS = [
  { at: 25,  name: "WINDMILL",     glyph: "🌀", theme: "wind",    intensity: 1 },
  { at: 50,  name: "FIRE SLAM",    glyph: "🔥", theme: "fire",    intensity: 2 },
  { at: 75,  name: "THUNDER DUNK", glyph: "⚡", theme: "thunder", intensity: 3 },
  { at: 100, name: "360 CYCLONE",  glyph: "🌪️", theme: "wind",    intensity: 4 },
  { at: 150, name: "METEOR JAM",   glyph: "☄️", theme: "fire",    intensity: 5 },
  { at: 200, name: "PORTAL DUNK",  glyph: "🌌", theme: "portal",  intensity: 6 },
  { at: 250, name: "FROST BITE",   glyph: "❄️", theme: "frost",   intensity: 7 },
  { at: 300, name: "SUPER DUNK",   glyph: "💥", theme: "fire",    intensity: 8 },
  { at: 400, name: "ENERGY CRUSH", glyph: "💠", theme: "portal",  intensity: 9 },
  { at: 500, name: "KING SLAM",    glyph: "👑", theme: "gold",    intensity: 10, legendary: true },
];

/** Highest tier whose milestone this score change crossed, or null. */
export function dunkTierCrossed(prevPoints, points) {
  let hit = null;
  for (const t of DUNK_TIERS) {
    if (prevPoints < t.at && points >= t.at) hit = t;
  }
  return hit;
}

// HOT ZONE — heat streak at/above this reads as "every knock is heavy".
// Visual flag only for now: the 2x scoring hook lands with the outcome-model
// rework, so the board never promises points the engine isn't paying.
export const HOT_ZONE_AT = 4;

/* ------------------------------------------------------------------ *
 * Ticker — live shooting stats strip inside the scoreboard shell      *
 * ------------------------------------------------------------------ */

export function JumboTicker({ shots, onTargetPct, streak, hotZone }) {
  return (
    <div className="fcj-ticker" aria-label="Live shooting stats">
      <span className="fcj-tick">
        <b>{shots}</b> SHOTS
      </span>
      <span className="fcj-tick">
        <b>{onTargetPct}%</b> ON TARGET
      </span>
      <span className={`fcj-tick ${streak > 0 ? "fcj-tick--hot" : ""}`}>
        <b>{streak}</b> STREAK
      </span>
      {hotZone && (
        <span className="fcj-hotzone" role="status">
          🔥 HOT ZONE
        </span>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Call-out — brief full-screen bonus overlay                          *
 * ------------------------------------------------------------------ */

// tone: 'sale' | 'bonus' | 'fire' | 'record' | 'warn'
export function JumboCallout({ callout }) {
  if (!callout) return null;
  return (
    <div key={callout.id} className={`fcj-callout fcj-callout--${callout.tone || "bonus"}`} aria-hidden="true">
      <div className="fcj-callout__inner">
        {callout.glyph && <div className="fcj-callout__glyph">{callout.glyph}</div>}
        <div className="fcj-callout__title">{callout.title}</div>
        {callout.sub && <div className="fcj-callout__sub">{callout.sub}</div>}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Combo dunk takeover — tiered milestone celebration                  *
 * ------------------------------------------------------------------ */

export function JumboDunk({ dunk }) {
  if (!dunk) return null;
  const t = dunk.tier;
  const rings = Math.min(5, 1 + Math.floor(t.intensity / 2));
  return (
    <div
      key={dunk.id}
      className={`fcj-dunk fcj-dunk--${t.theme} ${t.legendary ? "fcj-dunk--legend" : ""}`}
      data-power={t.intensity}
      aria-hidden="true"
    >
      <div className="fcj-dunk__flash" />
      {Array.from({ length: rings }, (_, i) => (
        <span key={i} className="fcj-dunk__ring" style={{ animationDelay: `${i * 90}ms` }} />
      ))}
      <div className="fcj-dunk__inner">
        <div className="fcj-dunk__combo">COMBO DUNK · {t.at} PTS</div>
        <div className="fcj-dunk__ball">
          <span className="fcj-dunk__glyph">{t.glyph}</span>
          <span className="fcj-dunk__bball">🏀</span>
        </div>
        <div className="fcj-dunk__name">{t.name}</div>
        {t.legendary && <div className="fcj-dunk__legend">LEGENDARY</div>}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Clutch time — red vignette + the final-10 countdown                 *
 * ------------------------------------------------------------------ */

export function ClutchLayer({ active, count }) {
  if (!active) return null;
  return (
    <div className="fcj-clutch" aria-hidden="true">
      <div className="fcj-clutch__vignette" />
      {count != null && count > 0 && (
        <div key={count} className="fcj-clutch__count">
          {count}
        </div>
      )}
      {count != null && count > 0 && <div className="fcj-clutch__label">CLUTCH TIME</div>}
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Quarter breakdown — recap strip (buzzer + final screens)            *
 * ------------------------------------------------------------------ */

export function QuarterBreakdown({ quarterLog = [], currentQuarter, currentPoints }) {
  const rows = [];
  let prevPts = 0;
  const logByQ = new Map(quarterLog.map((q) => [q.quarter, q]));
  for (let q = 1; q <= 4; q++) {
    const entry = logByQ.get(q);
    const target = QUARTER_TARGETS[q - 1];
    if (entry) {
      rows.push({
        q,
        pts: Math.max(0, entry.points - prevPts),
        doors: entry.doors,
        target,
        hitTarget: entry.doors >= target,
        won: entry.won,
        state: "done",
      });
      prevPts = entry.points;
    } else if (q === currentQuarter && currentPoints != null) {
      rows.push({ q, pts: Math.max(0, currentPoints - prevPts), target, state: "live" });
    } else {
      rows.push({ q, target, state: "next" });
    }
  }
  return (
    <div className="fcj-qbd" aria-label="Quarter breakdown">
      {rows.map((r) => (
        <div key={r.q} className={`fcj-qbd__cell fcj-qbd__cell--${r.state}`}>
          <span className="fcj-qbd__q">Q{r.q}</span>
          <span className="fcj-qbd__pts">{r.state === "next" ? "—" : r.pts}</span>
          <span className="fcj-qbd__marks">
            {r.state === "done" ? (
              <>
                <i className={r.hitTarget ? "fcj-ok" : "fcj-miss"}>
                  {r.hitTarget ? "✓" : "·"} {r.doors}/{r.target}
                </i>
                <i className={r.won ? "fcj-ok" : "fcj-miss"}>{r.won ? "✓ sale" : "no sale"}</i>
              </>
            ) : r.state === "live" ? (
              <i className="fcj-live">LIVE</i>
            ) : (
              <i className="fcj-next">{r.target} doors</i>
            )}
          </span>
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Final summary banner — game over, goal comparison, sign-off         *
 * ------------------------------------------------------------------ */

const SIGNOFFS = [
  "The math delivered. Same court tomorrow.",
  "You ran the whole game. That's the job.",
  "Every knock got counted. See you at tip-off.",
  "The board doesn't lie — you showed up today.",
  "Game in the books. Your season just grew.",
];

export function JumboFinal({ bx, gameDoors = 48 }) {
  if (!bx) return null;
  const doorsPct = Math.min(100, Math.round((bx.doors / gameDoors) * 100));
  const signoff = SIGNOFFS[bx.points % SIGNOFFS.length];
  return (
    <div className="fcj-final zn-card arena-reveal">
      <div className="fcj-final__label">FINAL</div>
      <div className="fcj-final__score">{bx.points}</div>
      <div className="fcj-final__goal">
        <div className="fcj-final__goalbar" aria-hidden="true">
          <span style={{ width: `${doorsPct}%` }} />
        </div>
        <div className="fcj-final__goaltext">
          {bx.doors} / {gameDoors} doors · {bx.sales} {bx.sales === 1 ? "sale" : "sales"} ·{" "}
          {bx.quartersWon}/4 quarters won
        </div>
      </div>
      <div className="fcj-final__signoff">“{signoff}”</div>
    </div>
  );
}
