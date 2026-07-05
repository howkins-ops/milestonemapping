// Chain of Fire — the squad's shared streak (Duolingo streak × peer obligation,
// with grace built in). The chain only advances on a day when EVERY active
// member checked in; one quiet member holds the link for everyone. Shared Ember
// Freezes let the squad buy a day of grace so one bad day never triggers the
// quit-spiral. Loss-aversion framing, but shame-free: a break is just ash and
// rebuilds in one check-in.
//
// The chain state is DERIVED server-side (az_arena_chain_state) — the client
// only reads it and spends freezes via RPC (az_arena_chain_freeze). Ownership:
// this file + ChainOfFire.css only. All game data flows through arenaService.js;
// all witness/notification copy through witnessLines.js.

import { useCallback, useEffect, useRef, useState } from "react";
import { useZoneCtx } from "../../../../hooks/useZone.js";
import { useAppData } from "../../../../hooks/useAppData.js";
import { chainState, chainFreeze } from "../../../../lib/arenaService.js";
import { useReveal, useArenaBurst } from "../useArenaFX.js";
import { witnessSay } from "../../witness/witnessLines.js";
import { sfxPhoenix, sfxWhoosh, sfxPop } from "../../../../lib/sfx.js";
import "./ChainOfFire.css";

const todaySeed = () => new Date().toISOString().slice(0, 10);

export default function ChainOfFire({ go }) {
  const { member, squads = [] } = useZoneCtx();
  const { celebrate, pushToast } = useAppData();
  const reveal = useReveal();
  const burst = useArenaBurst();

  const squad = squads[0] || null;
  const squadId = squad?.id || squad?.squad_id || null;
  const squadName = squad?.name || "your squad";
  const myName = member?.username ? `@${member.username}` : "You";

  const [chain, setChain] = useState(null);
  const [status, setStatus] = useState("loading"); // loading | ready | offline | nosquad | error
  const [freezing, setFreezing] = useState(false);
  const extendedCelebrated = useRef(false);
  const aliveRef = useRef(true);

  const load = useCallback(async () => {
    if (!squadId) {
      setStatus("nosquad");
      return;
    }
    try {
      const res = await chainState({ squadId });
      if (!aliveRef.current) return;
      if (res && res.offline) {
        setStatus("offline");
        return;
      }
      setChain(res || null);
      setStatus("ready");
    } catch {
      if (aliveRef.current) setStatus("error");
    }
  }, [squadId]);

  useEffect(() => {
    aliveRef.current = true;
    load();
    return () => {
      aliveRef.current = false;
    };
  }, [load]);

  const currentLen = Math.max(0, Number(chain?.current_len) || 0);
  const bestLen = Math.max(currentLen, Number(chain?.best_len) || 0);
  const freezes = Math.max(0, Number(chain?.freezes_remaining) || 0);
  const allIn = Boolean(chain?.all_checked_in_today);
  const members = Array.isArray(chain?.members) ? chain.members : [];
  const pending = members.filter((m) => !m.checked_in);
  const doneCount = members.length - pending.length;

  // Celebrate exactly once when the whole squad has locked in today's link.
  useEffect(() => {
    if (status === "ready" && allIn && currentLen > 0 && !extendedCelebrated.current) {
      extendedCelebrated.current = true;
      try {
        sfxPhoenix();
      } catch {
        /* audio never blocks */
      }
      const line = witnessSay("chain_extended", {
        squad: squadName,
        streak: currentLen,
        today: todaySeed(),
      }).line;
      celebrate?.({
        variant: "reward",
        title: `${currentLen}-DAY CHAIN`,
        subtitle: `Everyone in ${squadName} showed up today — the link holds.`,
        detail: line,
      });
    }
    // Reset the guard once the day is no longer complete so tomorrow can fire.
    if (!allIn) extendedCelebrated.current = false;
  }, [status, allIn, currentLen, squadName, celebrate]);

  const spendFreeze = useCallback(
    async (e) => {
      if (freezing || freezes <= 0) return;
      setFreezing(true);
      const x = e?.clientX ?? window.innerWidth / 2;
      const y = e?.clientY ?? window.innerHeight / 2;
      try {
        sfxWhoosh();
      } catch {
        /* noop */
      }
      burst(x, y, "#3BE0FF");
      try {
        const res = await chainFreeze({ squadId });
        if (!aliveRef.current) return;
        if (res && res.offline) {
          setStatus("offline");
          return;
        }
        setChain(res || chain);
        const line = witnessSay("chain_frozen", {
          squad: squadName,
          streak: Number(res?.current_len ?? currentLen),
          name: myName,
          today: todaySeed(),
        }).line;
        pushToast?.({ type: "success", title: "Chain frozen 🧊", message: line });
      } catch {
        if (aliveRef.current) {
          pushToast?.({
            type: "error",
            title: "Freeze didn't land",
            message: "Couldn't spend an Ember Freeze right now. Try again.",
          });
        }
      } finally {
        if (aliveRef.current) setFreezing(false);
      }
    },
    [freezing, freezes, squadId, chain, squadName, currentLen, myName, burst, pushToast]
  );

  const nudge = useCallback(
    (e) => {
      try {
        sfxPop();
      } catch {
        /* noop */
      }
      const x = e?.clientX ?? window.innerWidth / 2;
      const y = e?.clientY ?? window.innerHeight / 2;
      burst(x, y, "#FF7A1A");
    },
    [burst]
  );

  const goCheckIn = useCallback(() => {
    try {
      sfxWhoosh();
    } catch {
      /* noop */
    }
    pushToast?.({
      type: "info",
      title: "Your link in the chain",
      message: "Post today's proof — that's what keeps the chain alive for everyone.",
    });
    go?.("home");
  }, [go, pushToast]);

  // Neutral, shame-free status line under the counter. Copy via witnessLines.js.
  const witnessLine =
    status === "ready"
      ? allIn
        ? witnessSay("chain_extended", { squad: squadName, streak: currentLen, today: todaySeed() }).line
        : currentLen === 0
        ? witnessSay("chain_broken", { squad: squadName, today: todaySeed() }).line
        : `${pending.length} still to check in — the link holds until midnight.`
      : "";

  const iStillOwe =
    !!member?.username && pending.some((m) => (m.username || "") === member.username);

  return (
    <div className="chain-wrap" ref={reveal}>
      <button type="button" className="zn-back chain-back" onClick={() => go?.("squad")}>
        ← Squad
      </button>

      <header className="chain-head arena-reveal">
        <p className="zn-eyebrow">Chain of Fire · Shared streak</p>
        <h2 className="chain-title">The chain is only as strong as everyone</h2>
        <p className="chain-sub">
          Every active squadmate has to check in today or the link waits. Miss one and the
          chain resets — but that's just ash, and one check-in starts the next. Spend an
          Ember Freeze to buy the whole squad a day of grace.
        </p>
      </header>

      {status === "loading" && (
        <div className="zn-card chain-card arena-reveal">
          <div className="chain-skeleton" aria-hidden="true" />
          <p className="chain-loadtext">Reading the chain…</p>
        </div>
      )}

      {status === "nosquad" && (
        <div className="zn-card chain-card arena-reveal">
          <div className="zn-empty">
            <div className="zn-empty__icon">🔗</div>
            Chain of Fire is a squad streak. Join or forge a squad, then keep the chain
            alive together.
            <div className="chain-cta">
              <button type="button" className="zn-btn" onClick={() => go?.("squad")}>
                Find your squad
              </button>
            </div>
          </div>
        </div>
      )}

      {status === "offline" && (
        <div className="zn-card chain-card arena-reveal">
          <div className="zn-empty">
            <div className="zn-empty__icon">🔗</div>
            The chain is resting while you're offline. Reconnect to see today's link.
          </div>
        </div>
      )}

      {status === "error" && (
        <div className="zn-card chain-card arena-reveal">
          <div className="zn-empty">
            <div className="zn-empty__icon">🌫️</div>
            Couldn't reach the chain right now.
            <div className="chain-cta">
              <button type="button" className="zn-btn zn-btn--ghost" onClick={load}>
                Try again
              </button>
            </div>
          </div>
        </div>
      )}

      {status === "ready" && (
        <>
          <button
            type="button"
            className={`zn-card zn-card--glow chain-hero ${allIn ? "chain-hero--lit" : ""}`}
            onClick={nudge}
            aria-label={`Chain at ${currentLen} days`}
          >
            <span className="chain-heroicon" aria-hidden="true">
              {currentLen > 0 ? "🔗" : "✨"}
            </span>
            <span className="chain-heronum">{currentLen}</span>
            <span className="chain-herolabel">
              {currentLen === 1 ? "day on the chain" : "days on the chain"}
            </span>
            {allIn && <span className="chain-herobadge">🔥 held today</span>}
          </button>

          {witnessLine && <p className="chain-witness">{witnessLine}</p>}

          <div className="zn-2col chain-stats">
            <div className="zn-card zn-stat chain-stat">
              <div className="zn-stat__num">{bestLen}</div>
              <div className="zn-stat__label">Best chain</div>
            </div>
            <div className="zn-card zn-stat chain-stat">
              <div className="zn-stat__num">
                {doneCount}/{members.length || 0}
              </div>
              <div className="zn-stat__label">Checked in today</div>
            </div>
          </div>

          <div className="zn-card chain-card arena-reveal">
            <div className="chain-linkhead">
              <p className="zn-eyebrow">Today's links</p>
              <span className={`zn-chip chain-status ${allIn ? "chain-status--lit" : ""}`}>
                {allIn ? "Chain holds 🔥" : `${pending.length} left`}
              </span>
            </div>

            {members.length === 0 ? (
              <div className="chain-partyempty">
                No active members yet. Once your squad's rolling, everyone's link shows up
                here.
              </div>
            ) : (
              <ul className="chain-links">
                {members.map((m, i) => {
                  const name = m.username || m.name || "Squadmate";
                  const done = Boolean(m.checked_in);
                  const mine = !!member?.username && name === member.username;
                  return (
                    <li
                      key={m.user_id || m.username || i}
                      className={`chain-link ${done ? "chain-link--done" : "chain-link--wait"} ${
                        mine ? "chain-link--me" : ""
                      }`}
                    >
                      <span className="zn-avatar zn-avatar--sm chain-linkavatar">
                        {(name[0] || "?").toUpperCase()}
                      </span>
                      <span className="chain-linkname">
                        @{name}
                        {mine ? " · you" : ""}
                      </span>
                      <span className="chain-linkstate" aria-hidden="true">
                        {done ? "🔗" : "⌛"}
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* Ember Freeze — a shared grace, spent as a squad. Shame-free rescue. */}
          <div className="zn-card chain-freezecard arena-reveal">
            <div className="chain-freezerow">
              <span className="chain-freezeicon" aria-hidden="true">
                🧊
              </span>
              <div className="chain-freezemeta">
                <span className="chain-freezetitle">Ember Freezes</span>
                <span className="chain-freezesub">
                  {freezes > 0
                    ? `${freezes} left · buys the whole squad a day of grace`
                    : "None left — earn more as the chain grows"}
                </span>
              </div>
              <span className="zn-chip chain-freezecount">{freezes}</span>
            </div>
            <button
              type="button"
              className="zn-btn zn-btn--ghost chain-freezebtn"
              onClick={spendFreeze}
              disabled={freezes <= 0 || freezing || allIn}
            >
              {allIn
                ? "Chain's safe today"
                : freezing
                ? "Freezing…"
                : freezes > 0
                ? "Spend an Ember Freeze 🧊"
                : "No freezes left"}
            </button>
          </div>

          {!allIn && (
            <div className="chain-cta chain-cta--sticky">
              <button type="button" className="zn-btn" onClick={goCheckIn}>
                {iStillOwe ? "Add your link — post today's proof" : "Post today's proof"}
              </button>
              <p className="chain-ctahint">
                {iStillOwe
                  ? "The squad's waiting on your check-in to hold the chain."
                  : "You're in for today — every real check-in keeps the chain alive."}
              </p>
            </div>
          )}

          {allIn && (
            <div className="chain-cta">
              <div className="chain-heldbanner">🔥 {squadName} held the line today.</div>
              <button type="button" className="zn-btn zn-btn--ghost" onClick={() => go?.("squad")}>
                Back to the squad
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
