import React, { useState } from "react";
import {
  ShadowStage, Eyebrow, Heading, Lead, Science, Quote, Field, Primary, Chips, BreathOrb, Seal,
} from "./shell.jsx";

/* ════════════════════════════════════════════════════════════════════════
   SELF-COMPASSION — Kristin Neff's Self-Compassion Break, the 3 moves that
   defuse shame & the inner critic: mindfulness → common humanity → self-kindness.
   Science: in an 8-week Mindful Self-Compassion trial, participants showed
   significantly greater self-compassion than controls; self-compassion is
   linked to lower anxiety, depression and stress reactivity.
   ════════════════════════════════════════════════════════════════════════ */

const TOTAL = 5;
const KIND = ["May I be kind to myself", "I’m doing the best I can", "I deserve compassion too", "I’m allowed to be human", "I forgive myself"];

export default function SelfCompassion({ onClose, onFinish }) {
  const [step, setStep] = useState(0);
  const [hurt, setHurt] = useState("");
  const [phrase, setPhrase] = useState(null);
  const meter = Math.round(((TOTAL - step) / TOTAL) * 100);

  const finish = () =>
    onFinish("Self-Compassion", `Met the critic with kindness · "${phrase || "I’m doing my best"}"`, { accent: "pink" });

  return (
    <ShadowStage accent="pink" title="Self-Compassion" onClose={onClose} meter={meter} total={TOTAL} active={step}>
      {step === 0 && (
        <div className="sx-center">
          <Eyebrow>The critic is loud</Eyebrow>
          <Heading>Talk to yourself like someone you love.</Heading>
          <Lead>You&rsquo;d never speak to a friend the way the critic speaks to you. Three small moves turn the voice from attack to ally.</Lead>
          <Primary onClick={() => setStep(1)}>Begin →</Primary>
        </div>
      )}

      {step === 1 && (
        <div className="sx-pane">
          <Eyebrow>1 · Mindfulness</Eyebrow>
          <Heading>This is a moment of suffering.</Heading>
          <Lead>Name it plainly, without spinning it bigger or shoving it away. Just: &ldquo;this hurts right now.&rdquo;</Lead>
          <Field value={hurt} onChange={setHurt} placeholder="What&rsquo;s hard right now is…" rows={2} />
          <Quote>&ldquo;This is hard. This hurts right now.&rdquo;</Quote>
          <div className="sx-btnrow"><Primary onClick={() => setStep(2)}>Next →</Primary></div>
        </div>
      )}

      {step === 2 && (
        <div className="sx-center">
          <Eyebrow>2 · Common humanity</Eyebrow>
          <Heading>You are not the only one.</Heading>
          <Lead>Struggle isn&rsquo;t a defect in you — it&rsquo;s the price of being human. In this exact moment, countless people feel precisely what you feel. You&rsquo;re part of that, not exiled from it.</Lead>
          <Quote>&ldquo;Suffering is part of being human. I&rsquo;m not alone in this.&rdquo;</Quote>
          <Science>People who meet hard moments with self-compassion rather than self-attack show lower stress hormones and less anxiety &amp; depression — and it&rsquo;s trainable: 8 weeks of practice measurably raised it.</Science>
          <Primary onClick={() => setStep(3)}>Next →</Primary>
        </div>
      )}

      {step === 3 && (
        <div className="sx-center">
          <Eyebrow>3 · Self-kindness</Eyebrow>
          <Heading>Now offer yourself warmth.</Heading>
          <Lead>Place a hand on your heart — the touch alone signals safety. Breathe with the orb, and pick the words you most need to hear.</Lead>
          <BreathOrb phases={[
            { key: "Breathe in", sub: "hand on your heart", s: 4, scale: 1.5, col: "var(--brand-pink)" },
            { key: "Breathe out", sub: "soften", s: 6, scale: 0.82, col: "var(--brand-magenta)" },
          ]} />
          <Chips options={KIND} value={phrase} onChange={setPhrase} />
          <div className="sx-btnrow"><Primary disabled={!phrase} onClick={() => setStep(4)}>Let it land ✦</Primary></div>
        </div>
      )}

      {step === 4 && (
        <Seal
          eyebrow="Softened"
          title="You took your own side."
          lead="That&rsquo;s the whole skill — not silencing the critic by force, but answering it with warmth. The more you practice, the more it becomes your default inner voice."
          stamp={phrase || "I’m doing the best I can."}
          onDone={finish}
        />
      )}
    </ShadowStage>
  );
}
