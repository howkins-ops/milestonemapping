import React from "react";
import Card from "../ui/Card.jsx";
import Button from "../ui/Button.jsx";
import { isSunday } from "../../lib/dates.js";

export default function SundayReviewAlert({ onNavigate }) {
  if (!isSunday()) return null;

  return (
    <Card
      variant="gold"
      className="anim-glow-pulse"
      style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14, flexWrap: "nowrap" }}
    >
      <div className="row" style={{ gap: 12, minWidth: 0 }}>
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" aria-hidden="true" style={{ flexShrink: 0 }}>
          <path d="M12 3L22 20H2L12 3Z" stroke="var(--brand-gold)" strokeWidth="2" strokeLinejoin="round" fill="rgba(250,204,21,0.12)" />
          <line x1="12" y1="10" x2="12" y2="15" stroke="var(--brand-gold)" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="12" cy="18" r="1.2" fill="var(--brand-gold)" />
        </svg>
        <p style={{ fontWeight: 600, color: "var(--brand-gold)" }}>
          Sunday Review is live.
        </p>
      </div>
      <Button variant="gold" size="sm" onClick={() => onNavigate("weekly")} style={{ flexShrink: 0, padding: "6px 12px", fontSize: 13 }}>
        Update Map
      </Button>
    </Card>
  );
}
