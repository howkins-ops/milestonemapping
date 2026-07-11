import React, { useState } from "react";
import { useZoneCtx } from "../../../hooks/useZone.js";
import { useAppData } from "../../../hooks/useAppData.js";
import { ZONE_ICONS } from "../../../lib/zoneFire.js";
import { riseAgain } from "../../../lib/zoneService.js";
import { pickLine, WITNESS, fillTokens } from "../witness/witnessLines.js";
import { playSound } from "../../../lib/sounds.js";
import { getTodayKey } from "../../../lib/dates.js";
import ZoneIcon from "../shared/ZoneIcon.jsx";

// Your Standing — a calm read of where you are: streak, this week's fire, and
// your current fire level. No "egg", no zero-shaming. The Phoenix only appears
// in ash, where "Rise Again" is a real action (ported from the old PhoenixStage).
export default function StandingStrip({ onRecommit }) {
  const { member, fire, fireDays, refreshState } = useZoneCtx();
  const { settings, celebrate } = useAppData();
  const [busy, setBusy] = useState(false);
  const inAsh = !!member.ash_since;

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
    return <AshStanding member={member} busy={busy} onRise={rise} onRecommit={onRecommit} />;
  }

  const days = Math.max(0, Math.min(7, fireDays));

  return (
    <div className="zn-card zn-standing">
      <p className="zn-eyebrow">Your standing</p>
      <div className="zn-standing__stats">
        <div className="zn-stat">
          <div className="zn-stat__num">{member.zone_streak || 0}</div>
          <div className="zn-stat__label">Day streak</div>
        </div>
        <div className="zn-stat">
          <div className="zn-stat__num">{days}<span className="zn-standing__den">/7</span></div>
          <div className="zn-stat__label">Fire days</div>
        </div>
        <div className="zn-stat">
          <div className="zn-stat__num zn-standing__level">{fire.label}</div>
          <div className="zn-stat__label">Fire level</div>
        </div>
      </div>
      <div className="zn-standing__bar" aria-hidden="true">
        {Array.from({ length: 7 }).map((_, i) => (
          <span key={i} className={`zn-standing__seg${i < days ? " on" : ""}`} />
        ))}
      </div>
      <p className="zn-standing__hint">
        {days === 0
          ? "A clean slate. One kept promise lights the first day."
          : days >= 7
          ? "Seven for seven. The fire is yours this week."
          : `${7 - days} more fire ${7 - days === 1 ? "day" : "days"} for a full week.`}
      </p>
    </div>
  );
}

// The one door out of ash. Rise Again resets the fire; the full Recommit walks
// Shift One first. Ported from the old PhoenixStage ash branch.
function AshStanding({ member, busy, onRise, onRecommit }) {
  return (
    <div className="zn-card zn-standing zn-standing--ash">
      <p className="zn-eyebrow">The ashes</p>
      <div className="zn-standing__ashrow">
        <div className="zn-standing__ashicon zn-ash" aria-hidden="true">
          <ZoneIcon src={ZONE_ICONS.ash} />
        </div>
        <div style={{ minWidth: 0 }}>
          <div className="zn-standing__ashtitle">Ash</div>
          <div className="zn-standing__ashsub">
            {member.fallen_streak > 0
              ? `A ${member.fallen_streak}-day fire lives in these ashes.`
              : "The fire remembers you."}
          </div>
        </div>
      </div>
      <button type="button" className="zn-btn" onClick={onRise} disabled={busy} style={{ marginTop: 12 }}>
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
