import React, { useCallback, useEffect, useState } from "react";
import { useAppData } from "../../../hooks/useAppData.js";
import { useZoneCtx } from "../../../hooks/useZone.js";
import { squadDetail } from "../../../lib/zoneService.js";
import { zoneErrorMessage } from "../../../lib/zoneFire.js";
import SquadRoster from "./SquadRoster.jsx";
import SquadInviteFriends from "./SquadInviteFriends.jsx";
import Leaderboard from "./Leaderboard.jsx";
import UserChip from "../shared/UserChip.jsx";

function fallbackCopy(text) {
  const ta = document.createElement("textarea");
  ta.value = text;
  ta.style.position = "fixed";
  ta.style.opacity = "0";
  document.body.appendChild(ta);
  ta.select();
  document.execCommand("copy");
  document.body.removeChild(ta);
}

// One squad's home: identity, invite code, group stats, roster, leaderboard.
export default function SquadHome({ squadId, go }) {
  const { pushToast } = useAppData();
  const { userId } = useZoneCtx();
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notMember, setNotMember] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await squadDetail(squadId);
      setDetail(res && !res.offline ? res : null);
      setNotMember(false);
    } catch (err) {
      if (String(err?.message || "").includes("not_member")) {
        setNotMember(true);
      } else {
        pushToast({ type: "error", title: "Couldn't load squad", message: zoneErrorMessage(err) });
      }
    } finally {
      setLoading(false);
    }
  }, [squadId, pushToast]);

  useEffect(() => {
    setLoading(true);
    setDetail(null);
    load();
  }, [load]);

  if (loading) {
    return <div className="zn-empty">Lighting the squad fire…</div>;
  }

  if (notMember || !detail?.squad) {
    return (
      <div className="zn-empty">
        <div className="zn-empty__icon" aria-hidden="true">🛡️</div>
        <p style={{ margin: "0 0 14px" }}>You're not part of that squad — or it moved on.</p>
        <button
          type="button"
          className="zn-btn zn-btn--ghost zn-btn--small"
          style={{ margin: "0 auto" }}
          onClick={() => go("squad", null)}
        >
          ← Back to squads
        </button>
      </div>
    );
  }

  const squad = detail.squad;
  const members = Array.isArray(detail.members) ? detail.members : [];
  const stats = detail.stats || {};
  const myRole = members.find((m) => m.user_id === userId)?.role || "member";

  const copyInvite = async () => {
    const text = `Join my squad "${squad.name}" in the Zone — code: ${squad.invite_code}`;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        fallbackCopy(text);
      }
      pushToast({ type: "success", title: "Invite copied", message: "Send it to someone who shows up." });
    } catch {
      try {
        fallbackCopy(text);
        pushToast({ type: "success", title: "Invite copied", message: "Send it to someone who shows up." });
      } catch {
        pushToast({ type: "error", title: "Couldn't copy", message: "Long-press the code to copy it by hand." });
      }
    }
  };

  return (
    <div className="zn-stagger">
      {/* Header */}
      <div className="zn-card zn-card--glow" style={{ textAlign: "center" }}>
        <div
          style={{ fontSize: 46, lineHeight: 1, filter: "drop-shadow(0 0 14px var(--zfire-glow))" }}
          aria-hidden="true"
        >
          {squad.emblem || "🔥"}
        </div>
        <h2 className="zn-card__title" style={{ fontSize: 19, margin: "8px 0 2px" }}>{squad.name}</h2>
        <p style={{ fontSize: 12.5, color: "var(--text-soft)", margin: "0 0 12px" }}>
          {members.length} member{members.length === 1 ? "" : "s"} in the fire
        </p>
        <div className="zn-code" style={{ marginBottom: 10 }}>{squad.invite_code}</div>
        <button type="button" className="zn-btn zn-btn--ghost" onClick={copyInvite}>
          📋 Copy invite
        </button>
      </div>

      {/* Pull existing friends straight into the squad */}
      <SquadInviteFriends
        squad={squad}
        memberIds={members.map((m) => m.user_id)}
        go={go}
      />

      {/* Group stats */}
      <div className="zn-card">
        <p className="zn-eyebrow">Group stats — last 30 days</p>
        <div className="zn-2col">
          <div className="zn-stat">
            <div className="zn-stat__num">{stats.total_checkins ?? 0}</div>
            <div className="zn-stat__label">Check-ins</div>
          </div>
          <div className="zn-stat">
            <div className="zn-stat__num">{stats.total_points ?? 0}</div>
            <div className="zn-stat__label">Points</div>
          </div>
          <div className="zn-stat">
            <div className="zn-stat__num">{stats.avg_per_day ?? 0}</div>
            <div className="zn-stat__label">Avg / day</div>
          </div>
        </div>
        {stats.early_bird && (
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 10 }}>
            <span style={{ fontSize: 20 }} aria-hidden="true">🌅</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <UserChip member={stats.early_bird} size="sm" sub="Most early bird" />
            </div>
            <span className="zn-chip">{stats.early_bird.count}</span>
          </div>
        )}
        {stats.night_owl && (
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 10 }}>
            <span style={{ fontSize: 20 }} aria-hidden="true">🦉</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <UserChip member={stats.night_owl} size="sm" sub="Most night owl" />
            </div>
            <span className="zn-chip">{stats.night_owl.count}</span>
          </div>
        )}
      </div>

      <SquadRoster squad={squad} members={members} myRole={myRole} onChanged={load} />

      <Leaderboard />

      <div className="zn-2col">
        <button type="button" className="zn-btn zn-btn--ghost" onClick={() => go("messages")}>
          💬 Squad chat
        </button>
        <button type="button" className="zn-btn zn-btn--ghost" onClick={() => go("challenges")}>
          🏆 Start a challenge
        </button>
      </div>
    </div>
  );
}
