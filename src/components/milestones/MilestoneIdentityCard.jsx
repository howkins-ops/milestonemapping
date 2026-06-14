import React from "react";
import Card from "../ui/Card.jsx";

export default function MilestoneIdentityCard({ milestone }) {
  if (!milestone.oldIdentity && !milestone.newIdentity) return null;
  return (
    <Card variant="pink">
      <div className="kicker" style={{ color: "var(--brand-pink)", marginBottom: 10 }}>
        IDENTITY SHIFT
      </div>
      <div className="grid-2" style={{ gap: 14 }}>
        {milestone.oldIdentity && (
          <div>
            <p className="field__label" style={{ marginBottom: 6 }}>Leaving behind</p>
            <p className="soft" style={{ textDecoration: "line-through", lineHeight: 1.6 }}>
              {milestone.oldIdentity}
            </p>
          </div>
        )}
        {milestone.newIdentity && (
          <div>
            <p className="field__label" style={{ marginBottom: 6, color: "var(--brand-green)" }}>
              Becoming
            </p>
            <p style={{ color: "var(--text-main)", lineHeight: 1.6 }}>{milestone.newIdentity}</p>
          </div>
        )}
      </div>
      <p className="mono soft" style={{ fontSize: 12, marginTop: 16, fontStyle: "italic" }}>
        “You do not rise to the goal. You rise to the identity that can hold it.”
      </p>
    </Card>
  );
}
