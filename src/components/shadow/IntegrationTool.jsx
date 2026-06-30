import React, { useState } from "react";
import { ShadowStage, Eyebrow, Heading, Lead, Quote, Field, Primary, Seal } from "./shell.jsx";

/* ════════════════════════════════════════════════════════════════════════
   INTEGRATION — closing the loop. Not destroying the shadow, just letting it
   move through so it stops running you. Allowing/acceptance reduces the
   secondary suffering of fighting the feeling.
   ════════════════════════════════════════════════════════════════════════ */

const TOTAL = 4;

export default function IntegrationTool({ onClose, onFinish }) {
  const [step, setStep] = useState(0);
  const [feeling, setFeeling] = useState("");
  const [sat, setSat] = useState(false);
  const meter = Math.round(((TOTAL - step) / TOTAL) * 100);

  const finish = () =>
    onFinish("Integration", feeling.trim() ? `Sat with: "${feeling.slice(0, 50)}"` : "Let it sit, let it pass", { accent: "magenta" });

  return (
    <ShadowStage accent="magenta" title="Integration" onClose={onClose} meter={meter} total={TOTAL} active={step}>
      {step === 0 && (
        <div className="sx-pane">
          <Eyebrow>Closing the loop</Eyebrow>
          <Heading>Not solving. Just sitting.</Heading>
          <Lead>Some feelings don&rsquo;t need fixing — they need room. What&rsquo;s still sitting with you right now? Name it without judging it.</Lead>
          <Field value={feeling} onChange={setFeeling} placeholder="There's still some leftover frustration humming under the surface…" rows={3} />
          <div className="sx-btnrow"><Primary onClick={() => setStep(1)}>Now let it sit →</Primary></div>
        </div>
      )}

      {step === 1 && (
        <div className="sx-pane">
          <Eyebrow>Allow</Eyebrow>
          <Heading>Let it move through you.</Heading>
          <Lead>Read this slowly, then sit with it for a few breaths. Tap when it feels a little lighter — no rush.</Lead>
          <Quote>&ldquo;This is real, and it&rsquo;s allowed to be here. I don&rsquo;t need to push it away or act on it. I let it move through me, so it doesn&rsquo;t control me.&rdquo;</Quote>
          <label style={{ display: "flex", gap: 10, alignItems: "center", marginTop: 18, color: "var(--text-muted)", fontSize: 14.5, cursor: "pointer" }}>
            <input type="checkbox" checked={sat} onChange={(e) => setSat(e.target.checked)} style={{ width: 20, height: 20, accentColor: "var(--brand-magenta)" }} />
            I gave it some space.
          </label>
          <div className="sx-btnrow"><Primary disabled={!sat} onClick={() => setStep(2)}>Next →</Primary></div>
        </div>
      )}

      {step === 2 && (
        <div className="sx-pane">
          <Eyebrow>One last truth</Eyebrow>
          <Heading>It&rsquo;s part of your story — not the author.</Heading>
          <Lead>The shadow came from something real — pain, loss, betrayal. You keep what protects you, and you let go of what limits you.</Lead>
          <Quote>&ldquo;This comes from my past — but it doesn&rsquo;t define me. I keep what protects me, and I release what limits me.&rdquo;</Quote>
          <div className="sx-btnrow"><Primary onClick={() => setStep(3)}>Integrate it ✦</Primary></div>
        </div>
      )}

      {step === 3 && (
        <Seal
          eyebrow="Integrated"
          title="It moved through you."
          lead="The goal was never to destroy the shadow — only to let it pass so it stops running you. You sat with it. That&rsquo;s enough."
          stamp="It&rsquo;s part of my past — and it doesn&rsquo;t define me."
          onDone={finish}
        />
      )}
    </ShadowStage>
  );
}
