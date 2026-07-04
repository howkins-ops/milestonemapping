import React, { useEffect, useMemo, useState } from "react";
import { MentorSprite } from "../map-quest/kit.jsx";
import PlayerSprite from "./world/PlayerSprite.jsx";
import "../../styles/cityMentors.css";

// ════════════════════════════════════════════════════════════════════════
// MAPQUEST WORLD — Story dialog
// A generalized typed-beat scene for journey story moments (the hometown
// beats, future world beats). Same visual grammar and typing behavior as
// MentorDialog (18ms/char, tap completes the line then advances, beat
// dots, reduced-motion instant) and it reuses the mqc-m-* stylesheet —
// but MentorDialog itself stays untouched: the live lesson flow is not a
// place to introduce regressions from generalization.
//
// scene: {
//   title,                        // small kicker over the lines
//   color,                        // accent
//   sprite: "mentor"|"player"|null,
//   speakerName, epithet?,        // identity block
//   beats: [{ speaker, lines[] }],
//   doneLabel?,                   // last beat's continue label
// }
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

export default function StoryDialog({ scene, onDone, onClose }) {
  const beats = scene && Array.isArray(scene.beats) ? scene.beats : [];
  const [beatIndex, setBeatIndex] = useState(0);
  const [chars, setChars] = useState(0);

  const beat = beats[beatIndex] || null;
  const lines = useMemo(
    () => (beat && Array.isArray(beat.lines) ? beat.lines.map(String) : []),
    [beat]
  );
  const totalChars = useMemo(() => lines.reduce((n, l) => n + l.length, 0), [lines]);
  const typing = chars < totalChars;

  useEffect(() => {
    if (!scene) return undefined;
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
  }, [scene, beatIndex, totalChars]);

  useEffect(() => {
    if (!scene || !onClose) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [scene, onClose]);

  if (!scene) return null;

  const lastBeat = beatIndex >= beats.length - 1;

  const advance = () => {
    if (typing) {
      setChars(totalChars);
      return;
    }
    if (!lastBeat) setBeatIndex(beatIndex + 1);
    else if (onDone) onDone();
  };

  let used = 0;
  const rendered = lines.map((full) => {
    const visible = Math.max(0, Math.min(full.length, chars - used));
    used += full.length;
    return { full, text: full.slice(0, visible), started: visible > 0 };
  });
  const lastStarted = rendered.reduce((last, l, i) => (l.started ? i : last), -1);

  return (
    <div
      className="mqc-m-overlay"
      style={{ "--mqc-m-accent": scene.color || "#C9A15E" }}
      role="dialog"
      aria-modal="true"
      aria-label={scene.speakerName || scene.title || "Story"}
      onClick={advance}
    >
      {onClose ? (
        <button
          type="button"
          className="mqc-m-close"
          aria-label="Close"
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
        >
          ×
        </button>
      ) : null}

      <div className="mqc-m-panel">
        <div className="mqc-m-stage">
          <div className="mqc-m-pedestal" aria-hidden="true" />
          {scene.sprite === "mentor" ? (
            <MentorSprite size={92} color={scene.color} staff={false} />
          ) : scene.sprite === "player" ? (
            <PlayerSprite size={58} glow={scene.color} />
          ) : null}
        </div>

        <div className="mqc-m-ident">
          <div className="mqc-m-name">{scene.speakerName}</div>
          {scene.epithet ? <div className="mqc-m-epithet">{scene.epithet}</div> : null}
        </div>

        {beat ? (
          <div className="mqc-m-beat">
            {scene.title ? <div className="mqc-m-lesson-title">{scene.title}</div> : null}
            <div
              className={
                "mqc-m-speaker" + (beat.speaker === "YOU" ? " mqc-m-speaker--you" : "")
              }
            >
              {beat.speaker}
            </div>
            <div className="mqc-m-lines">
              {rendered.map((l, i) => (
                <p key={i} className="mqc-m-line">
                  {l.text}
                  {i === lastStarted && <span className="mqc-m-caret" aria-hidden="true" />}
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
              {typing ? "…" : lastBeat ? scene.doneLabel || "Continue" : "Continue"}
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
