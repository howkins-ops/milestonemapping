import React, { useCallback, useEffect, useRef, useState } from "react";
import { useAppData } from "../../../hooks/useAppData.js";
import { listChallenges, joinChallenge, challengeCheckin } from "../../../lib/zoneService.js";
import { zoneErrorMessage } from "../../../lib/zoneFire.js";
import { playSound } from "../../../lib/sounds.js";
import ZoneEmpty from "../shared/ZoneEmpty.jsx";
import ChallengeCreate from "./ChallengeCreate.jsx";
import ChallengeDetail from "./ChallengeDetail.jsx";

// Challenges tab: my active fires, ones I can join, and finished arcs.
export default function ChallengesPanel({ go, challengeId }) {
  const { addXP, celebrate, pushToast, settings } = useAppData();
  const [data, setData] = useState({ active: [], available: [], completed: [] });
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [busyId, setBusyId] = useState(null);
  const aliveRef = useRef(true);

  const load = useCallback(
    async (showError = true) => {
      try {
        const res = await listChallenges();
        if (!aliveRef.current) return;
        setData({
          active: res?.active || [],
          available: res?.available || [],
          completed: res?.completed || [],
        });
      } catch (err) {
        if (aliveRef.current && showError) {
          pushToast({ type: "error", title: "Couldn't load challenges", message: zoneErrorMessage(err) });
        }
      } finally {
        if (aliveRef.current) setLoading(false);
      }
    },
    [pushToast]
  );

  useEffect(() => {
    aliveRef.current = true;
    load();
    return () => {
      aliveRef.current = false;
    };
  }, [load]);

  if (challengeId) {
    return <ChallengeDetail challengeId={challengeId} onBack={() => go("challenges", null)} />;
  }

  const doJoin = async (c) => {
    setBusyId(c.id);
    try {
      await joinChallenge(c.id);
      playSound("pop", settings);
      await load(false);
    } catch (err) {
      pushToast({ type: "error", title: "Couldn't join", message: zoneErrorMessage(err) });
    } finally {
      if (aliveRef.current) setBusyId(null);
    }
  };

  const doCheckin = async (c) => {
    setBusyId(c.id);
    try {
      const res = await challengeCheckin(c.id);
      if (res?.xp_earned) addXP(res.xp_earned, "Challenge check-in");
      playSound("chime", settings);
      if (res?.completed) {
        celebrate({
          variant: "reward",
          title: "🏆 Challenge complete",
          subtitle: `${c.title} — every day, witnessed.`,
        });
      }
      await load(false);
    } catch (err) {
      pushToast({ type: "error", title: "Check-in didn't land", message: zoneErrorMessage(err) });
    } finally {
      if (aliveRef.current) setBusyId(null);
    }
  };

  if (loading) {
    return <div className="zn-empty">Fetching the fires…</div>;
  }

  const empty = !data.active.length && !data.available.length && !data.completed.length;

  return (
    <div className="zn-stagger">
      {creating ? (
        <ChallengeCreate
          onCreated={() => {
            setCreating(false);
            load(false);
          }}
          onCancel={() => setCreating(false)}
        />
      ) : (
        <button type="button" className="zn-btn" onClick={() => setCreating(true)}>
          ＋ New challenge
        </button>
      )}

      {empty && !creating && <ZoneEmpty which="challenges" icon="🏆" />}

      {data.active.length > 0 && (
        <>
          <div className="zn-dayhead">Active</div>
          {data.active.map((c) => {
            const total = Math.max(1, Number(c.duration_days) || 1);
            const done = Number(c.my_days_done ?? c.days_done ?? 0);
            const pct = Math.min(100, Math.round((done / total) * 100));
            const checked = !!(c.checked_today ?? c.checked_in_today);
            return (
              <div key={c.id} className="zn-card">
                <button
                  type="button"
                  className="zn-row"
                  style={{ marginBottom: 10 }}
                  onClick={() => go("challenges", c.id)}
                >
                  <div className="zn-row__thumb" aria-hidden="true">{c.icon || "🏆"}</div>
                  <div className="zn-row__body">
                    <div className="zn-row__title">{c.title}</div>
                    <div className="zn-row__meta">{endsLabel(c.ends_on)}</div>
                  </div>
                  <span className="zn-chip zn-chip--fire">⭐ {Number(c.my_points ?? c.points ?? 0)}</span>
                </button>
                <div className="zn-meter" aria-label={`${done} of ${total} days done`}>
                  <div className="zn-meter__fill" style={{ width: `${pct}%` }} />
                </div>
                <p className="zn-hint" style={{ margin: "6px 0 10px" }}>
                  {done} / {total} days in the fire
                </p>
                <button
                  type="button"
                  className="zn-btn"
                  onClick={() => doCheckin(c)}
                  disabled={checked || busyId === c.id}
                >
                  {checked ? "✓ Checked in today" : busyId === c.id ? "Checking in…" : "Check in today"}
                </button>
              </div>
            );
          })}
        </>
      )}

      {data.available.length > 0 && (
        <>
          <div className="zn-dayhead">Available</div>
          {data.available.map((c) => (
            <div key={c.id} className="zn-row" style={{ cursor: "default" }}>
              <div className="zn-row__thumb" aria-hidden="true">{c.icon || "🏆"}</div>
              <div className="zn-row__body">
                <div className="zn-row__title">{c.title}</div>
                <div className="zn-row__meta">
                  {Number(c.duration_days) || "?"} days
                  {c.member_count ? ` · ${c.member_count} in` : ""}
                </div>
              </div>
              <button
                type="button"
                className="zn-btn zn-btn--small"
                onClick={() => doJoin(c)}
                disabled={busyId === c.id}
              >
                {busyId === c.id ? "Joining…" : "Join"}
              </button>
            </div>
          ))}
        </>
      )}

      {data.completed.length > 0 && (
        <>
          <div className="zn-dayhead">Completed</div>
          {data.completed.map((c) => (
            <button key={c.id} type="button" className="zn-row" onClick={() => go("challenges", c.id)}>
              <div className="zn-row__thumb" aria-hidden="true">🏆</div>
              <div className="zn-row__body">
                <div className="zn-row__title">{c.title}</div>
                <div className="zn-row__meta">{Number(c.duration_days) || "?"} days · finished</div>
              </div>
              <span className="zn-chip">⭐ {Number(c.my_points ?? c.points ?? 0)}</span>
            </button>
          ))}
        </>
      )}
    </div>
  );
}

// "X days left" from an ends_on date key — warm, never alarmist.
export function endsLabel(endsOn) {
  if (!endsOn) return "In progress";
  const end = new Date(`${endsOn}T23:59:59`);
  if (Number.isNaN(end.getTime())) return "In progress";
  const days = Math.max(0, Math.ceil((end.getTime() - Date.now()) / 86400000));
  if (days === 0) return "Ends today";
  return `${days} day${days === 1 ? "" : "s"} left`;
}
