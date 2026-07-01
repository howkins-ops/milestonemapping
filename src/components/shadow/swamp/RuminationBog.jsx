import React, { useState } from "react";
import {
  SwampStage, Eyebrow, Heading, Lead, Science, Primary, Chips, Field, Fireflies,
} from "./swampShell.jsx";
import Boggo, { BoggoSays } from "./Boggo.jsx";
import { scanForRisk, SafetyScreen } from "./safety.jsx";
import { RUMINATION_THOUGHTS, BOG_LADDER, boggoLine } from "./swampData.js";

/* ════════════════════════════════════════════════════════════════════════
   RUMINATION BOG — the thought-loop one.

   A single thought repeats and sinks Boggo deeper. You don't win by arguing
   with the thought — you win by changing your *relationship* to it: separate
   fact from story, name the feeling, say it truer, take one small action.
   Each rung drains the bog and lifts Boggo out.
   ════════════════════════════════════════════════════════════════════════ */

const START_LEVEL = 84;

export default function RuminationBog({ onBack, onComplete }) {
  const [phase, setPhase] = useState("pick"); // pick | climb | out
  const [thought, setThought] = useState("");
  const [custom, setCustom] = useState("");
  const [risk, setRisk] = useState(null);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});

  const loop = custom.trim() || thought;
  const rung = BOG_LADDER[step];
  const bogLevel = phase === "out" ? 0 : Math.round(START_LEVEL * (1 - step / BOG_LADDER.length));
  const boggoState = phase === "out" ? "relieved" : bogLevel > 55 ? "bloated" : "calm";

  const begin = () => {
    const r = scanForRisk(custom);
    if (r.risk) { setRisk(r); return; }
    setPhase("climb");
  };

  const setAns = (v) => setAnswers((a) => ({ ...a, [rung.id]: v }));
  const advance = () => {
    if (rung.id === "reframe" || rung.id === "story") {
      const r = scanForRisk(answers[rung.id] || "");
      if (r.risk) { setRisk(r); return; }
    }
    if (step + 1 >= BOG_LADDER.length) { setPhase("out"); return; }
    setStep((s) => s + 1);
  };

  const finish = () => {
    const reframe = answers.reframe?.trim();
    const act = answers.action?.trim();
    const bits = ["Escaped a rumination loop"];
    if (reframe) bits.push(`truer: "${reframe.slice(0, 40)}"`);
    if (act) bits.push(`will: ${act.slice(0, 40)}`);
    onComplete(bits.join(" · "));
  };

  if (risk) return <SafetyScreen kind={risk.kind} onClose={onBack} />;

  return (
    <SwampStage
      title="Rumination Bog"
      onClose={onBack}
      total={phase === "pick" ? 0 : BOG_LADDER.length}
      active={step}
    >
      {/* the bog well — always visible once picked */}
      {phase !== "pick" && (
        <div className="sv-bog-well" style={{ marginBottom: 16 }}>
          <div className={`sv-bog-thought ${phase === "climb" ? "loop" : ""}`}>&ldquo;{loop}&rdquo;</div>
          <div className="sv-bog-boggo" style={{ bottom: `calc(${bogLevel}% - 6px)` }}>
            <Boggo state={boggoState} size={72} />
          </div>
          <div className="sv-bog-mud" style={{ height: `${bogLevel}%` }} />
        </div>
      )}

      {/* PICK */}
      {phase === "pick" && (
        <div className="sv-center">
          <Boggo state="bloated" size={128} />
          <Eyebrow>Stuck on a loop</Eyebrow>
          <Heading>What thought keeps repeating?</Heading>
          <Lead>The one on replay — the one that gets louder every lap. Pick it, or write your own.</Lead>
          <Chips options={RUMINATION_THOUGHTS} value={thought} onChange={(t) => { setThought(t); setCustom(""); }} sm />
          <Field value={custom} onChange={setCustom} rows={2} placeholder="…or the exact words looping in your head." />
          <Primary disabled={!loop.trim()} onClick={begin}>Into the bog →</Primary>
        </div>
      )}

      {/* CLIMB — the five rungs */}
      {phase === "climb" && (
        <div className="sv-pane">
          <div className="sv-bog-rung">
            <span className="sv-bog-rung__em">{rung.emoji}</span>
            <div>
              <div className="sv-bog-rung__tool">{rung.tool}</div>
              <p className="sv-lead" style={{ margin: "2px 0 0" }}>{rung.prompt}</p>
            </div>
          </div>
          <Field value={answers[rung.id] || ""} onChange={setAns} rows={3} placeholder={rung.ph} />
          {step === 0 && (
            <Science>This is cognitive defusion: you stop wrestling the thought and start relating to it — "I'm having the thought that…" — which drains its charge without needing it to be false.</Science>
          )}
          <Primary disabled={(answers[rung.id] || "").trim().length < 2} onClick={advance}>
            {step + 1 >= BOG_LADDER.length ? "Climb out →" : "Next rung →"}
          </Primary>
        </div>
      )}

      {/* OUT */}
      {phase === "out" && (
        <div className="sv-center">
          <div style={{ position: "relative" }}><Boggo state="relieved" size={132} /><Fireflies /></div>
          <Eyebrow>Loop broken</Eyebrow>
          <Heading>You climbed out.</Heading>
          <Lead>You didn't win by proving the thought wrong — you changed your relationship to it. Fact, story, feeling, a truer line, one action. The bog drained.</Lead>
          {answers.reframe?.trim() && (
            <div className="sv-stamp"><span>Your truer line</span><p>&ldquo;{answers.reframe.trim()}&rdquo;</p></div>
          )}
          <BoggoSays state="relieved" line={boggoLine("win", (loop || "x").length + 2)} />
          <Primary onClick={finish}>Save &amp; close ✦</Primary>
        </div>
      )}
    </SwampStage>
  );
}
