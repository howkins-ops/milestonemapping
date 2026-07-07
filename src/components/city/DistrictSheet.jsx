import React, { useEffect } from "react";
import { MentorSprite, AlchemistSprite } from "../map-quest/kit.jsx";
import { QUARTER_META } from "./cityDistricts.js";
import { MENTORS, getGreeting } from "./cityMentors.js";

// ════════════════════════════════════════════════════════════════════════
// MAPQUEST CITY — District sheet
// Bottom sheet for a tapped district: quarter kicker, lore, live progress
// meter, the resident mentor (greeting + HEAR THE LESSON) and the big
// ENTER action. Scrim tap + Escape close it.
// Locked (powered down) districts keep the sheet but swap the mentor for
// the switch-holder note and the primary CTA for GO TO the previous stop —
// with a quiet "Enter anyway" path, because the One Law is real life first.
// ════════════════════════════════════════════════════════════════════════

function enterLabel(action) {
  const type = action && action.type;
  if (type === "quest") return "BEGIN THE QUEST";
  if (type === "panel") return "OPEN THE HALL";
  return "ENTER DISTRICT";
}

export default function DistrictSheet({
  district,
  locked = false,
  sealed = false, // GATE 2 — the Spire before the city is fully lit
  gateNote = null,
  prevDistrict = null,
  onGoPrev,
  onClose,
  onEnter,
  onLesson,
}) {
  useEffect(() => {
    if (!district) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape") onClose && onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [district, onClose]);

  if (!district) return null;

  const d = district;
  const quarter = QUARTER_META[d.quarter] || null;
  const progress = d.progress || { value: 0, label: "", detail: "", streak: 0 };
  const pct = Math.round(Math.max(0, Math.min(1, Number(progress.value) || 0)) * 100);
  const mentor = MENTORS[d.id] || null;
  const offline = progress.detail === "Connection required";

  return (
    <>
      <div className="mqc-sheet__scrim" onClick={onClose} aria-hidden="true" />
      <div
        className="mqc-sheet mqc-d-sheet"
        style={{ "--d-color": d.color, "--d-glow": d.glow }}
        role="dialog"
        aria-modal="true"
        aria-label={d.name}
      >
        <div className="mqc-sheet__handle" aria-hidden="true" />

        {sealed ? (
          <p className="mqc-kicker mqc-d-sheet__quarter" style={{ color: "#7B2CFF" }}>
            ◈ SEALED — GATE 2
          </p>
        ) : locked ? (
          <p className="mqc-kicker mqc-d-sheet__quarter mqc-d-sheet__quarter--locked">
            ⏻ POWERED DOWN
          </p>
        ) : quarter ? (
          <p className="mqc-kicker mqc-d-sheet__quarter" style={{ color: quarter.accent }}>
            {quarter.label}
          </p>
        ) : null}

        <header className="mqc-d-sheet__head">
          <span className="mqc-d-sheet__glyph" aria-hidden="true">{d.icon}</span>
          <div>
            <h3 className="mqc-d-sheet__name">{d.name}</h3>
            <p className="mqc-d-sheet__sub">{d.sublabel}</p>
          </div>
        </header>

        <p className="mqc-d-sheet__lore">{d.lore}</p>

        <div className="mqc-d-sheet__meter" aria-label={`Progress: ${progress.label}`}>
          <div className="mqc-d-sheet__meterrow">
            <span className="mqc-d-sheet__meterlabel">{progress.label}</span>
            {progress.streak > 0 ? (
              <span className="mqc-d-sheet__streak">🔥 {progress.streak}</span>
            ) : null}
          </div>
          <div
            className="mqc-d-sheet__bar"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={pct}
          >
            <span className="mqc-d-sheet__fill" style={{ width: `${pct}%` }} />
          </div>
          {progress.detail ? (
            <p className={`mqc-d-sheet__detail${offline ? " mqc-d-sheet__detail--offline" : ""}`}>
              {progress.detail}
            </p>
          ) : null}
        </div>

        {sealed ? (
          <div className="mqc-d-sheet__lockednote">
            <p className="mqc-d-sheet__lockedline">
              {gateNote ||
                "The tower answers only to a trained citizen. Light every district and the Spire opens."}
            </p>
          </div>
        ) : locked ? (
          <div className="mqc-d-sheet__lockednote">
            <p className="mqc-d-sheet__lockedline">
              {prevDistrict
                ? `${(MENTORS[prevDistrict.id] && MENTORS[prevDistrict.id].name) || "The mentor"} of ${prevDistrict.name} holds the switch — hear their lesson and make one real move there to light this street.`
                : "This street hasn't been powered on yet."}
            </p>
          </div>
        ) : mentor ? (
          <div className="mqc-d-sheet__mentor">
            <span className="mqc-d-sheet__mentorsprite" aria-hidden="true">
              {mentor.spriteVariant === "alchemist" ? (
                <AlchemistSprite size={64} />
              ) : (
                <MentorSprite size={58} color={mentor.color} staff />
              )}
            </span>
            <div className="mqc-d-sheet__mentortxt">
              <p className="mqc-d-sheet__mentorname">{mentor.name}</p>
              <p className="mqc-d-sheet__mentorline">“{getGreeting(mentor)}”</p>
              <button
                type="button"
                className="mqc-btn mqc-d-sheet__lessonbtn"
                onClick={() => onLesson && onLesson(d)}
              >
                Hear the lesson
              </button>
            </div>
          </div>
        ) : null}

        {sealed ? (
          <button
            type="button"
            className="mqc-btn mqc-btn--primary mqc-d-sheet__enter"
            onClick={onClose}
          >
            BACK TO TRAINING
          </button>
        ) : locked && prevDistrict ? (
          <button
            type="button"
            className="mqc-btn mqc-btn--primary mqc-d-sheet__enter"
            onClick={() => onGoPrev && onGoPrev(prevDistrict)}
          >
            GO TO {prevDistrict.name.toUpperCase()}
          </button>
        ) : (
          <button
            type="button"
            className="mqc-btn mqc-btn--primary mqc-d-sheet__enter"
            onClick={() => onEnter && onEnter(d)}
          >
            {enterLabel(d.action)}
          </button>
        )}

        {locked && !sealed ? (
          <button
            type="button"
            className="mqc-d-sheet__enteranyway"
            onClick={() => onEnter && onEnter(d)}
          >
            Enter anyway →
          </button>
        ) : null}
      </div>
    </>
  );
}
