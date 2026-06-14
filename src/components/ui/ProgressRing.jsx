import React from "react";

export default function ProgressRing({
  value = 0,
  size = 120,
  stroke = 9,
  label,
  subLabel,
  color = "url(#ringGradient)"
}) {
  const percent = Math.max(0, Math.min(100, Number(value) || 0));
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <div
      style={{ position: "relative", width: size, height: size }}
      role="img"
      aria-label={`${label || "Progress"}: ${percent}%`}
    >
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <defs>
          <linearGradient id="ringGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#7B2CFF" />
            <stop offset="100%" stopColor="#00F0FF" />
          </linearGradient>
          <linearGradient id="ringGradientGold" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FACC15" />
            <stop offset="100%" stopColor="#FB923C" />
          </linearGradient>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(0, 240, 255, 0.08)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{
            transition: "stroke-dashoffset 800ms cubic-bezier(0.16, 1, 0.3, 1)",
            filter: "drop-shadow(0 0 6px rgba(123, 44, 255, 0.45))"
          }}
        />
      </svg>
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center"
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 800,
            fontSize: size * 0.21,
            color: "var(--text-main)"
          }}
        >
          {percent}%
        </span>
        {label && (
          <span style={{ fontSize: Math.max(10, size * 0.085), color: "var(--text-muted)" }}>
            {label}
          </span>
        )}
        {subLabel && (
          <span style={{ fontSize: Math.max(9, size * 0.07), color: "var(--text-soft)" }}>
            {subLabel}
          </span>
        )}
      </div>
    </div>
  );
}
