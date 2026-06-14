import React from "react";
import Card from "../ui/Card.jsx";

export default function MilestoneVisionCard({ milestone }) {
  if (!milestone.futureVision) return null;
  return (
    <Card variant="neon">
      <div className="kicker" style={{ marginBottom: 10 }}>
        FUTURE VISION
      </div>
      <h3 style={{ fontSize: 17, marginBottom: 10 }}>This is the person you are becoming.</h3>
      <p className="muted" style={{ lineHeight: 1.7 }}>{milestone.futureVision}</p>
    </Card>
  );
}
