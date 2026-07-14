import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import UrgeBattle from "./UrgeBattle.jsx";
import DailyTab from "./DailyTab.jsx";
import {
  loadClearDay, subscribeClearDay, dayNumber, currentRun, PROGRAM_DAYS,
  completeOnboarding, castVote, castDailyRep, closeOutDay, logBattle,
  setIdentityStatement, addBelief, addWhy, addCard, saveTape,
  addFreedomItem, addFutureLetter, openFutureLetter,
  setLaw, upgradeRung, addPulse,
} from "./clearDayStore.js";
import {
  lessonFor, PHASES, phaseColorVar, LADDER,
  bodyReportFor, HALTB, TRACK_META, CURRICULUM,
} from "./clearDayData.js";
import { useGamification } from "../../hooks/useGamification.js";
import { XP_VALUES } from "../../lib/gamification.js";
import { sfxHalo, sfxCoin, sfxPop, sfxPhoenix, sfxWaxSeal, sfxRungUp } from "../../lib/sfx.js";
import cdFx from "./cdFx.js";
import { tapLight, tapMedium, slamHeavy, buzzSuccess } from "../../lib/haptics.js";

/* ═══════════════════════════════════════════════════════════════
   CLEARDAY — identity-first recovery for weed + porn.
   Every screen obeys the language laws (see the build prompt §1B):
   "I don't" never "I can't" · nouns only for the desired self ·
   no "addict" anywhere · present tense on today's evidence ·
   nothing ever resets to zero.
   ═══════════════════════════════════════════════════════════════ */

/* ── celebration deck — guaranteed reward, surprising form ──────────── */
const CEREMONY_DECK = [
  { line: "Stamped. That's who you are.", color: "#5e9df0", n: 18 },
  { line: "Evidence, added.", color: "#4fd1c5", n: 16 },
  { line: "The ledger only fills.", color: "#f0b45e", n: 16 },
  { line: "One more brick in the man.", color: "#5fcf8e", n: 18 },
  { line: "Doubt just lost another argument.", color: "#a78bfa", n: 16 },
  { line: "Filed. Signed. Yours forever.", color: "#5e9df0", n: 20 },
];
const CEREMONY_CRIT = { line: "★ CRITICAL VOTE — the comeback rep. Biggest stamp in the book.", color: "#f0b45e", n: 44, crit: true };

function Ceremony({ show, onDone }) {
  useEffect(() => {
    if (!show) return undefined;
    const W = window.innerWidth || 390;
    const H = window.innerHeight || 844;
    cdFx.burst(W / 2, H / 2, "petal", show.n, show.color);
    if (show.crit) {
      cdFx.flare("#f0b45e");
      slamHeavy();
    }
    const t = setTimeout(onDone, show.crit ? 2100 : 1500);
    return () => clearTimeout(t);
  }, [show, onDone]);
  if (!show) return null;
  return (
    <div className={`cd-ceremony ${show.crit ? "cd-ceremony--crit" : ""}`} aria-live="polite">
      <div className="cd-ceremony-rays" aria-hidden="true" />
      <div className="cd-ceremony-stamp" style={{ borderColor: show.color, color: show.color }}>
        VOTE CAST
      </div>
      <div className="cd-ceremony-line">{show.line}</div>
    </div>
  );
}

/* ── the rung-upgrade moment — a full-screen sunrise for a new label ── */
function RungMoment({ rung, onDone }) {
  useEffect(() => {
    if (!rung) return undefined;
    cdFx.sunrise();
    const W = window.innerWidth || 390;
    const H = window.innerHeight || 844;
    cdFx.burst(W / 2, H / 2, "petal", 28);
    buzzSuccess();
    const t = setTimeout(onDone, 2400);
    return () => clearTimeout(t);
  }, [rung, onDone]);
  if (!rung) return null;
  return (
    <div className="cd-ceremony" aria-live="polite">
      <div className="cd-ceremony-rays" aria-hidden="true" />
      <div className="cd-ceremony-stamp" style={{ borderColor: "var(--cd-dawn)", color: "var(--cd-dawn)" }}>
        {rung.label.toUpperCase()}
      </div>
      <div className="cd-ceremony-line">The label climbed. It doesn't climb back down.</div>
    </div>
  );
}

/* ── the living horizon — 66 days rendered as light, not digits ─────── */
function HorizonCanvas({ day, votes }) {
  const ref = useRef(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext("2d");
    let raf = 0;
    let running = true;
    let t = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const resize = () => {
      canvas.width = canvas.offsetWidth * dpr;
      canvas.height = canvas.offsetHeight * dpr;
    };
    resize();
    window.addEventListener("resize", resize);
    const still = document.documentElement.dataset.reducedMotion === "true";
    const p = Math.min(1, (day - 1) / (PROGRAM_DAYS - 1)); // 0 → 1 across the program
    const stars = Array.from({ length: 34 }, () => ({
      x: Math.random(), y: Math.random() * 0.55, r: 0.4 + Math.random() * 1.1, tw: Math.random() * Math.PI * 2,
    }));
    const tick = () => {
      if (!running) return;
      if (document.hidden) { raf = requestAnimationFrame(tick); return; }
      t += still ? 0 : 0.016;
      const W = canvas.width;
      const H = canvas.height;
      const horizonY = H * 0.68;
      // sky: deepens with progress from near-black to pre-dawn blue
      const sky = ctx.createLinearGradient(0, 0, 0, horizonY);
      sky.addColorStop(0, `rgba(${8 + p * 8}, ${12 + p * 22}, ${22 + p * 46}, 1)`);
      sky.addColorStop(1, `rgba(${16 + p * 40}, ${28 + p * 62}, ${52 + p * 110}, 1)`);
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, W, horizonY);
      // stars fade out as first light grows
      const starAlpha = Math.max(0, 0.7 - p * 0.75);
      for (const s of stars) {
        const a = starAlpha * (0.5 + 0.5 * Math.sin(t * 1.4 + s.tw));
        ctx.fillStyle = `rgba(220, 232, 248, ${a.toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(s.x * W, s.y * H, s.r * dpr, 0, Math.PI * 2);
        ctx.fill();
      }
      // the glow at the horizon grows with the days
      const glowR = W * (0.18 + p * 0.5);
      const g = ctx.createRadialGradient(W / 2, horizonY, 0, W / 2, horizonY, glowR);
      g.addColorStop(0, `rgba(126, 179, 245, ${0.28 + p * 0.5})`);
      g.addColorStop(1, "rgba(126, 179, 245, 0)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, horizonY);
      // the sun: rises with progress — below the line day 1, breaking free day 66
      const sunR = W * 0.075;
      const sunLift = -sunR * 0.9 + p * sunR * 2.1;
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, 0, W, horizonY);
      ctx.clip();
      const sg = ctx.createLinearGradient(0, horizonY - sunLift - sunR, 0, horizonY);
      sg.addColorStop(0, "#9cc4f7");
      sg.addColorStop(1, "#2d5a8a");
      ctx.fillStyle = sg;
      ctx.beginPath();
      ctx.arc(W / 2, horizonY - sunLift + sunR * 0.2, sunR, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      // ground
      ctx.fillStyle = "rgba(8, 11, 16, 1)";
      ctx.fillRect(0, horizonY, W, H - horizonY);
      // the horizon line itself
      ctx.fillStyle = `rgba(126, 179, 245, ${0.5 + p * 0.5})`;
      ctx.fillRect(W * 0.04, horizonY - dpr, W * 0.92, 2 * dpr);
      // vote shimmer: tiny lights on the ground, one per ~8 votes (cap 40)
      const lights = Math.min(40, Math.floor(votes / 8) + 1);
      for (let i = 0; i < lights; i++) {
        const lx = (0.08 + ((i * 0.618) % 0.84)) * W;
        const ly = horizonY + 10 * dpr + ((i * 37) % (H - horizonY - 20 * dpr));
        const a = 0.25 + 0.3 * (0.5 + 0.5 * Math.sin(t * 2 + i));
        ctx.fillStyle = `rgba(240, 180, 94, ${a.toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(lx, ly, 1.3 * dpr, 0, Math.PI * 2);
        ctx.fill();
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, [day, votes]);
  return <canvas ref={ref} className="cd-horizon" aria-hidden="true" />;
}

/* ═══ ONBOARDING — "The Claim" ════════════════════════════════════════ */

const HEDGES = /\b(trying|less|mostly|cut\s*back|only\s+on|sometimes|usually)\b/i;
const MASK_IDEAS = ["The Salesman", "The Fog", "The Static", "The Dealer", "The Whisper"];

function lawValid(text) {
  return /i don'?t/i.test(text) && text.trim().length >= 10 && !HEDGES.test(text);
}

function Onboard({ onDone }) {
  const [step, setStep] = useState(0);
  const [tracks, setTracks] = useState([]);
  const [maskName, setMaskNameLocal] = useState("");
  const [statement, setStatement] = useState("");
  const [laws, setLaws] = useState({ weed: "", porn: "" });
  const [dark, setDark] = useState("");
  const [clear, setClear] = useState("");
  const [actions, setActions] = useState(["", "", ""]);
  const [whys, setWhys] = useState([{ text: "", intensity: 4 }]);
  const TOTAL = 8;

  const toggleTrack = (t) =>
    setTracks((cur) => (cur.includes(t) ? cur.filter((x) => x !== t) : [...cur, t]));

  const lawsOk = tracks.every((t) => lawValid(laws[t] || ""));
  const whysOk = whys.some((w) => w.text.trim().length >= 4);
  const actionsOk = actions.filter((a) => a.trim().length >= 3).length >= 1;

  const seal = () => {
    onDone({
      tracks,
      statement: statement.trim(),
      maskName: maskName.trim() || "The Mask",
      laws,
      doors: { dark: dark.trim(), clear: clear.trim(), actions: actions.map((a) => a.trim()).filter(Boolean) },
      whys: whys.filter((w) => w.text.trim()),
      beliefs: tracks.map((t) => ({ track: t, text: TRACK_META[t].lawHint.split(". ")[1] || TRACK_META[t].lawHint })),
    });
  };

  return (
    <div className="cd-onboard">
      <div className="cd-ob-progress">
        {Array.from({ length: TOTAL }, (_, i) => (
          <div key={i} className={`cd-ob-tick ${i <= step ? "cd-ob-tick--on" : ""}`} />
        ))}
      </div>

      {step === 0 && (
        <div className="cd-ob-step">
          <div className="cd-eyebrow">CLEARDAY</div>
          <h1 className="cd-h1">Every app counted<br />your days.<br />None of them built<br />the person.</h1>
          <p className="cd-p">
            Chasing the outcome — “30 days,” “quit forever” — burns out when motivation does.
            CLEARDAY flips it: decide <span className="cd-accent">who you are</span>, then stack
            evidence until your brain has no choice but to believe it.
          </p>
          <p className="cd-p">
            One rule above all: <strong>“I can't” is someone else's rule. “I don't” is who you are.</strong>{" "}
            People who refuse with “I don't” hold the line dramatically more often. Everything in here is built on that.
          </p>
          <button type="button" className="cd-btn" onClick={() => setStep(1)}>BEGIN THE CLAIM</button>
        </div>
      )}

      {step === 1 && (
        <div className="cd-ob-step">
          <div className="cd-eyebrow">STEP 1 · THE FRONTS</div>
          <h1 className="cd-h1">What are you<br />walking away from?</h1>
          <p className="cd-p cd-p--soft">One front or both. One identity either way.</p>
          <div className="cd-ob-tracks">
            <button type="button" className={`cd-track-card ${tracks.includes("weed") ? "cd-track-card--on" : ""}`} onClick={() => toggleTrack("weed")}>
              <span className="cd-track-name" style={{ color: TRACK_META.weed.color }}>WEED</span>
              <span className="cd-track-sub">The pen, the smoke, the fog</span>
            </button>
            <button type="button" className={`cd-track-card ${tracks.includes("porn") ? "cd-track-card--on" : ""}`} onClick={() => toggleTrack("porn")}>
              <span className="cd-track-name" style={{ color: TRACK_META.porn.color }}>PORN</span>
              <span className="cd-track-sub">The tab, the scroll, the 1am screen</span>
            </button>
          </div>
          <button type="button" className="cd-btn" disabled={!tracks.length} onClick={() => setStep(2)}>NEXT</button>
        </div>
      )}

      {step === 2 && (
        <div className="cd-ob-step">
          <div className="cd-eyebrow">STEP 2 · NAME THE MASK</div>
          <h1 className="cd-h1">The craving voice<br />isn't yours.</h1>
          <p className="cd-p">
            It says “<em>I</em> need it” so it can wear your voice. From today it gets its own name —
            and every line it speaks gets handed back to it: <strong>“That's not me. That's it talking.”</strong>
          </p>
          <input
            className="cd-input"
            value={maskName}
            onChange={(e) => setMaskNameLocal(e.target.value)}
            placeholder="Name it…"
          />
          <div className="cd-chips">
            {MASK_IDEAS.map((m) => (
              <button key={m} type="button" className="cd-chip" onClick={() => setMaskNameLocal(m)}>{m}</button>
            ))}
          </div>
          <button type="button" className="cd-btn" disabled={maskName.trim().length < 2} onClick={() => setStep(3)}>NEXT</button>
        </div>
      )}

      {step === 3 && (
        <div className="cd-ob-step">
          <div className="cd-eyebrow">STEP 3 · THE CLAIM</div>
          <h1 className="cd-h1">Who are you —<br />starting now?</h1>
          <p className="cd-p">
            Not who you'll be after 66 days. Who you are, present tense, from this minute.
            The people who make it claim the identity <em>first</em> and let the evidence catch up.
          </p>
          {tracks.includes("weed") && (
            <div className="cd-seed"><span className="cd-seed-dot" style={{ background: TRACK_META.weed.color }} />“I'm a man with healthy lungs and clear mornings.”</div>
          )}
          {tracks.includes("porn") && (
            <div className="cd-seed"><span className="cd-seed-dot" style={{ background: TRACK_META.porn.color }} />“I'm a man whose desire belongs to real life.”</div>
          )}
          <p className="cd-p cd-p--soft">Now write yours — in full. Typing it matters; produced words go deeper than read ones.</p>
          <textarea
            className="cd-input"
            rows={3}
            value={statement}
            onChange={(e) => setStatement(e.target.value)}
            placeholder="I'm someone who…"
          />
          <button type="button" className="cd-btn" disabled={statement.trim().length < 10} onClick={() => setStep(4)}>NEXT</button>
        </div>
      )}

      {step === 4 && (
        <div className="cd-ob-step">
          <div className="cd-eyebrow">STEP 4 · THE LAW</div>
          <h1 className="cd-h1">Decide once.<br />Never negotiate again.</h1>
          <p className="cd-p">
            “Cutting back” and “only on weekends” force a fresh decision every time — and one of them
            eventually loses. A categorical Law decides once. It must carry <strong>“I don't.”</strong>
          </p>
          {tracks.map((t) => (
            <div key={t} className="cd-law-block">
              <div className="cd-label" style={{ color: TRACK_META[t].color }}>{TRACK_META[t].label.toUpperCase()} LAW</div>
              <textarea
                className="cd-input"
                rows={2}
                value={laws[t]}
                onChange={(e) => setLaws((cur) => ({ ...cur, [t]: e.target.value }))}
                placeholder={TRACK_META[t].lawHint}
              />
              {laws[t] && !lawValid(laws[t]) && (
                <div className="cd-nudge">
                  Needs “I don't” — and no hedge words (“trying,” “less,” “mostly,” “only on…”). Loopholes leak.
                </div>
              )}
            </div>
          ))}
          <button type="button" className="cd-btn" disabled={!lawsOk} onClick={() => setStep(5)}>SIGN THE LAW</button>
        </div>
      )}

      {step === 5 && (
        <div className="cd-ob-step">
          <div className="cd-eyebrow">STEP 5 · TWO DOORS</div>
          <h1 className="cd-h1">Both futures exist.<br />Write them both.</h1>
          <div className="cd-label cd-label--rose">DOOR A — you at 40, if nothing changes</div>
          <textarea className="cd-input" rows={3} value={dark} onChange={(e) => setDark(e.target.value)}
            placeholder="Be specific. The lungs, the mornings, the memory, who's still around…" />
          <div className="cd-label cd-label--green">DOOR B — the clear one</div>
          <textarea className="cd-input" rows={3} value={clear} onChange={(e) => setClear(e.target.value)}
            placeholder="Also specific. What a Tuesday looks like. Who's there. What you've built…" />
          <div className="cd-label">DOOR B ONLY OPENS WITH ACTIONS — name up to 3 for this week</div>
          {actions.map((a, i) => (
            <input key={i} className="cd-input cd-input--sm" value={a}
              onChange={(e) => setActions((cur) => cur.map((x, j) => (j === i ? e.target.value : x)))}
              placeholder={["e.g. pen goes in the trash tonight", "e.g. phone sleeps in the kitchen", "e.g. gym Tuesday morning"][i]} />
          ))}
          <button type="button" className="cd-btn"
            disabled={dark.trim().length < 10 || clear.trim().length < 10 || !actionsOk}
            onClick={() => setStep(6)}>NEXT</button>
        </div>
      )}

      {step === 6 && (
        <div className="cd-ob-step">
          <div className="cd-eyebrow">STEP 6 · THE WHYS</div>
          <h1 className="cd-h1">For the version of you<br />at 3am.</h1>
          <p className="cd-p cd-p--soft">Write up to three. Rate the heat — the hottest one shows up mid-battle.</p>
          {whys.map((w, i) => (
            <div key={i} className="cd-why-row">
              <input className="cd-input" value={w.text}
                onChange={(e) => setWhys((cur) => cur.map((x, j) => (j === i ? { ...x, text: e.target.value } : x)))}
                placeholder={["e.g. I want to be someone my kid can count on", "e.g. I want my mornings back", "e.g. I want to look her in the eye"][i] || "Another reason…"} />
              <div className="cd-heat">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button key={n} type="button"
                    className={`cd-heat-dot ${w.intensity >= n ? "cd-heat-dot--on" : ""}`}
                    onClick={() => setWhys((cur) => cur.map((x, j) => (j === i ? { ...x, intensity: n } : x)))}
                    aria-label={`heat ${n}`} />
                ))}
              </div>
            </div>
          ))}
          {whys.length < 3 && (
            <button type="button" className="cd-ghost" onClick={() => setWhys((cur) => [...cur, { text: "", intensity: 3 }])}>
              + another why
            </button>
          )}
          <button type="button" className="cd-btn" disabled={!whysOk} onClick={() => setStep(7)}>NEXT</button>
        </div>
      )}

      {step === 7 && (
        <div className="cd-ob-step">
          <div className="cd-eyebrow">THE SEAL</div>
          <h1 className="cd-h1">This is the claim.</h1>
          <div className="cd-seal-card">
            <div className="cd-seal-statement">“{statement.trim()}”</div>
            {tracks.map((t) => (
              <div key={t} className="cd-seal-law" style={{ borderColor: `${TRACK_META[t].color}44` }}>
                {laws[t]}
              </div>
            ))}
            <div className="cd-seal-mask">The voice against it has a name now: <strong>{maskName.trim() || "The Mask"}</strong>. It doesn't vote.</div>
          </div>
          <p className="cd-p cd-p--soft">
            Naming the Mask, writing the Law, making the Claim — that was real work. It banks your
            first three votes right now. The bar is never empty again.
          </p>
          <button type="button" className="cd-btn cd-btn--seal" onClick={seal}>CAST MY FIRST 3 VOTES ➜</button>
        </div>
      )}
    </div>
  );
}

/* ═══ TODAY ═══════════════════════════════════════════════════════════ */

function Today({ S, day, settings, onBattle, onSlipFlow, celebrate, addXPSafe }) {
  const lesson = lessonFor(day);
  const repDone = S.curriculumDone.includes(day);
  const closed = Boolean(S.closedDays[day]);
  const rung = LADDER.find((r) => r.id === S.rung) || LADDER[0];
  const hour = new Date().getHours();
  const greet = hour < 5 ? "It's late" : hour < 12 ? "Morning" : hour < 18 ? "Afternoon" : "Evening";
  const [halt, setHalt] = useState(null);
  const hotWhy = useMemo(() => {
    const list = [...(S.whys || [])].sort((a, b) => (b.intensity || 0) - (a.intensity || 0));
    return list[(day - 1) % Math.max(1, list.length)] || list[0] || null;
  }, [S.whys, day]);

  const castRep = (e) => {
    const { firstTime } = castDailyRep(day, lesson.vote);
    if (firstTime) {
      addXPSafe(XP_VALUES.cleardayDailyRep, "CLEARDAY rep");
      cdFx.burstFrom(e, "spark", 14);
      tapMedium();
      sfxCoin(settings);
      celebrate();
    }
  };

  const closeClear = () => {
    const { firstTime } = closeOutDay("clear");
    if (firstTime) {
      addXPSafe(XP_VALUES.cleardayClearDay, "Clear day");
      cdFx.sunrise();
      buzzSuccess();
      sfxPhoenix(settings);
      celebrate();
    }
  };

  return (
    <div className="cd-page">
      <div className="cd-hero">
        <HorizonCanvas day={day} votes={S.votes} />
        <div className="cd-hero-copy">
          <div className="cd-hero-greet">{greet} — day {day} of {PROGRAM_DAYS}.</div>
          <div className="cd-hero-rung">{rung.label.toUpperCase()}</div>
          <div className="cd-hero-votes"><strong>{S.votes}</strong> votes on the ballot · none of them expire</div>
        </div>
      </div>

      <button type="button" className="cd-claim-card" onClick={(e) => {
        castVote("identity", "Did something the man in the Claim would do.");
        cdFx.burstFrom(e, "ember", 12, "#5e9df0");
        cdFx.ringFrom(e, "#5e9df0");
        tapLight();
        sfxPop(settings);
        celebrate();
      }}>
        <div className="cd-label cd-label--dawn">THE CLAIM · TAP WHEN YOU'VE LIVED IT TODAY</div>
        <div className="cd-claim-text">{S.identity.statement}</div>
      </button>

      <button type="button" className="cd-urge-btn" onClick={onBattle}>
        <span className="cd-urge-pulse" aria-hidden="true" />
        AN URGE, RIGHT NOW → START THE BATTLE
      </button>

      <div className="cd-card">
        <div className="cd-label">HOW ARE YOU, ACTUALLY? — most urges are one of these in a costume</div>
        <div className="cd-halt-grid">
          {HALTB.map((h) => (
            <button key={h.k} type="button" className={`cd-halt ${halt === h.k ? "cd-halt--on" : ""}`} onClick={() => setHalt(halt === h.k ? null : h.k)}>
              {h.label}
            </button>
          ))}
        </div>
        {halt && (
          <div className="cd-halt-fix">
            <div className="cd-halt-line">{HALTB.find((h) => h.k === halt).line}</div>
            <div className="cd-halt-do">{HALTB.find((h) => h.k === halt).fix}</div>
          </div>
        )}
      </div>

      <div className="cd-card">
        <div className="cd-lesson-top">
          <span className="cd-label" style={{ color: phaseColorVar(lesson.phase) }}>DAY {lesson.day} · {lesson.phase.toUpperCase()}</span>
          <span className="cd-lesson-skill">{lesson.skill}</span>
        </div>
        <div className="cd-lesson-title">{lesson.title}</div>
        <p className="cd-lesson-teach">{lesson.teach}</p>
        {lesson.cite && <div className="cd-cite">◈ {lesson.cite}</div>}
        {S.tracks.map((t) => lesson[t] ? (
          <div key={t} className="cd-insert" style={{ borderColor: `${TRACK_META[t].color}55` }}>
            <span style={{ color: TRACK_META[t].color, fontWeight: 700 }}>{TRACK_META[t].label.toUpperCase()} · </span>
            {lesson[t]}
          </div>
        ) : null)}
        <div className="cd-vote-box">
          <div className="cd-label cd-label--dawn">TODAY'S REP</div>
          <div className="cd-vote-meaning">{lesson.vote}</div>
          <div className="cd-vote-action">→ {lesson.action}</div>
        </div>
        {!repDone ? (
          <button type="button" className="cd-btn cd-btn--rep" onClick={castRep}>✓ REP DONE — CAST THE VOTE</button>
        ) : (
          <div className="cd-done-line">✓ vote cast · +1 evidence · who does that? you do.</div>
        )}
      </div>

      {S.tracks.map((t) => {
        const report = bodyReportFor(t, day);
        return report ? (
          <div key={t} className="cd-card cd-card--body" style={{ "--cd-acc": TRACK_META[t].tintRgb }}>
            <div className="cd-label" style={{ color: TRACK_META[t].color }}>
              {t === "weed" ? "BODY REPORT" : "THE HONEST TIMELINE"} · DAY {day}
            </div>
            <div className="cd-body-title">{report.title}</div>
            <p className="cd-body-text">{report.body}</p>
            <div className="cd-cite">◈ {report.cite}</div>
          </div>
        ) : null;
      })}

      {hotWhy && (
        <div className="cd-card cd-card--why">
          <div className="cd-label cd-label--amber">WHY YOU'RE DOING THIS</div>
          <div className="cd-why-text">“{hotWhy.text}”</div>
        </div>
      )}

      {!closed ? (
        <div className="cd-closeout">
          <div className="cd-label">CLOSE OUT DAY {day} — honest is the only mode that works</div>
          <button type="button" className="cd-btn" onClick={closeClear}>A CLEAR DAY</button>
          <button type="button" className="cd-slip-link" onClick={onSlipFlow}>
            It slipped — take me to the comeback
          </button>
        </div>
      ) : (
        <div className="cd-done-line cd-done-line--day">
          {S.closedDays[day] === "clear"
            ? `✓ Day ${day} closed clear. ${currentRun(S) || 1} in a row — rest up.`
            : `Day ${day} logged honestly — and you're already back. That's the whole move.`}
        </div>
      )}
    </div>
  );
}

/* ═══ SLIP FLOW — the comeback (anti-AVE, fixed order) ════════════════ */

const SLIP_CAUSES = ["A place", "A person", "A feeling", "The late hours", "Boredom", "A fight", "Exhaustion"];
const RECOVERY_ACTS = ["Removed the cue from reach", "Left the room", "Texted someone real", "Cold water, face first", "10 hard pushups"];

function SlipFlow({ S, settings, onClose, celebrate, addXPSafe }) {
  const [step, setStep] = useState(0);
  const [cause, setCause] = useState(null);
  const [act, setAct] = useState(null);
  const [renegotiate, setRenegotiate] = useState(false);
  const [newLaw, setNewLaw] = useState("");
  const day = dayNumber(S);
  const votesFor = S.votes;
  const votesAgainst = (S.stats.slips || 0) + 1;
  const track = S.tracks[0] || "weed";

  useEffect(() => {
    closeOutDay("slip"); // idempotent — logs the day honestly, resets nothing
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="cd-slip">
      {step === 0 && (
        <div className="cd-ob-step">
          <div className="cd-eyebrow">FIRST — WHAT WAS THE SITUATION?</div>
          <h1 className="cd-h1">Before anything else:<br />where did it find you?</h1>
          <p className="cd-p cd-p--soft">
            Not “what's wrong with me” — that question relapses people. What was the <em>setup</em>?
          </p>
          <div className="cd-chips cd-chips--wrap">
            {SLIP_CAUSES.map((c) => (
              <button key={c} type="button" className={`cd-chip ${cause === c ? "cd-chip--on" : ""}`} onClick={() => setCause(c)}>{c}</button>
            ))}
          </div>
          <button type="button" className="cd-btn" disabled={!cause} onClick={() => setStep(1)}>FILED</button>
        </div>
      )}
      {step === 1 && (
        <div className="cd-ob-step">
          <div className="cd-eyebrow">NOW — THE MATH</div>
          <h1 className="cd-h1">{votesFor} votes for.<br />{votesAgainst} against.</h1>
          <p className="cd-p">
            That's not a broken streak — nothing here resets, ever. That's an election you're winning
            by a landslide, with one bad precinct. The study behind the 66 days found missing a single
            day changed <em>nothing</em> about whether the habit formed.
          </p>
          <div className="cd-cite">◈ Lally et al. 2010 — one miss did not affect habit formation</div>
          <button type="button" className="cd-btn" onClick={() => setStep(2)}>KEEP COUNTING</button>
        </div>
      )}
      {step === 2 && (
        <div className="cd-ob-step">
          <div className="cd-eyebrow">THE COMEBACK REP — 60 SECONDS</div>
          <h1 className="cd-h1">The last move of this day<br />is yours.</h1>
          <p className="cd-p cd-p--soft">One identity-consistent act, right now. This is the biggest-stamp vote in the whole book.</p>
          <div className="cd-chips cd-chips--wrap">
            {RECOVERY_ACTS.map((a) => (
              <button key={a} type="button" className={`cd-chip ${act === a ? "cd-chip--on" : ""}`} onClick={() => setAct(a)}>{a}</button>
            ))}
          </div>
          <button type="button" className="cd-btn" disabled={!act} onClick={() => {
            castVote("recovery", `Got back up inside the hour: ${act.toLowerCase()}. Cause filed: ${cause.toLowerCase()}.`);
            addXPSafe(XP_VALUES.cleardaySlipRecovered, "The comeback rep");
            sfxPhoenix(settings);
            celebrate(true);
            setStep(3);
          }}>DONE — STAMP IT</button>
        </div>
      )}
      {step === 3 && (
        <div className="cd-ob-step">
          <div className="cd-eyebrow">LAST — THE HONEST LEDGER</div>
          <h1 className="cd-h1">One question.</h1>
          <p className="cd-p">Does last night <strong>change the Law</strong> — or did it <strong>break it once</strong>?
            There's no silent third option; “still quit, but…” is where relapses actually live.</p>
          {!renegotiate ? (
            <>
              <button type="button" className="cd-btn" onClick={onClose}>IT BROKE ONCE — THE LAW STANDS</button>
              <button type="button" className="cd-slip-link" onClick={() => setRenegotiate(true)}>I want to change the Law</button>
            </>
          ) : (
            <>
              <p className="cd-p cd-p--soft">Rewriting the Law is allowed — but it's done deliberately, in writing, with “I don't,” no hedges.</p>
              <textarea className="cd-input" rows={2} value={newLaw} onChange={(e) => setNewLaw(e.target.value)} placeholder={TRACK_META[track].lawHint} />
              <button type="button" className="cd-btn" disabled={!lawValid(newLaw)} onClick={() => { setLaw(track, newLaw.trim()); onClose(); }}>
                RE-SIGN THE LAW
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

/* ═══ IDENTITY TAB ════════════════════════════════════════════════════ */

function IdentityTab({ S, day, settings, celebrate }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(S.identity.statement);
  const [rungMoment, setRungMoment] = useState(null);
  const lastPulse = S.pulses[S.pulses.length - 1];
  const pulseDue = day >= 7 && (!lastPulse || day - lastPulse.day >= 7);

  return (
    <div className="cd-page">
      <div className="cd-section-head">
        <h1 className="cd-h1">Who you are</h1>
        <p className="cd-p cd-p--soft">Not a scoreboard — the evidence file. The label climbs, the file only fills.</p>
      </div>

      <div className="cd-card cd-card--claim">
        <div className="cd-label cd-label--dawn">THE CLAIM</div>
        {editing ? (
          <>
            <textarea className="cd-input" rows={3} value={draft} onChange={(e) => setDraft(e.target.value)} />
            <button type="button" className="cd-btn cd-btn--sm" disabled={draft.trim().length < 10}
              onClick={() => { setIdentityStatement(draft); setEditing(false); }}>Save</button>
          </>
        ) : (
          <>
            <div className="cd-claim-text cd-claim-text--big">{S.identity.statement}</div>
            <button type="button" className="cd-ghost" onClick={() => { setDraft(S.identity.statement); setEditing(true); }}>refine it</button>
          </>
        )}
      </div>

      <div className="cd-card">
        <div className="cd-label">THE LABEL LADDER — it only goes up</div>
        {LADDER.map((r) => {
          const active = S.rung === r.id;
          const reached = LADDER.findIndex((x) => x.id === S.rung) >= LADDER.findIndex((x) => x.id === r.id);
          const available = !reached && day >= r.minDay;
          return (
            <div key={r.id} className={`cd-rung ${active ? "cd-rung--on" : ""} ${reached && !active ? "cd-rung--past" : ""}`}>
              <div className="cd-rung-label">{r.label}</div>
              {active && <span className="cd-rung-tag">YOU ARE HERE</span>}
              {available && (
                <button type="button" className="cd-btn cd-btn--sm" onClick={() => {
                  const { upgraded } = upgradeRung(r.id);
                  if (upgraded) { sfxRungUp(settings); setRungMoment(r); }
                }}>
                  TAKE THE RUNG
                </button>
              )}
              {!reached && !available && <span className="cd-rung-lock">unlocks day {r.minDay}</span>}
            </div>
          );
        })}
        <div className="cd-cite">◈ “A user trying to quit” is the highest-relapse identity in the data — it's not on this ladder on purpose.</div>
      </div>

      {pulseDue && (
        <div className="cd-card cd-card--pulse">
          <div className="cd-label cd-label--dawn">THE WEEKLY PULSE — one honest tap</div>
          <div className="cd-pulse-q">Right now, which is truer?</div>
          {[
            { v: "clear", label: "I'm someone who doesn't do this anymore" },
            { v: "mostly", label: "I'm mostly that man" },
            { v: "holding", label: "I'm still holding the door shut" },
          ].map((opt) => (
            <button key={opt.v} type="button" className="cd-pulse-opt" onClick={(e) => {
              addPulse(opt.v);
              if (opt.v === "holding") {
                castVote("identity", "Answered the pulse honestly — and honesty is a clear-man move too.");
              }
              cdFx.ringFrom(e, "#4fd1c5");
              tapLight();
              sfxPop(settings);
            }}>{opt.label}</button>
          ))}
          <div className="cd-pulse-note">“Holding the door shut” isn't failure — it's a signal to do one identity rep today. The trend is the real progress bar.</div>
        </div>
      )}
      {!pulseDue && S.pulses.length > 0 && (
        <div className="cd-card">
          <div className="cd-label">PULSE TREND</div>
          <div className="cd-pulse-trend">
            {S.pulses.slice(-8).map((p, i) => (
              <div key={i} className={`cd-pulse-bar cd-pulse-bar--${p.value}`} title={`day ${p.day}`} />
            ))}
          </div>
        </div>
      )}

      <div className="cd-card">
        <div className="cd-label">THE MASK</div>
        <div className="cd-mask-line">Its name is <strong>{S.identity.maskName || "The Mask"}</strong>. It talks; it doesn't vote.</div>
        {S.tracks.map((t) => (
          <div key={t} className="cd-seal-law" style={{ borderColor: `${TRACK_META[t].color}44`, marginTop: 10 }}>
            {S.laws[t] || TRACK_META[t].lawHint}
          </div>
        ))}
      </div>

      {(S.doors.dark || S.doors.clear) && (
        <div className="cd-card">
          <div className="cd-label">TWO DOORS — written on day one</div>
          {S.doors.dark && <div className="cd-door cd-door--dark"><span>DOOR A</span>{S.doors.dark}</div>}
          {S.doors.clear && <div className="cd-door cd-door--clear"><span>DOOR B</span>{S.doors.clear}</div>}
          {S.doors.actions.length > 0 && (
            <div className="cd-door-actions">Door B runs on: {S.doors.actions.join(" · ")}</div>
          )}
        </div>
      )}

      <RungMoment rung={rungMoment} onDone={() => setRungMoment(null)} />
    </div>
  );
}

/* ═══ JOURNEY — the 66 days ═══════════════════════════════════════════ */

function Journey({ S, day }) {
  const [openPhase, setOpenPhase] = useState(PHASES.find((p) => day >= p.range[0] && day <= p.range[1])?.key || "Fog");
  return (
    <div className="cd-page">
      <div className="cd-section-head">
        <h1 className="cd-h1">66 days</h1>
        <p className="cd-p cd-p--soft">
          The real study: median 66 days to automatic, range 18–254 — and one missed day changed nothing.
          Every day here is authored, not repeated.
        </p>
      </div>
      {PHASES.map((p) => {
        const inP = day >= p.range[0] && day <= p.range[1];
        const done = day > p.range[1];
        const open = openPhase === p.key;
        const days = CURRICULUM.filter((d) => d.phase === p.key);
        return (
          <div key={p.key} className="cd-phase">
            <button type="button" className={`cd-phase-head ${inP ? "cd-phase-head--on" : ""}`} onClick={() => setOpenPhase(open ? null : p.key)}>
              <div>
                <div className="cd-label">DAYS {p.range[0]}–{p.range[1]}</div>
                <div className="cd-phase-name" style={{ color: done ? "var(--cd-teal)" : inP ? "var(--cd-dawn)" : "var(--cd-soft)" }}>
                  {p.name} {done && "✓"} {inP && "· you're here"}
                </div>
              </div>
              <span className="cd-phase-toggle">{open ? "−" : "+"}</span>
            </button>
            {open && (
              <>
                <div className="cd-phase-desc">{p.desc}</div>
                <div className="cd-daylist">
                  {days.map((d) => {
                    const isDone = day > d.day || S.curriculumDone.includes(d.day);
                    const isNow = day === d.day;
                    return (
                      <div key={d.day} className={`cd-dayrow ${isNow ? "cd-dayrow--now" : ""} ${day < d.day ? "cd-dayrow--locked" : ""}`}>
                        <span className="cd-dayrow-num" style={{ color: isDone ? "var(--cd-teal)" : isNow ? "var(--cd-dawn)" : "var(--cd-mute)" }}>
                          {isDone ? "✓" : d.day}
                        </span>
                        <div>
                          <div className="cd-dayrow-title">{d.title}</div>
                          <div className="cd-dayrow-skill">{d.skill}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ═══ THE VAULT — evidence, letters, freedom audit ════════════════════ */

const VOTE_KINDS = {
  clear: { label: "Clear day", color: "var(--cd-dawn)" },
  battle: { label: "Urge outlasted", color: "var(--cd-teal)" },
  lesson: { label: "Daily rep", color: "var(--cd-violet)" },
  identity: { label: "Identity vote", color: "var(--cd-dawn)" },
  recovery: { label: "The comeback rep", color: "var(--cd-amber)" },
  slip: { label: "Logged honestly", color: "var(--cd-amber)" },
};

function Vault({ S, day, settings }) {
  const [letter, setLetter] = useState("");
  const [freedom, setFreedom] = useState("");
  return (
    <div className="cd-page">
      <div className="cd-section-head">
        <h1 className="cd-h1">The vault</h1>
        <p className="cd-p cd-p--soft">Everything in here is yours forever. Nothing drains, nothing resets, nothing expires.</p>
      </div>

      <div className="cd-vault-stats">
        <div className="cd-stat"><div className="cd-stat-num" style={{ color: "var(--cd-dawn)" }}>{S.votes}</div><div className="cd-stat-label">votes, forever</div></div>
        <div className="cd-stat"><div className="cd-stat-num" style={{ color: "var(--cd-teal)" }}>{S.stats.clearDays}</div><div className="cd-stat-label">clear days</div></div>
        <div className="cd-stat"><div className="cd-stat-num" style={{ color: "var(--cd-green)" }}>{S.stats.battlesWon}</div><div className="cd-stat-label">urges outlasted</div></div>
        <div className="cd-stat"><div className="cd-stat-num" style={{ color: "var(--cd-amber)" }}>{S.stats.bestRun}</div><div className="cd-stat-label">best run</div></div>
      </div>

      <div className="cd-card">
        <div className="cd-label cd-label--dawn">LETTERS ACROSS TIME</div>
        {S.futureLetters.map((l, i) => {
          const unlocked = day >= l.deliverDay;
          return (
            <div key={i} className={`cd-letter ${unlocked ? "" : "cd-letter--locked"}`}>
              {unlocked ? (
                l.openedAt ? (
                  <div className="cd-letter-text">“{l.text}” <span className="cd-letter-meta">— you, day {l.fromDay}</span></div>
                ) : (
                  <button type="button" className="cd-btn cd-btn--sm" onClick={() => { openFutureLetter(i); sfxHalo(settings); }}>
                    ✉ A letter from day-{l.fromDay} you has arrived — open it
                  </button>
                )
              ) : (
                <div className="cd-letter-sealed">✉ Sealed until day {l.deliverDay} — from you, day {l.fromDay}</div>
              )}
            </div>
          );
        })}
        <textarea className="cd-input" rows={2} value={letter} onChange={(e) => setLetter(e.target.value)}
          placeholder="Write to the you at day 66… (delivered on day 66)" />
        <button type="button" className="cd-btn cd-btn--sm" disabled={letter.trim().length < 8}
          onClick={() => { addFutureLetter(letter, PROGRAM_DAYS); setLetter(""); sfxWaxSeal(settings); }}>
          SEAL IT
        </button>
      </div>

      <div className="cd-card">
        <div className="cd-label cd-label--amber">THE FREEDOM AUDIT — what's already back</div>
        <div className="cd-chips cd-chips--wrap">
          {S.freedomAudit.map((f) => <span key={f} className="cd-chip cd-chip--static">◆ {f}</span>)}
        </div>
        <input className="cd-input cd-input--sm" value={freedom} onChange={(e) => setFreedom(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && freedom.trim()) { addFreedomItem(freedom); setFreedom(""); sfxPop(settings); } }}
          placeholder="mornings · money · memory · presence…" />
      </div>

      <div className="cd-label" style={{ margin: "18px 0 10px" }}>THE BALLOT — every stamp, newest first</div>
      {S.ballot.length === 0 ? (
        <div className="cd-card cd-card--empty">Votes land here. Cast today's rep to start the file.</div>
      ) : (
        S.ballot.slice(0, 20).map((v, i) => {
          const vk = VOTE_KINDS[v.kind] || VOTE_KINDS.identity;
          return (
            <div key={i} className="cd-ballot-row">
              <span className="cd-ballot-dot" style={{ background: vk.color, boxShadow: `0 0 6px ${vk.color}` }} />
              <div>
                <div className="cd-ballot-kind" style={{ color: vk.color }}>DAY {v.day} · {vk.label.toUpperCase()}</div>
                <div className="cd-ballot-note">{v.note}</div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}

/* ═══ ROOT ════════════════════════════════════════════════════════════ */

export default function ClearDay({ onExit, settings }) {
  const [S, setS] = useState(loadClearDay);
  const [tab, setTab] = useState("today");
  const [battle, setBattle] = useState(null); // { track } | "pick"
  const [slip, setSlip] = useState(false);
  const [ceremony, setCeremony] = useState(null);
  const gamify = useGamification();
  const gamifyRef = useRef(gamify);
  gamifyRef.current = gamify;

  useEffect(() => subscribeClearDay(() => setS(loadClearDay())), []);
  const day = dayNumber(S);

  const addXPSafe = useCallback((amount, label) => {
    try { gamifyRef.current.addXP(amount, label); } catch { /* XP is decoration, never a blocker */ }
  }, []);

  const celebrate = useCallback((crit = false) => {
    const pick = crit ? CEREMONY_CRIT : CEREMONY_DECK[Math.floor(Math.random() * CEREMONY_DECK.length)];
    setCeremony(pick);
  }, []);

  if (!S.onboarded) {
    return (
      <>
        <Onboard onDone={(payload) => {
          completeOnboarding(payload);
          addXPSafe(XP_VALUES.cleardayOnboard, "CLEARDAY — the claim");
          sfxWaxSeal(settings);
          celebrate();
        }} />
        <Ceremony show={ceremony} onDone={() => setCeremony(null)} />
      </>
    );
  }

  const startBattle = () => {
    if (S.tracks.length > 1) setBattle("pick");
    else setBattle({ track: S.tracks[0] || "weed" });
  };

  if (battle && battle !== "pick") {
    return (
      <>
        <UrgeBattle
          track={battle.track}
          S={S}
          settings={settings}
          saveCard={(track, lie, comeback) => addCard(track, lie, comeback)}
          saveTapeFn={(track, dark, clearTxt) => saveTape(track, dark, clearTxt)}
          onWon={({ track, beats, seconds }) => {
            logBattle({ track, won: true, beats, seconds });
            addXPSafe(XP_VALUES.cleardayBattleWon, "Urge outlasted");
            setBattle(null);
            celebrate();
          }}
          onLeave={({ track, beats, seconds }) => {
            logBattle({ track, won: false, beats, seconds });
            setBattle(null);
          }}
          onSlip={() => { setBattle(null); setSlip(true); }}
        />
        <Ceremony show={ceremony} onDone={() => setCeremony(null)} />
      </>
    );
  }

  return (
    <div className="cd-app">
      {battle === "pick" && (
        <div className="cd-picksheet" role="dialog" aria-label="Which front?">
          <div className="cd-picksheet-card">
            <div className="cd-label cd-label--dawn">WHICH FRONT IS IT?</div>
            {S.tracks.map((t) => (
              <button key={t} type="button" className="cd-track-card cd-track-card--row" onClick={() => setBattle({ track: t })}>
                <span className="cd-track-name" style={{ color: TRACK_META[t].color }}>{TRACK_META[t].label.toUpperCase()}</span>
              </button>
            ))}
            <button type="button" className="cd-ghost" onClick={() => setBattle(null)}>not now</button>
          </div>
        </div>
      )}

      {slip && (
        <SlipFlow S={S} settings={settings} celebrate={celebrate} addXPSafe={addXPSafe} onClose={() => setSlip(false)} />
      )}

      {!slip && (
        <>
          {tab === "today" && (
            <Today S={S} day={day} settings={settings} onBattle={startBattle} onSlipFlow={() => setSlip(true)} celebrate={celebrate} addXPSafe={addXPSafe} />
          )}
          {tab === "daily" && (
            <DailyTab S={S} day={day} settings={settings} celebrate={celebrate} addXPSafe={addXPSafe} onGoTab={setTab} />
          )}
          {tab === "identity" && <IdentityTab S={S} day={day} settings={settings} celebrate={celebrate} />}
          {tab === "days" && <Journey S={S} day={day} />}
          {tab === "vault" && <Vault S={S} day={day} settings={settings} />}

          <nav className="cd-tabbar" aria-label="CLEARDAY sections">
            {[
              { id: "today", label: "Today" },
              { id: "daily", label: "Daily" },
              { id: "identity", label: "Identity" },
              { id: "days", label: "Days" },
              { id: "vault", label: "Vault" },
            ].map((it) => (
              <button key={it.id} type="button" className={`cd-tab ${tab === it.id ? "cd-tab--on" : ""}`} onClick={() => setTab(it.id)}>
                {it.label}
              </button>
            ))}
            <button type="button" className="cd-tab cd-tab--exit" onClick={onExit} aria-label="Close CLEARDAY">✕</button>
          </nav>
        </>
      )}

      <Ceremony show={ceremony} onDone={() => setCeremony(null)} />
    </div>
  );
}
