import React, { useCallback, useEffect, useRef, useState } from "react";
import { useZoneCtx } from "../../../hooks/useZone.js";
import { useAppData } from "../../../hooks/useAppData.js";
import { challengeDetail, challengeCheckin } from "../../../lib/zoneService.js";
import { zoneErrorMessage } from "../../../lib/zoneFire.js";
import { playSound } from "../../../lib/sounds.js";
import { endsLabel } from "./ChallengesPanel.jsx";

// One challenge: header, my day-grid, standings, check-in — or, once
// finished, the ceremony view with the final rankings.
export default function ChallengeDetail({ challengeId, onBack }) {
  const { userId } = useZoneCtx();
  const { addXP, celebrate, pushToast, settings } = useAppData();
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const aliveRef = useRef(true);
  const ceremonyCelebratedRef = useRef(false);

  const load = useCallback(
    async (showError = true) => {
      try {
        const res = await challengeDetail(challengeId);
        if (aliveRef.current) setDetail(res || null);
      } catch (err) {
        if (aliveRef.current && showError) {
          pushToast({ type: "error", title: "Couldn't open challenge", message: zoneErrorMessage(err) });
        }
      } finally {
        if (aliveRef.current) setLoading(false);
      }
    },
    [challengeId, pushToast]
  );

  useEffect(() => {
    aliveRef.current = true;
    load();
    return () => {
      aliveRef.current = false;
    };
  }, [load]);

  const ch = detail?.challenge || detail || {};
  const ceremony = detail?.ceremony || null;
  const standings = [...(detail?.standings || detail?.members || [])].sort(
    (a, b) => Number(b.points || 0) - Number(a.points || 0)
  );
  const memberCount = detail?.member_count ?? standings.length;
  const myRow = standings.find((r) => r.user_id === userId);
  const totalDays = Math.max(1, Number(ch.duration_days) || 1);
  const myDaysDone = Number(detail?.my_days_done ?? ch.my_days_done ?? myRow?.days_done ?? 0);
  const checkedToday = !!(detail?.checked_today ?? ch.checked_today ?? myRow?.checked_today);

  // Ceremony fanfare — exactly once per mount.
  useEffect(() => {
    if (ceremony && !ceremonyCelebratedRef.current) {
      ceremonyCelebratedRef.current = true;
      celebrate({
        variant: "reward",
        title: "🏆 Challenge complete",
        subtitle: ch.title || "Every day, witnessed.",
      });
    }
  }, [ceremony, celebrate, ch.title]);

  const doCheckin = async () => {
    if (busy || checkedToday) return;
    setBusy(true);
    try {
      const res = await challengeCheckin(challengeId);
      if (res?.xp_earned) addXP(res.xp_earned, "Challenge check-in");
      playSound("chime", settings);
      if (res?.completed) {
        celebrate({
          variant: "reward",
          title: "🏆 Challenge complete",
          subtitle: `${ch.title || "The challenge"} — every day, witnessed.`,
        });
      }
      await load(false);
    } catch (err) {
      pushToast({ type: "error", title: "Check-in didn't land", message: zoneErrorMessage(err) });
    } finally {
      if (aliveRef.current) setBusy(false);
    }
  };

  if (loading) {
    return (
      <div>
        <button type="button" className="zn-back" onClick={onBack}>‹ Back</button>
        <div className="zn-empty">Opening the challenge…</div>
      </div>
    );
  }

  if (!detail) {
    return (
      <div>
        <button type="button" className="zn-back" onClick={onBack}>‹ Back</button>
        <div className="zn-empty">
          <div className="zn-empty__icon" aria-hidden="true">🏆</div>
          <p style={{ margin: 0 }}>This challenge isn't visible from here.</p>
        </div>
      </div>
    );
  }

  /* ---------- ceremony view ---------- */
  if (ceremony) {
    const rankings = ceremony.rankings || [];
    const winner = ceremony.winner || rankings[0] || null;
    const totalPoints =
      ceremony.total_points ?? rankings.reduce((sum, r) => sum + Number(r.points || 0), 0);
    const winnerName = winner?.display_name || winner?.username;
    return (
      <div className="zn-stagger">
        <button type="button" className="zn-back" onClick={onBack}>‹ Back</button>
        <div className="zn-card zn-card--glow" style={{ textAlign: "center" }}>
          <div style={{ fontSize: 46, lineHeight: 1 }} aria-hidden="true">🏆</div>
          <h3 className="zn-card__title" style={{ margin: "10px 0 6px", fontSize: 18 }}>
            Challenge complete
          </h3>
          <p style={{ margin: 0, fontSize: 14, color: "var(--text-soft)", lineHeight: 1.55 }}>
            {totalPoints} points logged over {totalDays} days by {rankings.length || memberCount} members
          </p>
          {winnerName && (
            <p style={{ margin: "10px 0 0", fontSize: 14.5, color: "var(--text-main)", fontWeight: 700 }}>
              Congratulations to {winnerName} on first place 🔥
            </p>
          )}
        </div>

        {rankings.length > 0 && (
          <div className="zn-card">
            <p className="zn-eyebrow">Final rankings</p>
            {rankings.map((r, i) => (
              <div key={r.user_id || i} className="zn-lb-row">
                <span className={`zn-rank${i < 3 ? ` zn-rank--${i + 1}` : ""}`}>{i + 1}</span>
                <span className="zn-row__title" style={{ flex: 1 }}>
                  {r.display_name || r.username || "someone"}
                </span>
                <span className="zn-lb-row__score">⭐ {Number(r.points || 0)}</span>
              </div>
            ))}
          </div>
        )}

        <button
          type="button"
          className="zn-btn"
          onClick={() => pushToast({ type: "success", title: "It's already lit in the feed 🔥" })}
        >
          Share the story
        </button>
      </div>
    );
  }

  /* ---------- active view ---------- */
  const litDays = litDaySet(detail, ch, myDaysDone, totalDays);

  return (
    <div className="zn-stagger">
      <button type="button" className="zn-back" onClick={onBack}>‹ Back</button>

      <div className="zn-card zn-card--ember">
        <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
          <div className="zn-row__thumb" aria-hidden="true">{ch.icon || "🏆"}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h3 className="zn-card__title" style={{ margin: 0 }}>{ch.title || "Challenge"}</h3>
            {ch.description && (
              <p style={{ margin: "4px 0 0", fontSize: 13.5, color: "var(--text-soft)", lineHeight: 1.5 }}>
                {ch.description}
              </p>
            )}
          </div>
        </div>
        <div className="zn-chipbar" style={{ marginTop: 12 }}>
          <span className="zn-chip zn-chip--fire">{endsLabel(ch.ends_on)}</span>
          <span className="zn-chip">👥 {memberCount} in the fire</span>
        </div>
      </div>

      <div className="zn-card">
        <p className="zn-eyebrow">My days</p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {Array.from({ length: totalDays }, (_, i) => {
            const lit = litDays.has(i);
            return (
              <div
                key={i}
                aria-label={`Day ${i + 1}${lit ? " — done" : ""}`}
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 10.5,
                  fontWeight: 700,
                  color: lit ? "var(--text-main)" : "var(--text-soft)",
                  background: lit ? "var(--zfire-soft)" : "rgba(255,255,255,0.028)",
                  border: lit ? "1.5px solid var(--zfire)" : "1.5px solid transparent",
                  boxShadow: lit ? "0 0 10px -3px var(--zfire-glow)" : "none",
                }}
              >
                {i + 1}
              </div>
            );
          })}
        </div>
        <p className="zn-hint" style={{ marginTop: 8 }}>
          {myDaysDone} / {totalDays} days done
        </p>
      </div>

      {standings.length > 0 && (
        <div className="zn-card">
          <p className="zn-eyebrow">Standings</p>
          {standings.map((r, i) => (
            <div key={r.user_id || i} className="zn-lb-row">
              <span className={`zn-rank${i < 3 ? ` zn-rank--${i + 1}` : ""}`}>{i + 1}</span>
              <span className="zn-row__title" style={{ flex: 1 }}>
                {r.display_name || r.username || "someone"}
                {r.user_id === userId ? " (you)" : ""}
              </span>
              <span className="zn-lb-row__score">⭐ {Number(r.points || 0)}</span>
            </div>
          ))}
        </div>
      )}

      <button type="button" className="zn-btn" onClick={doCheckin} disabled={checkedToday || busy}>
        {checkedToday ? "✓ Checked in today" : busy ? "Checking in…" : "Check in today"}
      </button>
    </div>
  );
}

// Which day-circles light up. Prefers explicit check-in dates (offset from
// starts_on); falls back to lighting the first N when only a count is known.
function litDaySet(detail, ch, myDaysDone, totalDays) {
  const lit = new Set();
  const checkins = detail?.my_checkins || detail?.checkins || null;
  const startsOn = ch.starts_on || ch.started_on;
  if (Array.isArray(checkins) && startsOn) {
    const start = new Date(`${startsOn}T00:00:00`);
    for (const c of checkins) {
      const key = typeof c === "string" ? c : c?.checkin_date || c?.local_date || c?.date;
      if (!key) continue;
      const idx = Math.round((new Date(`${key}T00:00:00`).getTime() - start.getTime()) / 86400000);
      if (idx >= 0 && idx < totalDays) lit.add(idx);
    }
    if (lit.size) return lit;
  }
  for (let i = 0; i < Math.min(myDaysDone, totalDays); i++) lit.add(i);
  return lit;
}
