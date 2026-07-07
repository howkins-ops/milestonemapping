import React, { useEffect, useRef, useState } from "react";
import RewardBoard from "./RewardBoard.jsx";
import ArchetypePick from "./ArchetypePick.jsx";
import CharacterForge from "./CharacterForge.jsx";
import { SCROLLS } from "./data/scrolls.js";
import { sfxImpact, sfxChalkPoof, sfxScrollUnfurl, sfxForgeStrike } from "../../../lib/sfx.js";

/* ═══════════════════════════════════════════════════════════════
   THE CROSSING — Hero's Journey stages 1–4 as a playable cinematic.
   ordinary → knock (the missable Call) → refusal → rewards →
   archetype → forge → seal.
   Resume-safe: each step persists to flags.crossingStep. The final
   message of the whole flow lands LAST (anterograde memory).
   ═══════════════════════════════════════════════════════════════ */

const MIRROR_PROMPTS = [
  {
    id: "energy", q: "The energy when you wake:",
    chips: ["runs out by noon", "comes and goes", "steady, mostly"],
  },
  {
    id: "mirror", q: "The mirror, honestly:",
    chips: ["I look away fast", "some days are fine", "I can hold it"],
  },
  {
    id: "drive", q: "The drive:",
    chips: ["quieter than it was", "there, but buried", "still burning"],
  },
];

const STEPS = ["ordinary", "knock", "refusal", "rewards", "archetype", "forge", "seal"];

export default function AlphaCall({ alpha, settings, addXP, onDone }) {
  const { state } = alpha;
  const startStep = state.flags.crossingStep && STEPS.includes(state.flags.crossingStep)
    ? state.flags.crossingStep
    : "ordinary";
  const [step, setStep] = useState(startStep);
  const [refused, setRefused] = useState(false);

  const saveStep = (next) => {
    setStep(next);
    alpha.patchState({ flags: { ...alpha.state.flags, crossingStep: next } });
  };

  /* ── step handlers ── */
  const finishOrdinary = (answers) => {
    alpha.patchState({ flags: { ...alpha.state.flags, mirror: answers, crossingStep: "knock" } });
    setStep("knock");
  };

  const answerKnock = () => {
    sfxImpact(2, settings);
    if (!alpha.state.flags.callAnswered) {
      alpha.answerCall(); // stage 2 + `call` event
      addXP(10, "The Call — answered");
    }
    saveStep("refusal");
  };

  const walkAway = () => {
    setRefused(true);
    sfxChalkPoof(settings);
    saveStep("knock");
  };

  const cross = () => {
    sfxChalkPoof(settings);
    alpha.patchState({ stage: Math.max(alpha.state.stage, 3), flags: { ...alpha.state.flags, crossingStep: "rewards" } });
    setStep("rewards");
  };

  const pickRewards = (picks) => {
    alpha.patchState({ flags: { ...alpha.state.flags, rewardPicks: picks, crossingStep: "archetype" } });
    setStep("archetype");
  };

  const pickArchetype = (id) => {
    alpha.patchState({ archetype: id, flags: { ...alpha.state.flags, crossingStep: "forge" } });
    setStep("forge");
  };

  const forged = (v) => {
    sfxForgeStrike(settings);
    alpha.forgeCharacter(v); // stage 4 + forge event
    addXP(25, "Character forged in the Iron");
    saveStep("seal");
  };

  const sealDone = () => {
    alpha.patchState({
      stage: 5,
      flags: { ...alpha.state.flags, crossingDone: true, crossingStep: null, scrolls: [...(alpha.state.flags.scrolls || []), "call"] },
    });
    alpha.logEvent("scroll", { scrollId: "call" });
    alpha.logEvent("stage_up", { from: 4, to: 5 });
    addXP(10, "Wisdom scroll — collected");
    onDone();
  };

  return (
    <div className="iw-al-crossing" key={step}>
      {step === "ordinary" && <OrdinaryWorld onDone={finishOrdinary} settings={settings} />}
      {step === "knock" && <TheKnock onAnswer={answerKnock} refused={refused} settings={settings} />}
      {step === "refusal" && <TheRefusal onWalk={walkAway} onCross={cross} />}
      {step === "rewards" && <RewardBoard onDone={pickRewards} settings={settings} />}
      {step === "archetype" && <ArchetypePick onPick={pickArchetype} settings={settings} />}
      {step === "forge" && <CharacterForge onForge={forged} settings={settings} />}
      {step === "seal" && <MentorSeal onDone={sealDone} settings={settings} />}
    </div>
  );
}

/* ── STAGE 1 · the Ordinary World mirror ── */
function OrdinaryWorld({ onDone, settings }) {
  const [answers, setAnswers] = useState({});
  const answered = Object.keys(answers).length;
  const complete = answered === MIRROR_PROMPTS.length;
  return (
    <div className="iw-al-ordinary">
      <div className="iw-eyebrow">stage one · the ordinary world</div>
      <h2 className="iw-display iw-page-title">Look around, honestly.</h2>
      <p className="iw-body iw-al-forge-sub">
        Nothing here is a test. Three honest reads of the world you're
        standing in — the one that feels normal because it's familiar.
      </p>
      {MIRROR_PROMPTS.map((p, i) => (
        <div key={p.id} className={`iw-al-mirror-q ${i > answered ? "iw-al-mirror-wait" : ""}`}>
          <div className="iw-al-mirror-prompt">{p.q}</div>
          <div className="iw-al-mirror-chips">
            {p.chips.map((c) => (
              <button key={c}
                className={`iw-chip-btn ${answers[p.id] === c ? "iw-chip-on" : ""}`}
                onClick={() => { sfxChalkPoof(settings); setAnswers((a) => ({ ...a, [p.id]: c })); }}>
                {c}
              </button>
            ))}
          </div>
        </div>
      ))}
      {complete && (
        <div className="iw-al-ordinary-close iw-drop-in">
          <p className="iw-al-mentor-line">
            “Familiar is not the same as comfortable. Remember that when
            this room tries to call you back.”
          </p>
          <button className="iw-btn-ember iw-btn-wide" onClick={() => onDone(answers)}>
            step outside
          </button>
        </div>
      )}
    </div>
  );
}

/* ── STAGE 2 · the knock (deliberately small and missable) ── */
function TheKnock({ onAnswer, refused, settings }) {
  const [hint, setHint] = useState(false);
  const posRef = useRef({
    left: `${18 + Math.random() * 56}%`,
    top: `${22 + Math.random() * 44}%`,
  });
  useEffect(() => {
    const t = setTimeout(() => setHint(true), 8000);
    return () => clearTimeout(t);
  }, []);
  return (
    <div className="iw-al-knockroom">
      <div className="iw-eyebrow iw-al-knock-eyebrow">stage two · listen</div>
      {refused && (
        <p className="iw-al-mentor-line iw-al-knock-refused">
          “It stays. Quieter now — but it stays.”
        </p>
      )}
      <button className="iw-al-knock" style={posRef.current} onClick={onAnswer}
        aria-label="Answer the call">
        <span className="iw-al-knock-core" />
        <span className="iw-al-knock-ring" />
      </button>
      {hint && (
        <p className="iw-al-knock-hint iw-drop-in">
          “It's there. Calls are quiet, random, easy to miss.
          Your only job is to notice.”
        </p>
      )}
      <p className="iw-al-disclaimer iw-al-knock-disclaimer">
        Alpha Mode is a game system — stats, timers, and meters.
        It is not medical or nutrition advice.
      </p>
    </div>
  );
}

/* ── STAGE 3 · the refusal, named before it happens ── */
function TheRefusal({ onWalk, onCross }) {
  return (
    <div className="iw-al-refusal">
      <div className="iw-eyebrow">stage three · the refusal</div>
      <h2 className="iw-display iw-page-title">Before you cross —</h2>
      <div className="iw-al-mentor-card">
        <p className="iw-al-mentor-line">
          “Somewhere in the next month, a voice will tell you this is
          bullshit. I'm naming it now so you recognize it later: that
          voice is fear of inadequacy wearing a clever disguise.”
        </p>
        <p className="iw-al-mentor-line">
          “You can walk away. The door doesn't lock. But be honest about
          which choice is actually the frightening one — staying should
          scare you more than leaving.”
        </p>
      </div>
      <div className="iw-al-refusal-actions">
        <button className="iw-btn-ghost" onClick={onWalk}>walk away</button>
        <button className="iw-btn-ember" onClick={onCross}>cross</button>
      </div>
    </div>
  );
}

/* ── STAGE 4 seal · the first scroll + the last word ── */
function MentorSeal({ onDone, settings }) {
  const scroll = SCROLLS.find((s) => s.id === "call");
  useEffect(() => { sfxScrollUnfurl(settings); /* eslint-disable-next-line */ }, []);
  return (
    <div className="iw-al-seal">
      <div className="iw-eyebrow">stage four · the mentor</div>
      <div className="iw-al-scroll iw-al-scroll-unfurl">
        <div className="iw-eyebrow">wisdom scroll · your first</div>
        <div className="iw-al-scroll-line">“{scroll.line}”</div>
        <div className="iw-al-scroll-voice">— {scroll.voice}</div>
      </div>
      <div className="iw-al-mentor-card">
        <p className="iw-al-mentor-line">
          “The gates are on the map now. PRIME first — the threshold
          guardian. Four weeks. The numbers are already set.”
        </p>
        <p className="iw-al-mentor-line iw-al-final-line">
          “Show up Monday. That's the entire secret.
          Everything else is arithmetic.”
        </p>
      </div>
      <button className="iw-btn-ember iw-btn-wide" onClick={onDone}>open the map</button>
    </div>
  );
}
