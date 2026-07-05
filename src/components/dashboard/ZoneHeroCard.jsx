import React from "react";

// ════════════════════════════════════════════════════════════════════════
// Dashboard hero for The Accountability Zone. Same full-width feature-card
// footprint as CityHeroCard so the two "main features" (MapQuest City + the
// Zone) read as a matched pair at the top of Command Center. The Zone is the
// daily-use social anchor, so it earns a hero — not a grid tile.
// Self-contained inline styles so the dashboard needs no extra CSS.
// ════════════════════════════════════════════════════════════════════════

export default function ZoneHeroCard({ onEnter }) {
  return (
    <button
      type="button"
      onClick={onEnter}
      aria-label="Enter The Zone"
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
        border: "1px solid rgba(255, 62, 219, 0.32)",
        background: "#0a0010",
        boxShadow:
          "0 0 26px rgba(255, 62, 219, 0.12), 0 14px 34px rgba(0, 0, 0, 0.45)",
      }}
    >
      <img
        src="/assets/phoenix-shrine/phoenix-rising.png"
        alt=""
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition: "right center",
          opacity: 0.6,
        }}
      />
      <span
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(100deg, rgba(6,0,10,0.94) 22%, rgba(6,0,10,0.55) 56%, rgba(255,62,219,0.22))",
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
            color: "var(--brand-pink, #FF3EDB)",
          }}
        >
          Accountability · Daily
        </span>
        <span
          style={{
            fontFamily: 'var(--font-display, "Sora", sans-serif)',
            fontSize: 23,
            fontWeight: 800,
            letterSpacing: "0.06em",
            color: "#fff",
            textShadow: "0 0 18px rgba(255, 62, 219, 0.45)",
          }}
        >
          THE ZONE
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
          Declare it. Prove it. Rise with your people — every single day.
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
            boxShadow: "0 0 20px rgba(255, 62, 219, 0.4)",
          }}
        >
          Enter the Zone →
        </span>
      </span>
    </button>
  );
}
