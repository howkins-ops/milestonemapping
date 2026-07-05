// Dawn Raid — eat-the-frog / morning-momentum game. The first person in your
// squad to log a "frog" (a real proof/check-in) before 9AM local wins the day.
// Server-authoritative: the client only READS the derived board via
// arenaService.dawnState({ squadId }); first-strike is computed from the
// earliest proof before 09:00 local. Missing the sunrise is NEUTRAL and
// instantly recoverable — the day's still wide open, just log your frog.
//
// Ownership: this file + DawnRaid.css only. All game data flows through
// arenaService.js; all witness/notification copy through witnessLines.js.

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useZoneCtx } from "../../../../hooks/useZone.js";
import { useAppData } from "../../../../hooks/useAppData.js";
import { dawnState } from "../../../../lib/arenaService.js";
import { useReveal, useArenaBurst } from "../useArenaFX.js";
import { witnessSay } from "../../witness/witnessLines.js";
import { sfxPop, sfxCoin } from "../../../../lib/sfx.js";
import "./DawnRaid.css";

const todaySeed = () => new Date().toISOString().slice(0, 10);

// Normalize a frog time to a friendly "7:42a" label. Accepts "HH:MM[:SS]",
// an ISO timestamp, or already-formatted strings; returns null if empty.
function frogLabel(raw) {
  if (!raw) return null;
  const str = String(raw);
  // Pull the first HH:MM we can find (handles "07:42:10", ISO "…T07:42:…").
  const m = str.match(/(\d{1,2}):(\d{2})/);
  if (!m) return str;
  let h = Math.max(0, Math.min(23, Number(m[1])));
  const min = m[2];
  const ampm = h < 12 ? "a" : "p";
  let h12 = h % 12;
  if (h12 === 0) h12 = 12;
  return `${h12}:${min}${ampm}`;
}

export default function DawnRaid({ go }) {
  const { member, squads = [] } = useZoneCtx();
  const { celebrate, pushToast } = useAppData();
  const reveal = useReveal();
  const burst = useArenaBurst();

  const squad = squads[0] || null;
  const squadId = squad?.id || squad?.squad_id || null;
  const squadName = squad?.name || "your squad";
  const myUsername = member?.username || null;
  const myName = myUsername ? `@${myUsername}` : "You";

  const [state, setState] = useState(null);
  const [status, setStatus] = useState("loading"); // loading | ready | offline | nosquad | error
  const wonCelebrated = useRef(false);
  const aliveRef = useRef(true);

  const load = useCallback(async () => {
    if (!squadId) {
      setStatus("nosquad");
      return;
    }
    try {
      const res = await dawnState({ squadId });
      if (!aliveRef.current) return;
      if (res && res.offline) {
        setStatus("offline");
        return;
      }
      setState(res || null);
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

  const winnerName = state?.winner_username || null;
  const myFrog = frogLabel(state?.my_frog_time);
  const myWon = Boolean(state?.my_won_today);
  const streak = Math.max(0, Number(state?.streak) || 0);
  const board = Array.isArray(state?.board) ? state.board : [];

  // Whether the sunrise window has already been claimed by anyone today.
  const claimed = Boolean(winnerName);

  // Celebrate a fresh first-strike exactly once per mount/day.
  useEffect(() => {
    if (status !== "ready") return;
    if (myWon && !wonCelebrated.current) {
      wonCelebrated.current = true;
      try {
        sfxCoin();
      } catch {
        /* audio never blocks */
      }
      const line = witnessSay("dawn_first", {
        name: myName,
        squad: squadName,
        today: todaySeed(),
      }).line;
      celebrate?.({
        variant: "reward",
        title: "FIRST STRIKE 🌅",
        subtitle: `You beat ${squadName} to the sunrise${myFrog ? ` at ${myFrog}` : ""}.`,
        detail: line,
      });
    }
    if (!myWon) wonCelebrated.current = false;
  }, [status, myWon, myName, squadName, myFrog, celebrate]);

  // Neutral, encouraging status line under the hero.
  const statusLine = useMemo(() => {
    if (myWon) {
      return witnessSay("dawn_first", {
        name: myName,
        squad: squadName,
        today: todaySeed(),
      }).line;
    }
    if (claimed) {
      return witnessSay("dawn_missed", {
        name: myName,
        squad: squadName,
        today: todaySeed(),
      }).line;
    }
    return "Sunrise is still up for grabs. First real proof before 9AM takes the day.";
  }, [myWon, claimed, myName, squadName]);

  const goProve = useCallback(
    (e) => {
      try {
        sfxPop();
      } catch {
        /* noop */
      }
      const x = e?.clientX ?? window.innerWidth / 2;
      const y = e?.clientY ?? window.innerHeight / 2;
      burst(x, y, "#FFB020");
      pushToast?.({
        type: "info",
        title: "Eat the frog 🐸",
        message: "Log your hardest rep first — a real proof is the only thing that lands on the dawn board.",
      });
      go?.("home");
    },
    [burst, pushToast, go]
  );

  return (
    <div className="dawn-wrap" ref={reveal}>
      <button type="button" className="zn-back dawn-back" onClick={() => go?.("arena")}>
        ← Arena
      </button>

      <header className="dawn-head arena-reveal">
        <p className="zn-eyebrow">Dawn Raid · morning momentum</p>
        <h2 className="dawn-title">First frog before 9AM wins the day.</h2>
        <p className="dawn-sub">
          Eat the frog — do the hardest thing first. The earliest real proof anyone
          in {squadName} logs before sunrise takes the crown. Miss it? No loss. The
          day's still yours to light.
        </p>
      </header>

      {status === "loading" && (
        <div className="zn-card dawn-card arena-reveal">
          <div className="dawn-skeleton" aria-hidden="true" />
          <p className="dawn-loadtext">Reading the sunrise board…</p>
        </div>
      )}

      {status === "offline" && (
        <div className="zn-card dawn-card arena-reveal">
          <div className="zn-empty">
            <div className="zn-empty__icon">🌅</div>
            The dawn board's resting while you're offline. Reconnect to see who rose first.
          </div>
        </div>
      )}

      {status === "nosquad" && (
        <div className="zn-card dawn-card arena-reveal">
          <div className="zn-empty">
            <div className="zn-empty__icon">🌅</div>
            Dawn Raid is a squad race. Join or forge a squad, then out-rise them at
            sunrise.
            <div className="dawn-cta">
              <button type="button" className="zn-btn" onClick={() => go?.("squad")}>
                Find your squad
              </button>
            </div>
          </div>
        </div>
      )}

      {status === "error" && (
        <div className="zn-card dawn-card arena-reveal">
          <div className="zn-empty">
            <div className="zn-empty__icon">🌫️</div>
            Couldn't reach the dawn board right now.
            <div className="dawn-cta">
              <button type="button" className="zn-btn zn-btn--ghost" onClick={load}>
                Try again
              </button>
            </div>
          </div>
        </div>
      )}

      {status === "ready" && (
        <>
          {/* Hero — today's sunrise crown */}
          <button
            type="button"
            className={`dawn-hero zn-card ${myWon ? "dawn-hero--mine" : ""} arena-reveal`}
            onClick={goProve}
            aria-label="Post today's proof"
          >
            <span className="dawn-sky" aria-hidden="true">
              <span className="dawn-sun" />
            </span>
            <span className="dawn-heroicon" aria-hidden="true">
              {myWon ? "👑" : claimed ? "🌅" : "🐸"}
            </span>
            <span className="zn-eyebrow dawn-herolabel">
              {claimed ? "Today's first strike" : "Sunrise · unclaimed"}
            </span>
            <span className="dawn-heroname">
              {myWon ? myName : winnerName ? `@${winnerName}` : "Nobody yet"}
            </span>
            {claimed && (
              <span className="zn-chip dawn-herotime">
                {myWon
                  ? myFrog
                    ? `Your frog · ${myFrog}`
                    : "You rose first"
                  : "beat the sunrise crowd"}
              </span>
            )}
            <span className="dawn-herohint">
              {claimed ? "Tap to log your next frog" : "Tap to eat the frog now →"}
            </span>
          </button>

          <p className={`dawn-status ${myWon ? "dawn-status--win" : ""}`}>{statusLine}</p>

          {/* My stats */}
          <div className="dawn-stats arena-reveal">
            <div className="zn-stat dawn-stat">
              <span className="zn-stat__num">{myFrog || "—"}</span>
              <span className="zn-stat__label">Your frog today</span>
            </div>
            <div className="zn-stat dawn-stat">
              <span className="zn-stat__num">{streak}</span>
              <span className="zn-stat__label">
                {streak === 1 ? "Dawn day" : "Dawn streak"}
              </span>
            </div>
            <div className="zn-stat dawn-stat">
              <span className="zn-stat__num">{myWon ? "🌅" : claimed ? "🌤️" : "…"}</span>
              <span className="zn-stat__label">
                {myWon ? "First today" : claimed ? "Beaten to it" : "Wide open"}
              </span>
            </div>
          </div>

          {/* Squad board */}
          <div className="zn-card dawn-card dawn-board arena-reveal">
            <p className="zn-eyebrow">{squadName} · sunrise board</p>
            {board.length > 0 ? (
              <ol className="dawn-list">
                {board.map((row, i) => {
                  const uname = row?.username || row?.name || "someone";
                  const isMe = myUsername && uname === myUsername;
                  const t = frogLabel(row?.frog_time ?? row?.time);
                  const won = Boolean(row?.won ?? (i === 0 && t));
                  return (
                    <li
                      key={row?.user_id || uname || i}
                      className={`dawn-row ${isMe ? "dawn-row--me" : ""} ${
                        won ? "dawn-row--first" : ""
                      }`}
                    >
                      <span className="dawn-rank">{won ? "🌅" : i + 1}</span>
                      <span className="zn-avatar dawn-rowavatar">
                        {(uname[0] || "?").toUpperCase()}
                      </span>
                      <span className="dawn-rowname">
                        @{uname}
                        {isMe && <span className="dawn-rowyou"> · you</span>}
                      </span>
                      <span className="dawn-rowtime">{t || "not yet"}</span>
                    </li>
                  );
                })}
              </ol>
            ) : (
              <div className="zn-empty dawn-emptyboard">
                <div className="zn-empty__icon">🌄</div>
                No frogs logged yet today. Be the one who rises first.
              </div>
            )}
          </div>

          {/* Shame-free recovery CTA — always one tap to the board */}
          <div className="zn-card dawn-card dawn-cta arena-reveal">
            <p className="dawn-ctalead">
              {myWon
                ? "Crown's yours today. Keep the streak alive tomorrow — same time, same fire."
                : "Every proof counts whenever it lands. Log yours and stake tomorrow's sunrise."}
            </p>
            <button type="button" className="zn-btn dawn-provebtn" onClick={goProve}>
              🐸 Post today's proof
            </button>
            <p className="dawn-ctahint">
              Only real check-ins move the dawn board — no empty taps, just the work.
            </p>
          </div>
        </>
      )}
    </div>
  );
}
