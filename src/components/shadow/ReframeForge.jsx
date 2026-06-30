import React, { useState } from "react";
import { ShadowStage, Eyebrow, Heading, Lead, Science, Field, Primary, Skip, Chips, Seal } from "./shell.jsx";

/* ════════════════════════════════════════════════════════════════════════
   REFRAME FORGE — cognitive reappraisal: melt a limiting old story and
   forge a truer one. Reappraising the meaning of an event lowers amygdala
   reactivity and recruits prefrontal control (Ochsner & Gross).
   ════════════════════════════════════════════════════════════════════════ */

const TOTAL = 5;
const ESSENCE_WORDS = ["Majesty", "Love", "Radiance", "Power", "Joy"];

export default function ReframeForge({ onClose, onFinish }) {
  const [step, setStep] = useState(0);
  const [oldStory, setOld] = useState("");
  const [evidence, setEv] = useState("");
  const [essence, setEssence] = useState(null);
  const [meaning, setMeaning] = useState("");
  const meter = Math.round(((TOTAL - step) / TOTAL) * 100);

  const stamp = meaning.trim() || (essence ? `I am ${essence}.` : "My past is evidence I can change.");
  const finish = () => onFinish("Reframe Forge", `Old → New: "${stamp.slice(0, 48)}"`, { accent: "purple" });

  return (
    <ShadowStage accent="purple" title="Reframe Forge" onClose={onClose} meter={meter} total={TOTAL} active={step}>
      {step === 0 && (
        <div className="sx-pane">
          <Eyebrow>An old belief is loud</Eyebrow>
          <Heading>What&rsquo;s the old story you tell about yourself?</Heading>
          <Lead>The limiting one — the &ldquo;I&rsquo;m the kind of person who…&rdquo; that keeps you small.</Lead>
          <Field value={oldStory} onChange={setOld} placeholder="I always self-sabotage right before things work out." rows={3} />
          <div className="sx-btnrow"><Primary disabled={!oldStory.trim()} onClick={() => setStep(1)}>Into the fire →</Primary></div>
        </div>
      )}

      {step === 1 && (
        <div className="sx-pane">
          <Eyebrow>Evidence</Eyebrow>
          <Heading>What&rsquo;s the evidence against it?</Heading>
          <Lead>One real thing you&rsquo;ve done that the old story can&rsquo;t explain. Small counts.</Lead>
          <Field value={evidence} onChange={setEv} placeholder="I showed up today even when I didn't want to." rows={3} />
          <Science>Re-reading an event for a truer meaning — &ldquo;reappraisal&rdquo; — measurably lowers amygdala reactivity and brings your prefrontal cortex back online.</Science>
          <div className="sx-btnrow"><Primary disabled={!evidence.trim()} onClick={() => setStep(2)}>Next →</Primary></div>
        </div>
      )}

      {step === 2 && (
        <div className="sx-pane">
          <Eyebrow>Essence</Eyebrow>
          <Heading>Who are you underneath the old story?</Heading>
          <Lead>Pick the essence that&rsquo;s truer than the mask.</Lead>
          <Chips options={ESSENCE_WORDS} value={essence} onChange={setEssence} />
          <div className="sx-btnrow"><Primary disabled={!essence} onClick={() => setStep(3)}>Next →</Primary></div>
        </div>
      )}

      {step === 3 && (
        <div className="sx-pane">
          <Eyebrow>New meaning</Eyebrow>
          <Heading>Stamp the new story.</Heading>
          <Lead>Write it as &ldquo;I am…&rdquo; — present tense, like it&rsquo;s already true.</Lead>
          <Field value={meaning} onChange={setMeaning} placeholder={`I am ${essence || "Majesty"}. My past is evidence I can change, not proof I can't.`} rows={3} />
          <div className="sx-btnrow"><Primary onClick={() => setStep(4)}>Forge it ✦</Primary></div>
        </div>
      )}

      {step === 4 && (
        <Seal
          eyebrow="Forged"
          title="New story, forged."
          lead="Old story, met with evidence, reforged into new meaning. Reinforce it and it becomes your new default."
          stamp={stamp}
          onDone={finish}
        />
      )}
    </ShadowStage>
  );
}
