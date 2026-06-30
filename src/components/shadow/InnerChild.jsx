import React, { useState } from "react";
import {
  ShadowStage, Eyebrow, Heading, Lead, Science, Safe, Quote, Field, Primary, Skip, Chips, BreathOrb, Seal,
} from "./shell.jsx";

/* ════════════════════════════════════════════════════════════════════════
   INNER CHILD — gentle, trauma-informed reparenting + safe-place imagery.
   In IFS terms: turn toward a young "exile" part with the calm of Self,
   offer it what it needed, and bring it somewhere safe.
   Science: reparenting self-talk calms the threat system; guided safe-place
   imagery is a standard trauma-stabilisation/grounding technique.
   ════════════════════════════════════════════════════════════════════════ */

const TOTAL = 6;
const AGES = ["Tiny — before words", "A little kid", "School age", "A teenager"];
const NEEDS = ["You’re safe now", "It wasn’t your fault", "You’re wanted", "I’ve got you", "You’re enough", "You can rest"];

export default function InnerChild({ onClose, onFinish }) {
  const [step, setStep] = useState(0);
  const [age, setAge] = useState(null);
  const [need, setNeed] = useState(null);
  const [note, setNote] = useState("");
  const meter = Math.round(((TOTAL - step) / TOTAL) * 100);

  const finish = () =>
    onFinish("Inner Child", `Met the ${age ? age.toLowerCase() : "younger"} part · told them: "${note.trim() || need || ""}"`, { accent: "magenta" });

  return (
    <ShadowStage accent="magenta" title="Inner Child" onClose={onClose} meter={meter} total={TOTAL} active={step}>
      {step === 0 && (
        <div className="sx-center">
          <Eyebrow>Something old got touched</Eyebrow>
          <Heading>Let&rsquo;s turn toward the younger you.</Heading>
          <Lead>When a small thing hits way too hard, it&rsquo;s usually a younger part of you feeling an old feeling. They don&rsquo;t need fixing — they need <i>you</i> to show up.</Lead>
          <Safe>Go at your own pace. You can step out any time, and every step is skippable. This is a gentle practice, not therapy — if it feels like too much, pause and come back.</Safe>
          <Primary onClick={() => setStep(1)}>I&rsquo;m ready →</Primary>
        </div>
      )}

      {step === 1 && (
        <div className="sx-pane">
          <Eyebrow>Find them</Eyebrow>
          <Heading>How old does this feeling feel?</Heading>
          <Lead>Not how old you are — how old the <i>feeling</i> is. Trust the first number that comes.</Lead>
          <Chips options={AGES} value={age} onChange={setAge} />
          <div className="sx-btnrow"><Primary disabled={!age} onClick={() => setStep(2)}>Next →</Primary></div>
        </div>
      )}

      {step === 2 && (
        <div className="sx-pane">
          <Eyebrow>Listen</Eyebrow>
          <Heading>What did they most need to hear?</Heading>
          <Lead>Back then, in that moment — what did that younger you need someone to say, and never quite got?</Lead>
          <Chips options={NEEDS} value={need} onChange={setNeed} />
          <Field value={note} onChange={setNote} placeholder="Or say it in your own words…" rows={2} />
          <div className="sx-btnrow"><Primary disabled={!need && !note.trim()} onClick={() => setStep(3)}>Next →</Primary></div>
        </div>
      )}

      {step === 3 && (
        <div className="sx-center">
          <Eyebrow>Reparent</Eyebrow>
          <Heading>Now say it to them.</Heading>
          <Lead>Picture that younger you in front of you. Put a hand on your chest, and say it slowly — in your own voice, like you mean it:</Lead>
          <Quote>&ldquo;{note.trim() || need}. I&rsquo;m here now. I&rsquo;m not going anywhere.&rdquo;</Quote>
          <Science>Warm, reassuring self-talk toward a younger part calms the brain&rsquo;s threat response — the same soothing a safe caregiver once provided, now coming from you.</Science>
          <Primary onClick={() => setStep(4)}>They heard me →</Primary>
        </div>
      )}

      {step === 4 && (
        <div className="sx-center">
          <Eyebrow>Safe place</Eyebrow>
          <Heading>Take them somewhere safe.</Heading>
          <Lead>Picture a place they&rsquo;d feel completely safe — real or imagined. Warm light, no danger. Breathe with the orb and walk them there, hand in hand.</Lead>
          <BreathOrb />
          <Primary onClick={() => setStep(5)}>They&rsquo;re safe →</Primary>
        </div>
      )}

      {step === 5 && (
        <Seal
          eyebrow="Held"
          title="They&rsquo;re not alone anymore."
          lead="You turned toward the part of you that was still waiting — and stayed. That&rsquo;s how old wounds stop running the show: not by force, but by presence."
          stamp={`I’ve got the ${age ? age.toLowerCase() : "younger"} me. ${note.trim() || need}.`}
          onDone={finish}
        />
      )}
    </ShadowStage>
  );
}
