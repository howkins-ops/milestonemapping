import React, { useEffect, useMemo, useState } from "react";
import { MentorSprite, AlchemistSprite } from "../map-quest/kit.jsx";
import "../../styles/cityMentors.css";

// ════════════════════════════════════════════════════════════════════════
// MILESTONE CITY — Mentor Dialog
// Full-screen typed-dialogue lesson scene. The mentor teaches one beat at a
// time; the final panel sends the player into the REAL feature — "the
// lesson ends where the work begins."
//
//   tap / click     → completes the typing line, then advances the beat
//   Escape          → close
//   CTA             → onFinishLesson(mentor) then onEnterDistrict(district)
//   Stay in city    → onFinishLesson(mentor) then onClose()
// ════════════════════════════════════════════════════════════════════════

const TYPE_MS = 18;

function motionOff() {
  try {
    return (
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      document.documentElement.dataset.reducedMotion === "true"
    );
  } catch {
    return false;
  }
}

export default function MentorDialog({
  mentor,
  district,
  onClose,
  onFinishLesson,
  onEnterDistrict,
}) {
  const lesson = mentor && mentor.lesson ? mentor.lesson : null;
  const beats = lesson && Array.isArray(lesson.beats) ? lesson.beats : [];
  const exercise = lesson && lesson.exercise ? lesson.exercise : null;

  const [beatIndex, setBeatIndex] = useState(0);
  const [chars, setChars] = useState(0);
  const [phase, setPhase] = useState(beats.length ? "beats" : "exercise");

  const beat = beats[beatIndex] || null;
  const lines = useMemo(
    () => (beat && Array.isArray(beat.lines) ? beat.lines.map(String) : []),
    [beat]
  );
  const totalChars = useMemo(
    () => lines.reduce((n, l) => n + l.length, 0),
    [lines]
  );
  const typing = phase === "beats" && chars < totalChars;

  // Type the current beat, char by char. Instant when reduced motion.
  useEffect(() => {
    if (!mentor || phase !== "beats") return undefined;
    setChars(0);
    if (motionOff()) {
      setChars(totalChars);
      return undefined;
    }
    const t = setInterval(() => {
      setChars((c) => {
        const next = Math.min(c + 1, totalChars);
        if (next >= totalChars) clearInterval(t);
        return next;
      });
    }, TYPE_MS);
    return () => clearInterval(t);
  }, [mentor, phase, beatIndex, totalChars]);

  // Escape closes.
  useEffect(() => {
    if (!mentor) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape") onClose && onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mentor, onClose]);

  if (!mentor) return null;

  const advance = () => {
    if (phase !== "beats") return;
    if (typing) {
      setChars(totalChars); // first tap completes the line instantly
      return;
    }
    if (beatIndex < beats.length - 1) setBeatIndex(beatIndex + 1);
    else setPhase("exercise");
  };

  const finishAndEnter = (e) => {
    e.stopPropagation();
    onFinishLesson && onFinishLesson(mentor);
    onEnterDistrict && onEnterDistrict(district);
  };

  const finishAndStay = (e) => {
    e.stopPropagation();
    onFinishLesson && onFinishLesson(mentor);
    onClose && onClose();
  };

  // Per-line visible slices for the typing effect.
  let used = 0;
  const rendered = lines.map((full) => {
    const visible = Math.max(0, Math.min(full.length, chars - used));
    used += full.length;
    return { full, text: full.slice(0, visible), started: visible > 0 };
  });
  const lastStarted = rendered.reduce(
    (last, l, i) => (l.started ? i : last),
    -1
  );

  const isAlchemist = mentor.spriteVariant === "alchemist";

  return (
    <div
      className="mqc-m-overlay"
      style={{ "--mqc-m-accent": mentor.color || "#00F0FF" }}
      role="dialog"
      aria-modal="true"
      aria-label={mentor.name}
      onClick={advance}
    >
      <button
        type="button"
        className="mqc-m-close"
        aria-label="Close"
        onClick={(e) => {
          e.stopPropagation();
          onClose && onClose();
        }}
      >
        ×
      </button>

      <div className="mqc-m-panel">
        <div className="mqc-m-stage">
          <div className="mqc-m-pedestal" aria-hidden="true" />
          {isAlchemist ? (
            <AlchemistSprite size={100} />
          ) : (
            <MentorSprite size={92} color={mentor.color} staff />
          )}
        </div>

        <div className="mqc-m-ident">
          <div className="mqc-m-name">{mentor.name}</div>
          {mentor.epithet && (
            <div className="mqc-m-epithet">{mentor.epithet}</div>
          )}
        </div>

        {phase === "beats" && beat && (
          <div className="mqc-m-beat">
            {lesson && lesson.title && (
              <div className="mqc-m-lesson-title">{lesson.title}</div>
            )}
            <div
              className={
                "mqc-m-speaker" +
                (beat.speaker === "YOU" ? " mqc-m-speaker--you" : "")
              }
            >
              {beat.speaker}
            </div>
            <div className="mqc-m-lines">
              {rendered.map((l, i) => (
                <p key={i} className="mqc-m-line">
                  {l.text}
                  {i === lastStarted && (
                    <span className="mqc-m-caret" aria-hidden="true" />
                  )}
                </p>
              ))}
            </div>

            <div className="mqc-m-dots" aria-hidden="true">
              {beats.map((_, i) => (
                <span
                  key={i}
                  className={
                    "mqc-m-dot" +
                    (i === beatIndex
                      ? " mqc-m-dot--active"
                      : i < beatIndex
                      ? " mqc-m-dot--done"
                      : "")
                  }
                />
              ))}
            </div>

            <button
              type="button"
              className="mqc-m-continue"
              onClick={(e) => {
                e.stopPropagation();
                advance();
              }}
            >
              {typing ? "…" : "Continue"}
            </button>
          </div>
        )}

        {phase === "exercise" && (
          <div className="mqc-m-exercise">
            <div className="mqc-m-exercise-kicker">
              The lesson ends where the work begins
            </div>
            {exercise && (
              <p className="mqc-m-exercise-prompt">{exercise.prompt}</p>
            )}
            {exercise && (
              <button
                type="button"
                className="mqc-m-cta"
                onClick={finishAndEnter}
              >
                {exercise.ctaLabel}
              </button>
            )}
            <button type="button" className="mqc-m-stay" onClick={finishAndStay}>
              Stay in the city
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
