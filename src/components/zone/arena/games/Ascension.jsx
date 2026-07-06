// Ascension — the squad league. Your squad is ranked against ~8 peer squads on a
// weekly board; hold a top spot and you PROMOTE up a fire tier, slip to the bottom
// and you RELEGATE down one. Duolingo leagues, mapped onto the Zone's fire divisions
// (cold → warm → burning → inferno → phoenix). Points are DERIVED server-side from
// the week's real check-ins/proofs (az_arena_league_state) — the client only reads
// the standings. Relegation is NEUTRAL and one strong week climbs right back.
//
// Ownership: this file + Ascension.css only. All game data flows through
// arenaService.js; all witness/notification copy through witnessLines.js.

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useZoneCtx } from "../../../../hooks/useZone.js";
import { useAppData } from "../../../../hooks/useAppData.js";
import { leagueState } from "../../../../lib/arenaService.js";
import { FIRE_LEVELS, getFireLevel } from "../../../../lib/zoneFire.js";
import { useReveal, useArenaBurst } from "../useArenaFX.js";
import { witnessSay } from "../../witness/witnessLines.js";
import { sfxPhoenix, sfxWhoosh } from "../../../../lib/sfx.js";
import "./Ascension.css";

const todaySeed = () => new Date().toISOString().slice(0, 10);

// Duolingo-style zones on an ~8-squad board.
const PROMOTE_TOP = 3; // top N hold a promotion spot
const RELEGATE_BOTTOM = 2; // bottom N are in the drop zone

// Resolve a division key/label/tint/glow off the shared fire ladder so a squad's
// division renders in the exact same palette as personal fire tiers.
function divisionTier(division) {
  const key = String(division || "cold").toLowerCase();
  return FIRE_LEVELS.find((f) => f.key === key) || FIRE_LEVELS[0];
}
function tierIndex(key) {
  const i = FIRE_LEVELS.findIndex((f) => f.key === key);
  return i < 0 ? 0 : i;
}

export default function Ascension({ go }) {
  const { member, squads = [] } = useZoneCtx();
  const { celebrate, pushToast } = useAppData();
  const reveal = useReveal();
  const burst = useArenaBurst();

  const squad = squads[0] || null;
  const squadId = squad?.id || squad?.squad_id || null;
  const squadName = squad?.name || "your squad";

  const [league, setLeague] = useState(null);
  const [status, setStatus] = useState("loading"); // loading | ready | offline | nosquad | error
  const aliveRef = useRef(true);

  const load = useCallback(async () => {
    if (!squadId) {
      setStatus("nosquad");
      return;
    }
    try {
      const res = await leagueState({ squadId });
      if (!aliveRef.current) return;
      if (res && res.offline) {
        setStatus("offline");
        return;
      }
      setLeague(res || null);
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

  const tier = divisionTier(league?.division);
  const idx = tierIndex(tier.key);
  const nextTier = idx < FIRE_LEVELS.length - 1 ? FIRE_LEVELS[idx + 1] : null;
  const prevTier = idx > 0 ? FIRE_LEVELS[idx - 1] : null;
  const myPoints = Math.max(0, Number(league?.points) || 0);
  const myRank = Math.max(0, Number(league?.rank) || 0);

  // Build the full standings board = my squad + peers, deduped & rank-sorted.
  const board = useMemo(() => {
    const peers = Array.isArray(league?.peers) ? league.peers : [];
    const rows = peers.map((p) => ({
      name: p.name || p.username || "squad",
      points: Math.max(0, Number(p.points) || 0),
      rank: Number(p.rank) || 0,
      isMe: false,
    }));
    // Include my squad if the peer list didn't already carry it.
    const meAlready = rows.some(
      (r) => r.isMe || (myRank > 0 && r.rank === myRank && r.name === squadName)
    );
    if (!meAlready) {
      rows.push({ name: squadName, points: myPoints, rank: myRank, isMe: true });
    } else {
      rows.forEach((r) => {
        if (myRank > 0 && r.rank === myRank) r.isMe = true;
      });
    }
    // Rank ascending; fall back to points desc when ranks are missing/tied.
    rows.sort((a, b) => {
      if (a.rank && b.rank && a.rank !== b.rank) return a.rank - b.rank;
      return b.points - a.points;
    });
    // Normalize display positions 1..n regardless of server rank gaps.
    return rows.map((r, i) => ({ ...r, pos: i + 1 }));
  }, [league, myRank, myPoints, squadName, squadId]);

  const total = board.length;
  const canPromote = Boolean(nextTier);
  const canRelegate = Boolean(prevTier);
  const promoteCut = PROMOTE_TOP;
  const relegateCut = total - RELEGATE_BOTTOM;

  const myPos = board.find((r) => r.isMe)?.pos || myRank || 0;
  const inPromote = canPromote && myPos > 0 && myPos <= promoteCut;
  const inRelegate = canRelegate && myPos > 0 && myPos > relegateCut;

  // Projected-standing flavor, pulled from the witness voice (no inline strings).
  const projection = useMemo(() => {
    if (status !== "ready") return null;
    if (inPromote && nextTier) {
      return witnessSay("league_promoted", { squad: squadName, today: todaySeed() }).line;
    }
    if (inRelegate) {
      return witnessSay("league_relegated", { squad: squadName, today: todaySeed() }).line;
    }
    return null;
  }, [status, inPromote, inRelegate, nextTier, squadName]);

  // Sound a soft phoenix note once when the squad is sitting in a promotion spot.
  const promoNoted = useRef(false);
  useEffect(() => {
    if (status === "ready" && inPromote && !promoNoted.current) {
      promoNoted.current = true;
      try {
        sfxPhoenix();
      } catch {
        /* audio never blocks */
      }
      celebrate?.({
        variant: "reward",
        title: "PROMOTION SPOT",
        subtitle: `${squadName} is holding top ${promoteCut} — one strong week and it's ${nextTier?.label}.`,
        detail: projection || undefined,
      });
    }
    if (status === "ready" && !inPromote) promoNoted.current = false;
  }, [status, inPromote, squadName, promoteCut, nextTier, projection, celebrate]);

  const rallySquad = useCallback(
    (e) => {
      try {
        sfxWhoosh();
      } catch {
        /* noop */
      }
      const x = e?.clientX ?? window.innerWidth / 2;
      const y = e?.clientY ?? window.innerHeight / 2;
      burst(x, y, tier.tint);
      pushToast?.({
        type: "info",
        title: "Points come from proof",
        message:
          "The board moves on real check-ins. Post today's proof and rally the squad to do the same.",
      });
      go?.("squad");
    },
    [burst, tier.tint, pushToast, go]
  );

  /* ---------- one standings row ---------- */
  const renderRow = (r, i) => {
    const zone =
      canPromote && r.pos <= promoteCut
        ? "asc-row--promote"
        : canRelegate && r.pos > relegateCut
        ? "asc-row--relegate"
        : "";
    return (
      <li
        key={`${r.name}-${r.pos}`}
        style={{ "--i": i }}
        className={`asc-row a3d-deepin a3d-stagger ${zone} ${r.isMe ? "asc-row--me" : ""}`}
      >
        <span className="asc-rank">{r.pos}</span>
        <span className="asc-name">
          {r.isMe ? "★ " : ""}
          {r.name}
        </span>
        <span className="asc-pts">
          {r.points}
          <span className="asc-ptslabel"> pts</span>
        </span>
      </li>
    );
  };

  return (
    <div
      className="asc-wrap"
      ref={reveal}
      style={{ "--asc-tint": tier.tint, "--asc-glow": tier.glow }}
    >
      <button type="button" className="zn-back asc-back" onClick={() => go?.("arena")}>
        ← Arena
      </button>

      <header className="asc-head arena-reveal">
        <p className="zn-eyebrow">Ascension · Squad League</p>
        <h2 className="asc-title">Climb the fire tiers, together.</h2>
        <p className="asc-sub">
          Your squad is ranked against its division every week. Hold a top spot and you
          rise a tier; slip to the bottom and you drop one — no drama, one strong week
          climbs right back. Every point is real proof, logged.
        </p>
      </header>

      {status === "loading" && (
        <div className="zn-card asc-card arena-reveal">
          <div className="asc-skeleton" aria-hidden="true" />
          <p className="asc-loadtext">Reading the standings…</p>
        </div>
      )}

      {status === "nosquad" && (
        <div className="zn-card asc-card arena-reveal">
          <div className="zn-empty">
            <div className="zn-empty__icon">🛡️</div>
            Ascension is a squad game. Forge or join a squad, then climb the divisions
            together.
            <div className="asc-cta">
              <button type="button" className="zn-btn" onClick={() => go?.("squad")}>
                🛡️ Find your squad
              </button>
            </div>
          </div>
        </div>
      )}

      {status === "offline" && (
        <div className="zn-card asc-card arena-reveal">
          <div className="zn-empty">
            <div className="zn-empty__icon">📡</div>
            The league board's offline right now. Reconnect to see where your squad stands.
          </div>
        </div>
      )}

      {status === "error" && (
        <div className="zn-card asc-card arena-reveal">
          <div className="zn-empty">
            <div className="zn-empty__icon">🌫️</div>
            Couldn't reach the standings right now.
            <div className="asc-cta">
              <button type="button" className="zn-btn zn-btn--ghost" onClick={load}>
                Try again
              </button>
            </div>
          </div>
        </div>
      )}

      {status === "ready" && (
        <>
          {/* Division banner — styled by fire tier; the medallion does a full
              3D flip while the squad is holding a promotion spot */}
          <div className="zn-card zn-card--glow asc-division arena-reveal a3d-stage">
            <div className="asc-divtop">
              <span
                className={`asc-divbadge ${inPromote ? "a3d-flipY" : ""}`}
                aria-hidden="true"
              >
                🔥
              </span>
              <div className="asc-divmeta">
                <p className="zn-eyebrow asc-diveyebrow">Current division</p>
                <p className="asc-divname">{tier.label}</p>
              </div>
              <div className="asc-divladder" aria-hidden="true">
                {FIRE_LEVELS.map((f, i) => (
                  <span
                    key={f.key}
                    className={`asc-pip ${i === idx ? "asc-pip--on" : ""} ${
                      i < idx ? "asc-pip--past" : ""
                    }`}
                    style={i === idx ? { background: f.tint } : undefined}
                    title={f.label}
                  />
                ))}
              </div>
            </div>

            <div className="asc-mystats">
              <div className="zn-stat asc-stat">
                <span className="zn-stat__num">{myPos || "—"}</span>
                <span className="zn-stat__label">Rank</span>
              </div>
              <div className="zn-stat asc-stat">
                <span className="zn-stat__num">{myPoints}</span>
                <span className="zn-stat__label">Points</span>
              </div>
              <div className="zn-stat asc-stat">
                <span className="zn-stat__num">{total}</span>
                <span className="zn-stat__label">Squads</span>
              </div>
            </div>

            {projection && (
              <p
                className={`asc-projection ${
                  inPromote ? "asc-projection--up" : "asc-projection--down"
                }`}
              >
                {projection}
              </p>
            )}
          </div>

          {/* Standings board */}
          <div className="zn-card asc-card asc-boardcard arena-reveal">
            <div className="asc-boardhead">
              <p className="zn-eyebrow">This week's board</p>
              {canPromote && (
                <span className="zn-chip asc-legend asc-legend--up">
                  Top {promoteCut} rise → {nextTier?.label}
                </span>
              )}
            </div>

            {board.length > 0 ? (
              <ol className="asc-board a3d-stage--deep">{board.map(renderRow)}</ol>
            ) : (
              <div className="zn-empty">
                <div className="zn-empty__icon">📊</div>
                No standings yet this week — post the first proof to put {squadName} on the
                board.
              </div>
            )}

            {canRelegate && board.length > relegateCut && (
              <p className="asc-dropnote">
                Bottom {RELEGATE_BOTTOM} drop to {prevTier?.label} — neutral, and one good
                week climbs right back.
              </p>
            )}
          </div>

          {/* Rally CTA — real-life-first */}
          <div className="zn-card zn-card--glow asc-rally arena-reveal">
            <p className="asc-rallylead">
              {inPromote
                ? `${squadName} is holding a promotion spot. Keep the proof coming.`
                : inRelegate
                ? `${squadName} can climb out this week — every check-in is a point.`
                : `Every proof your squad logs moves ${squadName} up the board.`}
            </p>
            <button type="button" className="zn-btn asc-rallybtn" onClick={rallySquad}>
              🔥 Rally the squad
            </button>
            <p className="asc-rallyhint">
              Points come from real check-ins — no proof, no move on the board.
            </p>
          </div>
        </>
      )}
    </div>
  );
}
