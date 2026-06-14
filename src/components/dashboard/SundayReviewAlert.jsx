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
      style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14, flexWrap: "wrap" }}
    >
      <div className="row" style={{ gap: 12 }}>
        <span style={{ fontSize: 24 }} aria-hidden="true">🚨</span>
        <p style={{ fontWeight: 600, color: "var(--brand-gold)" }}>
          Sunday Review is live. Update the map before the next battle begins.
        </p>
      </div>
      <Button variant="gold" size="sm" onClick={() => onNavigate("weekly")}>
        Start Review
      </Button>
    </Card>
  );
}
