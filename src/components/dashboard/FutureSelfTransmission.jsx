import React, { useMemo } from "react";
import Card from "../ui/Card.jsx";
import { useAppData } from "../../hooks/useAppData.js";
import { DEFAULT_TRANSMISSION, MOTIVATIONAL_COPY } from "../../lib/constants.js";

export default function FutureSelfTransmission({ onNavigate }) {
  const { identity } = useAppData();
  const statement = (identity.powerStatement || "").trim() || DEFAULT_TRANSMISSION;

  // Rotate daily by day-of-year so the attribution changes each day
  const researchAttribution = useMemo(() => {
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
    return MOTIVATIONAL_COPY[dayOfYear % MOTIVATIONAL_COPY.length];
  }, []);

  return (
    <Card
      variant="pink"
      hoverable
      onClick={() => onNavigate("identity")}
      style={{ cursor: "pointer", marginTop: 30 }}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter") onNavigate("identity");
      }}
    >
      <div className="kicker" style={{ color: "var(--brand-pink)", marginBottom: 12 }}>
        ▰▰ INCOMING TRANSMISSION — FUTURE SELF ▰▰
      </div>
      <p
        className="anim-transmission mono"
        style={{
          fontSize: "clamp(16px, 2.4vw, 21px)",
          fontWeight: 600,
          color: "var(--text-main)",
          lineHeight: 1.6
        }}
      >
        “{statement}”
      </p>
      {researchAttribution?.stat && (
        <p className="mono" style={{ fontSize: 10, marginTop: 10, opacity: 0.55, lineHeight: 1.5 }}>
          ↳ {researchAttribution.stat} — {researchAttribution.source}
        </p>
      )}
      <p className="soft" style={{ fontSize: 12, marginTop: 8 }}>
        Signal verified · encrypted channel · tap to edit identity
      </p>
    </Card>
  );
}
