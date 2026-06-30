import React, { useState } from "react";
import { maskCards } from "../../data/maskCards.js";
import {
  ShadowStage, Eyebrow, Heading, Lead, Science, Quote, Field, Primary, Skip, Chips,
  MaskMorph, Seal, maskCardSrc,
} from "./shell.jsx";

/* ════════════════════════════════════════════════════════════════════════
   SHADOW ALCHEMIST — the centerpiece. Merges "Spot the Mask" + "Name It".
   Built on the Accomplishment Coaching "Naming the Survival Mechanism"
   exercise (Hans Phillips): distinguish the Survival Mechanism running you,
   externalise the victim story, get altitude on it (affect labeling), then
   TRANSMUTE the mask into its essence and take a stand.

   Science: naming a feeling/part dampens amygdala activity and hands the
   wheel back to the cortex (UCLA, Lieberman, fMRI); IFS "unblending" from a
   protector part reduced depression & PTSD in a randomized trial.
   ════════════════════════════════════════════════════════════════════════ */

const TOTAL = 8;

export default function ShadowAlchemist({ onClose, onFinish }) {
  const [step, setStep] = useState(0);
  const [maskId, setMaskId] = useState(null);
  const [moment, setMoment] = useState("");
  const [victim, setVictim] = useState("");
  const [afraid, setAfraid] = useState("");
  const [transmuted, setTransmuted] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [essence, setEssence] = useState(null);
  const [declaration, setDeclaration] = useState("");

  const mask = maskCards.find((m) => m.id === maskId) || null;
  const meter = Math.round(((TOTAL - step) / TOTAL) * 100);
  const go = (n) => setStep(n);

  const transmute = () => {
    setTransmuted(true);
    setTimeout(() => setRevealed(true), 1150);
  };

  const finish = () => {
    const stamp = declaration.trim() || (essence ? `I am ${essence}.` : "I see the mask, and I'm at the wheel.");
    onFinish("Shadow Alchemist", `${mask.name} → ${essence || "essence"} · "${stamp.slice(0, 48)}"`, {
      accent: "gold",
      transmuted: true,
      essence: { maskId: mask.id, name: mask.name, essence },
    });
  };

  return (
    <ShadowStage accent="gold" title="Shadow Alchemist" onClose={onClose} meter={meter} total={TOTAL} active={step}>
      {/* 0 · pick the mask */}
      {step === 0 && (
        <div className="sx-pane">
          <Eyebrow>The mask grabbed the wheel</Eyebrow>
          <Heading>Which one is running you?</Heading>
          <Lead>These aren&rsquo;t who you are — they&rsquo;re <b>Survival Mechanisms</b>: old habits of being that once kept you safe. You can&rsquo;t transmute what you won&rsquo;t name. Pick the one that just took over.</Lead>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 14 }}>
            {maskCards.map((m) => {
              const sel = maskId === m.id;
              return (
                <button key={m.id} onClick={() => setMaskId(m.id)}
                  style={{
                    display: "flex", flexDirection: "column", textAlign: "center", padding: 10, cursor: "pointer",
                    background: sel ? "var(--card-hover)" : "var(--card)",
                    border: `1px solid ${sel ? "var(--brand-gold)" : "var(--border)"}`,
                    borderRadius: 14, color: "var(--text-main)",
                    boxShadow: sel ? "0 0 24px rgba(250,204,21,0.25)" : "none", transition: ".2s",
                  }}>
                  <img src={maskCardSrc(m.id, "front-card")} alt={m.name}
                    onError={(e) => { e.currentTarget.style.display = "none"; }}
                    style={{ width: "100%", borderRadius: 10, display: "block" }} />
                  <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 14, marginTop: 10 }}>{m.name}</span>
                  <span style={{ color: "var(--text-soft)", fontSize: 11.5, lineHeight: 1.35, marginTop: 3 }}>{m.subtitle}</span>
                </button>
              );
            })}
          </div>
          <div className="sx-btnrow"><Primary disabled={!mask} onClick={() => go(1)}>That&rsquo;s the one →</Primary></div>
        </div>
      )}

      {/* 1 · how it shows up */}
      {step === 1 && (
        <div className="sx-pane">
          <Eyebrow>{mask.name} · distinguish it</Eyebrow>
          <Heading>How did it show up?</Heading>
          <Lead>{mask.corePattern}</Lead>
          <Quote>&ldquo;{mask.maskVoice}&rdquo;</Quote>
          <label className="sx-label">What did it just have you do, say, or avoid?</label>
          <Field value={moment} onChange={setMoment} placeholder="Walk through the moment it took over…" rows={3} />
          <div className="sx-btnrow"><Primary onClick={() => go(2)}>Next →</Primary></div>
        </div>
      )}

      {/* 2 · the victim story (externalise — straight from the coaching doc) */}
      {step === 2 && (
        <div className="sx-pane">
          <Eyebrow>Let it talk</Eyebrow>
          <Heading>From the rawest place — whose fault is it?</Heading>
          <Lead>Don&rsquo;t be fair or responsible here. Let the {mask.name} blame whoever it blames — &ldquo;they did this to me.&rdquo; We name the story out loud so it stops running in the dark.</Lead>
          <Field value={victim} onChange={setVictim} placeholder="If only they / it weren't… then I wouldn't have to…" rows={3} />
          <div className="sx-btnrow">
            <Primary onClick={() => go(3)}>Said it →</Primary>
            <Skip onClick={() => go(3)}>Skip</Skip>
          </div>
        </div>
      )}

      {/* 3 · what it protects / fears */}
      {step === 3 && (
        <div className="sx-pane">
          <Eyebrow>Under the armor</Eyebrow>
          <Heading>What is it protecting?</Heading>
          <Lead><b>It protected you by:</b> {mask.protectedBy} <br /><b>And it traps you by:</b> {mask.trapsBy}</Lead>
          <label className="sx-label">What are you afraid might be true about you?</label>
          <Field value={afraid} onChange={setAfraid} placeholder="The fear underneath the mask is…" rows={2} />
          <div className="sx-btnrow"><Primary onClick={() => go(4)}>Next →</Primary></div>
        </div>
      )}

      {/* 4 · name & de-identify */}
      {step === 4 && (
        <div className="sx-pane">
          <Eyebrow>Name it to tame it</Eyebrow>
          <Heading>This is the {mask.name} — not you.</Heading>
          <Lead>Say it in the third person: not &ldquo;I&rsquo;m broken,&rdquo; but &ldquo;ah — that&rsquo;s my {mask.name} again.&rdquo; The moment you can <i>see</i> the habit, you&rsquo;re no longer inside it. You can even smile at it.</Lead>
          <div className="sx-echo">&ldquo;That&rsquo;s just my <b>{mask.name}</b> talking.&rdquo;</div>
          <p className="sx-echo-sub">It&rsquo;s a costume you put on to survive — and a costume can come off.</p>
          <Science>Putting a precise name to what&rsquo;s running you drops activity in the amygdala and hands the wheel back to your thinking brain (UCLA fMRI studies of &ldquo;affect labeling&rdquo;).</Science>
          <div className="sx-btnrow"><Primary onClick={() => go(5)}>Now transmute it →</Primary></div>
        </div>
      )}

      {/* 5 · TRANSMUTE — the alchemist moment */}
      {step === 5 && (
        <div className="sx-center">
          <Eyebrow>Transmutation</Eyebrow>
          <Heading>{revealed ? "There you are." : "Turn the lead to gold."}</Heading>
          <Lead>{revealed
            ? `Underneath the ${mask.name} was never a flaw — it was this, guarding itself. Step into it.`
            : "Every mask is a gift in disguise. Hold it in the fire and let it burn back to its essence."}</Lead>

          <div style={{ position: "relative" }}>
            <MaskMorph maskId={mask.id} transmuted={transmuted} />
          </div>

          {!transmuted && <Primary onClick={transmute}>Transmute ✦</Primary>}

          {revealed && (
            <>
              <p className="sx-echo-sub" style={{ textAlign: "center" }}>Choose the essence you&rsquo;re stepping back into:</p>
              <Chips options={mask.essenceReturn} value={essence} onChange={setEssence} />
              <div className="sx-btnrow"><Primary disabled={!essence} onClick={() => { setDeclaration(`I am ${essence}.`); go(6); }}>Claim it →</Primary></div>
            </>
          )}
        </div>
      )}

      {/* 6 · declaration (the stand) */}
      {step === 6 && (
        <div className="sx-pane">
          <Eyebrow>Take the stand</Eyebrow>
          <Heading>Stamp the truer story.</Heading>
          <Lead>Write it present-tense, as already true — a stand you can actually feel. &ldquo;I am&hellip;&rdquo;</Lead>
          <Field value={declaration} onChange={setDeclaration} placeholder={`I am ${essence}. Money / love / power moves through me.`} rows={2} />
          <div className="sx-btnrow"><Primary onClick={() => go(7)}>Forge it ✦</Primary></div>
        </div>
      )}

      {/* 7 · seal */}
      {step === 7 && (
        <Seal
          eyebrow={`${mask.name} → ${essence}`}
          title="You took it back."
          lead={`You met the ${mask.name}, saw what it was guarding, and chose your essence. ${essence} was always underneath — every rep makes it your default.`}
          stamp={declaration.trim() || `I am ${essence}.`}
          onDone={finish}
          doneLabel="Add to my Essence Gallery ✦"
        />
      )}
    </ShadowStage>
  );
}
