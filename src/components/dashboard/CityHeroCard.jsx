import React from "react";
import useAutoPlayVideo from "../../hooks/useAutoPlayVideo.js";

// ════════════════════════════════════════════════════════════════════════
// Dashboard launcher for MapQuest City. Same cinematic video-card pattern
// as MapQuestHero: looping muted bg video + scrim + one clear CTA.
// Self-contained inline styles so the dashboard needs no extra CSS.
// ════════════════════════════════════════════════════════════════════════

export default function CityHeroCard({ onEnter }) {
  const videoRef = useAutoPlayVideo();

  return (
    <button
      type="button"
      onClick={onEnter}
      aria-label="Enter MapQuest City"
      style={{
        position: "relative",
        display: "block",
        width: "100%",
        minHeight: 148,
        marginTop: 14,
        padding: 0,
        borderRadius: "var(--radius-lg, 20px)",
        overflow: "hidden",
        cursor: "pointer",
        textAlign: "left",
        border: "1px solid rgba(0, 240, 255, 0.3)",
        background: "#08000c",
        boxShadow:
          "0 0 26px rgba(0, 240, 255, 0.1), 0 14px 34px rgba(0, 0, 0, 0.45)",
      }}
    >
      <video
        ref={videoRef}
        src="/bg-loop.mp4"
        poster="/bg-loop-poster.jpg"
        muted
        loop
        playsInline
        preload="metadata"
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          opacity: 0.55,
        }}
      />
      <span
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(100deg, rgba(2,0,6,0.92) 20%, rgba(2,0,6,0.55) 55%, rgba(123,44,255,0.25))",
        }}
      />
      <span
        style={{
          position: "relative",
          display: "flex",
          flexDirection: "column",
          gap: 6,
          padding: "20px 22px",
          zIndex: 1,
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-display, "Sora", sans-serif)',
            fontSize: 10.5,
            fontWeight: 700,
            letterSpacing: "0.26em",
            textTransform: "uppercase",
            color: "var(--brand-cyan, #00F0FF)",
          }}
        >
          Open World
        </span>
        <span
          style={{
            fontFamily: 'var(--font-display, "Sora", sans-serif)',
            fontSize: 23,
            fontWeight: 800,
            letterSpacing: "0.06em",
            color: "#fff",
            textShadow: "0 0 18px rgba(0, 240, 255, 0.45)",
          }}
        >
          MAPQUEST CITY
        </span>
        <span
          style={{
            fontFamily: 'var(--font-body, "Manrope", sans-serif)',
            fontSize: 13.5,
            lineHeight: 1.5,
            color: "rgba(242, 240, 244, 0.85)",
            maxWidth: 420,
          }}
        >
          Every feature is a district. The city grows as you do.
        </span>
        <span
          style={{
            alignSelf: "flex-start",
            marginTop: 8,
            padding: "9px 20px",
            borderRadius: 999,
            fontFamily: 'var(--font-display, "Sora", sans-serif)',
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "#fff",
            background:
              "var(--grad-primary, linear-gradient(135deg, #7B2CFF, #D11EFF 30%, #FF3EDB 65%, #00F0FF))",
            boxShadow: "0 0 20px rgba(209, 30, 255, 0.4)",
          }}
        >
          Enter the City →
        </span>
      </span>
    </button>
  );
}
