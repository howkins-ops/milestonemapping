// The Duel — a 7-day, 1v1 head-to-head with your accountability partner, scored
// purely on ACTIVITY points (real check-ins/proofs in range). Iron sharpens iron:
// two people, one week, whoever shows up more takes it. Server-authoritative — the
// client only reads derived scores (az_arena_duel_state) and starts a duel via RPC
// (az_arena_duel_start). Losses are NEUTRAL and one-tap recoverable (Run it back).
//
// Ownership: this file + TheDuel.css only. All game data flows through
// arenaService.js; all witness/notification copy through witnessLines.js.

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useZoneCtx } from "../../../../hooks/useZone.js";
import { useAppData } from "../../../../hooks/useAppData.js";
import { duelStart, duelState } from "../../../../lib/arenaService.js";
import { useReveal, useArenaBurst } from "../useArenaFX.js";
import { witnessSay } from "../../witness/witnessLines.js";
import { sfxBuzzer, sfxWhoosh, sfxImpact } from "../../../../lib/sfx.js";
import "./TheDuel.css";

const todaySeed = () => new Date().toISOString().slice(0, 10);

// az_duel_bucket rows look like:
//   { id, starts_on, ends_on, status, me_is_a, my_score, their_score,
//     a: {user_id, username, display_name, avatar_url, score}, b: {…} }
// Scores are server-derived proof counts; resolve my corner via me_is_a
// (falling back to a user-id match) and read names off the nested players.
function normalizeDuel(d, userId) {
  if (!d) return null;
  const num = (v) => Math.max(0, Number(v) || 0);

  const isA =
    d.me_is_a != null
      ? Boolean(d.me_is_a)
      : d.a?.user_id != null && userId != null && String(d.a.user_id) === String(userId);
  const mine = (isA ? d.a : d.b) || {};
  const theirs = (isA ? d.b : d.a) || {};

  const meScore = num(d.my_score != null ? d.my_score : mine.score);
  const themScore = num(d.their_score != null ? d.their_score : theirs.score);

  // Days left from ends_on (inclusive of the final day).
  let daysLeft = d.days_left;
  if (daysLeft == null && d.ends_on) {
    const end = new Date(`${d.ends_on}T23:59:59`);
    daysLeft = Math.ceil((end.getTime() - Date.now()) / 86400000);
  }
  daysLeft = Math.max(0, Number(daysLeft) || 0);

  const status = d.status || (daysLeft > 0 ? "live" : "ended");
  const iWon = meScore > themScore;
  const tied = meScore === themScore;

  return {
    id: d.id || `${d.starts_on}-${d.ends_on}`,
    meScore,
    themScore,
    meName: mine.username || mine.display_name || "You",
    themName: theirs.username || theirs.display_name || "Partner",
    daysLeft,
    status,
    startsOn: d.starts_on || null,
    endsOn: d.ends_on || null,
    iWon,
    tied,
    lead: meScore - themScore,
  };
}

export default function TheDuel({ go }) {
  const { userId, member, partner } = useZoneCtx();
  const { celebrate, pushToast } = useAppData();
  const reveal = useReveal();
  const burst = useArenaBurst();

  const [active, setActive] = useState([]);
  const [past, setPast] = useState([]);
  const [status, setStatus] = useState("loading"); // loading | ready | offline | error
  const [starting, setStarting] = useState(false);
  const aliveRef = useRef(true);
  const wonCelebrated = useRef(new Set());

  const myName = member?.username ? `@${member.username}` : "You";
  const partnerActive =
    partner?.link?.status === "active" && partner?.partner ? partner.partner : null;
  const partnerId = partnerActive?.user_id || null;
  const partnerName = partnerActive?.username
    ? `@${partnerActive.username}`
    : partnerActive?.display_name || "your partner";

  const load = useCallback(async () => {
    try {
      const res = await duelState();
      if (!aliveRef.current) return;
      if (res && res.offline) {
        setStatus("offline");
        return;
      }
      setActive((res?.active || []).map((d) => normalizeDuel(d, userId)).filter(Boolean));
      setPast((res?.past || []).map((d) => normalizeDuel(d, userId)).filter(Boolean));
      setStatus("ready");
    } catch {
      if (aliveRef.current) setStatus("error");
    }
  }, [userId]);

  useEffect(() => {
    aliveRef.current = true;
    load();
    return () => {
      aliveRef.current = false;
    };
  }, [load]);

  const activeWithPartner = useMemo(
    () => active.some((d) => d.status === "live" || d.daysLeft > 0),
    [active]
  );

  // Celebrate a freshly-finished win exactly once.
  useEffect(() => {
    if (status !== "ready") return;
    past.forEach((d) => {
      if (d.iWon && !d.tied && !wonCelebrated.current.has(d.id)) {
        wonCelebrated.current.add(d.id);
        try {
          sfxBuzzer();
        } catch {
          /* audio never blocks */
        }
        const line = witnessSay("duel_won", {
          name: myName,
          partner: `@${d.themName}`.replace(/^@@/, "@"),
          today: todaySeed(),
        }).line;
        celebrate?.({
          variant: "reward",
          title: "DUEL WON",
          subtitle: `${d.meScore}–${d.themScore} over ${d.themName}. A week of proof, stacked.`,
          detail: line,
        });
      }
    });
  }, [status, past, myName, celebrate]);

  const startDuel = useCallback(
    async (e) => {
      if (starting || !partnerId) return;
      setStarting(true);
      const x = e?.clientX ?? window.innerWidth / 2;
      const y = e?.clientY ?? window.innerHeight / 2;
      try {
        sfxImpact();
      } catch {
        /* noop */
      }
      burst(x, y, "#FF7A1A");
      try {
        const res = await duelStart({ partnerId });
        if (!aliveRef.current) return;
        if (res && res.offline) {
          setStatus("offline");
          return;
        }
        const line = witnessSay("duel_started", {
          name: myName,
          partner: partnerName,
          today: todaySeed(),
        }).line;
        pushToast?.({ type: "success", title: "Duel on ⚔️", message: line });
        await load();
      } catch {
        if (aliveRef.current) {
          pushToast?.({
            type: "error",
            title: "Duel didn't start",
            message: "Couldn't open the duel right now. Try again in a moment.",
          });
        }
      } finally {
        if (aliveRef.current) setStarting(false);
      }
    },
    [starting, partnerId, myName, partnerName, burst, pushToast, load]
  );

  const tapScore = useCallback(
    (e, tint) => {
      try {
        sfxWhoosh();
      } catch {
        /* noop */
      }
      const x = e?.clientX ?? window.innerWidth / 2;
      const y = e?.clientY ?? window.innerHeight / 2;
      burst(x, y, tint);
    },
    [burst]
  );

  const goProve = useCallback(() => {
    pushToast?.({
      type: "info",
      title: "Every proof is a point",
      message: "Post today's proof — real activity is the only thing that moves the duel.",
    });
    go?.("home");
  }, [go, pushToast]);

  /* ---------------- active duel card ---------------- */
  const renderActive = (d) => {
    const total = d.meScore + d.themScore;
    const mePct = total > 0 ? Math.round((d.meScore / total) * 100) : 50;
    const leadLabel =
      d.tied
        ? "Dead even — the week's yours to take."
        : d.lead > 0
        ? `You're ahead by ${d.lead}.`
        : `${d.themName} leads by ${Math.abs(d.lead)} — close it.`;

    return (
      // the whole versus card flips in like a fight poster; duel-face is the
      // 3D stage so the sides can pop toward the viewer when they take the lead
      <div key={d.id} className="zn-card zn-card--glow duel-arena arena-reveal a3d-flipY">
        <div className="duel-arenahead">
          <p className="zn-eyebrow">Live duel · 7 days</p>
          <span className="zn-chip duel-days">
            {d.daysLeft > 0
              ? `${d.daysLeft} ${d.daysLeft === 1 ? "day" : "days"} left`
              : "final day"}
          </span>
        </div>

        <div className="duel-face a3d-stage">
          <button
            type="button"
            className={`duel-side duel-side--me ${d.lead > 0 ? "duel-side--lead" : ""}`}
            onClick={(e) => tapScore(e, "#FF7A1A")}
            aria-label={`Your score ${d.meScore}`}
          >
            <span className="zn-avatar duel-sideavatar">
              {(member?.username?.[0] || "Y").toUpperCase()}
            </span>
            <span className="duel-sidename">{myName}</span>
            <span className="duel-sidescore">{d.meScore}</span>
          </button>

          <span className="duel-vs a3d-slam" aria-hidden="true">
            ⚔️
          </span>

          <button
            type="button"
            className={`duel-side duel-side--them ${d.lead < 0 ? "duel-side--lead" : ""}`}
            onClick={(e) => tapScore(e, "#3BE0FF")}
            aria-label={`${d.themName} score ${d.themScore}`}
          >
            <span className="zn-avatar duel-sideavatar duel-sideavatar--them">
              {(d.themName?.[0] || "P").toUpperCase()}
            </span>
            <span className="duel-sidename">@{d.themName}</span>
            <span className="duel-sidescore">{d.themScore}</span>
          </button>
        </div>

        <div className="duel-bar" aria-hidden="true">
          <div className="duel-bar__me" style={{ width: `${mePct}%` }} />
          <div className="duel-bar__them" style={{ width: `${100 - mePct}%` }} />
        </div>
        <p className="duel-lead">{leadLabel}</p>

        <div className="duel-cta">
          <button type="button" className="zn-btn" onClick={goProve}>
            Post today's proof
          </button>
          <p className="duel-ctahint">
            Points come from real check-ins — no proof, no move on the board.
          </p>
        </div>
      </div>
    );
  };

  /* ---------------- past duel row ---------------- */
  const renderPast = (d, i) => {
    const cls = d.tied ? "duel-past--tie" : d.iWon ? "duel-past--won" : "duel-past--lost";
    const tag = d.tied ? "Tied" : d.iWon ? "Won" : "Close";
    const fx = d.iWon && !d.tied ? "a3d-flipY a3d-stagger" : "a3d-deepin a3d-stagger";
    return (
      <li key={d.id} style={{ "--i": i }} className={`duel-past ${cls} ${fx}`}>
        <span className="duel-pasttag">{tag}</span>
        <span className="duel-pastscore">
          {d.meScore}
          <span className="duel-pastdash">–</span>
          {d.themScore}
        </span>
        <span className="duel-pastwho">vs @{d.themName}</span>
      </li>
    );
  };

  return (
    <div className="duel-wrap" ref={reveal}>
      <button type="button" className="zn-back duel-back" onClick={() => go?.("arena")}>
        ← Arena
      </button>

      <header className="duel-head arena-reveal">
        <p className="zn-eyebrow">The Duel · 1v1</p>
        <h2 className="duel-title">Seven days. One partner. Most proof wins.</h2>
        <p className="duel-sub">
          A head-to-head with your accountability partner, scored only on the real work
          you both log for a week. Iron sharpens iron — and if you come up short, every
          rep still counts and the rematch is one tap away.
        </p>
      </header>

      {status === "loading" && (
        <div className="zn-card duel-card arena-reveal">
          <div className="duel-skeleton" aria-hidden="true" />
          <p className="duel-loadtext">Reading the duel…</p>
        </div>
      )}

      {status === "offline" && (
        <div className="zn-card duel-card arena-reveal">
          <div className="zn-empty">
            <div className="zn-empty__icon">⚔️</div>
            The duel's on pause while you're offline. Reconnect to see the scoreboard.
          </div>
        </div>
      )}

      {status === "error" && (
        <div className="zn-card duel-card arena-reveal">
          <div className="zn-empty">
            <div className="zn-empty__icon">🌫️</div>
            Couldn't reach the duel right now.
            <div className="duel-cta">
              <button type="button" className="zn-btn zn-btn--ghost" onClick={load}>
                Try again
              </button>
            </div>
          </div>
        </div>
      )}

      {status === "ready" && (
        <>
          {/* Active duels */}
          {active.length > 0 ? (
            active.map(renderActive)
          ) : partnerActive ? (
            /* Have a partner, no live duel — offer to start one. */
            <div className="zn-card zn-card--glow duel-start arena-reveal">
              <span className="duel-starticon" aria-hidden="true">
                ⚔️
              </span>
              <p className="duel-startlead">
                No duel running with {partnerName}.
              </p>
              <p className="duel-startsub">
                Call it and the seven days start now — whoever logs the most real proof
                takes the week.
              </p>
              <button
                type="button"
                className="zn-btn duel-startbtn"
                onClick={startDuel}
                disabled={starting}
              >
                {starting ? "Starting…" : `Challenge ${partnerName} ⚔️`}
              </button>
            </div>
          ) : (
            /* No partner yet — teaser to pair. */
            <div className="zn-card duel-card arena-reveal">
              <div className="zn-empty">
                <div className="zn-empty__icon">⚭</div>
                The Duel needs a partner to spar with. Pair with one accountability
                partner, then call the seven-day challenge.
                <div className="duel-cta">
                  <button type="button" className="zn-btn" onClick={() => go?.("partner")}>
                    ⚭ Pair with a partner
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Past duels */}
          {past.length > 0 && (
            <div className="zn-card duel-card duel-history arena-reveal">
              <p className="zn-eyebrow">Past duels</p>
              <ul className="duel-pastlist a3d-stage--deep">{past.map(renderPast)}</ul>
              {partnerActive && !activeWithPartner && (
                <button
                  type="button"
                  className="zn-btn zn-btn--ghost duel-again"
                  onClick={startDuel}
                  disabled={starting}
                >
                  {starting ? "Starting…" : "Run it back ⚔️"}
                </button>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
