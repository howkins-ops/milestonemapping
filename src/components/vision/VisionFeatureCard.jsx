import React, { useMemo } from "react";
import { useAppData } from "../../hooks/useAppData.js";

// The scattered angles the peek polaroids sit at — small, hand-pinned tilt.
const PEEK_TILT = [-7, 5, -3];
const GHOSTS = [
  { icon: "✈️", tint: "cyan" },
  { icon: "🏡", tint: "purple" },
  { icon: "💎", tint: "pink" },
];

// Rotating "imagine it real" nudge — matches the collage voice.
const PROMPTS = [
  "Picture it like it's already yours.",
  "If it were done — what would you see?",
  "Build the future you can already feel.",
  "See it before you become it.",
];

/**
 * The Vision Board entry point on the home command center. A single official
 * feature card: a peek of the pinned board on the right, the pitch + a big
 * "Open your board" CTA on the left. The whole card navigates to the full
 * corkboard.
 */
export default function VisionFeatureCard({ onNavigate }) {
  const { visionBoard } = useAppData();

  const withImages = useMemo(() => visionBoard.filter((v) => v.imageUrl), [visionBoard]);
  const peek = withImages.slice(0, 3);
  const count = visionBoard.length;

  const prompt = useMemo(() => {
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
    return PROMPTS[dayOfYear % PROMPTS.length];
  }, []);

  const open = () => onNavigate?.("vision");

  return (
    <section
        className="vision-feature anim-slide-up"
        role="button"
        tabIndex={0}
        aria-label="Open your vision board"
        onClick={open}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            open();
          }
        }}
      >
        <div className="vision-feature__glow" aria-hidden="true" />

        <div className="vision-feature__body">
          <p className="vision-feature__kicker">✦ Vision Board</p>
          <h2 className="vision-feature__title">See it before you build it</h2>
          <p className="vision-feature__prompt">{prompt}</p>

          <div className="vision-feature__meta">
            {count > 0 ? (
              <span className="vision-feature__count">
                <strong>{count}</strong> {count === 1 ? "vision" : "visions"} pinned
              </span>
            ) : (
              <span className="vision-feature__count vision-feature__count--empty">
                Your board is waiting
              </span>
            )}
          </div>

          <div className="vision-feature__actions">
            <span className="vision-feature__cta">
              Open your board <span aria-hidden="true">→</span>
            </span>
          </div>
        </div>

        {/* Peek of the corkboard — a few pinned polaroids leaning off the edge */}
        <div className="vision-feature__peek" aria-hidden="true">
          <span className="vision-feature__board" />
          {peek.length > 0
            ? peek.map((item, i) => (
                <span
                  key={item.id}
                  className="vision-feature__polaroid"
                  style={{ "--tilt": `${PEEK_TILT[i % PEEK_TILT.length]}deg`, "--i": i }}
                >
                  <span className="vision-feature__pin" />
                  <img src={item.imageUrl} alt="" loading="lazy" />
                </span>
              ))
            : GHOSTS.map((g, i) => (
                <span
                  key={i}
                  className={`vision-feature__polaroid vision-feature__polaroid--ghost vision-feature__polaroid--${g.tint}`}
                  style={{ "--tilt": `${PEEK_TILT[i % PEEK_TILT.length]}deg`, "--i": i }}
                >
                  <span className="vision-feature__pin" />
                  <span className="vision-feature__ghost-icon">{g.icon}</span>
                </span>
              ))}
        </div>
      </section>
  );
}
