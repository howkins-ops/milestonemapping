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
        <img
          src="/assets/ui/alert-sunday-badge.png"
          alt=""
          onError={(e) => { e.currentTarget.replaceWith(Object.assign(document.createElement("span"), { textContent: "🚨", style: "font-size:18px" })); }}
          style={{ width: 28, height: 28, objectFit: "contain", flexShrink: 0 }}
        />
        <p style={{ fontWeight: 600, color: "var(--brand-gold)" }}>
          Sunday Review is live. Time to update your map.
        </p>
      </div>
      <Button variant="gold" size="sm" onClick={() => onNavigate("weekly")}>
        Update Map
      </Button>
    </Card>
  );
}
