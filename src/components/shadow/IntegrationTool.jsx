import React, { useMemo, useState } from "react";
import { ShadowStage, Eyebrow, Heading, Lead, Quote, Field, Primary, Chips, BreathOrb, Burst } from "./shell.jsx";
import { XP_VALUES } from "../../lib/gamification.js";

/* ════════════════════════════════════════════════════════════════════════
   INTEGRATION — the Moon Gate, the way back out. The finale of the descent:
   look back at the work you just did, let the last of it move through you,
   choose one line to carry up, and walk back out as yourself. Allowing/
   acceptance reduces the secondary suffering of fighting the feeling.
   ════════════════════════════════════════════════════════════════════════ */

const TOTAL = 5;

// A long, releasing exhale — "let it move through me."
const RELEASE = [
  { key: "Breathe in", sub: "let it be here", s: 4, scale: 1.45, col: "var(--brand-magenta)" },
  { key: "Breathe out", sub: "let it move through", s: 7, scale: 0.8, col: "var(--brand-cyan)" },
];

const CARRY = [
  "I faced it. That's enough.",
  "I keep what protects me — I release what limits me.",
  "It's part of my past. It doesn't define me.",
  "I can always come back to myself.",
];

function sameDayAsNow(ts) {
  if (!ts) return false;
  const d = new Date(ts);
  const n = new Date();
  return d.getFullYear() === n.getFullYear() && d.getMonth() === n.getMonth() && d.getDate() === n.getDate();
}

export default function IntegrationTool({ onClose, onFinish, takeaways = [], streak }) {
  const [step, setStep] = useState(0);
  const [feeling, setFeeling] = useState("");
  const [carry, setCarry] = useState(null);
  const [ownCarry, setOwnCarry] = useState("");
  const meter = Math.round(((TOTAL - step) / TOTAL) * 100);

  // Today's footprints — the work of this descent, reflected back at the gate.
  const today = useMemo(() => {
    const rows = (takeaways || []).filter((r) => sameDayAsNow(r.at) && r.tool !== "Integration");
    const tools = [];
    for (const r of rows) if (!tools.includes(r.tool)) tools.push(r.tool);
    return { rows: rows.slice(0, 4), tools };
  }, [takeaways]);

  const carried = ownCarry.trim() || carry || "I faced it. That's enough.";

  const finish = () =>
    onFinish("Integration", `Carried back up: "${carried.slice(0, 60)}"`, {
      xp: XP_VALUES.shadowIntegration,
      accent: "magenta",
      achievements: ["integration"],
    });

  return (
    <ShadowStage accent="magenta" title="Integration" onClose={onClose} meter={meter} total={TOTAL} active={step}>
      {step === 0 && (
        <div className="sx-pane">
          <Eyebrow>The Moon Gate · closing the loop</Eyebrow>
          <Heading>You made it back to the gate.</Heading>
          {today.tools.length > 0 ? (
            <>
              <Lead>Before you walk back out, look at what you faced down here today. This was the work.</Lead>
              <div className="sx-recap">
                {today.rows.map((r, i) => (
                  <div key={r.at ?? i} className="sx-recap__row">
                    <span className="sx-recap__tool">{r.tool}</span>
                    <span className="sx-recap__take">{r.takeaway}</span>
                  </div>
                ))}
              </div>
              <Lead>{today.tools.length === 1 ? "One chamber" : `${today.tools.length} chambers`}, faced in your own words. That counts.</Lead>
            </>
          ) : (
            <Lead>You came to the gate to close a loop. Some feelings don&rsquo;t need fixing — they need room, and then a way out. Let&rsquo;s give this one both.</Lead>
          )}
          {streak?.current > 1 && (
            <p className="sx-science"><span>STREAK</span>{streak.current} days of showing up for the inner work. That&rsquo;s the whole game.</p>
          )}
          <div className="sx-btnrow"><Primary onClick={() => setStep(1)}>Close the loop →</Primary></div>
        </div>
      )}

      {step === 1 && (
        <div className="sx-pane">
          <Eyebrow>Name the leftover</Eyebrow>
          <Heading>What&rsquo;s still sitting with you?</Heading>
          <Lead>Not solving it — just naming it, without judging it. Whatever&rsquo;s still humming under the surface as you reach the gate.</Lead>
          <Field value={feeling} onChange={setFeeling} placeholder="There's still some leftover frustration humming under the surface…" rows={3} />
          <div className="sx-btnrow"><Primary onClick={() => setStep(2)}>Now let it move →</Primary></div>
        </div>
      )}

      {step === 2 && (
        <div className="sx-center">
          <Eyebrow>Allow</Eyebrow>
          <Heading>Let it move through you.</Heading>
          <Lead>Nothing to push away, nothing to act on. Breathe with the orb — a few long exhales — and let the last of it drain out through the gate.</Lead>
          <BreathOrb phases={RELEASE} />
          <Quote>&ldquo;This is real, and it&rsquo;s allowed to be here. I don&rsquo;t need to push it away or act on it. I let it move through me, so it doesn&rsquo;t control me.&rdquo;</Quote>
          <div className="sx-btnrow"><Primary onClick={() => setStep(3)}>It&rsquo;s lighter →</Primary></div>
        </div>
      )}

      {step === 3 && (
        <div className="sx-pane">
          <Eyebrow>Carry one line back up</Eyebrow>
          <Heading>What do you take with you?</Heading>
          <Lead>You don&rsquo;t leave the descent empty-handed. Pick the one line you carry back into the day — or write your own.</Lead>
          <Chips options={CARRY} value={carry} onChange={(v) => { setCarry(v); setOwnCarry(""); }} />
          <Field value={ownCarry} onChange={(v) => { setOwnCarry(v); if (v) setCarry(null); }} placeholder="…or put it in your own words" rows={2} />
          <div className="sx-btnrow"><Primary disabled={!carry && !ownCarry.trim()} onClick={() => setStep(4)}>Walk back out ✦</Primary></div>
        </div>
      )}

      {step === 4 && (
        <div className="sx-center">
          <div className="sx-ascent" aria-hidden>
            <span className="sx-ascent__gate" />
            <span className="sx-ascent__moon" />
            <Burst n={18} />
          </div>
          <Eyebrow>Back at the surface</Eyebrow>
          <Heading>You walked back out as yourself.</Heading>
          <Lead>The goal was never to destroy the shadow — only to let it pass so it stops running you. You faced it, you let it move, and you kept what&rsquo;s yours.</Lead>
          <div className="sx-stamp"><span>You carry back up</span><p>{carried}</p></div>
          <Primary onClick={finish}>Step into the day ✦</Primary>
        </div>
      )}
    </ShadowStage>
  );
}
