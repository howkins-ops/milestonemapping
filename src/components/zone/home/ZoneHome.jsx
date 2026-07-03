import React, { useEffect, useState } from "react";
import { useZoneCtx } from "../../../hooks/useZone.js";
import { fetchFeed } from "../../../lib/zoneService.js";
import { getCategory } from "../../../lib/zoneFire.js";
import Witness from "../witness/Witness.jsx";
import FireDial from "./FireDial.jsx";
import PhoenixStage from "./PhoenixStage.jsx";
import SquadFireMeter from "./SquadFireMeter.jsx";
import UserChip from "../shared/UserChip.jsx";

// Zone Home: the Witness, today's mission, the two big CTAs, fire + phoenix,
// squad momentum, partner strip, and a live feed preview.
export default function ZoneHome({ go, openDeclare, openProof }) {
  const { member, todayMission, todayProofCount, partner, lastNotification } = useZoneCtx();
  const [preview, setPreview] = useState([]);

  useEffect(() => {
    let alive = true;
    fetchFeed({ limit: 3 })
      .then((rows) => alive && setPreview(rows))
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [todayProofCount, lastNotification]);

  const cat = todayMission ? getCategory(todayMission.category) : null;
  const missionDone = todayMission?.status === "done" || todayProofCount > 0;

  return (
    <div className="zn-stagger">
      <Witness />

      {/* Today's mission */}
      <div className={`zn-card${todayMission && !missionDone ? " zn-card--ember" : ""}`}>
        <p className="zn-eyebrow">Today's mission</p>
        {todayMission ? (
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div className="zn-row__thumb" aria-hidden="true">{cat.icon}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="zn-row__title" style={{ fontSize: 15.5 }}>{todayMission.title}</div>
              {todayMission.note && <div className="zn-row__meta">{todayMission.note}</div>}
            </div>
            <span className={`zn-chip${missionDone ? " zn-chip--fire" : ""}`}>
              {missionDone ? "✓ Witnessed" : "Declared"}
            </span>
          </div>
        ) : (
          <p style={{ fontSize: 14, color: "var(--text-soft)", margin: 0, lineHeight: 1.55 }}>
            Nothing on the board yet. One true mission is all today asks.
          </p>
        )}
      </div>

      {/* The two big CTAs */}
      <div className="zn-2col" style={{ marginBottom: 12 }}>
        <button type="button" className="zn-btn" onClick={openDeclare}>
          ⚡ {todayMission ? "Edit Mission" : "Declare Mission"}
        </button>
        <button type="button" className="zn-btn" style={{ background: "linear-gradient(120deg, #FF7A1A, var(--brand-magenta))" }} onClick={() => openProof()}>
          📸 Post Proof
        </button>
      </div>

      {/* Fire + Phoenix */}
      <div className="zn-card">
        <div className="zn-2col" style={{ alignItems: "center" }}>
          <FireDial />
          <PhoenixStage />
        </div>
      </div>

      <SquadFireMeter go={go} />

      {/* Partner strip */}
      <div className="zn-card">
        <p className="zn-eyebrow">Accountability partner</p>
        {partner?.link?.status === "active" && partner.partner ? (
          <button type="button" className="zn-row" onClick={() => go("partner")}>
            <UserChip
              member={partner.partner}
              sub={
                partner.partner_proved_today
                  ? "🔥 Proved today — go celebrate them"
                  : "Hasn't posted yet — a warm nudge goes far"
              }
            />
            <span className="zn-chip zn-chip--fire">⚭ {partner.link.partner_streak || 0}</span>
          </button>
        ) : partner?.link?.status === "pending" ? (
          <button type="button" className="zn-row" onClick={() => go("partner")}>
            <div className="zn-row__body">
              <div className="zn-row__title">Partner invite pending</div>
              <div className="zn-row__meta">Tap to view</div>
            </div>
          </button>
        ) : (
          <button type="button" className="zn-btn zn-btn--ghost" onClick={() => go("partner")}>
            ⚭ Pair with a partner
          </button>
        )}
      </div>

      {/* Quick paths */}
      <div className="zn-2col" style={{ marginBottom: 12 }}>
        <button type="button" className="zn-btn zn-btn--ghost" onClick={() => go("challenges")}>🏆 Challenges</button>
        <button type="button" className="zn-btn zn-btn--ghost" onClick={() => go("friends")}>🤝 Friends</button>
      </div>

      {/* Live feed preview */}
      {preview.length > 0 && (
        <div className="zn-card">
          <p className="zn-eyebrow">The fire, live</p>
          {preview.map((ev) => (
            <button key={ev.id} type="button" className="zn-row" onClick={() => go("feed")}>
              <div className="zn-row__thumb" aria-hidden="true">
                {ev.event_type === "proof" ? "📸" : ev.event_type === "declare" ? "⚡" : ev.event_type === "rise" ? "🔥" : "🌋"}
              </div>
              <div className="zn-row__body">
                <div className="zn-row__title">
                  {ev.payload?.title || ev.payload?.caption || labelFor(ev)}
                </div>
                <div className="zn-row__meta">{ev.member?.display_name || ev.member?.username}</div>
              </div>
              <span className="zn-row__time">{timeAgo(ev.created_at)}</span>
            </button>
          ))}
          <button type="button" className="zn-btn zn-btn--ghost zn-btn--small" style={{ margin: "4px auto 0" }} onClick={() => go("feed")}>
            Open the feed →
          </button>
        </div>
      )}
    </div>
  );
}

function labelFor(ev) {
  switch (ev.event_type) {
    case "proof": return "Posted proof";
    case "declare": return "Declared a mission";
    case "rise": return "Rose from the ashes";
    case "eruption": return `${ev.payload?.squad_name || "Squad"} erupted!`;
    case "squad_join": return `Joined ${ev.payload?.squad_name || "a squad"}`;
    case "challenge_join": return `Joined ${ev.payload?.title || "a challenge"}`;
    case "challenge_complete": return `${ev.payload?.title || "Challenge"} complete!`;
    case "weekly_report": return "Shared a weekly report";
    default: return "Something stirred";
  }
}

export function timeAgo(iso) {
  const s = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return "now";
  if (s < 3600) return `${Math.floor(s / 60)}m`;
  if (s < 86400) return `${Math.floor(s / 3600)}h`;
  return `${Math.floor(s / 86400)}d`;
}
