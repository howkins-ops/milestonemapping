import React, { useEffect, useRef, useState } from "react";
import { ShadowStage, Eyebrow, Heading, Lead, Science, Safe, Field, Primary, Skip, Chips, Phoenix, Burst } from "./shell.jsx";
import { XP_VALUES } from "../../lib/gamification.js";
import { sfxMatchStrike, sfxIgnite, sfxFireLoop, sfxRainbow } from "../../lib/sfx";
import "../../styles/burn.css";

/* ════════════════════════════════════════════════════════════════════════
   THE BURN — BUFCA, the master tool of the Shadow Realm.
   Breakdown → Upset → Facts → Commitment → Action, then the ritual:
   the old story is written on paper, lit by hand, cast into the fire,
   burned to ash — and the commitment rises from the ashes with the phoenix.
   Source: Accomplishment Coaching BUFCA (see coaching/04_INTEGRATION_ROADMAP).
   ════════════════════════════════════════════════════════════════════════ */

const TOTAL = 7;
const FEELINGS = ["Angry", "Hurt", "Scared", "Ashamed", "Betrayed", "Powerless", "Sad", "Overwhelmed"];
const BY_WHEN = ["Today", "Tomorrow", "This week"];

const MANTRAS = [
  "Watch it burn.",
  "That story kept you safe once. It has done its job.",
  "You are not the story. You are the one standing at the fire.",
];

const HOLD_MS = 2000;      // press-and-hold to ignite
const CAST_MS = 1700;      // paper falls into the fire
const MANTRA_AT = [400, 4200, 8200]; // when each mantra fades in
const EMBERS_AT = 11600;   // fire settles to embers
const REBIRTH_AT = 12800;  // phoenix + commitment card

export default function TheBurn({ onClose, onFinish }) {
  const [step, setStep] = useState(0);
  const [breakdown, setBreakdown] = useState("");
  const [feelings, setFeelings] = useState([]);
  const [upset, setUpset] = useState("");
  const [facts, setFacts] = useState("");
  const [commitment, setCommitment] = useState("");
  const [action, setAction] = useState("");
  const [byWhen, setByWhen] = useState(null);
  const meter = Math.round(((TOTAL - step) / TOTAL) * 100);

  const finish = () =>
    onFinish("The Burn", `Burned the old story → committed: "${commitment.trim().slice(0, 52)}"`, {
      xp: XP_VALUES.bufcaBurn,
      achievements: ["first_burn"],
    });

  return (
    <ShadowStage accent="gold" title="The Burn · BUFCA" onClose={onClose} meter={meter} total={TOTAL} active={step}>
      {step === 0 && (
        <div className="sx-pane">
          <Eyebrow>The master tool</Eyebrow>
          <Heading>Something just hit. Bring it to the fire.</Heading>
          <Lead>
            Five steps take you from reaction to committed action — <b>Breakdown, Upset, Facts, Commitment, Action</b>.
            Then you&rsquo;ll write the old story on paper and burn it. For real. Take your time in here.
          </Lead>
          <ol className="bfc-ladder" aria-hidden>
            <li><b>B</b> what shouldn&rsquo;t be</li>
            <li><b>U</b> everything it stirred up</li>
            <li><b>F</b> only the facts</li>
            <li><b>C</b> what you&rsquo;re committed to</li>
            <li><b>A</b> the next move</li>
          </ol>
          <div className="sx-btnrow"><Primary onClick={() => setStep(1)}>Begin →</Primary></div>
        </div>
      )}

      {step === 1 && (
        <div className="sx-pane">
          <Eyebrow>B · Breakdown</Eyebrow>
          <Heading>What happened that shouldn&rsquo;t have?</Heading>
          <Lead>Name the breakdown — the thing that knocked you off-centre. Say it plainly.</Lead>
          <Field value={breakdown} onChange={setBreakdown} placeholder="The deal fell through. He said that thing. I dropped the ball again." rows={3} />
          <div className="sx-btnrow"><Primary disabled={!breakdown.trim()} onClick={() => setStep(2)}>Next →</Primary></div>
        </div>
      )}

      {step === 2 && (
        <div className="sx-pane">
          <Eyebrow>U · Upset</Eyebrow>
          <Heading>Let it be loud.</Heading>
          <Lead>Thoughts, feelings, body sensations — <i>no filter</i>. This part is for the fire, not for anyone else.</Lead>
          <Chips options={FEELINGS} value={feelings} onChange={setFeelings} multi sm />
          <Field value={upset} onChange={setUpset} placeholder="It's not fair. My chest is tight. I want to quit. I'm furious that…" rows={4} />
          <Safe>Nothing you write here is &ldquo;too much.&rdquo; The upset gets voice now so it doesn&rsquo;t run the show later.</Safe>
          <div className="sx-btnrow">
            <Primary disabled={!upset.trim() && feelings.length === 0} onClick={() => setStep(3)}>It&rsquo;s out →</Primary>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="sx-pane">
          <Eyebrow>F · Facts</Eyebrow>
          <Heading>Now — what would an impartial reporter say?</Heading>
          <Lead>Strip the interpretation. No villains, no verdicts about you. Just what a camera would have recorded.</Lead>
          <Field value={facts} onChange={setFacts} placeholder="On Tuesday the client emailed that they chose another vendor. I read it at 9pm." rows={3} />
          <Science>Separating facts from story is cognitive defusion: naming the raw event calms the threat response and hands control back to the prefrontal cortex — which is exactly who you want writing the next chapter.</Science>
          <div className="sx-btnrow"><Primary disabled={!facts.trim()} onClick={() => setStep(4)}>Just the facts →</Primary></div>
        </div>
      )}

      {step === 4 && (
        <div className="sx-pane">
          <Eyebrow>C · Commitment</Eyebrow>
          <Heading>Separate from all of that — what are you committed to?</Heading>
          <Lead>Not what the circumstances allow. What you stand for — the commitment that was there before this happened and is still here now.</Lead>
          <Field value={commitment} onChange={setCommitment} placeholder="I'm committed to building a business that provides for my family — no matter which client says no." rows={3} />
          <div className="sx-btnrow"><Primary disabled={!commitment.trim()} onClick={() => setStep(5)}>That&rsquo;s my stand →</Primary></div>
        </div>
      )}

      {step === 5 && (
        <div className="sx-pane">
          <Eyebrow>A · Action</Eyebrow>
          <Heading>Given only the commitment — what&rsquo;s the next move?</Heading>
          <Lead>One action the commitment would take. Small and real beats big and vague.</Lead>
          <Field value={action} onChange={setAction} placeholder="Send three new outreach messages before noon." rows={2} />
          <p className="sx-label">By when?</p>
          <Chips options={BY_WHEN} value={byWhen} onChange={setByWhen} sm />
          <div className="sx-btnrow">
            <Primary disabled={!action.trim() || !byWhen} onClick={() => setStep(6)}>Take it to the fire →</Primary>
          </div>
        </div>
      )}

      {step === 6 && (
        <BurnRitual
          breakdown={breakdown}
          feelings={feelings}
          upset={upset}
          commitment={commitment}
          action={action}
          byWhen={byWhen}
          onDone={finish}
        />
      )}
    </ShadowStage>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   THE RITUAL — paper → hold-to-ignite → cast → the long burn → rebirth
   ════════════════════════════════════════════════════════════════════════ */
function BurnRitual({ breakdown, feelings, upset, commitment, action, byWhen, onDone }) {
  const [phase, setPhase] = useState("paper"); // paper | ignite | lit | cast | burning | embers | rebirth
  const [holdPct, setHoldPct] = useState(0);
  const [mantra, setMantra] = useState(-1);
  const holdRef = useRef({ timer: null, start: 0, raf: null });
  const fireLoopRef = useRef(null);
  const timeouts = useRef([]);
  const reduced = typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

  const later = (fn, ms) => { timeouts.current.push(setTimeout(fn, ms)); };
  useEffect(() => () => {
    timeouts.current.forEach(clearTimeout);
    cancelAnimationFrame(holdRef.current.raf);
    fireLoopRef.current?.stop();
  }, []);

  // reveal the "hold the flame" instruction shortly after the paper writes on
  useEffect(() => {
    if (phase === "paper") later(() => setPhase("ignite"), reduced ? 400 : 2600);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  /* ── hold-to-ignite ── */
  const holdStart = (e) => {
    if (phase !== "ignite") return;
    // capture the pointer so a wobbling thumb can't cancel the hold, and
    // kill the browser's long-press selection/callout before it starts
    e.preventDefault();
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch { /* unsupported */ }
    sfxMatchStrike();
    holdRef.current.start = performance.now();
    const tick = (now) => {
      const pct = Math.min(100, ((now - holdRef.current.start) / HOLD_MS) * 100);
      setHoldPct(pct);
      if (pct >= 100) { sfxIgnite(); setPhase("lit"); return; }
      holdRef.current.raf = requestAnimationFrame(tick);
    };
    holdRef.current.raf = requestAnimationFrame(tick);
  };
  const holdEnd = () => {
    if (phase !== "ignite") return;
    cancelAnimationFrame(holdRef.current.raf);
    setHoldPct(0);
  };

  /* ── cast into the fire, then run the long burn timeline ── */
  const cast = () => {
    setPhase("cast");
    sfxIgnite();
    fireLoopRef.current?.stop();
    fireLoopRef.current = sfxFireLoop();
    fireLoopRef.current.setLevel(0.32);
    const speed = reduced ? 0.25 : 1;
    later(() => {
      setPhase("burning");
      fireLoopRef.current?.setLevel(0.42);
      MANTRA_AT.forEach((t, i) => later(() => setMantra(i), t * speed));
      later(() => {
        setPhase("embers");
        fireLoopRef.current?.setLevel(0.1);
      }, EMBERS_AT * speed);
      later(() => {
        setPhase("rebirth");
        fireLoopRef.current?.stop();
        sfxRainbow();
      }, REBIRTH_AT * speed);
    }, CAST_MS * speed);
  };

  const skipToRebirth = () => {
    timeouts.current.forEach(clearTimeout);
    fireLoopRef.current?.stop();
    setPhase("rebirth");
  };

  const inFire = phase === "cast" || phase === "burning" || phase === "embers";
  const feelingLine = feelings.length ? feelings.join(" · ") : null;

  return (
    <div className={`bfc-scene is-${phase}`} onContextMenu={(e) => e.preventDefault()}>
      {/* heat glow + vignette */}
      <div className="bfc-heat" aria-hidden />

      {/* ── the paper holding the old story ── */}
      {(phase === "paper" || phase === "ignite" || phase === "lit" || phase === "cast") && (
        <div className={`bfc-paper ${phase === "cast" ? "is-cast" : ""} ${phase === "lit" || phase === "cast" ? "is-lit" : ""}`}>
          <p className="bfc-paper__title">The old story</p>
          <p className="bfc-paper__text">{breakdown}</p>
          {feelingLine && <p className="bfc-paper__feelings">{feelingLine}</p>}
          {upset.trim() && <p className="bfc-paper__scrawl">{upset}</p>}
          <span className="bfc-paper__char" aria-hidden />
          <span className="bfc-paper__cornerflame" aria-hidden><i /><i /><i /></span>
        </div>
      )}

      {/* ── stage copy + controls above the fire ── */}
      {phase === "paper" && <p className="bfc-caption">This is the story you&rsquo;ve been carrying.</p>}

      {phase === "ignite" && (
        <div className="bfc-ignite">
          <button
            className="bfc-holdmatch"
            onPointerDown={holdStart}
            onPointerUp={holdEnd}
            onPointerCancel={holdEnd}
            draggable={false}
            aria-label="Press and hold to light the paper"
          >
            <svg className="bfc-holdring" viewBox="0 0 60 60" aria-hidden>
              <circle cx="30" cy="30" r="26" className="bfc-holdring__track" />
              <circle cx="30" cy="30" r="26" className="bfc-holdring__fill"
                style={{ strokeDashoffset: 163.4 - (163.4 * holdPct) / 100 }} />
            </svg>
            <span className="bfc-holdmatch__flame" aria-hidden><i /><i /></span>
          </button>
          <p className="bfc-caption">Press &amp; hold the flame to the corner. Don&rsquo;t let go.</p>
        </div>
      )}

      {phase === "lit" && (
        <div className="bfc-ignite">
          <p className="bfc-caption is-hot">It&rsquo;s caught. There&rsquo;s no keeping it now.</p>
          <button className="sx-primary bfc-castbtn" onClick={cast}>Cast it into the fire ↓</button>
        </div>
      )}

      {/* ── mantras over the long burn ── */}
      {(phase === "burning" || phase === "embers") && mantra >= 0 && (
        <p key={mantra} className="bfc-mantra">{MANTRAS[mantra]}</p>
      )}

      {/* ── the fire pit ── */}
      {phase !== "rebirth" && (
        <div className="bfc-pit" aria-hidden>
          <span className="bfc-glowcore" />
          <span className="bfc-flame f1" /><span className="bfc-flame f2" /><span className="bfc-flame f3" />
          <span className="bfc-flame f4" /><span className="bfc-flame f5" />
          {inFire && <span className="bfc-burnsheet" />}
          <span className="bfc-embers" />
          {(phase === "burning" || phase === "embers") && (
            <span className="bfc-ashfield">
              {Array.from({ length: 24 }).map((_, i) => <i key={i} style={{ "--n": i }} />)}
            </span>
          )}
        </div>
      )}

      {/* ── from the ashes ── */}
      {phase === "rebirth" && (
        <div className="bfc-rebirth">
          <div className="bfc-rebirth__phoenix">
            <Phoenix />
            <Burst />
          </div>
          <p className="bfc-rebirth__eyebrow">From the ashes</p>
          <div className="bfc-rebirthcard">
            <p className="bfc-rebirthcard__label">My commitment</p>
            <p className="bfc-rebirthcard__commitment">{commitment}</p>
            <div className="bfc-rebirthcard__action">
              <span>⚡ {action}</span>
              <b>{byWhen}</b>
            </div>
          </div>
          <Primary onClick={onDone}>Rise ✦</Primary>
        </div>
      )}

      {/* accessibility / impatience escape hatch */}
      {inFire && <Skip onClick={skipToRebirth}>skip the ritual</Skip>}
    </div>
  );
}
