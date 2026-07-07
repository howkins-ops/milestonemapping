import React, { useMemo } from "react";
import { useAppData } from "../../../hooks/useAppData.js";
import { useAlpha } from "./useAlpha.js";
import AlphaCall from "./AlphaCall.jsx";
import CharacterForge from "./CharacterForge.jsx";
import { dayMacros } from "./engine/eatingEngine.js";
import { daySlot, dayIdxFromDate } from "./engine/scheduler.js";
import { HORMONES, condition } from "./engine/hormones.js";
import { JOURNEY } from "./data/journey.js";
import { SCROLLS } from "./data/scrolls.js";
import { PHASES } from "./data/phases.js";
import "../../../styles/alpha.css";

/* ═══════════════════════════════════════════════════════════════
   ALPHA MODE — campaign root (Phase 0).
   Flow: The Call → the Character Forge → the campaign home
   (character sheet · today's targets · hormone dials · the road).
   Phases 1–6 grow this into the full world; the router and the
   persistence contract (useAlpha) are already final.
   ═══════════════════════════════════════════════════════════════ */

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function AlphaMode() {
  const { userId, settings, addXP } = useAppData();
  const alpha = useAlpha(userId);
  const { state } = alpha;

  if (!state.flags.callAnswered) {
    return <AlphaCall settings={settings} onAnswer={() => { alpha.answerCall(); addXP(10, "The Call — answered"); }} />;
  }
  if (!state.flags.forged) {
    return (
      <CharacterForge settings={settings}
        onForge={(v) => { alpha.forgeCharacter(v); addXP(25, "Character forged in the Iron"); }} />
    );
  }
  return <AlphaHome alpha={alpha} />;
}

/* ── the Phase-0 campaign home ── */
function AlphaHome({ alpha }) {
  const { state } = alpha;
  const phase = PHASES[state.phase] || PHASES.prime;

  const todayIdx = dayIdxFromDate();
  const slot = useMemo(() => daySlot(state.phase, state.week, todayIdx), [state.phase, state.week, todayIdx]);
  const macros = useMemo(() => dayMacros({
    weightLb: state.bodyWeight, bodyFatPct: state.bodyFat,
    phaseId: state.phase, week: state.week,
    isWorkoutDay: Boolean(slot?.nutrition.isWorkoutDay),
  }), [state.bodyWeight, state.bodyFat, state.phase, state.week, slot]);

  const cond = condition(state.hormones);
  const callScroll = SCROLLS.find((s) => s.id === "call");

  return (
    <div className="iw-page iw-page-in">
      <div className="iw-eyebrow" style={{ color: phase.accent }}>alpha mode · stage {state.stage}</div>
      <h2 className="iw-display iw-page-title">The Campaign</h2>

      {/* character plate */}
      <div className="iw-al-sheet" style={{ "--iw-al-accent": phase.accent }}>
        <div className="iw-al-sheet-row">
          <div className="iw-al-sheet-stat">
            <span className="iw-al-sheet-num">{macros?.lbm ?? "—"}</span>
            <span className="iw-al-sheet-label">lean mass</span>
          </div>
          <div className="iw-al-sheet-stat">
            <span className="iw-al-sheet-num">{macros ? macros.maintenance.toLocaleString() : "—"}</span>
            <span className="iw-al-sheet-label">maintenance</span>
          </div>
          <div className="iw-al-sheet-stat">
            <span className="iw-al-sheet-num">{cond}</span>
            <span className="iw-al-sheet-label">condition</span>
          </div>
        </div>
      </div>

      {/* today's targets */}
      {macros && (
        <div className="iw-al-card">
          <div className="iw-al-card-head">
            <span className="iw-eyebrow">today · {DAY_LABELS[todayIdx]} · {phase.name} week {state.week}</span>
            <span className={`iw-chip ${slot?.nutrition.isWorkoutDay ? "iw-chip-ember" : ""}`}>
              {slot?.kind === "workout" ? "training day" : slot?.kind === "cardio" ? "cardio day" : "rest day"}
            </span>
          </div>
          <div className="iw-al-macros">
            <div className="iw-al-macro"><span className="iw-al-macro-num">{macros.calories.toLocaleString()}</span><span className="iw-al-macro-label">calories</span></div>
            <div className="iw-al-macro"><span className="iw-al-macro-num">{macros.protein}g</span><span className="iw-al-macro-label">protein</span></div>
            <div className="iw-al-macro"><span className="iw-al-macro-num">{macros.carbs}g</span><span className="iw-al-macro-label">carbs</span></div>
            <div className="iw-al-macro"><span className="iw-al-macro-num">{macros.fat}g</span><span className="iw-al-macro-label">fat</span></div>
          </div>
          <div className="iw-al-fastline">fasting window {slot?.nutrition.fasting} · eat late, train fed by yesterday</div>
        </div>
      )}

      {/* hormone dials */}
      <div className="iw-al-card">
        <div className="iw-eyebrow iw-al-card-title">the hormone codex</div>
        <div className="iw-al-dials">
          {HORMONES.map((h) => {
            const v = state.hormones[h.id] ?? 50;
            return (
              <div key={h.id} className="iw-al-dial">
                <div className="iw-al-dial-top">
                  <span className="iw-al-dial-name">{h.label}</span>
                  <span className="iw-al-dial-val">{v}</span>
                </div>
                <div className="iw-al-dial-track">
                  <div className="iw-al-dial-fill" style={{ width: `${v}%` }} />
                </div>
              </div>
            );
          })}
        </div>
        <div className="iw-al-fastline">dials move when you log sleep, fasts, and training — full codex opens with PRIME</div>
      </div>

      {/* the road — 11 stages */}
      <div className="iw-al-card">
        <div className="iw-eyebrow iw-al-card-title">the road · eleven stages</div>
        <div className="iw-al-road">
          {JOURNEY.map((s) => {
            const zoneAccent = s.zone ? PHASES[s.zone]?.accent : null;
            const isHere = s.n === state.stage;
            const done = s.n < state.stage;
            return (
              <div key={s.n} className={`iw-al-stage ${isHere ? "iw-al-stage-here" : ""} ${done ? "iw-al-stage-done" : ""}`}>
                <span className="iw-al-stage-node" style={zoneAccent ? { "--iw-al-accent": zoneAccent } : undefined}>
                  {done ? "✓" : s.n}
                </span>
                <span className="iw-al-stage-text">
                  <span className="iw-al-stage-title">{s.title}{s.zone ? ` · ${PHASES[s.zone].name}` : ""}</span>
                  {isHere && <span className="iw-al-stage-blurb">{s.blurb}</span>}
                </span>
              </div>
            );
          })}
        </div>
        <div className="iw-al-gate">
          <span className="iw-al-gate-glyph" aria-hidden="true">⚔</span>
          The PRIME gate is sealed — the Threshold opens as the campaign builds out.
          Your sheet, your dials, and your numbers are already live.
        </div>
      </div>

      {/* first scroll */}
      {callScroll && (
        <div className="iw-al-scroll">
          <div className="iw-eyebrow">wisdom scroll · collected</div>
          <div className="iw-al-scroll-line">“{callScroll.line}”</div>
          <div className="iw-al-scroll-voice">— {callScroll.voice}</div>
        </div>
      )}
    </div>
  );
}
