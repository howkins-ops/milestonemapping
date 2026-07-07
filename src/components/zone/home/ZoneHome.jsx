import React, { useEffect, useState } from "react";
import { useZoneCtx } from "../../../hooks/useZone.js";
import { fetchFeed } from "../../../lib/zoneService.js";
import { getCategory, ZONE_ICONS } from "../../../lib/zoneFire.js";
import Witness from "../witness/Witness.jsx";
import Recommit from "../recommit/Recommit.jsx";
import FireDial from "./FireDial.jsx";
import PhoenixStage from "./PhoenixStage.jsx";
import SquadFireMeter from "./SquadFireMeter.jsx";
import UserChip from "../shared/UserChip.jsx";
import ZoneIcon from "../shared/ZoneIcon.jsx";

const ACTION_CARD_IMAGES = {
  declare: "/assets/zone/action-cards/declare-mission.png",
  proof: "/assets/zone/action-cards/post-proof.png",
  challenges: "/assets/zone/action-cards/challenges.png",
  friends: "/assets/zone/action-cards/friends.png",
};

// Zone Home: the Witness, today's mission, the two big CTAs, fire + phoenix,
// squad momentum, partner strip, and a live feed preview.
export default function ZoneHome({ go, openDeclare, openProof }) {
  const { member, todayMission, todayProofCount, partner, lastNotification } = useZoneCtx();
  const [preview, setPreview] = useState([]);
  const [recommitOpen, setRecommitOpen] = useState(false);
  const [feedBump, setFeedBump] = useState(0);

  useEffect(() => {
    let alive = true;
    fetchFeed({ limit: 3 })
      .then((rows) => alive && setPreview(rows))
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [todayProofCount, lastNotification, feedBump]);

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
            <div className="zn-row__thumb zn-row__thumb--art" aria-hidden="true">
              <ZoneIcon src={cat.art} />
            </div>
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
      <div className="zn-2col zn-action-grid zn-action-grid--primary">
        <ActionCard
          image={ACTION_CARD_IMAGES.declare}
          label={todayMission ? "Edit Mission" : "Declare Mission"}
          onClick={openDeclare}
        />
        <ActionCard
          image={ACTION_CARD_IMAGES.proof}
          label="Post Proof"
          onClick={() => openProof()}
        />
      </div>

      {/* The quiet door back — Shift One */}
      <button
        type="button"
        className="zn-btn zn-btn--ghost zn-btn--small zn-recommit-door"
        onClick={() => setRecommitOpen(true)}
      >
        Broke your word somewhere? → Recommit
      </button>

      {/* Fire + Phoenix */}
      <div className="zn-card">
        <div className="zn-2col" style={{ alignItems: "center" }}>
          <FireDial />
          <PhoenixStage onRecommit={() => setRecommitOpen(true)} />
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
                  ? "Proved today — go celebrate them"
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
            <ZoneIcon src={ZONE_ICONS.partner} className="zn-btn__icon" />
            Pair with a partner
          </button>
        )}
      </div>

      {/* Quick paths */}
      <div className="zn-2col zn-action-grid">
        <ActionCard
          image={ACTION_CARD_IMAGES.challenges}
          label="Challenges"
          onClick={() => go("challenges")}
          compact
        />
        <ActionCard
          image={ACTION_CARD_IMAGES.friends}
          label="Friends"
          onClick={() => go("friends")}
          compact
        />
      </div>

      {/* Live feed preview */}
      {preview.length > 0 && (
        <div className="zn-card">
          <p className="zn-eyebrow">The fire, live</p>
          {preview.map((ev) => (
            <button key={ev.id} type="button" className="zn-row" onClick={() => go("feed")}>
              <div className="zn-row__thumb zn-row__thumb--art" aria-hidden="true">
                <ZoneIcon src={iconForEvent(ev.event_type)} />
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

      {recommitOpen && (
        <Recommit
          onClose={() => setRecommitOpen(false)}
          onDone={() => {
            setRecommitOpen(false);
            setFeedBump((n) => n + 1);
          }}
        />
      )}
    </div>
  );
}

function ActionCard({ image, label, onClick, compact = false }) {
  return (
    <button
      type="button"
      className={`zn-action-card${compact ? " zn-action-card--compact" : ""}`}
      style={{ "--zn-action-img": `url(${image})` }}
      onClick={onClick}
    >
      <span className="zn-action-card__shine" aria-hidden="true" />
      <span className="zn-action-card__label">
        <span>{label}</span>
      </span>
    </button>
  );
}

function iconForEvent(type) {
  switch (type) {
    case "proof": return ZONE_ICONS.proof;
    case "declare": return ZONE_ICONS.declare;
    case "rise": return ZONE_ICONS.fire;
    case "recommit": return ZONE_ICONS.fire;
    case "eruption": return ZONE_ICONS.eruption;
    case "challenge_join":
    case "challenge_complete": return ZONE_ICONS.challenge;
    case "squad_join": return ZONE_ICONS.shield;
    default: return ZONE_ICONS.fire;
  }
}

function labelFor(ev) {
  switch (ev.event_type) {
    case "proof": return "Posted proof";
    case "declare": return "Declared a mission";
    case "rise": return "Rose from the ashes";
    case "recommit": return ev.payload?.declaration || "Recommitted — back in integrity";
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
