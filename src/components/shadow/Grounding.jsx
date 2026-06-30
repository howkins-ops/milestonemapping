import React, { useState } from "react";
import { ShadowStage, Eyebrow, Heading, Lead, Science, Primary, Skip, BreathOrb, Seal } from "./shell.jsx";

/* ════════════════════════════════════════════════════════════════════════
   GROUNDING — the 5-4-3-2-1 senses anchor with a calming breath underneath.
   For overwhelm / spiralling / dissociation. Pulling attention into the
   present senses engages the parasympathetic system and buys a buffer
   between the impulse and the reaction.
   ════════════════════════════════════════════════════════════════════════ */

const SENSES = [
  { n: 5, verb: "see", prompt: "5 things you can see" },
  { n: 4, verb: "hear", prompt: "4 things you can hear" },
  { n: 3, verb: "feel", prompt: "3 things you can touch" },
  { n: 2, verb: "smell", prompt: "2 things you can smell" },
  { n: 1, verb: "taste", prompt: "1 thing you can taste" },
];
const TOTAL = SENSES.length + 2; // arrive + 5 senses + seal

function SenseTap({ n, onNext }) {
  const [hit, setHit] = useState(0);
  const done = hit >= n;
  return (
    <>
      <div style={{ display: "flex", justifyContent: "center", gap: 12, flexWrap: "wrap", margin: "10px 0 18px" }}>
        {Array.from({ length: n }).map((_, i) => {
          const lit = i < hit;
          return (
            <button key={i} onClick={() => setHit((h) => Math.min(n, Math.max(h, i + 1)))}
              aria-label={`item ${i + 1}`}
              style={{
                width: 46, height: 46, borderRadius: "50%", cursor: "pointer",
                border: `2px solid ${lit ? "var(--brand-green)" : "var(--border)"}`,
                background: lit ? "radial-gradient(circle at 50% 40%, rgba(0,255,191,0.4), transparent 70%)" : "var(--card)",
                boxShadow: lit ? "0 0 18px rgba(0,255,191,0.4)" : "none",
                color: "var(--text-main)", fontFamily: "var(--font-mono)", fontWeight: 800, fontSize: 14,
                transition: "all .2s ease",
              }}>
              {lit ? "✓" : i + 1}
            </button>
          );
        })}
      </div>
      <div className="sx-btnrow"><Primary disabled={!done} onClick={onNext}>{done ? "Next →" : `Tap each one as you notice it`}</Primary></div>
    </>
  );
}

export default function Grounding({ onClose, onFinish }) {
  const [step, setStep] = useState(0);
  const meter = Math.round(((TOTAL - step) / TOTAL) * 100);
  const finish = () => onFinish("Grounding", "Came back to the present through the senses", { accent: "green" });

  const senseIdx = step - 1;
  const sense = SENSES[senseIdx];

  return (
    <ShadowStage accent="green" title="Grounding" onClose={onClose} meter={meter} total={TOTAL} active={step}>
      {step === 0 && (
        <div className="sx-center">
          <Eyebrow>Spiralling out</Eyebrow>
          <Heading>Come back to right here.</Heading>
          <Lead>When the mind races into what-ifs, the senses are the door home. We&rsquo;ll count down through them — 5, 4, 3, 2, 1 — while the breath keeps you steady.</Lead>
          <Science>Anchoring attention in present sensory detail dampens the fight-or-flight response and switches on the parasympathetic &ldquo;rest&rdquo; system — a buffer before you react.</Science>
          <Primary onClick={() => setStep(1)}>Start the countdown →</Primary>
        </div>
      )}

      {sense && (
        <div className="sx-center">
          <Eyebrow>{sense.n} · {sense.verb}</Eyebrow>
          <Heading>{sense.prompt}</Heading>
          <Lead>Slowly. Really look, really listen. Tap each one as you find it.</Lead>
          <BreathOrb />
          <SenseTap n={sense.n} onNext={() => setStep(step + 1)} />
          <Skip onClick={() => setStep(step + 1)}>Skip this one</Skip>
        </div>
      )}

      {step === TOTAL - 1 && (
        <Seal
          eyebrow="Landed"
          title="You&rsquo;re here. You&rsquo;re safe."
          lead="The spiral lives in the future and the past — your senses only exist now. You just walked yourself back to solid ground."
          stamp="I can always come back through my senses."
          onDone={finish}
        />
      )}
    </ShadowStage>
  );
}
