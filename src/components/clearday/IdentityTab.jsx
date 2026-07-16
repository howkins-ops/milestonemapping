import React, { useEffect, useRef, useState } from "react";
import {
  setIdentityStatement, setLaw, upgradeRung, addPulse, castVote,
  setMaskName, addBelief, setDoors, addRule, deleteRule, armRule,
  addShedding, burnShedding, addCatch, addOpposite, addChapter,
} from "./clearDayStore.js";
import { LADDER, TRACK_META, RULE_STARTERS, powerCheck, GRANDIOSE_RE } from "./clearDayData.js";
import { XP_VALUES } from "../../lib/gamification.js";
import cdFx from "./cdFx.js";
import { tapLight, tapMedium, buzzSuccess } from "../../lib/haptics.js";
import { sfxPop, sfxCoin, sfxPhoenix, sfxRungUp } from "../../lib/sfx.js";

/* ═══════════════════════════════════════════════════════════════
   IDENTITY — the GYM and the FILE.
   Ritual performs; Identity builds. Two zones:
     ZONE 1 · TODAY'S IDENTITY WORKOUT — three 60-second cognitive
       reps (catch the Mask's lie → do the opposite → file an
       exhibit). Daily minutes beat weekly hours (CBT dose research).
     ZONE 2 · THE IDENTITY FILE — the claim, the ladder, WAS/AM,
       THE CODE (non-negotiables + when-then arming), the weekly
       rewrite. Every card carries its science receipt — nothing
       in here is decoration.
   All done-states derive from the ballot; nothing drifts.
   ═══════════════════════════════════════════════════════════════ */

export function Science({ children }) {
  return <div className="cd-cite cd-cite--science">◈ THE SCIENCE · {children}</div>;
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

/* the identity constellation — one star per belief, per pulse, per rung,
   per workout rep. The file only fills; the sky only gains stars. */
function ConstellationCanvas({ S }) {
  const ref = useRef(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext("2d");
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = canvas.offsetWidth * dpr;
    canvas.height = canvas.offsetHeight * dpr;
    const W = canvas.width;
    const H = canvas.height;
    const still = document.documentElement.dataset.reducedMotion === "true" ||
      (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);

    // deterministic star field seeded by the evidence counts
    const stars = [];
    const seedStar = (i, bright) => {
      const a = (i * 137.508) % 360; // golden-angle spread
      const r = 0.18 + ((i * 61) % 100) / 260;
      stars.push({
        x: W / 2 + Math.cos((a * Math.PI) / 180) * W * r * 0.46,
        y: H * 0.52 + Math.sin((a * Math.PI) / 180) * H * r * 0.75,
        s: (bright ? 2.2 : 1.4) * dpr,
        b: bright,
        ph: (i * 0.7) % (Math.PI * 2),
      });
    };
    (S.identity.beliefs || []).forEach((_, i) => seedStar(i + 1, true));
    (S.pulses || []).forEach((p, i) => seedStar(i + 30, p.value === "clear"));
    const rungIdx = ["chose", "exuser", "clear"].indexOf(S.rung);
    for (let i = 0; i <= rungIdx; i++) seedStar(i + 70, true);
    (S.catches || []).forEach((_, i) => seedStar(i + 110, false));
    (S.opposites || []).forEach((_, i) => seedStar(i + 170, false));
    if (stars.length < 5) for (let i = stars.length; i < 5; i++) seedStar(i + 90, false);

    let raf = 0;
    let t = 0;
    let running = true;
    const draw = () => {
      if (!running) return;
      if (document.hidden) { raf = requestAnimationFrame(draw); return; }
      t += 0.012;
      ctx.clearRect(0, 0, W, H);
      // connective lines between the bright stars — the identity taking shape
      const bright = stars.filter((s) => s.b);
      ctx.strokeStyle = "rgba(127, 180, 255, 0.16)";
      ctx.lineWidth = 1 * dpr;
      ctx.beginPath();
      bright.forEach((s, i) => { if (i === 0) ctx.moveTo(s.x, s.y); else ctx.lineTo(s.x, s.y); });
      ctx.stroke();
      stars.forEach((s) => {
        const tw = still ? 0.8 : 0.55 + Math.sin(t + s.ph) * 0.35;
        ctx.fillStyle = s.b ? `rgba(255, 196, 107, ${0.5 + tw * 0.4})` : `rgba(201, 205, 232, ${0.3 + tw * 0.3})`;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.s * (0.8 + tw * 0.3), 0, Math.PI * 2);
        ctx.fill();
      });
      if (still) return; // one static frame under reduced motion
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => { running = false; cancelAnimationFrame(raf); };
  }, [S.identity.beliefs, S.pulses, S.rung, S.catches, S.opposites]);
  return <canvas ref={ref} className="cd-constellation" aria-hidden="true" />;
}

/* one law, editable in place — the Identity tab owns the Laws */
function LawLine({ track, law, settings }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(law || TRACK_META[track].lawHint);
  const ok = /i don'?t/i.test(draft) && draft.trim().length >= 10;
  if (!editing) {
    return (
      <button
        type="button"
        className="cd-seal-law cd-seal-law--edit"
        style={{ borderColor: `${TRACK_META[track].color}44`, marginTop: 10 }}
        onClick={() => { setDraft(law || TRACK_META[track].lawHint); setEditing(true); }}
      >
        {law || TRACK_META[track].lawHint}
        <span className="cd-law-edittag">edit</span>
      </button>
    );
  }
  return (
    <div style={{ marginTop: 10 }}>
      <textarea className="cd-input cd-input--sm" rows={2} value={draft} onChange={(e) => setDraft(e.target.value)} />
      {!ok && draft.trim().length >= 10 && (
        <div className="cd-nudge">The Law runs on “I don't” — not “I can't,” not “I'm trying.”</div>
      )}
      <button type="button" className="cd-btn cd-btn--sm" disabled={!ok}
        onClick={() => { setLaw(track, draft.trim()); sfxPop(settings); setEditing(false); }}>
        Re-sign the {TRACK_META[track].label} law
      </button>
    </div>
  );
}

/* a view/edit textarea used by the WAS / AM doors */
function DoorField({ label, tone, value, placeholder, onSave }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value || "");
  if (!editing) {
    return (
      <button type="button" className={`cd-door cd-door--${tone} cd-door--edit`}
        onClick={() => { setDraft(value || ""); setEditing(true); }}>
        <span>{label}</span>
        {value || <em className="cd-door-empty">{placeholder}</em>}
        <span className="cd-law-edittag">edit</span>
      </button>
    );
  }
  return (
    <div className={`cd-door cd-door--${tone}`}>
      <span>{label}</span>
      <textarea className="cd-input cd-input--sm" rows={3} value={draft}
        onChange={(e) => setDraft(e.target.value)} placeholder={placeholder} />
      <button type="button" className="cd-btn cd-btn--sm" disabled={draft.trim().length < 10}
        onClick={() => { onSave(draft.trim()); setEditing(false); }}>Save</button>
    </div>
  );
}

/* one workout rep card — collapses to a done-line once filed */
function RepCard({ n, title, done, doneLine, children }) {
  return (
    <div className={`cd-card cd-rep ${done ? "cd-rep--done" : ""}`}>
      <div className="cd-label cd-label--dawn">{n} · {title}</div>
      {done ? <div className="cd-done-line" style={{ textAlign: "left" }}>{doneLine}</div> : children}
    </div>
  );
}

export default function IdentityTab({ S, day, settings, celebrate, addXPSafe }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(S.identity.statement);
  const [rungMoment, setRungMoment] = useState(null);

  /* workout inputs */
  const [lie, setLie] = useState("");
  const [truth, setTruth] = useState("");
  const [push, setPush] = useState("");
  const [counter, setCounter] = useState("");
  const [exhibit, setExhibit] = useState("");

  /* file inputs */
  const [maskDraft, setMaskDraft] = useState(null); // null = viewing
  const [shedDraft, setShedDraft] = useState("");
  const [beliefDraft, setBeliefDraft] = useState("");
  const [ruleDraft, setRuleDraft] = useState("");
  const [armOpen, setArmOpen] = useState(null); // rule id being armed
  const [armWhen, setArmWhen] = useState("");
  const [armThen, setArmThen] = useState("");
  const [chapterDraft, setChapterDraft] = useState("");

  /* done-states — ballot-derived, never stored locally */
  const repDone = (kind) => S.ballot.some((b) => b.day === day && b.kind === kind);
  const catchDone = repDone("catch");
  const oppositeDone = repDone("opposite");
  const exhibitDone = repDone("exhibit");
  const workoutCount = [catchDone, oppositeDone, exhibitDone].filter(Boolean).length;
  const workoutDone = workoutCount === 3;

  const lastPulse = S.pulses[S.pulses.length - 1];
  const pulseDue = day >= 7 && (!lastPulse || day - lastPulse.day >= 7);
  const lastChapter = (S.chapters || [])[0];
  const chapterDue = day >= 7 && (!lastChapter || day - lastChapter.day >= 7);

  const maskName = S.identity.maskName || "The Mask";
  const rules = S.rules || [];
  const shedding = S.shedding || [];
  const unusedStarters = RULE_STARTERS.filter(
    (ex) => !rules.some((r) => r.text.toLowerCase() === ex.toLowerCase())
  );

  const fileRep = (e, xpLabel) => {
    addXPSafe(XP_VALUES.cleardayWorkoutRep, xpLabel);
    cdFx.burstFrom(e, "spark", 12);
    tapMedium();
    sfxCoin(settings);
    celebrate();
  };

  const claimGrandiose = editing && GRANDIOSE_RE.test(draft);
  const exhibitBankrupt = powerCheck(exhibit);

  const adoptRule = (text) => {
    const { added } = addRule(text);
    if (added) {
      addXPSafe(XP_VALUES.cleardayRuleAdded, "Non-negotiable added");
      tapLight();
      sfxPop(settings);
    }
  };

  return (
    <div className="cd-page">
      <div className="cd-identity-hero">
        <div className="cd-identity-art" aria-hidden="true" />
        <ConstellationCanvas S={S} />
        <div className="cd-identity-hero-copy">
          <h1 className="cd-h1">Who you are</h1>
          <p className="cd-p cd-p--soft">Not a scoreboard — the evidence file. Every star up there is something you did. The sky only fills.</p>
        </div>
      </div>

      {/* ═══ ZONE 1 — TODAY'S IDENTITY WORKOUT ═══ */}
      <div className="cd-idw-head">
        <div className="cd-label cd-label--dawn">TODAY'S IDENTITY WORKOUT · {workoutCount}/3</div>
        <div className="cd-idw-dots" aria-hidden="true">
          {[catchDone, oppositeDone, exhibitDone].map((d, i) => (
            <span key={i} className={`cd-daily-dot ${d ? "cd-daily-dot--on" : ""}`} />
          ))}
        </div>
      </div>
      {!workoutDone && (
        <Science>
          Your brain decides who you are by watching what you do — self-perception, Bem 1972.
          Three reps, two minutes, filed as evidence. Daily minutes rewire more than weekly hours.
        </Science>
      )}

      {workoutDone ? (
        <div className="cd-card cd-rep--sealed">
          <div className="cd-done-line">✓ Workout done — 3 exhibits filed. The case for the new you grew again today.</div>
        </div>
      ) : (
        <>
          <RepCard n="1" title={`THE CATCH — what did ${maskName} say today?`} done={catchDone}
            doneLine={`✓ Caught it, answered it. ${maskName} lost the argument on the record.`}>
            <input className="cd-input cd-input--sm" value={lie} onChange={(e) => setLie(e.target.value)}
              placeholder={`The lie, word for word — “${maskName} said…”`} />
            <input className="cd-input cd-input--sm" value={truth} onChange={(e) => setTruth(e.target.value)}
              placeholder="Your answer — with evidence from your own file" />
            <button type="button" className="cd-btn cd-btn--sm" disabled={lie.trim().length < 4 || truth.trim().length < 4}
              onClick={(e) => { addCatch(lie, truth); fileRep(e, "The catch"); setLie(""); setTruth(""); }}>
              CAUGHT IT — FILE THE EXHIBIT
            </button>
            <Science>
              Naming the thought as {maskName} talking cuts its pull — you're the one watching the fog,
              not the fog (ACT defusion). Answering with evidence is the CBT rep that rewires the pathway.
            </Science>
          </RepCard>

          <RepCard n="2" title="THE OPPOSITE — reverse one push" done={oppositeDone}
            doneLine="✓ Reversed it. The old identity got outvoted in real time.">
            <input className="cd-input cd-input--sm" value={push} onChange={(e) => setPush(e.target.value)}
              placeholder="What did the old you push for today?" />
            <input className="cd-input cd-input--sm" value={counter} onChange={(e) => setCounter(e.target.value)}
              placeholder="The opposite move — done, or done within the hour" />
            <button type="button" className="cd-btn cd-btn--sm" disabled={push.trim().length < 4 || counter.trim().length < 4}
              onClick={(e) => { addOpposite(push, counter); fileRep(e, "The opposite"); setPush(""); setCounter(""); }}>
              REVERSED — FILE THE EXHIBIT
            </button>
            <Science>
              The old identity is a pattern of predictions. Every deliberate reversal is a prediction
              error — the raw material your brain uses to update who it thinks you are.
            </Science>
          </RepCard>

          <RepCard n="3" title="FILE AN EXHIBIT — proof only" done={exhibitDone}
            doneLine="✓ Exhibit filed. Receipts, not announcements.">
            <input className="cd-input cd-input--sm" value={exhibit} onChange={(e) => setExhibit(e.target.value)}
              placeholder="One thing you DID today that only the new you would do" />
            {exhibitBankrupt && (
              <div className="cd-nudge">
                “{exhibitBankrupt.from}” is a spectator word. Swap it for <strong>{exhibitBankrupt.to}</strong> — this file only takes things that happened.
              </div>
            )}
            <button type="button" className="cd-btn cd-btn--sm" disabled={exhibit.trim().length < 6}
              onClick={(e) => { castVote("exhibit", exhibit.trim()); fileRep(e, "Exhibit filed"); setExhibit(""); }}>
              IT HAPPENED — FILE IT
            </button>
            <Science>
              Logged actions change self-concept; announced intentions don't — telling people your new
              identity actually reduces the striving (Gollwitzer 2009). Receipts beat announcements.
            </Science>
          </RepCard>
        </>
      )}

      {/* ═══ ZONE 2 — THE IDENTITY FILE ═══ */}
      <div className="cd-label" style={{ margin: "22px 0 10px" }}>THE IDENTITY FILE</div>

      <div className="cd-card cd-card--claim">
        <div className="cd-label cd-label--dawn">THE CLAIM</div>
        {editing ? (
          <>
            <textarea className="cd-input" rows={3} value={draft} onChange={(e) => setDraft(e.target.value)} />
            {claimGrandiose && (
              <div className="cd-nudge">
                Keep it believable <em>today</em> — “choosing,” “becoming,” “someone who” beat “forever” and “never again.”
                Claims your brain rejects backfire (Wood 2009).
              </div>
            )}
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

      {/* WAS / AM — the two doors, alive */}
      <div className="cd-card cd-wasam">
        <div className="cd-wasam-col cd-wasam-col--was">
          <div className="cd-label cd-label--rose">THE MAN I'M LEAVING</div>
          <div className="cd-mask-line">
            Its voice is <strong>{maskName}</strong>.{" "}
            {maskDraft === null ? (
              <button type="button" className="cd-law-edittag" onClick={() => setMaskDraft(maskName)}>rename</button>
            ) : (
              <span className="cd-mask-edit">
                <input className="cd-input cd-input--sm" value={maskDraft} onChange={(e) => setMaskDraft(e.target.value)} />
                <button type="button" className="cd-btn cd-btn--sm" disabled={maskDraft.trim().length < 2}
                  onClick={() => { setMaskName(maskDraft); setMaskDraft(null); }}>Save</button>
              </span>
            )}
          </div>
          <DoorField label="DOOR A — where he was headed" tone="dark" value={S.doors.dark}
            placeholder="You at 40 if nothing changed — keep it specific, keep it visible"
            onSave={(v) => setDoors({ dark: v })} />
          <div className="cd-label" style={{ marginTop: 12 }}>WHAT HE TOOK WITH HIM — name it, then burn it</div>
          {shedding.map((s) => (
            <div key={s.id} className={`cd-shed ${s.burnedAt ? "cd-shed--burned" : ""}`}>
              <span className="cd-shed-text">{s.text}</span>
              {!s.burnedAt ? (
                <button type="button" className="cd-shed-burn" aria-label={`Burn: ${s.text}`}
                  onClick={(e) => {
                    burnShedding(s.id);
                    cdFx.burstFrom(e, "ember", 16, "#ff9d5c");
                    tapMedium();
                    sfxPhoenix(settings);
                    celebrate();
                  }}>🔥 BURN IT</button>
              ) : (
                <span className="cd-shed-ash">burned · it stays in the ashes</span>
              )}
            </div>
          ))}
          <input className="cd-input cd-input--sm" value={shedDraft} onChange={(e) => setShedDraft(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && shedDraft.trim().length >= 3) { addShedding(shedDraft); setShedDraft(""); tapLight(); } }}
            placeholder="a habit, an excuse, a version of the story… ⏎ to add" />
        </div>

        <div className="cd-wasam-col cd-wasam-col--am">
          <div className="cd-label cd-label--green">THE MAN I'M BECOMING</div>
          <DoorField label="DOOR B — a Tuesday in his life" tone="clear" value={S.doors.clear}
            placeholder="Also specific: the morning, who's there, what you've built"
            onSave={(v) => setDoors({ clear: v })} />
          {S.doors.actions.length > 0 && (
            <div className="cd-door-actions">Door B runs on: {S.doors.actions.join(" · ")}</div>
          )}
          <div className="cd-label" style={{ marginTop: 12 }}>WHAT HE BELIEVES — the constellation feeds on these</div>
          {(S.identity.beliefs || []).map((b) => (
            <div key={b.id} className="cd-shed">
              <span className="cd-shed-text">★ {b.text}</span>
            </div>
          ))}
          <input className="cd-input cd-input--sm" value={beliefDraft} onChange={(e) => setBeliefDraft(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && beliefDraft.trim().length >= 4) { addBelief("all", beliefDraft); setBeliefDraft(""); tapLight(); sfxPop(settings); } }}
            placeholder="something true of him you're proving… ⏎ to add a star" />
        </div>
        <Science>
          Vivid contact with the future self is the strongest known antidote to “just this once”
          (future-self continuity, Hershfield). Writing the old self out loud makes it something
          you HAD, not something you ARE — narrative externalization.
        </Science>
      </div>

      {/* THE CODE — laws + non-negotiables, when-then armed */}
      <div className="cd-card">
        <div className="cd-label">THE CODE — the laws &amp; the non-negotiables</div>
        <div className="cd-mask-line">{maskName} talks. It doesn't get a say in this file.</div>
        {S.tracks.map((t) => (
          <LawLine key={t} track={t} law={S.laws[t]} settings={settings} />
        ))}

        {rules.length > 0 && (
          <div className="cd-rules">
            {rules.map((r, i) => (
              <div key={r.id} className="cd-rule">
                <div className="cd-rule-row">
                  <span className="cd-rule-num">§{String(i + 1).padStart(2, "0")}</span>
                  <span className="cd-rule-text">{r.text}</span>
                  {r.armedAt && <span className="cd-rule-armed" title={`WHEN ${r.when} → ${r.then}`}>⚡</span>}
                  <button type="button" className="cd-rule-x" aria-label={`Delete rule: ${r.text}`}
                    onClick={() => deleteRule(r.id)}>✕</button>
                </div>
                {r.armedAt ? (
                  <div className="cd-rule-when">WHEN {r.when} → {r.then}</div>
                ) : armOpen === r.id ? (
                  <div className="cd-rule-armform">
                    <input className="cd-input cd-input--sm" value={armWhen} onChange={(e) => setArmWhen(e.target.value)}
                      placeholder="WHEN… (the exact moment it gets tested)" />
                    <input className="cd-input cd-input--sm" value={armThen} onChange={(e) => setArmThen(e.target.value)}
                      placeholder="I… (the exact move, no thinking required)" />
                    <button type="button" className="cd-btn cd-btn--sm" disabled={armWhen.trim().length < 3 || armThen.trim().length < 3}
                      onClick={(e) => {
                        armRule(r.id, armWhen, armThen);
                        cdFx.burstFrom(e, "spark", 10, "#ffc46b");
                        tapMedium(); sfxPop(settings);
                        setArmOpen(null); setArmWhen(""); setArmThen("");
                      }}>⚡ ARM IT</button>
                  </div>
                ) : (
                  <button type="button" className="cd-ghost cd-ghost--sm" onClick={() => { setArmOpen(r.id); setArmWhen(""); setArmThen(""); }}>
                    ⚡ arm it with a when-then
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="cd-rule-add">
          <input className="cd-input cd-input--sm" value={ruleDraft} onChange={(e) => setRuleDraft(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && ruleDraft.trim().length >= 6) { adoptRule(ruleDraft.trim()); setRuleDraft(""); } }}
            placeholder="A rule the new you doesn't break…" />
          <button type="button" className="cd-btn cd-btn--sm" disabled={ruleDraft.trim().length < 6}
            onClick={() => { adoptRule(ruleDraft.trim()); setRuleDraft(""); }}>+ ADD (+{XP_VALUES.cleardayRuleAdded} XP)</button>
        </div>
        {unusedStarters.length > 0 && (
          <div className="cd-chips cd-chips--wrap" style={{ marginTop: 10 }}>
            {unusedStarters.map((ex) => (
              <button key={ex} type="button" className="cd-chip" onClick={() => adoptRule(ex)}>+ {ex}</button>
            ))}
          </div>
        )}
        <Science>
          A rule armed with a when-then trigger is one of the strongest effects in behavior science —
          d = 0.65 across 94 studies (Gollwitzer &amp; Sheeran). The Ritual rehearses one armed rule
          every night; write them here.
        </Science>
      </div>

      {/* THE WEEKLY REWRITE — pulse + chapter, one card, due weekly */}
      {(pulseDue || chapterDue) && (
        <div className="cd-card cd-card--pulse">
          <div className="cd-label cd-label--dawn">THE WEEKLY REWRITE</div>
          {pulseDue && (
            <>
              <div className="cd-pulse-q">First — right now, which is truer?</div>
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
                  cdFx.ringFrom(e, "#5ce0d3");
                  tapLight();
                  sfxPop(settings);
                }}>{opt.label}</button>
              ))}
              <div className="cd-pulse-note">“Holding the door shut” isn't failure — it's a signal to do one extra workout rep today. The trend is the real progress bar.</div>
            </>
          )}
          {chapterDue && (
            <>
              <div className="cd-pulse-q" style={{ marginTop: pulseDue ? 14 : 0 }}>
                Then — write this week as a chapter. The low point, and the turning point.
              </div>
              <textarea className="cd-input" rows={3} value={chapterDraft}
                onChange={(e) => setChapterDraft(e.target.value)}
                placeholder="Where it got hard this week… and the moment it turned." />
              <button type="button" className="cd-btn cd-btn--sm" disabled={chapterDraft.trim().length < 20}
                onClick={(e) => {
                  const { added } = addChapter(chapterDraft);
                  if (added) {
                    addXPSafe(XP_VALUES.cleardayChapter, "The weekly rewrite");
                    cdFx.burstFrom(e, "petal", 14);
                    tapMedium(); sfxCoin(settings); celebrate();
                    setChapterDraft("");
                  }
                }}>WRITE IT INTO THE RECORD</button>
              <Science>
                People who narrate their story with a turning point stay recovered at nearly double the
                rate — redemption arcs, 83% vs 44% (Dunlop &amp; Tracy 2013). You're not logging a week; you're authoring one.
              </Science>
            </>
          )}
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
          {lastChapter && (
            <div className="cd-cite" style={{ marginTop: 8 }}>
              last chapter · day {lastChapter.day} — “{lastChapter.text.slice(0, 90)}{lastChapter.text.length > 90 ? "…" : ""}”
            </div>
          )}
        </div>
      )}

      <RungMoment rung={rungMoment} onDone={() => setRungMoment(null)} />
    </div>
  );
}
