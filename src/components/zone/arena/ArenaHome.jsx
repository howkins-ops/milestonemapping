// ArenaHome — the living Squad Arena screen. This is the redesigned squad
// experience: a crest + fire-tier division, a Chain-of-Fire strip, a Boss HP
// bar, an ACTIVITY board (this week's real fire), a live Vows preview, a
// one-tap fire-bump on the squad's latest win, and the full game Roster.
//
// It is ALSO the arena router: when `gameKey` matches a registry entry it renders
// that game's <Component go={go} /> under a zn-back to the hub; otherwise it shows
// the hub. It does NOT replace/edit SquadHome — it's a new screen (read SquadHome
// only as a data/props reference).
//
// Ownership: ArenaHome.jsx + ArenaHome.css (ah-/arn- prefixes) + ArenaGamesGrid +
// arenaGames only. All game data flows through arenaService.js; leaderboard,
// feed + reactions reuse zoneService.js; witness copy comes from witnessLines.js.
// Every fetch degrades gracefully on { offline:true } / no-squad — never crashes.

import React, { useCallback, useEffect, useRef, useState } from "react";
import { useZoneCtx } from "../../../hooks/useZone.js";
import { useAppData } from "../../../hooks/useAppData.js";
import { getLeaderboard, fetchFeed, react } from "../../../lib/zoneService.js";
import { chainState, bossState, vowList } from "../../../lib/arenaService.js";
import { getArenaGame } from "./arenaGames.js";
import ArenaGamesGrid from "./ArenaGamesGrid.jsx";
import { ArenaSoundToggle } from "./ArenaFX.jsx";
import { useReveal, useArenaBurst } from "./useArenaFX.js";
import { sfxCoin } from "../../../lib/sfx.js";
import UserChip from "../shared/UserChip.jsx";
import "./ArenaHome.css";

const squadIdOf = (s) => (s ? s.id || s.squad_id || null : null);
const isOffline = (r) => !!(r && r.offline);

// ------- the hub -------
function ArenaHub({ go }) {
  const { userId, member, fire, squads = [] } = useZoneCtx();
  const { pushToast } = useAppData();
  const reveal = useReveal();
  const burst = useArenaBurst();

  const squad = squads[0] || null;
  const squadId = squadIdOf(squad);

  const [chain, setChain] = useState(null);
  const [boss, setBoss] = useState(null);
  const [board, setBoard] = useState(null);
  const [vows, setVows] = useState(null);
  const [lastEventId, setLastEventId] = useState(null);
  const [bumped, setBumped] = useState(false);
  const alive = useRef(true);

  useEffect(() => {
    alive.current = true;
    // Activity board is squad-independent (friends + squadmates) — always try.
    (async () => {
      try {
        const rows = await getLeaderboard(7);
        if (alive.current) setBoard(isOffline(rows) ? [] : Array.isArray(rows) ? rows : []);
      } catch {
        if (alive.current) setBoard([]);
      }
    })();
    return () => {
      alive.current = false;
    };
  }, []);

  useEffect(() => {
    if (!squadId) {
      setChain(null);
      setBoss(null);
      setVows(null);
      setLastEventId(null);
      return undefined;
    }
    let on = true;
    (async () => {
      try {
        const c = await chainState({ squadId });
        if (on) setChain(isOffline(c) ? null : c || null);
      } catch {
        if (on) setChain(null);
      }
      try {
        const b = await bossState({ squadId });
        if (on) setBoss(isOffline(b) ? null : b || null);
      } catch {
        if (on) setBoss(null);
      }
      try {
        const v = await vowList({ squadId });
        if (on) setVows(isOffline(v) ? null : v || null);
      } catch {
        if (on) setVows(null);
      }
      try {
        const feed = await fetchFeed({ squadId, limit: 1 });
        if (on) setLastEventId(Array.isArray(feed) && feed[0] ? feed[0].id : null);
      } catch {
        if (on) setLastEventId(null);
      }
    })();
    return () => {
      on = false;
    };
  }, [squadId]);

  // Fire-bump = a real reaction (🔥) on the squad's most recent win. Real-life-first:
  // it lands on a real feed event; no fake scoring. Silent, celebratory, one per tap.
  const fireBump = useCallback(
    async (e) => {
      const x = e?.clientX ?? window.innerWidth / 2;
      const y = e?.clientY ?? window.innerHeight / 2;
      burst(x, y, fire?.tint || "#FF7A1A");
      try {
        sfxCoin();
      } catch {
        /* audio never blocks */
      }
      setBumped(true);
      if (!lastEventId || !userId) return;
      try {
        await react(lastEventId, "🔥", userId);
        pushToast?.({ type: "success", title: "Fire sent", message: "You bumped the squad's last win." });
      } catch {
        /* duplicate/again is harmless — the burst already fired */
      }
    },
    [burst, fire, lastEventId, userId, pushToast]
  );

  const currentLen = Math.max(0, Number(chain?.current_len) || 0);
  const chainMembers = Array.isArray(chain?.members) ? chain.members : [];
  const chainDone = chainMembers.filter((m) => m.checked_in).length;
  const chainAll = Boolean(chain?.all_checked_in_today);

  const maxHp = Math.max(1, Number(boss?.max_hp) || 0);
  const hp = Math.max(0, Math.min(maxHp, Number(boss?.hp ?? boss?.max_hp) || 0));
  const bossPct = Math.round((hp / maxHp) * 100);
  const bossSlain = !!boss?.defeated_at || (boss && hp <= 0);

  const liveVows = Array.isArray(vows?.live) ? vows.live : [];

  const crest = squad?.emblem || "🔥";
  const squadName = squad?.name || "No squad yet";

  return (
    <div className="ah-hub zn-stagger" ref={reveal}>
      {/* Crest + division */}
      <header className="ah-crest zn-card zn-card--glow">
        <ArenaSoundToggle className="ah-sound" />
        <p className="zn-eyebrow ah-eyebrow">The Squad Arena</p>
        <div className="ah-crest__emblem" aria-hidden="true">
          {crest}
        </div>
        <h2 className="ah-crest__name">{squadName}</h2>
        <div className="ah-division">
          <span className={`ah-tier ah-tier--${fire?.key || "cold"}`} aria-hidden="true" />
          <span className="ah-division__label">
            {fire?.label || "Cold"} division
          </span>
        </div>
        {!squadId && (
          <p className="ah-crest__hint">
            Solo games are open below. Forge or join a squad to light up the co-op arenas.
          </p>
        )}
      </header>

      {squadId && (
        <>
          {/* Chain of Fire strip */}
          <button
            type="button"
            className={`ah-strip zn-card ${chainAll ? "ah-strip--lit" : ""}`}
            onClick={() => go && go("arena", "chain_of_fire")}
          >
            <span className="ah-strip__icon" aria-hidden="true">
              {currentLen > 0 ? "🔗" : "✨"}
            </span>
            <span className="ah-strip__body">
              <span className="ah-strip__eyebrow">Chain of Fire</span>
              <span className="ah-strip__big">
                {currentLen}
                <em>{currentLen === 1 ? " day" : " days"}</em>
              </span>
              <span className="ah-strip__sub">
                {chain
                  ? chainAll
                    ? "Everyone showed up today — the link holds."
                    : `${chainDone}/${chainMembers.length || 0} checked in today`
                  : "Reading the chain…"}
              </span>
            </span>
            <span className="ah-strip__go" aria-hidden="true">
              →
            </span>
          </button>

          {/* Boss HP bar */}
          <button
            type="button"
            className="ah-boss zn-card"
            onClick={() => go && go("arena", "boss_forge")}
          >
            <div className="ah-boss__row">
              <span className="ah-boss__eyebrow">This week's boss</span>
              <span className="zn-chip ah-boss__hp">
                {bossSlain ? "Slain" : `${hp}/${maxHp} HP`}
              </span>
            </div>
            <div className="zn-meter ah-boss__meter">
              <span
                className={`zn-meter__fill ah-boss__fill ${bossSlain ? "ah-boss__fill--slain" : ""}`}
                style={{ width: `${bossSlain ? 0 : bossPct}%` }}
              />
            </div>
            <span className="ah-boss__sub">
              {boss
                ? bossSlain
                  ? "The squad felled it — a new one rises next week."
                  : "Every real check-in lands a hit. Tap to join the fight."
                : "No boss stirring yet — check in to summon this week's."}
            </span>
          </button>

          {/* Live Vows preview */}
          <div className="ah-vows zn-card">
            <div className="ah-vows__head">
              <p className="zn-eyebrow">Live vows</p>
              <button
                type="button"
                className="zn-btn zn-btn--ghost zn-btn--small"
                onClick={() => go && go("arena", "the_vow")}
              >
                {liveVows.length ? "See all →" : "Make a vow →"}
              </button>
            </div>
            {liveVows.length === 0 ? (
              <p className="ah-vows__empty">
                No fuses burning. A dated vow, witnessed, is the hardest thing to walk away from.
              </p>
            ) : (
              <ul className="ah-vows__list">
                {liveVows.slice(0, 3).map((v) => (
                  <li key={v.id} className="ah-vows__item">
                    <span className="ah-vows__fuse" aria-hidden="true" />
                    <span className="ah-vows__title">{v.title || "A vow"}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}

      {/* Activity board — reuses the weekly leaderboard, framed as lane winners. */}
      <div className="ah-board zn-card">
        <p className="zn-eyebrow">Activity this week — who's on fire</p>
        {board === null ? (
          <div className="zn-empty ah-board__loading">Lighting the board…</div>
        ) : board.length === 0 ? (
          <div className="zn-empty ah-board__empty">
            <div className="zn-empty__icon" aria-hidden="true">🏁</div>
            No laps logged yet this week. First real check-in takes pole position.
          </div>
        ) : (
          <ol className="ah-board__list">
            {board.slice(0, 5).map((r, i) => (
              <li key={r.user_id || i} className="ah-board__row">
                <span className={`ah-board__rank${i < 3 ? ` ah-board__rank--${i + 1}` : ""}`}>
                  {i + 1}
                </span>
                <div className="ah-board__who">
                  <UserChip member={r} size="sm" />
                </div>
                <div className="ah-board__stat">
                  <span className="ah-board__pct">{r.consistency_pct ?? 0}%</span>
                  <span className="ah-board__meta">
                    🔥 {r.zone_streak ?? 0} · {r.proofs ?? 0} proof{(r.proofs ?? 0) === 1 ? "" : "s"}
                  </span>
                </div>
              </li>
            ))}
          </ol>
        )}
        {squadId && (
          <button
            type="button"
            className={`zn-btn ah-firebump ${bumped ? "is-bumped" : ""}`}
            onClick={fireBump}
            disabled={!lastEventId}
          >
            🔥 {bumped ? "Fire sent" : lastEventId ? "Fire-bump the squad's last win" : "No win to bump yet"}
          </button>
        )}
      </div>

      {/* The Roster */}
      <ArenaGamesGrid go={go} />
    </div>
  );
}

// ------- router shell -------
export default function ArenaHome({ go, gameKey, fullscreen }) {
  const game = getArenaGame(gameKey);

  if (game) {
    const GameComponent = game.Component;
    // Every game renders its own zn-back — no wrapper back here or we get two.
    // `fullscreen` only matters to Full Court (launched from the Hoops button);
    // the other games ignore the extra prop.
    return (
      <div className="ah-gameview">
        <GameComponent go={go} initialFullscreen={fullscreen} />
      </div>
    );
  }

  return <ArenaHub go={go} />;
}
