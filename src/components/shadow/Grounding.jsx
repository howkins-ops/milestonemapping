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

// Tap each item as you notice it — and, optionally, name it. The typed words
// are what make the footprint personal ("cold glass, the fridge hum, …").
function SenseTap({ n, verb, onNext }) {
  const [items, setItems] = useState(() => Array.from({ length: n }, () => ({ lit: false, word: "" })));
  const done = items.filter((it) => it.lit).length >= n;
  const light = (i) => setItems((arr) => arr.map((it, idx) => (idx === i ? { ...it, lit: true } : it)));
  const type = (i, w) =>
    setItems((arr) => arr.map((it, idx) => (idx === i ? { lit: it.lit || w.trim().length > 0, word: w } : it)));
  return (
    <>
      <div className="gr-senses">
        {items.map((it, i) => (
          <div key={i} className="gr-sense">
            <button className={`gr-sense__dot ${it.lit ? "on" : ""}`} onClick={() => light(i)} aria-label={`${verb} item ${i + 1}`}>
              {it.lit ? "✓" : i + 1}
            </button>
            <input
              className="gr-sense__word"
              value={it.word}
              onChange={(e) => type(i, e.target.value)}
              placeholder={`something you ${verb}…`}
              maxLength={40}
              aria-label={`name the thing you ${verb}`}
            />
          </div>
        ))}
      </div>
      <div className="sx-btnrow">
        <Primary disabled={!done} onClick={() => onNext(items.map((it) => it.word.trim()).filter(Boolean))}>
          {done ? "Next →" : "Tap each one as you notice it"}
        </Primary>
      </div>
    </>
  );
}

export default function Grounding({ onClose, onFinish }) {
  const [step, setStep] = useState(0);
  const [caught, setCaught] = useState([]); // words noticed across all senses
  const meter = Math.round(((TOTAL - step) / TOTAL) * 100);

  const captured = caught.map((w) => w.trim()).filter(Boolean).slice(0, 6);
  const personal = captured.length
    ? `Came back through: ${captured.join(", ")}`
    : "Came back to the present through the senses";
  const finish = () => onFinish("Grounding", personal, { accent: "green" });

  const advance = (words = []) => {
    if (words.length) setCaught((c) => [...c, ...words]);
    setStep((s) => s + 1);
  };

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
          <Lead>Slowly. Really look, really listen. Tap each one as you find it — name it if you can.</Lead>
          <BreathOrb />
          <SenseTap n={sense.n} verb={sense.verb} onNext={advance} />
          <Skip onClick={() => advance()}>Skip this one</Skip>
        </div>
      )}

      {step === TOTAL - 1 && (
        <Seal
          eyebrow="Landed"
          title="You&rsquo;re here. You&rsquo;re safe."
          lead="The spiral lives in the future and the past — your senses only exist now. You just walked yourself back to solid ground."
          stamp={captured.length ? captured.join(" · ") : "I can always come back through my senses."}
          onDone={finish}
        />
      )}
    </ShadowStage>
  );
}
