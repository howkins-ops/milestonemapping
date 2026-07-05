// FULL COURT — the flagship sales game. Play your day like a 4-quarter game:
// tap-to-log every door, race the quarter buzzer, and let the Odds Engine prove
// the sale is baked into the math (Law of Probability). The whole game runs
// CLIENT-SIDE off the pure state machine in src/lib/fullCourtEngine.js — this
// file owns the clock, sound, haptics and animation only. The finished box
// score is the one thing that hits the DB, via arenaService.fullcourtLogGame.
//
// Ownership: this file + FullCourt.css + FullCourtStats.jsx only. All game data
// flows through arenaService.js; all witness/notification copy through
// witnessLines.js. Season is read from the DB, never localStorage.

import { useCallback, useEffect, useRef, useState } from "react";
import { useZoneCtx } from "../../../../hooks/useZone.js";
import { useAppData } from "../../../../hooks/useAppData.js";
import { fullcourtLogGame, fullcourtSeason } from "../../../../lib/arenaService.js";
import {
  createGame,
  logDoor,
  advanceDrive,
  startOvertime,
  oddsEngine,
  boxScore,
  toGamePayload,
  quarterProgress,
  quarterLabel,
  currentDrive,
  LADDER,
  HEAT_ON,
} from "../../../../lib/fullCourtEngine.js";
import { useReveal, useArenaBurst } from "../useArenaFX.js";
import { witnessSay } from "../../witness/witnessLines.js";
import {
  sfxBuzzer,
  sfxCoin,
  sfxPop,
  sfxHorn,
  sfxWhoosh,
  sfxPhoenix,
} from "../../../../lib/sfx.js";
import FullCourtStats from "./FullCourtStats.jsx";
import "./FullCourt.css";

const GOLD = "#FFD166";

// Local YYYY-MM-DD (matches how the Zone stamps local_date on proofs).
const today = () => new Date().toLocaleDateString("en-CA");
const num = (v) => (Number.isFinite(Number(v)) ? Number(v) : 0);

// Per-quarter clock (seconds). Later quarters carry more doors → more time.
// OT periods have no door target — they end on the clock. setInterval(1000).
const QSECS = { 1: 26, 2: 32, 3: 40, 4: 48 };
const quarterSecs = (q) => (q > 4 ? 30 : QSECS[q] || 40);

// The 8 drives grouped into 4 quarters (2 each), from the Heat Ladder.
const LADDER_GROUPS = [
  [LADDER[0], LADDER[1]],
  [LADDER[2], LADDER[3]],
  [LADDER[4], LADDER[5]],
  [LADDER[6], LADDER[7]],
];
// Cumulative doors when each drive completes (a drive is "done" past its mark).
const DRIVE_CUM = [2, 6, 10, 16, 22, 30, 38, 48];

// Tap buttons per mode — outcome keys match fullCourtEngine's outcome tables.
const MODE_ACTIONS = {
  rookie: [
    { key: "no", glyph: "🚪", label: "NO", sub: "+2 · a knock still scores", cls: "fc-btn--no" },
    { key: "pitch", glyph: "🎤", label: "PITCH", sub: "+4 · value build", cls: "fc-btn--pitch" },
    { key: "sale", glyph: "💰", label: "SALE", sub: "+10 · the dunk", cls: "fc-btn--sale" },
  ],
  pro: [
    { key: "knock", glyph: "🚪", label: "KNOCK", sub: "+2 · no answer", cls: "fc-btn--no" },
    { key: "talked_to", glyph: "🗣️", label: "TALKED", sub: "+4 · contact", cls: "fc-btn--pitch" },
    { key: "value_build", glyph: "📈", label: "VALUE", sub: "+6 · pitched", cls: "fc-btn--pitch" },
    { key: "price_drop", glyph: "🏷️", label: "PRICE", sub: "+8 · objection", cls: "fc-btn--pitch" },
    { key: "close", glyph: "💰", label: "CLOSE", sub: "+10 · the dunk", cls: "fc-btn--sale" },
  ],
};

// Map the DB season aggregate → the Odds-Engine "prior" funnel + best points.
function seasonPrior(season) {
  if (!season || season.offline) return { prior: undefined, best: 0 };
  const t = season.totals || season;
  return {
    prior: {
      doors: num(t.doors),
      contacts: num(t.contacts),
      pitches: num(t.pitches),
      objections: num(t.objections),
      sales: num(t.sales),
    },
    best: num(season.best_points ?? season.bestPoints),
  };
}

function fmtClock(s) {
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${String(m).padStart(2, "0")}:${String(r).padStart(2, "0")}`;
}

export default function FullCourt({ go }) {
  const { userId, member, fire, squads = [], partner } = useZoneCtx();
  const { celebrate, pushToast } = useAppData();
  const reveal = useReveal();
  const burst = useArenaBurst();

  const squad = squads[0] || null;
  const squadName = squad?.name || null;
  const partnerActive =
    partner?.link?.status === "active" && partner?.partner ? partner.partner : null;
  const myTeam = squadName ? squadName.toUpperCase() : "SOLO RUN";
  const myTag = member?.username ? `@${member.username}` : "you";

  // Season prior (read from DB, seeds the Odds Engine so it "starts real").
  const [season, setSeason] = useState(null);
  const [seasonStatus, setSeasonStatus] = useState("loading"); // loading|ready|offline

  // Setup knobs.
  const [mode, setMode] = useState("rookie");
  const [avgDollar, setAvgDollar] = useState(250);

  // Live game state (null until tip-off) + UI phase.
  const [game, setGame] = useState(null);
  const [phase, setPhase] = useState("idle"); // idle|playing|buzzer|over
  const [clock, setClock] = useState(0);
  const [buzz, setBuzz] = useState(null); // { label, isHalf, won }
  const [flies, setFlies] = useState([]);
  const [bumping, setBumping] = useState(false);
  const [showStats, setShowStats] = useState(false);

  // Persist bookkeeping.
  const [logging, setLogging] = useState(false);
  const [logged, setLogged] = useState(null); // null|'done'|'offline'
  const loggedRef = useRef(false);
  const aliveRef = useRef(true);

  const loadSeason = useCallback(async () => {
    if (!userId) {
      setSeasonStatus("ready");
      return;
    }
    try {
      const res = await fullcourtSeason({ userId });
      if (!aliveRef.current) return;
      if (res && res.offline) {
        setSeasonStatus("offline");
        return;
      }
      setSeason(res || null);
      setSeasonStatus("ready");
    } catch {
      if (aliveRef.current) setSeasonStatus("ready"); // playable without a prior
    }
  }, [userId]);

  useEffect(() => {
    aliveRef.current = true;
    loadSeason();
    return () => {
      aliveRef.current = false;
    };
  }, [loadSeason]);

  /* ---------------- fx helpers ---------------- */

  const pushFly = useCallback((text, sale) => {
    const id = Math.random().toString(36).slice(2);
    setFlies((f) => [...f.slice(-3), { id, text, sale }]);
    setTimeout(() => {
      if (aliveRef.current) setFlies((f) => f.filter((x) => x.id !== id));
    }, 1000);
  }, []);

  const bump = useCallback(() => {
    setBumping(true);
    setTimeout(() => {
      if (aliveRef.current) setBumping(false);
    }, 170);
  }, []);

  /* ---------------- buzzer / finish ---------------- */

  const finalize = useCallback(
    (next) => {
      setBuzz(null);
      setPhase("over");
      try {
        sfxPhoenix();
      } catch {
        /* audio never blocks */
      }
      const bx = boxScore(next);
      celebrate?.({
        variant: "reward",
        title: "FINAL BUZZER",
        subtitle: `${bx.points} pts · ${bx.sales} ${bx.sales === 1 ? "sale" : "sales"} · ${bx.quartersWon}/4 Q`,
        detail: bx.isPersonalBest
          ? "New personal best — the math delivered. 🏆"
          : "Game in the books. Log it and run it back.",
      });
      // Felt observation for the squad — copy sourced from witnessLines.js.
      if (squadName) {
        try {
          pushToast?.({
            type: "success",
            title: "📣 Squad broadcast",
            message: witnessSay("grind_together", { squad: squadName, today: today() }).line,
          });
        } catch {
          /* toast is best-effort */
        }
      }
    },
    [celebrate, pushToast, squadName]
  );

  const doBuzzer = useCallback(
    (next) => {
      try {
        sfxBuzzer();
      } catch {
        /* silent */
      }
      try {
        if (navigator.vibrate) navigator.vibrate([40, 30, 140]);
      } catch {
        /* haptics optional */
      }
      const ended = next.quarterLog[next.quarterLog.length - 1];
      if (next.over) {
        finalize(next);
        return;
      }
      setBuzz({ label: ended?.label || "Q", isHalf: ended?.label === "Q2", won: !!ended?.won });
      setPhase("buzzer");
    },
    [finalize]
  );

  /* ---------------- clock ---------------- */

  useEffect(() => {
    if (phase !== "playing") return undefined;
    const t = setInterval(() => {
      setClock((c) => Math.max(0, c - 1));
    }, 1000);
    return () => clearInterval(t);
  }, [phase, game?.quarter]);

  // Quarter timer expired → end the quarter by expiry (buzzer).
  useEffect(() => {
    if (phase !== "playing" || clock !== 0 || !game || game.over) return;
    const next = advanceDrive(game);
    if (next === game) return;
    setGame(next);
    doBuzzer(next);
  }, [clock, phase, game, doBuzzer]);

  /* ---------------- controls ---------------- */

  const tipOff = useCallback(() => {
    const { prior, best } = seasonPrior(season);
    const g = createGame({
      mode,
      avgDollar: Number(avgDollar) > 0 ? Number(avgDollar) : 250,
      season: prior,
      seasonBest: best,
    });
    loggedRef.current = false;
    setLogged(null);
    setGame(g);
    setPhase("playing");
    setClock(quarterSecs(g.quarter));
    setBuzz(null);
    setFlies([]);
    try {
      sfxWhoosh();
    } catch {
      /* silent */
    }
  }, [season, mode, avgDollar]);

  const doLog = useCallback(
    (outcome, e) => {
      if (!game || phase !== "playing") return;
      const next = logDoor(game, outcome);
      if (next === game) return; // unknown outcome / finished
      const ev = next.lastEvent;
      const isSale = !!ev?.isSale;
      try {
        if (isSale) sfxHorn(1);
        else if (ev?.onFire) sfxCoin();
        else sfxPop();
      } catch {
        /* silent */
      }
      const x = e?.clientX ?? window.innerWidth / 2;
      const y = e?.clientY ?? window.innerHeight / 2;
      if (isSale) burst(x, y, GOLD);
      pushFly(ev?.tag || `+${ev?.points ?? 0}`, isSale);
      bump();
      setGame(next);
      if (ev?.quarterEnded) doBuzzer(next);
    },
    [game, phase, burst, pushFly, bump, doBuzzer]
  );

  const nextQuarter = useCallback(() => {
    if (!game) return;
    setBuzz(null);
    setPhase("playing");
    setClock(quarterSecs(game.quarter)); // game.quarter already advanced by the engine
  }, [game]);

  const goOvertime = useCallback(() => {
    if (!game || loggedRef.current) return;
    const next = startOvertime(game);
    if (next === game) return;
    setGame(next);
    setPhase("playing");
    setClock(quarterSecs(next.quarter));
    try {
      sfxWhoosh();
    } catch {
      /* silent */
    }
  }, [game]);

  const logSeasonGame = useCallback(async () => {
    if (loggedRef.current || !game) return;
    loggedRef.current = true;
    setLogging(true);
    const payload = { ...toGamePayload(game), played_on: today() };
    try {
      const res = await fullcourtLogGame(payload);
      if (res && res.offline) {
        setLogged("offline");
        pushToast?.({
          type: "info",
          title: "Saved to the moment only",
          message: "You're offline — reconnect to log this game to your season.",
        });
      } else {
        if (res?.season) setSeason(res.season);
        else loadSeason();
        setLogged("done");
        pushToast?.({
          type: "success",
          title: "Logged to season",
          message: "Your stat sheet just grew.",
        });
      }
    } catch {
      loggedRef.current = false;
      pushToast?.({ type: "error", title: "Couldn't log", message: "Try again in a moment." });
    } finally {
      if (aliveRef.current) setLogging(false);
    }
  }, [game, pushToast, loadSeason]);

  const newGame = useCallback(() => {
    setGame(null);
    setPhase("idle");
    setBuzz(null);
    setFlies([]);
    setLogged(null);
    loggedRef.current = false;
  }, []);

  /* ---------------- stats sub-view ---------------- */

  if (showStats) {
    return <FullCourtStats go={go} onBack={() => setShowStats(false)} />;
  }

  /* ---------------- derived ---------------- */

  const odds = game ? oddsEngine(game) : null;
  const qp = game ? quarterProgress(game) : null;
  const drv = game ? currentDrive(game).drive : -1;
  const onFire = !!game && game.heat >= HEAT_ON;
  const lowClock = phase === "playing" && clock <= 5;
  const actions = MODE_ACTIONS[mode] || MODE_ACTIONS.rookie;
  const canPlay = phase === "playing";
  const bx = game && phase === "over" ? boxScore(game) : null;
  const { best: seasonBest } = seasonPrior(season);

  return (
    <div className="fc-wrap" ref={reveal}>
      <button type="button" className="zn-back fc-back" onClick={() => go?.("arena")}>
        ← Arena
      </button>

      <header className="fc-head arena-reveal">
        <p className="zn-eyebrow">Full Court · The Law of Probability</p>
        <h2 className="fc-title">Run your day like a 4-quarter game</h2>
        <p className="fc-sub">
          Score on every door, race the quarter buzzer, and watch the Odds Engine prove the
          sale is baked into the math. You're not hoping for a yes — you're running out the
          clock until the numbers deliver it.
        </p>
      </header>

      {/* ---------------- SCOREBOARD ---------------- */}
      <div className="fc-board zn-card zn-card--glow" data-fire={fire?.key || "cold"}>
        <div className="fc-top">
          <div className="fc-team">
            {myTeam}
            <small>
              {myTag} · {mode.toUpperCase()} MODE
            </small>
          </div>
          <div className="fc-topright">
            <span className="fc-qchip">{game ? quarterLabel(game) : "Q1"}</span>
            <span className={`fc-clock ${lowClock ? "fc-clock--low" : ""}`}>
              {fmtClock(phase === "idle" ? quarterSecs(1) : clock)}
            </span>
          </div>
        </div>

        <div className="fc-scorewrap">
          <div className="fc-flies" aria-hidden="true">
            {flies.map((f) => (
              <span key={f.id} className={`fc-fly ${f.sale ? "fc-fly--sale" : ""}`}>
                {f.text}
              </span>
            ))}
          </div>
          <div className={`fc-score ${bumping ? "fc-score--bump" : ""}`}>
            {game ? game.points : 0}
          </div>
          <div className="fc-scorelbl">POINTS</div>
          <div className="fc-chips">
            <span className={`fc-heat ${onFire ? "fc-heat--on" : ""}`}>
              🔥 HEAT · {game ? game.heat : 0}
            </span>
            <span className="fc-best">🏆 BEST {Math.max(seasonBest, game ? game.points : 0)}</span>
          </div>
        </div>

        {/* ladder */}
        <div className="fc-ladderlbl">DOOR TARGETS · 2-4-4-6-6-8-8-10 = 48 doors</div>
        <div className="fc-ladder">
          {LADDER_GROUPS.map((group, qi) => (
            <div className="fc-qgroup" key={qi}>
              <span className="fc-qname">Q{qi + 1}</span>
              <div className="fc-drives">
                {group.map((val, di) => {
                  const idx = qi * 2 + di;
                  const doors = game ? game.doors : 0;
                  const done = doors >= DRIVE_CUM[idx];
                  const cur = game && !done && drv === idx;
                  return (
                    <span
                      key={di}
                      className={`fc-drive ${done ? "fc-drive--done" : ""} ${cur ? "fc-drive--cur" : ""}`}
                    >
                      {val}
                    </span>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="fc-qprog">
          {qp ? (
            <>
              {qp.label} doors: <b>{qp.doors} / {qp.target || "—"}</b> ·{" "}
              <span className={qp.won ? "fc-obj" : "fc-obj fc-obj--miss"}>
                {qp.won ? "✓ quarter won — sale landed" : "land a sale to win the quarter"}
              </span>
            </>
          ) : (
            <>Q1 target: <b>6 doors</b> · land a sale to win the quarter</>
          )}
        </div>

        {/* action row */}
        <div className={`fc-actions fc-actions--${actions.length}`}>
          {actions.map((a) => (
            <button
              key={a.key}
              type="button"
              className={`fc-btn ${a.cls}`}
              disabled={!canPlay}
              onClick={(e) => doLog(a.key, e)}
            >
              <span className="fc-btn__glyph">{a.glyph}</span>
              {a.label}
              <small>{a.sub}</small>
            </button>
          ))}
        </div>

        {/* buzzer overlay */}
        {phase === "buzzer" && buzz && (
          <div className="fc-buzz">
            <div className="fc-buzz__siren" aria-hidden="true">🚨</div>
            <div className="fc-buzz__q">{buzz.isHalf ? "HALFTIME" : `END OF ${buzz.label}`}</div>
            <div className="fc-buzz__s">
              {buzz.isHalf
                ? game && game.sales > 0
                  ? "You're closing — keep the pace. Second half is yours."
                  : "No sale yet — the math says it's coming. Ask sooner."
                : buzz.won
                ? "Quarter won. You're up " + (game ? game.points : 0) + "."
                : "Quarter's up. Reset the streak — next one's fresh."}
            </div>
            <button type="button" className="zn-btn fc-buzz__btn" onClick={nextQuarter}>
              {buzz.isHalf ? "Start the second half →" : "Next quarter →"}
            </button>
          </div>
        )}
      </div>

      {/* ---------------- ODDS ENGINE ---------------- */}
      <div className="fc-odds">
        <div className="fc-odd fc-odd--hero">
          <div className="fc-odd__v">{odds ? odds.yourNumber : "—"}</div>
          <div className="fc-odd__l">
            <b>YOUR NUMBER</b>
            <br />
            doors to knock for 1 sale
          </div>
        </div>
        <div className="fc-odd">
          <div className="fc-odd__v">${odds ? odds.valueOfNo : 0}</div>
          <div className="fc-odd__l">
            value of every <b>"no"</b>
            <br />
            you just got paid
          </div>
        </div>
        <div className="fc-odd">
          <div className="fc-odd__v">${odds ? odds.onPaceDollars : 0}</div>
          <div className="fc-odd__l">
            on pace for
            <br />
            today's <b>payout</b>
          </div>
        </div>
      </div>
      <div className="fc-law">
        🎯 The Law of Probability:{" "}
        <b>
          {odds
            ? `at your average, the next sale is inside ${odds.nextSaleInDoors} ${
                odds.nextSaleInDoors === 1 ? "door" : "doors"
              }.`
            : "every no you log makes the yes more certain."}
        </b>{" "}
        Keep knocking — the math owes you.
      </div>

      {/* ---------------- CONTROLS / IDLE / OVER ---------------- */}
      {phase === "idle" && (
        <div className="zn-card fc-setup arena-reveal">
          <div className="fc-modeseg" role="tablist" aria-label="Tracking mode">
            <button
              type="button"
              role="tab"
              aria-selected={mode === "rookie"}
              className={`fc-modebtn ${mode === "rookie" ? "fc-modebtn--on" : ""}`}
              onClick={() => setMode("rookie")}
            >
              Rookie
              <small>No · Pitch · Sale</small>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mode === "pro"}
              className={`fc-modebtn ${mode === "pro" ? "fc-modebtn--on" : ""}`}
              onClick={() => setMode("pro")}
            >
              Pro
              <small>Full funnel · sharper math</small>
            </button>
          </div>

          <div className="zn-field fc-field">
            <label className="zn-label" htmlFor="fc-avg">
              Avg commission per sale
            </label>
            <div className="fc-dollarwrap">
              <span className="fc-dollarsign">$</span>
              <input
                id="fc-avg"
                className="zn-input fc-dollar"
                type="number"
                inputMode="numeric"
                min="0"
                step="10"
                value={avgDollar}
                onChange={(e) => setAvgDollar(e.target.value)}
              />
            </div>
          </div>

          <button type="button" className="zn-btn fc-tipoff" onClick={tipOff}>
            ▶ Tip off — start the game
          </button>
          {seasonStatus === "offline" && (
            <p className="fc-note">
              You're offline — the game plays fully, but tonight's box score won't hit your
              season until you reconnect.
            </p>
          )}
          <button
            type="button"
            className="zn-btn zn-btn--ghost fc-statsbtn"
            onClick={() => setShowStats(true)}
          >
            📊 Season & stat sheet
          </button>
        </div>
      )}

      {phase === "over" && bx && (
        <div className="zn-card fc-box arena-reveal">
          <h3 className="fc-boxtitle">🏆 Final buzzer · your box score</h3>
          <div className="fc-boxrows">
            <div className="fc-row">
              <span>Points</span>
              <b>{bx.points}</b>
            </div>
            <div className="fc-row">
              <span>Doors knocked</span>
              <b>{bx.doors}</b>
            </div>
            <div className="fc-row">
              <span>Contacts</span>
              <b>{bx.contacts}</b>
            </div>
            <div className="fc-row">
              <span>Good pitches</span>
              <b>{bx.pitches}</b>
            </div>
            <div className="fc-row">
              <span>Sales / closes</span>
              <b>{bx.sales}</b>
            </div>
            <div className="fc-row">
              <span>Close rate (per door)</span>
              <b>{bx.closePct}%</b>
            </div>
            <div className="fc-row">
              <span>Quarters won</span>
              <b>{bx.quartersWon} / 4</b>
            </div>
            <div className="fc-row">
              <span>Best heat streak</span>
              <b>{bx.bestHeat}</b>
            </div>
            <div className="fc-row">
              <span>Buzzer-beaters</span>
              <b>{bx.buzzerBeaters}</b>
            </div>
            <div className="fc-row fc-row--hero">
              <span>Projected payout</span>
              <b>${bx.payout}</b>
            </div>
          </div>
          {bx.isPersonalBest && <div className="fc-pb">🏆 New personal best</div>}

          <div className="fc-boxcta">
            {logged === "done" ? (
              <div className="fc-logged">📣 Logged &amp; broadcast — this is your season growing.</div>
            ) : logged === "offline" ? (
              <div className="fc-logged fc-logged--off">
                Offline — reconnect and this box score joins your season.
              </div>
            ) : (
              <button
                type="button"
                className="zn-btn fc-logbtn"
                disabled={logging}
                onClick={logSeasonGame}
              >
                {logging ? "Logging…" : "✔ Log game to season"}
              </button>
            )}

            <div className="fc-boxctarow">
              {!loggedRef.current && (
                <button type="button" className="zn-btn zn-btn--ghost" onClick={goOvertime}>
                  ▶ Overtime — chase your record
                </button>
              )}
              <button type="button" className="zn-btn zn-btn--ghost" onClick={newGame}>
                ↻ New game
              </button>
            </div>
            <button
              type="button"
              className="zn-btn zn-btn--ghost fc-statsbtn"
              onClick={() => setShowStats(true)}
            >
              📊 Season &amp; stat sheet
            </button>
          </div>
        </div>
      )}

      {(phase === "playing" || phase === "buzzer") && (
        <p className="fc-realnote">
          Every tap is a real door. When the buzzer's done, log the box score — that's what
          feeds your season and pings {partnerActive ? `@${partnerActive.username}` : "your squad"}.
        </p>
      )}
    </div>
  );
}
