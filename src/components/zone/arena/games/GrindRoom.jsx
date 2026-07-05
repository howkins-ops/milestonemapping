// Grind Room — live body-doubling for the squad. "We're both grinding right now."
// The ship-last presence game: no scores, no proof, no leaderboard — just the
// felt sense that you're not working alone. Whoever taps "I'm grinding" lights
// up in the room in real time; a shared session clock shows how long each of
// you has been heads-down. Pure presence, so there is NO game outcome to persist
// — this mode is ephemeral by design and rides Supabase Realtime PRESENCE
// directly (the one arena mode with no az_* RPC, per the build contract). Reads
// nothing from a table; writes nothing to one. Ownership: this file + GrindRoom.css.
//
// Shame-free: leaving is one tap and instant; being the only one grinding is
// framed as "hold the room" not failure. All witness copy via witnessLines.js.
// Performance law §3: one setInterval(1000) clock, transform/opacity only, the
// clock only runs while someone is in the room.

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useZoneCtx } from "../../../../hooks/useZone.js";
import { useAppData } from "../../../../hooks/useAppData.js";
import { supabase } from "../../../../lib/supabase.js";
import { useReveal, useArenaBurst } from "../useArenaFX.js";
import { witnessSay } from "../../witness/witnessLines.js";
import { sfxWhoosh, sfxPop, sfxCoin } from "../../../../lib/sfx.js";
import "./GrindRoom.css";

const todaySeed = () => new Date().toISOString().slice(0, 10);

// mm:ss, rolling up to h:mm:ss past an hour. Guards against clock skew.
function fmtElapsed(sinceMs, nowMs) {
  let total = Math.floor((nowMs - Number(sinceMs || nowMs)) / 1000);
  if (!Number.isFinite(total) || total < 0) total = 0;
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const pad = (n) => String(n).padStart(2, "0");
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
}

export default function GrindRoom({ go }) {
  const { userId, member, fire, squads = [] } = useZoneCtx();
  const { celebrate, pushToast } = useAppData();
  const reveal = useReveal();
  const burst = useArenaBurst();

  const squad = squads[0] || null;
  const squadId = squad?.id || squad?.squad_id || null;
  const squadName = squad?.name || "your squad";
  const myName = member?.username || "you";
  const tint = fire?.tint || "#FF7A1A";

  // status: loading | ready | offline | nosquad
  const [status, setStatus] = useState("loading");
  const [grinders, setGrinders] = useState([]); // [{ user_id, username, since }]
  const [amGrinding, setAmGrinding] = useState(false);
  const [now, setNow] = useState(() => Date.now());

  const channelRef = useRef(null);
  const mySinceRef = useRef(null); // my grind start (ms) — stable across re-tracks
  const celebratedFull = useRef(false);

  // ---- Realtime presence: one channel per squad, keyed by user id ----
  useEffect(() => {
    if (!supabase) {
      setStatus("offline");
      return undefined;
    }
    if (!squadId) {
      setStatus("nosquad");
      return undefined;
    }
    if (!userId) return undefined;

    const channel = supabase.channel(`arena-grind-${squadId}`, {
      config: { presence: { key: String(userId) } },
    });
    channelRef.current = channel;

    const syncFromState = () => {
      const raw = channel.presenceState() || {};
      const byUser = new Map();
      Object.values(raw).forEach((metas) => {
        (metas || []).forEach((meta) => {
          const uid = meta.user_id || meta.key;
          if (!uid) return;
          const since = Number(meta.since) || Date.now();
          const prev = byUser.get(uid);
          // Keep the earliest start if the same user is on multiple tabs.
          if (!prev || since < prev.since) {
            byUser.set(uid, { user_id: uid, username: meta.username || "grinder", since });
          }
        });
      });
      const list = Array.from(byUser.values()).sort((a, b) => a.since - b.since);
      setGrinders(list);
      setAmGrinding(byUser.has(String(userId)));
    };

    channel
      .on("presence", { event: "sync" }, syncFromState)
      .on("presence", { event: "join" }, syncFromState)
      .on("presence", { event: "leave" }, syncFromState)
      .subscribe((s) => {
        if (s === "SUBSCRIBED") setStatus("ready");
      });

    return () => {
      try {
        channel.untrack();
      } catch {
        /* noop */
      }
      supabase.removeChannel(channel);
      channelRef.current = null;
    };
  }, [supabase, squadId, userId]);

  // ---- Shared clock: one 1s tick, only while the room has anyone in it. ----
  useEffect(() => {
    if (grinders.length === 0) return undefined;
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [grinders.length]);

  const startGrinding = useCallback(
    (e) => {
      const channel = channelRef.current;
      if (!channel || amGrinding) return;
      mySinceRef.current = Date.now();
      try {
        sfxWhoosh();
      } catch {
        /* audio never blocks */
      }
      const x = e?.clientX ?? window.innerWidth / 2;
      const y = e?.clientY ?? window.innerHeight / 2;
      burst(x, y, tint);
      channel.track({
        user_id: String(userId),
        username: myName,
        since: mySinceRef.current,
      });
      pushToast?.({
        type: "success",
        title: "You're in the room 🔥",
        message: "Heads down. The squad can see you grinding now.",
      });
    },
    [amGrinding, burst, tint, userId, myName, pushToast]
  );

  const stopGrinding = useCallback(() => {
    const channel = channelRef.current;
    if (!channel || !amGrinding) return;
    try {
      sfxPop();
    } catch {
      /* noop */
    }
    channel.untrack();
    mySinceRef.current = null;
    pushToast?.({
      type: "info",
      title: "Session logged in your head, not on a board",
      message: "You left the room — no score, no shame. Come back anytime.",
    });
  }, [amGrinding, pushToast]);

  // Celebrate once when the whole room is grinding together (2+ people, me in).
  const othersCount = useMemo(
    () => grinders.filter((g) => g.user_id !== String(userId)).length,
    [grinders, userId]
  );

  useEffect(() => {
    if (status !== "ready") return;
    if (amGrinding && othersCount >= 1 && !celebratedFull.current) {
      celebratedFull.current = true;
      try {
        sfxCoin();
      } catch {
        /* noop */
      }
      const line = witnessSay("grind_together", {
        squad: squadName,
        today: todaySeed(),
        name: myName,
      }).line;
      celebrate?.({
        variant: "reward",
        title: "GRINDING TOGETHER",
        subtitle: `You + ${othersCount} more in the room right now.`,
        detail: line,
      });
    }
    // Reset so the next time the room fills it can fire again.
    if (!amGrinding || othersCount === 0) celebratedFull.current = false;
  }, [status, amGrinding, othersCount, squadName, myName, celebrate]);

  const witnessLine =
    status === "ready" && grinders.length > 0
      ? witnessSay("grind_together", { squad: squadName, today: todaySeed(), name: myName }).line
      : "";

  return (
    <div className="grind-wrap" ref={reveal}>
      <button type="button" className="zn-back grind-back" onClick={() => go?.("squad")}>
        ← Squad
      </button>

      <header className="grind-head arena-reveal">
        <p className="zn-eyebrow">Grind Room · Body-doubling</p>
        <h2 className="grind-title">Nobody grinds alone in here</h2>
        <p className="grind-sub">
          Tap in and the squad sees you working — live. No proof, no points, no board. Just
          the oldest productivity hack there is: someone else in the room, heads down, same
          time as you. Leave whenever. This one's about presence, not performance.
        </p>
      </header>

      {status === "loading" && (
        <div className="zn-card grind-card arena-reveal">
          <div className="grind-skeleton" aria-hidden="true" />
          <p className="grind-loadtext">Opening the room…</p>
        </div>
      )}

      {status === "nosquad" && (
        <div className="zn-card grind-card arena-reveal">
          <div className="zn-empty">
            <div className="zn-empty__icon">🧑‍💻</div>
            The Grind Room is a squad space. Join or forge a squad, then you'll have people to
            grind alongside.
            <div className="grind-cta">
              <button type="button" className="zn-btn" onClick={() => go?.("squad")}>
                Find your squad
              </button>
            </div>
          </div>
        </div>
      )}

      {status === "offline" && (
        <div className="zn-card grind-card arena-reveal">
          <div className="zn-empty">
            <div className="zn-empty__icon">🌙</div>
            The room's dark while you're offline. Reconnect and tap in to grind with the squad.
          </div>
        </div>
      )}

      {status === "ready" && (
        <>
          <div
            className={`zn-card zn-card--glow grind-hero ${
              grinders.length > 0 ? "grind-hero--live" : ""
            }`}
          >
            <span className="grind-herodot" aria-hidden="true" />
            <span className="grind-heronum">{grinders.length}</span>
            <span className="grind-herolabel">
              {grinders.length === 1 ? "in the room now" : "in the room now"}
            </span>
            {amGrinding && mySinceRef.current != null && (
              <span className="grind-heroclock">{fmtElapsed(mySinceRef.current, now)}</span>
            )}
          </div>

          {witnessLine && <p className="grind-witness">{witnessLine}</p>}

          <div className="zn-card grind-card arena-reveal">
            <div className="grind-roomhead">
              <p className="zn-eyebrow">Who's grinding</p>
              <span
                className={`zn-chip grind-livechip ${grinders.length > 0 ? "grind-livechip--on" : ""}`}
              >
                {grinders.length > 0 ? "Live 🔴" : "Empty"}
              </span>
            </div>

            {grinders.length === 0 ? (
              <div className="grind-empty">
                The room's quiet. Tap in below and you'll be the one who starts it — the
                others feel it when someone's already working.
              </div>
            ) : (
              <ul className="grind-list">
                {grinders.map((g) => {
                  const mine = g.user_id === String(userId);
                  const name = g.username || "grinder";
                  return (
                    <li
                      key={g.user_id}
                      className={`grind-person ${mine ? "grind-person--me" : ""}`}
                    >
                      <span className="zn-avatar zn-avatar--sm grind-avatar">
                        {(name[0] || "?").toUpperCase()}
                      </span>
                      <span className="grind-personname">
                        @{name}
                        {mine ? " · you" : ""}
                      </span>
                      <span className="grind-persontime" aria-hidden="true">
                        {fmtElapsed(g.since, now)}
                      </span>
                      <span className="grind-personpulse" aria-hidden="true" />
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          <div className="grind-cta grind-cta--sticky">
            {amGrinding ? (
              <>
                <button type="button" className="zn-btn zn-btn--ghost grind-stopbtn" onClick={stopGrinding}>
                  Leave the room
                </button>
                <p className="grind-ctahint">
                  {othersCount > 0
                    ? `You + ${othersCount} more, heads down together. 🔥`
                    : "You're holding the room — the next one in joins you."}
                </p>
              </>
            ) : (
              <>
                <button type="button" className="zn-btn grind-startbtn" onClick={startGrinding}>
                  I'm grinding now 🔥
                </button>
                <p className="grind-ctahint">
                  {grinders.length > 0
                    ? `${grinders.length} already in — tap in and grind with ${squadName}.`
                    : "Be first in. Someone else always joins a room that's already lit."}
                </p>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}
