import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import UrgeBattle from "./UrgeBattle.jsx";
import DailyTab from "./DailyTab.jsx";
import Incantation from "./Incantation.jsx";
import IdentityTab, { Science } from "./IdentityTab.jsx";
import ReclamationClock, { ReclamationChip } from "./ReclamationClock.jsx";
import ClearProofWall from "./battle/ClearProofWall.jsx";
import NightLedger from "./NightLedger.jsx";
import CornerChat from "./CornerChat.jsx";
import ReachOut from "./ReachOut.jsx";
import DevotionSetup from "./DevotionSetup.jsx";
import {
  loadClearDay, subscribeClearDay, dayNumber, currentRun, PROGRAM_DAYS,
  completeOnboarding, castVote, castDailyRep, closeOutDay, logBattle,
  addWhy, addCard, saveTape,
  addFreedomItem, addFutureLetter, openFutureLetter,
  setLaw, fileService, addRepair, setRepairStatus, setDevotion,
} from "./clearDayStore.js";
import {
  lessonFor, PHASES, phaseColorVar, LADDER,
  bodyReportFor, HALTB, TRACK_META, CURRICULUM, standFor,
  NIGHT, isNightShift, SERVICE_WHO, SERVICE_RECEIPT,
} from "./clearDayData.js";
import { useGamification } from "../../hooks/useGamification.js";
import { XP_VALUES } from "../../lib/gamification.js";
import { sfxHalo, sfxCoin, sfxPop, sfxPhoenix, sfxWaxSeal } from "../../lib/sfx.js";
import cdFx from "./cdFx.js";
import { tapLight, tapMedium, slamHeavy } from "../../lib/haptics.js";

/* ═══════════════════════════════════════════════════════════════
   CLEARDAY — identity-first recovery for weed + porn.
   Every screen obeys the language laws (see the build prompt §1B):
   "I don't" never "I can't" · nouns only for the desired self ·
   no "addict" anywhere · present tense on today's evidence ·
   nothing ever resets to zero.
   ═══════════════════════════════════════════════════════════════ */

/* ── celebration deck — guaranteed reward, surprising form ──────────── */
const CEREMONY_DECK = [
  { line: "Stamped. That's who you are.", color: "#7fb4ff", n: 18 },
  { line: "Evidence, added. The case only grows.", color: "#5ce0d3", n: 16 },
  { line: "The file only fills.", color: "#ffc46b", n: 16 },
  { line: "One more brick in the man.", color: "#7be495", n: 18 },
  { line: "Doubt just lost another argument.", color: "#b49bff", n: 16 },
  { line: "Filed. Signed. Yours forever.", color: "#7fb4ff", n: 20 },
];
const CEREMONY_CRIT = { line: "★ CRITICAL EXHIBIT — the comeback rep. Biggest stamp in the book.", color: "#ffc46b", n: 44, crit: true };

function ClearNavIcon({ type }) {
  const common = { viewBox: "0 0 32 32", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true };
  if (type === "today") return <svg {...common}><path d="M5 22h22"/><path d="M9 22a7 7 0 0 1 14 0"/><path d="M16 4v4M6.5 11l3 2M25.5 11l-3 2"/><path d="M7 27h18"/></svg>;
  if (type === "daily") return <svg {...common}><path d="M8 5h16v22H8z"/><path d="M12 5V3m8 2V3"/><path d="m11.5 13 2 2 4-4"/><path d="M11.5 20h9"/><circle cx="24" cy="24" r="4" fill="currentColor" stroke="none"/><path d="m22.5 24 1 1 2-2" stroke="var(--cd-ink)"/></svg>;
  if (type === "identity") return <svg {...common}><circle cx="16" cy="9" r="4"/><path d="M8 27c.8-7 3.4-11 8-11s7.2 4 8 11"/><path d="m5 16 3-1m19 1-3-1M16 1v3"/><circle cx="5" cy="16" r="1" fill="currentColor" stroke="none"/><circle cx="27" cy="16" r="1" fill="currentColor" stroke="none"/></svg>;
  if (type === "days") return <svg {...common}><path d="M5 25C8 17 11 22 14 15s6-2 8-8"/><circle cx="5" cy="25" r="2"/><circle cx="14" cy="15" r="2"/><path d="m22 4 1.5 3L27 8l-2.5 2.5.5 3.5-3-1.5-3 1.5.5-3.5L17 8l3.5-1z"/></svg>;
  return <svg {...common}><path d="M6 10h20v17H6z"/><path d="M4 6h24v5H4z"/><path d="M12 15h8"/><path d="m16 18 1.3 2.6 2.9.4-2.1 2 .5 3-2.6-1.4-2.6 1.4.5-3-2.1-2 2.9-.4z"/></svg>;
}

function Ceremony({ show, onDone }) {
  useEffect(() => {
    if (!show) return undefined;
    const W = window.innerWidth || 390;
    const H = window.innerHeight || 844;
    cdFx.burst(W / 2, H / 2, "petal", show.n, show.color);
    if (show.crit) {
      cdFx.flare("#ffc46b");
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
        EVIDENCE FILED
      </div>
      <div className="cd-ceremony-line">{show.line}</div>
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
      sg.addColorStop(1, "#35619e");
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
        ctx.fillStyle = `rgba(255, 196, 107, ${a.toFixed(3)})`;
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
                    className={`cd-heat-flame ${w.intensity >= n ? "cd-heat-flame--on" : ""} ${w.intensity === n ? "cd-heat-flame--peak" : ""}`}
                    style={{ "--heat-level": n, "--heat-delay": `${n * -0.13}s` }}
                    onClick={() => {
                      setWhys((cur) => cur.map((x, j) => (j === i ? { ...x, intensity: n } : x)));
                      tapLight();
                    }}
                    aria-label={`Heat ${n} of 5`}
                    aria-pressed={w.intensity === n}
                  >
                    <span className="cd-flame-aura" aria-hidden="true" />
                    <span className="cd-flame-body" aria-hidden="true"><span className="cd-flame-core" /></span>
                    <span className="cd-flame-spark cd-flame-spark--a" aria-hidden="true" />
                    <span className="cd-flame-spark cd-flame-spark--b" aria-hidden="true" />
                    <span className="cd-heat-number" aria-hidden="true">{n}</span>
                  </button>
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
            Naming the Mask, writing the Law, making the Claim — that was real work. It files your
            first three exhibits right now. The case is never empty again.
          </p>
          <button type="button" className="cd-btn cd-btn--seal" onClick={seal}>FILE MY FIRST 3 EXHIBITS ➜</button>
        </div>
      )}
    </div>
  );
}

/* ═══ UNSEEN WORK — the daily service rep ═════════════════════════════
   Weed and porn are self-sealing rooms: hours alone, spent on you. One
   act pointed at another human attacks the self-focus loop directly.
   Undetected = ×2 crit — no credit taken is the whole mechanic. */
function UnseenWorkCard({ S, day, settings, celebrate, addXPSafe }) {
  const [who, setWho] = useState(null);
  const [what, setWhat] = useState("");
  const [unseen, setUnseen] = useState(true);
  const done = S.ballot.some((b) => b.day === day && b.kind === "service");

  if (done) {
    return (
      <div id="cd-unseen-work" className="cd-card cd-service cd-service--done">
        <div className="cd-card-arthead">
          <img src="/assets/clearday/unseen-work-v3.webp" alt="" />
          <div><div className="cd-label" style={{ color: "var(--cd-teal)" }}>UNSEEN WORK</div><div className="cd-card-title">Quiet proof, filed.</div></div>
        </div>
        <div className="cd-done-line" style={{ textAlign: "left" }}>✓ filed · a different engine than the one the Mask built</div>
      </div>
    );
  }

  return (
    <div id="cd-unseen-work" className="cd-card cd-service">
      <div className="cd-card-arthead">
        <img src="/assets/clearday/unseen-work-v3.webp" alt="" />
        <div><div className="cd-label" style={{ color: "var(--cd-teal)" }}>UNSEEN WORK</div><div className="cd-card-title">One act for someone else.</div></div>
      </div>
      <p className="cd-p cd-p--soft" style={{ margin: "6px 0 10px" }}>
        The old habits were hours alone, spent on you. This is the counter-move — and if nobody
        ever finds out, <strong>it crits.</strong>
      </p>
      <div className="cd-service-chips">
        {SERVICE_WHO.map((w) => (
          <button key={w} type="button" className={`cd-service-chip ${who === w ? "on" : ""}`} onClick={() => { setWho(who === w ? null : w); tapLight(); }}>
            {w}
          </button>
        ))}
      </div>
      <input
        className="cd-service-input"
        maxLength={160}
        value={what}
        placeholder="e.g. Made her coffee before she woke up."
        onChange={(e) => setWhat(e.target.value)}
      />
      <button type="button" className={`cd-service-toggle ${unseen ? "on" : ""}`} onClick={() => { setUnseen(!unseen); tapLight(); }}>
        <span className="cd-service-knob" aria-hidden="true" />
        <span><strong>Undetected.</strong> No credit taken, none coming. (×2)</span>
      </button>
      <button
        type="button"
        className="cd-btn cd-btn--rep"
        disabled={!who || what.trim().length < 6}
        onClick={(e) => {
          const { firstTime, crit } = fileService({ who, what, unseen });
          if (!firstTime) return;
          addXPSafe(XP_VALUES.cleardayWorkoutRep, "Unseen work");
          cdFx.burstFrom(e, "spark", crit ? 26 : 14, "#5ce0d3");
          tapMedium();
          sfxCoin(settings);
          celebrate(crit);
        }}
      >
        {unseen ? "FILE IT — NOBODY KNOWS" : "FILE THE REP"}
      </button>
      <div className="cd-cite">◈ {SERVICE_RECEIPT}</div>
    </div>
  );
}

/* ═══ TODAY ═══════════════════════════════════════════════════════════ */

function Today({ S, day, settings, onBattle, onSlipFlow, celebrate, addXPSafe, onGoTab, onCorner, onLedger }) {
  const [reachOpen, setReachOpen] = useState(false);
  const [devotionOpen, setDevotionOpen] = useState(false);
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

  return (
    <div className="cd-page">
      <div className="cd-hero">
        <div className="cd-hero-art" aria-hidden="true" />
        <HorizonCanvas day={day} votes={S.votes} />
        <div className="cd-hero-orbit" aria-hidden="true" />
        <div className="cd-hero-copy">
          <div className="cd-hero-greet">{greet} — day {day} of {PROGRAM_DAYS}.</div>
          <h1 className="cd-hero-title">Today, you <span>choose clear.</span></h1>
          <div className="cd-hero-rung">{rung.label.toUpperCase()}</div>
          <div className="cd-hero-votes"><strong>{S.votes}</strong> exhibits on file · none of them expire</div>
          <div className="cd-hero-progress" aria-label={`${day} of ${PROGRAM_DAYS} days`}>
            <span style={{ width: `${Math.min(100, (day / PROGRAM_DAYS) * 100)}%` }} />
          </div>
        </div>
      </div>

      {/* ── THE NIGHT SHIFT — dusk onward, Today knows what time it is.
           One night surface only: every chip is a POINTER into the Ritual,
           never a duplicate. Weed's window is the evening; porn's is
           10pm–2am (research §4) — the card escalates as the night deepens. */}
      {isNightShift(hour) && (
        !closed ? (
          <div className="cd-card cd-nightshift">
            <div className="cd-nightshift-glow" aria-hidden="true" />
            <div className="cd-label" style={{ color: "var(--cd-amber)" }}>☾ THE NIGHT WORK</div>
            <div className="cd-nightshift-line">The Mask works nights. So do we. Tap any row.</div>
            {hour >= NIGHT.ESCALATE_H && S.tracks.includes("porn") && (
              <div className="cd-nightshift-curfew">
                Phone leaves the bedroom at {NIGHT.CURFEW_H - 12}. That's not willpower — that's the law.
              </div>
            )}

            {(() => {
              const ledgerDone = S.ballot.some((b) => b.day === day && b.kind === "ledger");
              const serviceDone = S.ballot.some((b) => b.day === day && b.kind === "service");
              const devotionSet = Boolean(S.identity.devotion);
              const rows = [
                {
                  image: "/assets/clearday/night-ledger-v3.webp", tag: "NIGHTLY", tagClass: "amber", title: "The Night Ledger",
                  sub: "Take tonight's fuel out of the Mask's hands. ~60s.",
                  done: ledgerDone, onClick: () => onLedger && onLedger(),
                },
                {
                  image: "/assets/clearday/unseen-work-v3.webp", tag: "DAILY", tagClass: "teal", title: "Unseen Work",
                  sub: "One thing for someone else — crit if you're never found out.",
                  done: serviceDone,
                  onClick: () => document.getElementById("cd-unseen-work")?.scrollIntoView({ behavior: "smooth", block: "center" }),
                },
                {
                  image: "/assets/clearday/reach-out-v3.webp", tag: "BATTLE", tagClass: "rose", title: "Reach Out",
                  sub: "Put a human in the room before you face the Mask alone.",
                  done: false, onClick: () => setReachOpen(true),
                },
                {
                  image: "/assets/clearday/overwrite-v3.webp", tag: "VAULT", tagClass: "violet", title: "The Overwrite",
                  sub: "Old-chapter scenes, reshot by the clear you.",
                  done: false, onClick: () => onGoTab && onGoTab("vault"),
                },
                {
                  image: "/assets/clearday/devotion-line-v3.webp", tag: "RITUAL", tagClass: "violet", title: "The Devotion Line",
                  sub: devotionSet ? `Speaking for: ${S.identity.devotion}` : "One outward line added to your Incantation.",
                  done: devotionSet, onClick: () => setDevotionOpen(true),
                },
              ];
              return rows.map((r) => (
                <button
                  key={r.title}
                  type="button"
                  className={`cd-nwmenu-row ${r.done ? "cd-nwmenu-row--done" : ""}`}
                  onClick={() => { tapLight(); r.onClick(); }}
                >
                  <span className="cd-nwmenu-art"><img src={r.image} alt="" loading="lazy" /></span>
                  <span className="cd-nwmenu-text">
                    <span className="cd-nwmenu-title">{r.title}{r.done && " ✓"}</span>
                    <span className="cd-nwmenu-sub">{r.sub}</span>
                  </span>
                  <span className={`cd-nwmenu-tag cd-nwmenu-tag--${r.tagClass}`}>{r.tag}</span>
                </button>
              ));
            })()}

            <button type="button" className="cd-btn cd-btn--rep" style={{ marginTop: 12 }} onClick={() => onGoTab && onGoTab("daily")}>
              ☾ ENTER THE RITUAL — SEAL THE DAY →
            </button>
          </div>
        ) : (
          <div className="cd-card cd-nightshift cd-nightshift--settled">
            <div className="cd-label" style={{ color: "var(--cd-teal)" }}>☾ THE NIGHT WORK</div>
            <div className="cd-nightshift-line">Day {day} is closed. The night has nothing to work with.</div>
          </div>
        )
      )}

      {reachOpen && <ReachOut onClose={() => setReachOpen(false)} onOpenCorner={onCorner} />}
      {devotionOpen && <DevotionSetup current={S.identity.devotion} onClose={() => setDevotionOpen(false)} />}

      <ReclamationChip S={S} onGoTab={onGoTab} />

      {/* the Ritual is the only place laws are held — Today just points */}
      {!S.tracks.every((t) => S.ballot.some((b) => b.day === day && b.kind === "law" && b.track === t)) && (
        <button type="button" className="cd-seal-pointer" onClick={() => onGoTab && onGoTab("daily")}>
          ⚖ The Laws haven't been held today — the Ritual holds them → Ritual
        </button>
      )}

      <button type="button" className="cd-urge-btn" onClick={onBattle}>
        <span className="cd-urge-pulse" aria-hidden="true" />
        AN URGE, RIGHT NOW → START THE BATTLE
      </button>

      <div className="cd-card cd-card--checkin">
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

      <UnseenWorkCard S={S} day={day} settings={settings} celebrate={celebrate} addXPSafe={addXPSafe} />

      <div className="cd-card cd-card--lesson">
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
          <button type="button" className="cd-btn cd-btn--rep" onClick={castRep}>✓ REP DONE — FILE THE EXHIBIT</button>
        ) : (
          <div className="cd-done-line">✓ exhibit filed · +1 evidence · who does that? you do.</div>
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
        <>
          <button type="button" className="cd-seal-pointer" onClick={() => onGoTab && onGoTab("daily")}>
            ☀ Day {day} isn't sealed yet — the ritual closes it → Daily
          </button>
          <button type="button" className="cd-slip-link" onClick={onSlipFlow}>
            It slipped — take me to the comeback
          </button>
        </>
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
          <h1 className="cd-h1">{votesFor} exhibits for the new you.<br />{votesAgainst} against.</h1>
          <p className="cd-p">
            That's not a broken streak — nothing here resets, ever. No honest jury convicts on that
            ratio. The study behind the 66 days found missing a single day changed <em>nothing</em>{" "}
            about whether the habit formed.
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

/* ═══ JOURNEY — the 66 days ═══════════════════════════════════════════ */

function Journey({ S, day }) {
  const [openPhase, setOpenPhase] = useState(PHASES.find((p) => day >= p.range[0] && day <= p.range[1])?.key || "Fog");
  return (
    <div className="cd-page">
      <div className="cd-section-head cd-journey-hero">
        <div className="cd-journey-art" aria-hidden="true" />
        <div className="cd-hero-kicker">THE ROAD TO AUTOMATIC</div>
        <h1 className="cd-h1"><span>{day}</span> of 66 days</h1>
        <p className="cd-p cd-p--soft">
          You are not starting over. <strong>Every authored day moves the horizon closer.</strong>
        </p>
        <div className="cd-journey-progress"><span style={{ width: `${Math.min(100, (day / PROGRAM_DAYS) * 100)}%` }} /></div>
      </div>
      <ReclamationClock S={S} />
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

const EVIDENCE_KINDS = {
  clear: { label: "Clear day", color: "var(--cd-dawn)" },
  battle: { label: "Urge interrupted", color: "var(--cd-teal)" },
  lesson: { label: "Daily rep", color: "var(--cd-violet)" },
  identity: { label: "Identity move", color: "var(--cd-dawn)" },
  recovery: { label: "The comeback rep", color: "var(--cd-amber)" },
  slip: { label: "Logged honestly", color: "var(--cd-amber)" },
  law: { label: "Law held", color: "var(--cd-green)" },
  incant: { label: "Incantation", color: "var(--cd-amber)" },
  contract: { label: "Contract signed", color: "var(--cd-amber)" },
  catch: { label: "Caught the Mask", color: "var(--cd-violet)" },
  opposite: { label: "The opposite move", color: "var(--cd-teal)" },
  exhibit: { label: "Exhibit filed", color: "var(--cd-green)" },
  armed: { label: "Rule armed", color: "var(--cd-amber)" },
  chapter: { label: "The weekly rewrite", color: "var(--cd-dawn)" },
  burn: { label: "Burned for good", color: "var(--cd-amber)" },
  ledger: { label: "Settled the ledger", color: "var(--cd-amber)" },
  service: { label: "Unseen work", color: "var(--cd-teal)" },
  reachout: { label: "Reached the corner", color: "var(--cd-rose)" },
  repair: { label: "The Overwrite", color: "var(--cd-violet)" },
  devotion: { label: "The Devotion Line", color: "var(--cd-green)" },
};

const REPAIR_STATUS = {
  ready: { label: "ROLL IT — ready", short: "READY" },
  scheduled: { label: "SCHEDULED — not yet", short: "SCHEDULED" },
  "live-it": { label: "OVERWRITE BY LIVING IT", short: "LIVING IT" },
};

/* ═══ THE OVERWRITE — old-chapter scenes, reshot by the clear you ═══════
   Brand's amends (Steps 8-9), transmuted: not "make it right" but reshoot
   the scene. Named damage becomes a scene on the board; unnamed damage
   becomes fuel. Lives in the Vault — a considered act, not a checklist. */
function OverwriteSection({ S, settings }) {
  const [open, setOpen] = useState(false);
  const [scene, setScene] = useState("");
  const [should, setShould] = useState("");
  const [who, setWho] = useState("");

  return (
    <div className="cd-card cd-overwrite">
      <div className="cd-card-arthead">
        <img src="/assets/clearday/overwrite-v3.webp" alt="" loading="lazy" />
        <div><div className="cd-label" style={{ color: "var(--cd-violet)" }}>THE OVERWRITE</div><div className="cd-card-title">Reshoot the old chapter.</div></div>
      </div>
      <p className="cd-p cd-p--soft" style={{ margin: "6px 0 12px" }}>
        The loudest proof isn't in this app — it's in your people. One scene, reshot by the
        clear you, outweighs a hundred exhibits.
      </p>

      {S.repairs.map((r) => (
        <div key={r.id} className="cd-overwrite-row">
          <div className="cd-overwrite-scene">"{r.scene}"</div>
          <div className="cd-overwrite-should">→ {r.should} <span className="cd-overwrite-who">— {r.who}</span></div>
          <div className="cd-overwrite-statuses">
            {Object.entries(REPAIR_STATUS).map(([k, v]) => (
              <button
                key={k}
                type="button"
                className={`cd-overwrite-chip ${r.status === k ? "on" : ""}`}
                onClick={() => setRepairStatus(r.id, k)}
              >
                {v.short}
              </button>
            ))}
          </div>
        </div>
      ))}

      {!open ? (
        <button type="button" className="cd-ghost" onClick={() => setOpen(true)}>+ set up a reshoot</button>
      ) : (
        <div className="cd-overwrite-form">
          <textarea className="cd-input" rows={2} value={scene} onChange={(e) => setScene(e.target.value)} placeholder="The scene the old chapter shot…" />
          <input className="cd-input" value={should} onChange={(e) => setShould(e.target.value)} placeholder="How the clear me shoots it…" />
          <input className="cd-input" value={who} onChange={(e) => setWho(e.target.value)} placeholder="Who gets the new version" />
          <button
            type="button"
            className="cd-btn cd-btn--sm"
            disabled={scene.trim().length < 8 || should.trim().length < 4 || !who.trim()}
            onClick={() => {
              const { added } = addRepair({ scene, should, who });
              if (added) { setScene(""); setShould(""); setWho(""); setOpen(false); sfxWaxSeal(settings); }
            }}
          >
            SET UP THE RESHOOT
          </button>
        </div>
      )}
      <div className="cd-cite">◈ Guilt about an act predicts repair and staying clear; shame about the self predicts hiding and relapse. Structured make-it-right work converts one into the other.</div>
    </div>
  );
}

function Vault({ S, day, settings }) {
  const [letter, setLetter] = useState("");
  const [freedom, setFreedom] = useState("");
  return (
    <div className="cd-page">
      <div className="cd-vault-hero">
        <div className="cd-vault-art" aria-hidden="true" />
        <h1 className="cd-h1">The vault</h1>
        <p className="cd-p cd-p--soft">Everything in here is yours forever. Nothing drains, nothing resets, nothing expires.</p>
        <div className="cd-vault-total"><strong>{S.votes}</strong><span>pieces of evidence</span></div>
      </div>

      <Science>
        Your brain decides who you are by watching what you do — self-perception, Bem 1972. Every act
        you log becomes an exhibit in the case for the new you. That's why nothing in this vault can drain.
      </Science>

      <div className="cd-vault-stats">
        <div className="cd-stat"><div className="cd-stat-num" style={{ color: "var(--cd-dawn)" }}>{S.votes}</div><div className="cd-stat-label">exhibits, forever</div></div>
        <div className="cd-stat"><div className="cd-stat-num" style={{ color: "var(--cd-teal)" }}>{S.stats.clearDays}</div><div className="cd-stat-label">clear days</div></div>
        <div className="cd-stat"><div className="cd-stat-num" style={{ color: "var(--cd-green)" }}>{S.stats.battlesWon}</div><div className="cd-stat-label">urges interrupted</div></div>
        <div className="cd-stat"><div className="cd-stat-num" style={{ color: "var(--cd-amber)" }}>{S.stats.bestRun}</div><div className="cd-stat-label">best run</div></div>
      </div>

      <ClearProofWall battles={S.battles} />

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

      <OverwriteSection S={S} settings={settings} />

      <div className="cd-card">
        <div className="cd-label cd-label--amber">THE FREEDOM AUDIT — what's already back</div>
        <div className="cd-chips cd-chips--wrap">
          {S.freedomAudit.map((f) => <span key={f} className="cd-chip cd-chip--static">◆ {f}</span>)}
        </div>
        <input className="cd-input cd-input--sm" value={freedom} onChange={(e) => setFreedom(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && freedom.trim()) { addFreedomItem(freedom); setFreedom(""); sfxPop(settings); } }}
          placeholder="mornings · money · memory · presence…" />
      </div>

      <div className="cd-label" style={{ margin: "18px 0 10px" }}>THE CASE FILE — every exhibit, newest first</div>
      {S.ballot.length === 0 ? (
        <div className="cd-card cd-card--empty">Exhibits land here. File today's rep to open the case.</div>
      ) : (
        S.ballot.slice(0, 20).map((v, i) => {
          const vk = EVIDENCE_KINDS[v.kind] || EVIDENCE_KINDS.identity;
          return (
            <div key={i} className="cd-ballot-row">
              <span className="cd-ballot-dot" style={{ background: vk.color, boxShadow: `0 0 6px ${vk.color}` }} />
              <div>
                <div className="cd-ballot-kind" style={{ color: vk.color }}>
                  DAY {v.day} · {vk.label.toUpperCase()}
                  {v.track && v.track !== "all" && TRACK_META[v.track] && (
                    <span className="cd-ballot-track" style={{ color: TRACK_META[v.track].color, borderColor: `${TRACK_META[v.track].color}55` }}>
                      {TRACK_META[v.track].label.toUpperCase()}
                    </span>
                  )}
                </div>
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
  const [tab, setTab] = useState("daily"); // Ritual is the front door — the ceremony leads, the field follows
  const [battle, setBattle] = useState(null); // { track } | "pick"
  const [slip, setSlip] = useState(false);
  const [incant, setIncant] = useState(false);
  const [ledger, setLedger] = useState(false);
  const [corner, setCorner] = useState(false);
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
          onWon={(battleResult) => {
            logBattle({ ...battleResult, won: true });
            addXPSafe(XP_VALUES.cleardayBattleWon, "Urge interrupted");
            setBattle(null);
            celebrate();
          }}
          onLeave={(battleResult) => {
            logBattle({ ...battleResult, won: false, earlyExit: true });
            setBattle(null);
          }}
          onSlip={() => { setBattle(null); setSlip(true); }}
          onReachOutCorner={() => setCorner(true)}
        />
        <Ceremony show={ceremony} onDone={() => setCeremony(null)} />
        {corner && <CornerChat S={S} day={day} onClose={() => setCorner(false)} />}
      </>
    );
  }

  return (
    <div className={`cd-app cd-app--${tab}`}>
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
            <Today S={S} day={day} settings={settings} onBattle={startBattle} onSlipFlow={() => setSlip(true)} celebrate={celebrate} addXPSafe={addXPSafe} onGoTab={setTab} onCorner={() => setCorner(true)} onLedger={() => setLedger(true)} />
          )}
          {tab === "daily" && (
            <DailyTab
              S={S}
              day={day}
              settings={settings}
              celebrate={celebrate}
              addXPSafe={addXPSafe}
              onGoTab={setTab}
              onIncant={() => setIncant(true)}
              onSlipFlow={() => setSlip(true)}
              onLedger={() => setLedger(true)}
            />
          )}
          {tab === "identity" && <IdentityTab S={S} day={day} settings={settings} celebrate={celebrate} addXPSafe={addXPSafe} />}
          {tab === "days" && <Journey S={S} day={day} />}
          {tab === "vault" && <Vault S={S} day={day} settings={settings} />}

          <nav className="cd-tabbar" aria-label="CLEARDAY sections">
            {[
              { id: "daily", label: "Ritual" },
              { id: "today", label: "Today" },
              { id: "identity", label: "Identity" },
              { id: "days", label: "Journey" },
              { id: "vault", label: "Evidence" },
            ].map((it) => (
              <button key={it.id} type="button" className={`cd-tab ${tab === it.id ? "cd-tab--on" : ""}`} onClick={() => setTab(it.id)}>
                <span className="cd-tab-icon"><ClearNavIcon type={it.id} /></span>
                <span>{it.label}</span>
              </button>
            ))}
            <button type="button" className="cd-tab cd-tab--exit" onClick={onExit} aria-label="Close CLEARDAY"><span aria-hidden="true">×</span></button>
          </nav>
        </>
      )}

      {incant && (
        <Incantation
          statement={S.identity.statement}
          extraLine={standFor(day)}
          settings={settings}
          devotionLine={S.identity.devotion}
          onComplete={() => {
            castVote("incant", `Spoke the claim and today's stand out loud — three rounds, full voice. ("${standFor(day)}")`);
            addXPSafe(XP_VALUES.cleardayIncant, "The incantation");
          }}
          onClose={() => setIncant(false)}
        />
      )}

      {ledger && (
        <NightLedger
          day={day}
          settings={settings}
          onDone={() => {
            addXPSafe(XP_VALUES.cleardayWorkoutRep, "Settled the ledger");
          }}
          onClose={() => setLedger(false)}
        />
      )}

      {corner && <CornerChat S={S} day={day} onClose={() => setCorner(false)} />}

      <Ceremony show={ceremony} onDone={() => setCeremony(null)} />
    </div>
  );
}
