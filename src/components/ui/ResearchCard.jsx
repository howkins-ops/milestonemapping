import React, { useState, useEffect, useRef } from "react";
import { useAppData } from "../../hooks/useAppData.js";
import { playSound } from "../../lib/sounds.js";

function useCountUp(target, duration = 1400, enabled = true) {
  const [count, setCount] = useState(0);
  const [done, setDone] = useState(false);
  const rafRef = useRef(null);

  useEffect(() => {
    if (!enabled || !target) return;
    let start = null;
    const step = (ts) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(step);
      } else {
        setCount(target);
        setDone(true);
      }
    };
    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target, duration, enabled]);

  return { count, done };
}

const COLOR_MAP = {
  cyan:   { border: "rgba(0,240,255,0.3)",   accent: "var(--brand-cyan)",   bg: "rgba(0,240,255,0.04)" },
  gold:   { border: "rgba(250,204,21,0.3)",  accent: "var(--brand-gold)",   bg: "rgba(250,204,21,0.04)" },
  green:  { border: "rgba(0,255,191,0.3)",   accent: "var(--brand-green)",  bg: "rgba(0,255,191,0.04)" },
  purple: { border: "rgba(139,92,246,0.3)",  accent: "var(--brand-purple)", bg: "rgba(139,92,246,0.04)" },
  pink:   { border: "rgba(255,62,219,0.3)",  accent: "var(--brand-pink)",   bg: "rgba(255,62,219,0.04)" },
};

export default function ResearchCard({ card, variant = "inline", showCount = false, className = "", style = {} }) {
  const { settings } = useAppData();
  const [isFlipped, setIsFlipped] = useState(false);
  const reducedMotion = settings?.reducedMotion || false;

  const colors = COLOR_MAP[card?.categoryColor] || COLOR_MAP.cyan;
  const { count, done } = useCountUp(
    showCount ? card?.countTarget : null,
    1400,
    !reducedMotion
  );

  useEffect(() => {
    playSound("insight", settings);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (!card) return null;

  const displayCount = showCount && card.countTarget
    ? (reducedMotion ? card.countTarget : count)
    : null;

  const statWithCount = displayCount !== null
    ? card.stat.replace(String(card.countTarget), String(displayCount))
    : card.stat;

  const outerStyle = {
    borderRadius: 18,
    border: `1px solid ${colors.border}`,
    background: colors.bg,
    overflow: "hidden",
    perspective: "1000px",
    cursor: "pointer",
    ...style
  };

  return (
    <div
      className={className}
      style={outerStyle}
      onClick={() => setIsFlipped((f) => !f)}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setIsFlipped((f) => !f); }}
      role="button"
      tabIndex={0}
      aria-label={`Research insight: ${card.headline}. Press to ${isFlipped ? "go back" : "see the source"}.`}
    >
      <div
        style={{
          transformStyle: "preserve-3d",
          transition: reducedMotion ? "none" : "transform 560ms cubic-bezier(0.4,0,0.2,1)",
          transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
          position: "relative",
          minHeight: 150
        }}
      >
        {/* ── FRONT ── */}
        <div style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden", padding: "22px 22px 18px" }}>
          {/* Category pill */}
          <div style={{ marginBottom: 14 }}>
            <span style={{
              display: "inline-block",
              fontSize: 11,
              fontWeight: 600,
              fontFamily: "var(--font-body)",
              color: colors.accent,
              background: colors.border,
              borderRadius: 99,
              padding: "3px 11px",
              letterSpacing: "0.03em"
            }}>
              {card.icon} {card.category}
            </span>
          </div>

          {/* Headline */}
          <p style={{
            fontSize: "clamp(15px, 2.2vw, 17px)",
            fontFamily: "var(--font-display)",
            fontWeight: 700,
            lineHeight: 1.45,
            color: "var(--text-main)",
            margin: "0 0 14px"
          }}>
            {card.headline}
          </p>

          {/* Stat */}
          <p style={{
            fontSize: 13.5,
            fontFamily: "var(--font-body)",
            fontWeight: 400,
            lineHeight: 1.65,
            color: "var(--text-soft)",
            margin: "0 0 16px",
            borderLeft: `3px solid ${colors.border}`,
            paddingLeft: 12
          }}>
            {displayCount !== null ? (
              <>
                {card.stat.split(String(card.countTarget))[0]}
                <span style={{
                  fontWeight: 700,
                  color: colors.accent,
                  fontSize: 15,
                  transition: "color 0.2s"
                }}>
                  {displayCount}
                </span>
                {card.stat.split(String(card.countTarget)).slice(1).join(String(card.countTarget))}
              </>
            ) : statWithCount}
          </p>

          {/* Footer */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{
              fontSize: 11,
              fontFamily: "var(--font-body)",
              fontWeight: 500,
              color: "var(--text-soft)",
              opacity: 0.65
            }}>
              {card.source}
            </span>
            <span style={{
              fontSize: 11,
              fontFamily: "var(--font-body)",
              color: colors.accent,
              opacity: 0.7
            }}>
              see source →
            </span>
          </div>
        </div>

        {/* ── BACK ── */}
        <div style={{
          backfaceVisibility: "hidden",
          WebkitBackfaceVisibility: "hidden",
          transform: "rotateY(180deg)",
          position: "absolute",
          inset: 0,
          padding: "22px 22px 18px",
          background: colors.bg,
          display: "flex",
          flexDirection: "column",
          gap: 14
        }}>
          <p style={{
            fontSize: 11,
            fontFamily: "var(--font-body)",
            fontWeight: 600,
            color: colors.accent,
            margin: 0,
            letterSpacing: "0.05em",
            textTransform: "uppercase"
          }}>
            The Research
          </p>
          <p style={{
            fontSize: 14,
            fontFamily: "var(--font-body)",
            lineHeight: 1.7,
            color: "var(--text-main)",
            margin: 0
          }}>
            {card.stat}
          </p>
          <p style={{
            fontSize: 12,
            fontFamily: "var(--font-body)",
            fontWeight: 600,
            color: "var(--text-soft)",
            margin: 0
          }}>
            {card.source}
          </p>
          <a
            href={card.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            style={{
              fontSize: 12,
              fontFamily: "var(--font-body)",
              fontWeight: 600,
              color: colors.accent,
              textDecoration: "none",
              borderBottom: `1px solid ${colors.border}`,
              paddingBottom: 1,
              alignSelf: "flex-start",
              marginTop: "auto"
            }}
          >
            View full study ↗
          </a>
          <p style={{
            fontSize: 11,
            fontFamily: "var(--font-body)",
            color: "var(--text-soft)",
            opacity: 0.5,
            margin: 0
          }}>
            ← tap to go back
          </p>
        </div>
      </div>
    </div>
  );
}
