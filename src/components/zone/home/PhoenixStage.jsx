import React, { useState } from "react";
import { useZoneCtx } from "../../../hooks/useZone.js";
import { useAppData } from "../../../hooks/useAppData.js";
import { getNextPhoenixStage, ZONE_ICONS } from "../../../lib/zoneFire.js";
import { riseAgain } from "../../../lib/zoneService.js";
import { pickLine, WITNESS, fillTokens } from "../witness/witnessLines.js";
import { playSound } from "../../../lib/sounds.js";
import { getTodayKey } from "../../../lib/dates.js";
import ZoneIcon from "../shared/ZoneIcon.jsx";

// Phoenix evolution — and the single door out of ash: Rise Again.
// onRecommit opens the same door with the full Shift One walk.
export default function PhoenixStage({ onRecommit }) {
  const { member, phoenix, refreshState } = useZoneCtx();
  const { settings, celebrate } = useAppData();
  const [busy, setBusy] = useState(false);
  const inAsh = !!member.ash_since;
  const next = getNextPhoenixStage(member.longest_zone_streak || 0);

  const rise = async () => {
    setBusy(true);
    try {
      await riseAgain();
      playSound("levelup", settings);
      celebrate({
        variant: "rank",
        title: "The Phoenix Rises",
        subtitle: fillTokens(pickLine(WITNESS.riseCelebration, getTodayKey()), {}),
      });
      await refreshState();
    } finally {
      setBusy(false);
    }
  };

  if (inAsh) {
    return (
      <div className="zn-phoenix">
        <div className="zn-phoenix__icon zn-ash" aria-hidden="true">
          <ZoneIcon src={ZONE_ICONS.ash} />
        </div>
        <div className="zn-phoenix__stage" style={{ color: "var(--text-soft)" }}>Ash</div>
        <div className="zn-phoenix__next">
          {member.fallen_streak > 0 ? `A ${member.fallen_streak}-day fire lives in these ashes.` : "The fire remembers you."}
        </div>
        <button type="button" className="zn-btn" style={{ marginTop: 12 }} onClick={rise} disabled={busy}>
          {!busy && <ZoneIcon src={ZONE_ICONS.fire} className="zn-btn__icon" />}
          {busy ? "Rising…" : "Rise Again"}
        </button>
        {onRecommit && (
          <button
            type="button"
            className="zn-btn zn-btn--ghost zn-btn--small"
            style={{ marginTop: 8 }}
            onClick={onRecommit}
            disabled={busy}
          >
            Rise with a full Recommit →
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="zn-phoenix">
      {phoenix.art ? (
        <img
          src={phoenix.art}
          alt=""
          aria-hidden="true"
          style={{ width: 74, height: 74, objectFit: "contain", filter: "drop-shadow(0 0 16px var(--zfire-glow))" }}
          onError={(e) => {
            e.currentTarget.style.display = "none";
            if (e.currentTarget.nextElementSibling) e.currentTarget.nextElementSibling.style.display = "block";
          }}
        />
      ) : null}
      <div className="zn-phoenix__icon" aria-hidden="true" style={{ display: phoenix.art ? "none" : "block" }}>{phoenix.icon}</div>
      <div className="zn-phoenix__stage">{phoenix.label}</div>
      <div className="zn-phoenix__next">
        {next ? `${next.label} at a ${next.min}-day best` : "The final form. You are the fire."}
      </div>
    </div>
  );
}
