// FULL COURT — season averages + NBA-style Me-vs-partner stat sheet. Reads the
// player's season aggregate (arenaService.fullcourtSeason) and the head-to-head
// line (arenaService.fullcourtH2H) straight from the DB — never localStorage.
//
// Ownership: part of the FullCourt game (this file + FullCourt.jsx + FullCourt.css).
// Reached from FullCourt (onBack) or routed directly by Arena Home.

import { useCallback, useEffect, useRef, useState } from "react";
import { useZoneCtx } from "../../../../hooks/useZone.js";
import { fullcourtSeason, fullcourtH2H } from "../../../../lib/arenaService.js";
import { useReveal } from "../useArenaFX.js";
import "./FullCourt.css";

const num = (v) => (Number.isFinite(Number(v)) ? Number(v) : 0);
const round1 = (v) => Math.round(num(v) * 10) / 10;

// Read a stat from either a nested {averages:{}} / {totals:{}} shape or flat.
function pick(obj, ...keys) {
  if (!obj) return 0;
  for (const k of keys) {
    if (obj[k] != null) return obj[k];
    if (obj.averages && obj.averages[k] != null) return obj.averages[k];
    if (obj.totals && obj.totals[k] != null) return obj.totals[k];
  }
  return 0;
}

// Derive the season headline stats from the az_fullcourt_season_payload shape:
// { games, best_points, totals:{points,doors,sales,…}, averages:{points,sales,…} }.
// Ratios come from totals; per-game lines prefer the server averages.
function seasonLine(s) {
  const games = num(pick(s, "games", "games_played"));
  const t = (s && s.totals) || {};
  const a = (s && s.averages) || {};
  const doors = num(t.doors != null ? t.doors : pick(s, "doors"));
  const sales = num(t.sales != null ? t.sales : pick(s, "sales"));
  const points = num(t.points != null ? t.points : pick(s, "points"));
  return {
    games,
    bestPoints: num(pick(s, "best_points", "bestPoints")),
    ppg: a.points != null ? round1(a.points) : games ? round1(points / games) : 0,
    spg: a.sales != null ? round1(a.sales) : games ? round1(sales / games) : 0,
    closePct: doors ? round1((sales / doors) * 100) : 0,
    doorsPerSale: sales ? round1(doors / sales) : 0,
    doors,
    sales,
  };
}

function StatTiles({ line }) {
  return (
    <div className="fc-tiles">
      <div className="zn-stat fc-tile">
        <div className="fc-tile__num">{line.ppg}</div>
        <div className="fc-tile__lbl">PPG</div>
      </div>
      <div className="zn-stat fc-tile">
        <div className="fc-tile__num">{line.spg}</div>
        <div className="fc-tile__lbl">Sales / game</div>
      </div>
      <div className="zn-stat fc-tile">
        <div className="fc-tile__num">{line.closePct}%</div>
        <div className="fc-tile__lbl">Close rate</div>
      </div>
      <div className="zn-stat fc-tile">
        <div className="fc-tile__num">{line.doorsPerSale || "—"}</div>
        <div className="fc-tile__lbl">Doors / sale</div>
      </div>
      <div className="zn-stat fc-tile">
        <div className="fc-tile__num">{line.games}</div>
        <div className="fc-tile__lbl">Games</div>
      </div>
      <div className="zn-stat fc-tile fc-tile--hero">
        <div className="fc-tile__num">{line.bestPoints}</div>
        <div className="fc-tile__lbl">Career high</div>
      </div>
    </div>
  );
}

// One row of the head-to-head sheet: label + my value vs their value.
// Keys are seasonLine() fields — az_fullcourt_h2h returns a full season payload
// per side ({me, them}), so both sides run through the same derivation.
const H2H_ROWS = [
  { key: "ppg", label: "Points / game" },
  { key: "spg", label: "Sales / game" },
  { key: "closePct", label: "Close rate", pct: true },
  { key: "doorsPerSale", label: "Doors / sale" },
  { key: "games", label: "Games played" },
  { key: "bestPoints", label: "Career high" },
];

export default function FullCourtStats({ go, onBack }) {
  const { userId, member, partner } = useZoneCtx();
  const reveal = useReveal();

  const partnerActive =
    partner?.link?.status === "active" && partner?.partner ? partner.partner : null;
  const partnerId = partnerActive?.user_id || null;
  const partnerName = partnerActive?.username
    ? `@${partnerActive.username}`
    : partnerActive?.display_name || "your partner";
  const myName = member?.username ? `@${member.username}` : "You";

  const [season, setSeason] = useState(null);
  const [h2h, setH2h] = useState(null);
  const [tab, setTab] = useState("me"); // me | vs
  const [status, setStatus] = useState("loading"); // loading|ready|offline|error
  const aliveRef = useRef(true);

  const load = useCallback(async () => {
    setStatus("loading");
    try {
      const [s, h] = await Promise.all([
        userId ? fullcourtSeason({ userId }) : Promise.resolve(null),
        partnerId ? fullcourtH2H({ partnerId }) : Promise.resolve(null),
      ]);
      if (!aliveRef.current) return;
      if ((s && s.offline) || (h && h.offline)) {
        setStatus("offline");
        return;
      }
      setSeason(s || null);
      setH2h(h || null);
      setStatus("ready");
    } catch {
      if (aliveRef.current) setStatus("error");
    }
  }, [userId, partnerId]);

  useEffect(() => {
    aliveRef.current = true;
    load();
    return () => {
      aliveRef.current = false;
    };
  }, [load]);

  const back = () => (onBack ? onBack() : go?.("arena", "full_court"));

  const line = seasonLine(season);
  const noGames = status === "ready" && line.games === 0;
  const lastGames = Array.isArray(season?.last) ? season.last : [];

  const h2hLines = {
    me: h2h ? seasonLine(h2h.me) : null,
    them: h2h ? seasonLine(h2h.them) : null,
  };
  const h2hVal = (side, row) => {
    const lineObj = h2hLines[side];
    if (!lineObj) return "—";
    const v = lineObj[row.key];
    if (v == null || v === "") return "—";
    return row.pct ? `${v}%` : v;
  };

  return (
    <div className="fc-wrap" ref={reveal}>
      <button type="button" className="zn-back fc-back" onClick={back}>
        ← Full Court
      </button>

      <header className="fc-head arena-reveal">
        <p className="zn-eyebrow">Full Court · The Stat Sheet</p>
        <h2 className="fc-title">Your season, like a real box score</h2>
        <p className="fc-sub">
          Every logged game rolls up here — your doors-per-sale dropping over weeks is the
          visible proof you're getting better. Saved to your account, not this device.
        </p>
      </header>

      {status === "loading" && (
        <div className="zn-card fc-statcard arena-reveal">
          <div className="fc-skeleton" aria-hidden="true" />
          <p className="fc-loadtext">Pulling your season…</p>
        </div>
      )}

      {status === "offline" && (
        <div className="zn-card fc-statcard arena-reveal">
          <div className="zn-empty">
            <div className="zn-empty__icon">📊</div>
            Your stat sheet lives in the cloud. Reconnect to see your season and head-to-head.
          </div>
        </div>
      )}

      {status === "error" && (
        <div className="zn-card fc-statcard arena-reveal">
          <div className="zn-empty">
            <div className="zn-empty__icon">🌫️</div>
            Couldn't reach your stats right now.
            <div className="fc-emptycta">
              <button type="button" className="zn-btn zn-btn--ghost" onClick={load}>
                Try again
              </button>
            </div>
          </div>
        </div>
      )}

      {status === "ready" && (
        <>
          <div className="fc-tabs" role="tablist" aria-label="Stat sheet view">
            <button
              type="button"
              role="tab"
              aria-selected={tab === "me"}
              className={`fc-tab ${tab === "me" ? "fc-tab--on" : ""}`}
              onClick={() => setTab("me")}
            >
              Just me
            </button>
            {partnerId && (
              <button
                type="button"
                role="tab"
                aria-selected={tab === "vs"}
                className={`fc-tab ${tab === "vs" ? "fc-tab--on" : ""}`}
                onClick={() => setTab("vs")}
              >
                Me vs {partnerName}
              </button>
            )}
          </div>

          {tab === "me" && (
            <div className="fc-statcard zn-card arena-reveal">
              {noGames ? (
                <div className="zn-empty">
                  <div className="zn-empty__icon">🏀</div>
                  No games logged yet. Tip off a Full Court game and your season starts here.
                  <div className="fc-emptycta">
                    <button type="button" className="zn-btn" onClick={back}>
                      Play a game
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <StatTiles line={line} />
                  {lastGames.length > 0 && (
                    <div className="fc-recent">
                      <p className="zn-eyebrow">Recent games</p>
                      <ul className="fc-gamelist">
                        {lastGames.map((g, i) => (
                          <li key={g.id || i} className="fc-gamerow">
                            <span className="fc-gamedate">{g.played_on || g.date || "—"}</span>
                            <span className="fc-gamemode">{(g.mode || "").toUpperCase()}</span>
                            <span className="fc-gamestat">{num(g.points)} pts</span>
                            <span className="fc-gamestat">
                              {num(g.sales)} {num(g.sales) === 1 ? "sale" : "sales"}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {tab === "vs" && partnerId && (
            <div className="fc-statcard zn-card arena-reveal">
              {!h2h ? (
                <div className="zn-empty">
                  <div className="zn-empty__icon">⚔️</div>
                  No head-to-head yet. Once you both log a game, the stat sheet fills in.
                </div>
              ) : (
                <div className="fc-h2h">
                  <div className="fc-h2hhead">
                    <span className="fc-h2hname fc-h2hname--me">{myName}</span>
                    <span className="fc-h2hvs">vs</span>
                    <span className="fc-h2hname">{partnerName}</span>
                  </div>
                  <div className="fc-h2hrows">
                    {H2H_ROWS.map((row) => {
                      const mine = h2hVal("me", row);
                      const theirs = h2hVal("them", row);
                      const mn = num(mine);
                      const tn = num(theirs);
                      const meLead = mn > tn && mine !== "—";
                      const themLead = tn > mn && theirs !== "—";
                      return (
                        <div className="fc-h2hrow" key={row.key}>
                          <span className={`fc-h2hval ${meLead ? "fc-h2hval--lead" : ""}`}>
                            {mine}
                          </span>
                          <span className="fc-h2hlbl">{row.label}</span>
                          <span className={`fc-h2hval ${themLead ? "fc-h2hval--lead" : ""}`}>
                            {theirs}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  <p className="fc-h2hnote">
                    Iron sharpens iron. Every game either of you logs moves this sheet.
                  </p>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
