import React, { useEffect, useRef, useState } from "react";
import {
  setIdentityStatement, setLaw, upgradeRung, addPulse, castVote,
  setMaskName, addBelief, setDoors, addRule, deleteRule, armRule,
  addShedding, burnShedding, addCatch, addOpposite, addChapter,
} from "./clearDayStore.js";
import { LADDER, TRACK_META, RULE_STARTERS, powerCheck } from "./clearDayData.js";
import { STAGES, SCIENCE, QUIET_DAY_LIE, QUIET_DAY_TRUTH, claimOk } from "./identityForge.js";
import ClaimForge from "./ClaimForge.jsx";
import IdentitySeal from "./IdentitySeal.jsx";
import Incantation from "./Incantation.jsx";
import { XP_VALUES } from "../../lib/gamification.js";
import cdFx from "./cdFx.js";
import { tapLight, tapMedium, buzzSuccess } from "../../lib/haptics.js";
import { sfxPop, sfxCoin, sfxPhoenix, sfxRungUp } from "../../lib/sfx.js";
import "../../styles/clearday-forge.css";

/* ═══════════════════════════════════════════════════════════════
   IDENTITY — THE FORGE, then THE FILE.

   Two states, never both:

   THE FORGE (until it's signed) — a real build, in order, gated.
     1 THE OLD NAME   past tense, once. The only space he gets.
     2 THE NEW NAME   specific enough to walk into.
     3 THE CLAIM      one present-tense sentence, forged from his
                      own words by THE CORNER (Haiku 4.5).
     4 THE CODE       the laws + non-negotiables, when-then armed.
     5 SEAL IT        signed in his own hand, then said out loud.

   THE FILE (once signed) — three zones, not seven cards.
     HERO             the claim IS the header. Signed, stamped.
     TODAY'S PROOF    inverted: his move first, the Fog last and
                      optional. The old self never gets the first
                      cursor of the day again.
     THE CODE         compact, with the armed meter.
     THE RECORD       everything else, folded away. Nothing lost.

   Laws that still hold: every done-state derives from the ballot;
   the reps reuse the exhibit/opposite/catch kinds so nothing
   migrates and the Ritual's pointer chip keeps agreeing; the word
   "addict" appears nowhere; nothing ever resets to zero.
   ═══════════════════════════════════════════════════════════════ */

/* The open receipt — kept exported and byte-identical in markup because
   the Vault renders it too (ClearDay.jsx imports Science from here). */
export function Science({ children }) {
  return <div className="cd-cite cd-cite--science">◈ THE SCIENCE · {children}</div>;
}

/* The collapsed receipt — one per zone instead of one per card. The
   citations were the best thing on the old page and also most of its
   wall of text; folding them keeps the proof and drops the noise. */
function Receipt({ children, label = "why this works" }) {
  return (
    <details className="idf-receipt">
      <summary>◈ {label}</summary>
      <div className="idf-receipt-body">{children}</div>
    </details>
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

/* the identity constellation — one star per belief, per pulse, per rung,
   per rep. The file only fills; the sky only gains stars. */
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
      // Connective lines between the bright stars — the identity taking shape.
      // Only short hops, and only once there are enough stars to make a shape:
      // with two or three, the polyline reads as a scratch across the claim
      // rather than a constellation, and the claim is the one thing on this
      // screen that must stay clean.
      const bright = stars.filter((s) => s.b);
      if (bright.length >= 4) {
        const maxHop = W * 0.34;
        ctx.strokeStyle = "rgba(127, 180, 255, 0.13)";
        ctx.lineWidth = 1 * dpr;
        for (let i = 1; i < bright.length; i++) {
          const a = bright[i - 1];
          const b = bright[i];
          if (Math.hypot(b.x - a.x, b.y - a.y) > maxHop) continue;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
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
        <span className="cd-law-edittag">{law ? "edit" : "sign it"}</span>
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
        Sign the {TRACK_META[track].label} law
      </button>
    </div>
  );
}

/* a view/edit textarea used by the WAS / AM doors */
function DoorField({ label, tone, value, placeholder, onSave, settings }) {
  const [editing, setEditing] = useState(!value);
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
        onClick={() => { onSave(draft.trim()); sfxPop(settings); setEditing(false); }}>Save</button>
    </div>
  );
}

/* the ashes list — name what he took with him, then burn it */
function ShedList({ shedding, settings, celebrate }) {
  const [draft, setDraft] = useState("");
  return (
    <>
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
              }}>BURN IT</button>
          ) : (
            <span className="cd-shed-ash">burned · it stays in the ashes</span>
          )}
        </div>
      ))}
      <input className="cd-input cd-input--sm" value={draft} onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter" && draft.trim().length >= 3) { addShedding(draft); setDraft(""); tapLight(); } }}
        placeholder="a habit, an excuse, a version of the story… ⏎ to add" />
    </>
  );
}

/* what he believes — each one becomes a bright star */
function BeliefList({ beliefs, settings }) {
  const [draft, setDraft] = useState("");
  return (
    <>
      {beliefs.map((b) => (
        <div key={b.id} className="cd-shed">
          <span className="cd-shed-text"><span className="cd-belief-mark" aria-hidden="true" />{b.text}</span>
        </div>
      ))}
      <input className="cd-input cd-input--sm" value={draft} onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && draft.trim().length >= 4) {
            addBelief("all", draft); setDraft(""); tapLight(); sfxPop(settings);
          }
        }}
        placeholder="something true of him you're proving… ⏎ to add a star" />
    </>
  );
}

/* THE CODE — laws + non-negotiables, when-then armed. One component,
   mounted by forge stage 4 and by the sealed file's zone 3. */
function TheCode({ S, settings, addXPSafe }) {
  const [ruleDraft, setRuleDraft] = useState("");
  const [armOpen, setArmOpen] = useState(null);
  const [armWhen, setArmWhen] = useState("");
  const [armThen, setArmThen] = useState("");

  const rules = S.rules || [];
  const armed = rules.filter((r) => r.armedAt);
  const unusedStarters = RULE_STARTERS.filter(
    (ex) => !rules.some((r) => r.text.toLowerCase() === ex.toLowerCase())
  );

  const adoptRule = (text) => {
    const { added } = addRule(text);
    if (added) {
      addXPSafe(XP_VALUES.cleardayRuleAdded, "Non-negotiable added");
      tapLight();
      sfxPop(settings);
    }
  };

  return (
    <>
      {S.tracks.map((t) => (
        <LawLine key={t} track={t} law={S.laws[t]} settings={settings} />
      ))}

      {rules.length > 0 && (
        <>
          <div className="idf-armed-meter">
            <span className="idf-armed-count">{armed.length}/{rules.length} ARMED</span>
            <span className="idf-armed-pips" aria-hidden="true">
              {rules.map((r) => (
                <span key={r.id} className={`idf-pip ${r.armedAt ? "idf-pip--on" : ""}`} />
              ))}
            </span>
          </div>
          <div className="cd-rules">
            {rules.map((r, i) => (
              <div key={r.id} className="cd-rule">
                <div className="cd-rule-row">
                  <span className="cd-rule-num">§{String(i + 1).padStart(2, "0")}</span>
                  <span className="cd-rule-text">{r.text}</span>
                  {r.armedAt && <span className="cd-rule-armed" title={`WHEN ${r.when} → ${r.then}`}>ARMED</span>}
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
                      }}>ARM IT</button>
                  </div>
                ) : (
                  <button type="button" className="cd-ghost cd-ghost--sm" onClick={() => { setArmOpen(r.id); setArmWhen(""); setArmThen(""); }}>
                    arm it with a when-then
                  </button>
                )}
              </div>
            ))}
          </div>
        </>
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
    </>
  );
}

/* one daily rep — the active one is a full card, everything else is a line.
   The page never shows three open reps at once. */
function Rep({ n, title, sub, done, doneLine, open, onOpen, children }) {
  if (done) {
    return (
      <div className="idf-rep idf-rep--done">
        <span className="idf-rep-mark" aria-hidden="true">✓</span>
        <span className="idf-rep-doneline">{doneLine}</span>
      </div>
    );
  }
  if (!open) {
    return (
      <button type="button" className="idf-rep idf-rep--shut" onClick={onOpen}>
        <span className="idf-rep-mark" aria-hidden="true">{n}</span>
        <span className="idf-rep-shuttitle">{title}</span>
        <span className="idf-rep-chev" aria-hidden="true">›</span>
      </button>
    );
  }
  return (
    <div className="cd-card idf-rep-card">
      <h2 className="idf-rep-title"><span>{n}</span>{title}</h2>
      {sub && <p className="idf-rep-sub">{sub}</p>}
      {children}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════ */

export default function IdentityTab({ S, day, settings, celebrate, addXPSafe }) {
  const [rungMoment, setRungMoment] = useState(null);
  const [speakOpen, setSpeakOpen] = useState(false);
  const [refining, setRefining] = useState(false);
  const [maskDraft, setMaskDraft] = useState(null);
  const [chapterDraft, setChapterDraft] = useState("");
  const [openStage, setOpenStage] = useState(null);
  const [openRep, setOpenRep] = useState(null);

  /* workout inputs — his line is always the first field */
  const [move, setMove] = useState("");
  const [counter, setCounter] = useState("");
  const [push, setPush] = useState("");
  const [answer, setAnswer] = useState("");
  const [said, setSaid] = useState("");

  const claim = S.identity.statement || "";
  const seal = S.identity.seal || null;
  const sealed = Boolean(seal && seal.sealedAt);
  // The file is only as good as the last time he signed it.
  const staleSeal = sealed && String(seal.claim || "").trim() !== claim.trim();

  const maskName = S.identity.maskName || "The Mask";
  const rules = S.rules || [];
  const armed = rules.filter((r) => r.armedAt);
  const shedding = S.shedding || [];
  const beliefs = S.identity.beliefs || [];
  const lawSigned = S.tracks.some((t) => /i don'?t/i.test(S.laws[t] || ""));

  /* ── forge stage gates ── */
  const stageDone = {
    old: Boolean(S.identity.maskName) && (S.doors.dark || "").trim().length >= 10,
    new: (S.doors.clear || "").trim().length >= 10,
    claim: claimOk(claim),
    code: lawSigned && rules.length >= 3 && armed.length >= 1,
    seal: sealed,
  };
  const doneCount = STAGES.filter((s) => stageDone[s.id]).length;
  const firstUndoneStage = STAGES.findIndex((s) => !stageDone[s.id]);
  const shownStage = openStage !== null ? openStage : firstUndoneStage;
  useEffect(() => { setOpenStage(null); }, [doneCount]);

  /* ── done-states — ballot-derived, never stored locally ── */
  const repDone = (kind) => S.ballot.some((b) => b.day === day && b.kind === kind);
  const moveDone = repDone("exhibit");
  const reversalDone = repDone("opposite");
  const answerDone = repDone("catch");
  const proof = [moveDone, reversalDone, answerDone];
  const proofCount = proof.filter(Boolean).length;
  const firstUndoneRep = proof.findIndex((p) => !p);
  const shownRep = openRep !== null ? openRep : firstUndoneRep;
  useEffect(() => { setOpenRep(null); }, [proofCount]);

  const lastPulse = S.pulses[S.pulses.length - 1];
  const pulseDue = day >= 7 && (!lastPulse || day - lastPulse.day >= 7);
  const lastChapter = (S.chapters || [])[0];
  const chapterDue = day >= 7 && (!lastChapter || day - lastChapter.day >= 7);
  const claimableRung = LADDER.find((r) => {
    const reached = LADDER.findIndex((x) => x.id === S.rung) >= LADDER.findIndex((x) => x.id === r.id);
    return !reached && day >= r.minDay;
  });

  const fileRep = (e, xpLabel) => {
    addXPSafe(XP_VALUES.cleardayWorkoutRep, xpLabel);
    cdFx.burstFrom(e, "spark", 12);
    tapMedium();
    sfxCoin(settings);
    celebrate();
  };

  const onSpoke = () => {
    addXPSafe(XP_VALUES.cleardayIncant, "Spoke the claim");
    // Deliberately NOT the "incant" kind — the Ritual's step 1 is its own
    // ceremony and must never silently complete itself from this tab.
    castVote("identity", "Said the claim out loud — whisper, voice, roar.");
  };

  const sealedPretty = (() => {
    if (!sealed) return "";
    try {
      return new Date(seal.sealedAt).toLocaleDateString(undefined, { month: "short", day: "numeric" });
    } catch {
      return "";
    }
  })();

  const forgeCtx = {
    old: S.doors.dark,
    future: S.doors.clear,
    beliefs: beliefs.map((b) => b.text).join(" · "),
    law: S.tracks.map((t) => S.laws[t]).filter(Boolean).join(" · "),
    maskName: S.identity.maskName,
    track: S.tracks.length === 1 ? S.tracks[0] : "both",
    day,
  };

  /* ══════════════════════════════════════════════════════════════
     STATE A — THE FORGE
     ══════════════════════════════════════════════════════════════ */
  if (!sealed) {
    const stageBody = (id) => {
      if (id === "old") {
        return (
          <>
            <div className="idf-maskline">
              His voice has a name: <strong>{maskName}</strong>.{" "}
              {maskDraft === null ? (
                <button type="button" className="cd-law-edittag" onClick={() => setMaskDraft(S.identity.maskName || "")}>
                  {S.identity.maskName ? "rename" : "name it"}
                </button>
              ) : (
                <span className="cd-mask-edit">
                  <input className="cd-input cd-input--sm" value={maskDraft} onChange={(e) => setMaskDraft(e.target.value)}
                    placeholder="The Fog, The Salesman, Marcus…" />
                  <button type="button" className="cd-btn cd-btn--sm" disabled={maskDraft.trim().length < 2}
                    onClick={() => { setMaskName(maskDraft); setMaskDraft(null); tapLight(); sfxPop(settings); }}>Save</button>
                </span>
              )}
            </div>
            <DoorField label="WHERE HE WAS HEADED" tone="dark" value={S.doors.dark} settings={settings}
              placeholder="You at 40 if nothing had changed — specific, visible, past tense"
              onSave={(v) => setDoors({ dark: v })} />
            <div className="cd-label" style={{ marginTop: 14 }}>WHAT HE TOOK WITH HIM — name it, then burn it</div>
            <ShedList shedding={shedding} settings={settings} celebrate={celebrate} />
          </>
        );
      }
      if (id === "new") {
        return (
          <>
            <DoorField label="A TUESDAY IN HIS LIFE" tone="clear" value={S.doors.clear} settings={settings}
              placeholder="The morning, who's there, what you've built — specific enough to walk into"
              onSave={(v) => setDoors({ clear: v })} />
            <div className="cd-label" style={{ marginTop: 14 }}>WHAT HE BELIEVES — each one becomes a star</div>
            <BeliefList beliefs={beliefs} settings={settings} />
          </>
        );
      }
      if (id === "claim") {
        return <ClaimForge ctx={forgeCtx} value={claim} settings={settings} onSave={(v) => setIdentityStatement(v)} />;
      }
      if (id === "code") {
        return (
          <>
            <TheCode S={S} settings={settings} addXPSafe={addXPSafe} />
            {!stageDone.code && (
              <div className="idf-gate">
                To seal the file: one law signed with “I don't” · three non-negotiables · at least one ARMED.
                {" "}<span className="idf-gate-now">
                  now — {lawSigned ? "law ✓" : "law ✗"} · {rules.length}/3 rules · {armed.length ? "armed ✓" : "armed ✗"}
                </span>
              </div>
            )}
          </>
        );
      }
      return (
        <IdentitySeal S={S} day={day} claim={claim} settings={settings}
          onSealed={() => {
            addXPSafe(XP_VALUES.cleardayIdentitySealed, "Signed the identity file");
            castVote("identity", `Signed the identity file: "${claim}"`);
            celebrate();
            setSpeakOpen(true);
          }} />
      );
    };

    return (
      <div className="cd-page idf-page">
        <div className="idf-forge-hero">
          <div className="cd-eyebrow">THE IDENTITY FORGE</div>
          <h1 className="idf-h1">Goals change what you chase.<br /><span>Identity changes what you keep.</span></h1>
          <p className="idf-lede">
            Five stages, in order. Name the old version, name the new one, compress it into one sentence,
            write the code it runs on — then sign it. Nothing on this page is a scoreboard.
          </p>
          <div className="idf-progress" aria-label={`stage ${Math.min(doneCount + 1, 5)} of 5`}>
            {STAGES.map((s) => (
              <span key={s.id} className={`idf-progress-seg ${stageDone[s.id] ? "idf-progress-seg--on" : ""}`} />
            ))}
          </div>
          <div className="idf-progress-label">STAGE {Math.min(doneCount + 1, 5)} OF 5</div>
        </div>

        <Receipt label="why the order matters">{SCIENCE.forge}</Receipt>

        <div className="idf-spine">
          {STAGES.map((s, i) => {
            const done = stageDone[s.id];
            const open = i === shownStage;
            const locked = i > firstUndoneStage && firstUndoneStage !== -1;
            if (!open) {
              return (
                <button
                  key={s.id}
                  type="button"
                  className={`idf-stage-shut ${done ? "idf-stage-shut--done" : ""} ${locked ? "idf-stage-shut--locked" : ""}`}
                  onClick={() => { if (!locked || done) setOpenStage(i); }}
                  disabled={locked && !done}
                >
                  <span className="idf-stage-n">{done ? "✓" : s.n}</span>
                  <span className="idf-stage-shutlabel">{s.label}</span>
                  {locked && !done && <span className="idf-stage-lock" aria-hidden="true">·</span>}
                </button>
              );
            }
            return (
              <div key={s.id} className={`cd-card idf-stage ${done ? "idf-stage--done" : ""}`} style={{ "--cd-acc": s.accent }}>
                <div className="idf-stage-head">
                  <span className="idf-stage-n idf-stage-n--big">{done ? "✓" : s.n}</span>
                  <div>
                    <h2 className="idf-stage-label">{s.label}</h2>
                    <p className="idf-stage-lead">{s.lead}</p>
                  </div>
                </div>
                {stageBody(s.id)}
                {s.id === "claim" && <Receipt>{SCIENCE.claim}</Receipt>}
                {s.id === "code" && <Receipt>{SCIENCE.code}</Receipt>}
                {s.id === "seal" && <Receipt>{SCIENCE.seal}</Receipt>}
                {done && i < STAGES.length - 1 && (
                  <button type="button" className="cd-btn cd-btn--sm idf-next" onClick={() => setOpenStage(i + 1)}>
                    NEXT — {STAGES[i + 1].label} →
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {speakOpen && claim && (
          <Incantation statement={claim} devotionLine={S.identity.devotion} settings={settings}
            onComplete={onSpoke} onClose={() => setSpeakOpen(false)} />
        )}
        <RungMoment rung={rungMoment} onDone={() => setRungMoment(null)} />
      </div>
    );
  }

  /* ══════════════════════════════════════════════════════════════
     STATE B — THE FILE
     ══════════════════════════════════════════════════════════════ */
  return (
    <div className="cd-page idf-page">
      {/* ── HERO: the claim IS the header ── */}
      <div className="idf-file-hero">
        <ConstellationCanvas S={S} />
        <div className="idf-file-inner">
          <div className="idf-file-stamp">{(LADDER.find((r) => r.id === S.rung) || {}).label || "CHOSE"}</div>
          <blockquote className="idf-file-claim">
            <span className="idf-file-quote" aria-hidden="true">“</span>{claim}
          </blockquote>
          {seal.sig && <img className="idf-file-sig" src={seal.sig} alt="Your signature on the identity file" />}
          <div className="idf-file-standing">
            SEALED {sealedPretty} · DAY {day} · {S.votes} EXHIBIT{S.votes === 1 ? "" : "S"} · §{rules.length} · {armed.length} ARMED
          </div>
          <div className="idf-file-key">
            One star per belief, per rung, per rep. The sky only fills — nothing up there can be taken back.
          </div>
          <div className="idf-file-acts">
            <button type="button" className="cd-btn cd-btn--sm" onClick={() => { setSpeakOpen(true); tapMedium(); }}>
              ⚡ SPEAK IT
            </button>
            <button type="button" className="cd-ghost cd-ghost--sm" onClick={() => setRefining((v) => !v)}>
              {refining ? "keep it as it is" : "refine the claim"}
            </button>
          </div>
        </div>
      </div>

      {(claimableRung || pulseDue || chapterDue) && (
        <div className="idf-pointers">
          {claimableRung && (
            <button type="button" className="idf-pointer" onClick={() => {
              const { upgraded } = upgradeRung(claimableRung.id);
              if (upgraded) { sfxRungUp(settings); setRungMoment(claimableRung); }
            }}>
              a rung is waiting — take “{claimableRung.label}”
            </button>
          )}
          {(pulseDue || chapterDue) && <span className="idf-pointer idf-pointer--flat">the weekly rewrite is due ↓</span>}
        </div>
      )}

      {refining && (
        <div className="cd-card idf-stage" style={{ "--cd-acc": "127, 180, 255" }}>
          <div className="cd-label cd-label--dawn">REFINE THE CLAIM</div>
          <ClaimForge ctx={forgeCtx} value={claim} settings={settings}
            onSave={(v) => { setIdentityStatement(v); setRefining(false); }} />
          <Receipt>{SCIENCE.claim}</Receipt>
        </div>
      )}

      {staleSeal && !refining && (
        <div className="cd-card idf-stage" style={{ "--cd-acc": "255, 196, 107" }}>
          <div className="cd-label cd-label--amber">THE CLAIM CHANGED — RE-SIGN THE FILE</div>
          <IdentitySeal S={S} day={day} claim={claim} settings={settings} resign
            onSealed={() => {
              addXPSafe(XP_VALUES.cleardayIdentitySealed, "Re-signed the identity file");
              castVote("identity", `Re-signed the file: "${claim}"`);
              celebrate();
              setSpeakOpen(true);
            }} />
        </div>
      )}

      {/* ── ZONE 2: TODAY'S PROOF — his move first, always ── */}
      <div className="idf-zone-head">
        <div className="cd-label cd-label--dawn">TODAY'S PROOF · {proofCount}/3</div>
        <div className="cd-idw-dots" aria-hidden="true">
          {proof.map((d, i) => <span key={i} className={`cd-daily-dot ${d ? "cd-daily-dot--on" : ""}`} />)}
        </div>
      </div>

      {proofCount === 3 ? (
        <div className="cd-card idf-sealed-day">
          <div className="cd-done-line">✓ Three exhibits filed. The case for the new man grew again today.</div>
        </div>
      ) : (
        <>
          <Rep n="1" title="THE MOVE" done={moveDone} open={shownRep === 0} onOpen={() => setOpenRep(0)}
            sub="One thing you DID today that only the new you would do. Proof, not plans."
            doneLine="The move is filed. Receipts, not announcements.">
            <input className="cd-input cd-input--sm" value={move} onChange={(e) => setMove(e.target.value)}
              placeholder="What you did — it already happened" />
            {powerCheck(move) && (
              <div className="cd-nudge">
                “{powerCheck(move).from}” is a spectator word. Swap it for <strong>{powerCheck(move).to}</strong> —
                this file only takes things that happened.
              </div>
            )}
            <button type="button" className="cd-btn cd-btn--sm" disabled={move.trim().length < 6}
              onClick={(e) => { castVote("exhibit", move.trim()); fileRep(e, "The move"); setMove(""); }}>
              IT HAPPENED — FILE IT
            </button>
          </Rep>

          <Rep n="2" title="THE REVERSAL" done={reversalDone} open={shownRep === 1} onOpen={() => setOpenRep(1)}
            sub="One push you turned around today. Your move goes first."
            doneLine="Reversed it. The old identity got outvoted in real time.">
            <input className="cd-input cd-input--sm" value={counter} onChange={(e) => setCounter(e.target.value)}
              placeholder="What you did instead — done, or done within the hour" />
            <input className="cd-input cd-input--sm idf-input--minor" value={push} onChange={(e) => setPush(e.target.value)}
              placeholder="what the old you pushed for" />
            <button type="button" className="cd-btn cd-btn--sm" disabled={counter.trim().length < 4 || push.trim().length < 4}
              onClick={(e) => { addOpposite(push, counter); fileRep(e, "The reversal"); setPush(""); setCounter(""); }}>
              REVERSED — FILE IT
            </button>
          </Rep>

          <Rep n="3" title="THE ANSWER" done={answerDone} open={shownRep === 2} onOpen={() => setOpenRep(2)}
            sub={`If ${maskName} said anything today, here's your answer. Your line first — it gets the rebuttal, not the opening.`}
            doneLine={`Answered it. ${maskName} lost the argument on the record.`}>
            <input className="cd-input cd-input--sm" value={answer} onChange={(e) => setAnswer(e.target.value)}
              placeholder="Your answer — with evidence from your own file" />
            <input className="cd-input cd-input--sm idf-input--minor" value={said} onChange={(e) => setSaid(e.target.value)}
              placeholder={`what ${maskName} said (optional)`} />
            <button type="button" className="cd-btn cd-btn--sm" disabled={answer.trim().length < 4}
              onClick={(e) => {
                addCatch(said.trim() || QUIET_DAY_LIE, answer.trim());
                fileRep(e, "The answer");
                setAnswer(""); setSaid("");
              }}>
              ANSWERED — FILE IT
            </button>
            <button type="button" className="idf-quiet" onClick={(e) => {
              addCatch(QUIET_DAY_LIE, QUIET_DAY_TRUTH);
              fileRep(e, "A quiet day, filed");
            }}>
              it stayed quiet today →
            </button>
          </Rep>
        </>
      )}
      <Receipt label="why proof goes first">{SCIENCE.proof}</Receipt>

      {/* ── ZONE 3: THE CODE ── */}
      <div className="idf-zone-head">
        <div className="cd-label cd-label--amber">THE CODE</div>
        <span className="idf-zone-sub">{maskName} talks. It doesn't get a say in here.</span>
      </div>
      <div className="cd-card">
        <TheCode S={S} settings={settings} addXPSafe={addXPSafe} />
        <Receipt>{SCIENCE.code}</Receipt>
      </div>

      {/* ── THE WEEKLY REWRITE — only when due ── */}
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
              <div className="cd-pulse-note">“Holding the door shut” isn't failure — it's a signal to do one extra rep today. The trend is the real progress bar.</div>
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

      {/* ── THE RECORD — folded. Nothing deleted, nothing shouting. ── */}
      <details className="idf-record">
        <summary>
          <span>THE RECORD</span>
          <span className="idf-record-sub">the ladder, the two doors, the ashes, the pulse</span>
        </summary>

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

        <div className="cd-card cd-wasam">
          <div className="cd-wasam-col cd-wasam-col--was">
            <div className="cd-label cd-label--rose">THE MAN HE WAS</div>
            <div className="idf-maskline">
              His voice was named <strong>{maskName}</strong>.{" "}
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
            <DoorField label="WHERE HE WAS HEADED" tone="dark" value={S.doors.dark} settings={settings}
              placeholder="You at 40 if nothing had changed" onSave={(v) => setDoors({ dark: v })} />
            <div className="cd-label" style={{ marginTop: 12 }}>THE ASHES</div>
            <ShedList shedding={shedding} settings={settings} celebrate={celebrate} />
          </div>
          <div className="cd-wasam-col cd-wasam-col--am">
            <div className="cd-label cd-label--green">THE MAN HE'S BECOMING</div>
            <DoorField label="A TUESDAY IN HIS LIFE" tone="clear" value={S.doors.clear} settings={settings}
              placeholder="The morning, who's there, what you've built" onSave={(v) => setDoors({ clear: v })} />
            {S.doors.actions.length > 0 && (
              <div className="cd-door-actions">It runs on: {S.doors.actions.join(" · ")}</div>
            )}
            <div className="cd-label" style={{ marginTop: 12 }}>WHAT HE BELIEVES</div>
            <BeliefList beliefs={beliefs} settings={settings} />
          </div>
        </div>

        {S.pulses.length > 0 && (
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
      </details>

      {speakOpen && claim && (
        <Incantation statement={claim} devotionLine={S.identity.devotion} settings={settings}
          onComplete={onSpoke} onClose={() => setSpeakOpen(false)} />
      )}
      <RungMoment rung={rungMoment} onDone={() => setRungMoment(null)} />
    </div>
  );
}
