import React, { useState, useEffect } from "react";
import { useMapQuestState } from "../map-quest/useMapQuestState.js";

// ─── John's personal masks & essences (from Survival Mechanism Manual) ───────
const MASKS = [
  {
    id: "broke_king",
    name: "Broke King",
    tell: "Money panic, shame spirals",
    essence: "Majesty",
    emoji: "👑",
    trigger: "Financial pressure, loss of respect, lack of visibility",
  },
  {
    id: "addict_saint",
    name: "Addict Saint",
    tell: "Numbing out, escaping through habits",
    essence: "Love",
    emoji: "🌊",
    trigger: "Temptation, inconsistency, broken trust",
  },
  {
    id: "wasted_genius",
    name: "Wasted Genius",
    tell: "Avoiding the real work, wasting talent on distractions",
    essence: "Purpose",
    emoji: "⚡",
    trigger: "High-stakes opportunity, fear of failing at what matters most",
  },
  {
    id: "raging_victim",
    name: "Raging Victim",
    tell: "Anger, blame loops, victim story",
    essence: "Power",
    emoji: "🔥",
    trigger: "Loss of respect, injustice, broken trust",
  },
  {
    id: "naive_warrior",
    name: "Naive Warrior",
    tell: "Drifting, self-sabotage, losing momentum",
    essence: "Joy",
    emoji: "⚔️",
    trigger: "Inconsistency, procrastination, lack of direction",
  },
];

const ESSENCE_WORDS = ["Majesty", "Love", "Radiance", "Power", "Joy"];

const IDENTITY_CLAIMS = [
  "I am Majesty — money moves through me",
  "I am a present, reliable father",
  "I build through follow-through, not bursts",
  "I lead with calm and close with confidence",
];

const TOOLS = [
  { id: "stand",     name: "Daily Stand",         sub: "Claim who you are today",    mark: "WARD",   relic: "Oath Shield",      imgIcon: "/assets/icons/icon-shield.png",   when: "Start of day",          color: "var(--brand-gold)",    accent: "#FACC15" },
  { id: "spot",      name: "Spot the Mask",       sub: "Name what's showing up",     mark: "REVEAL", relic: "Truth Compass",    imgIcon: "/assets/icons/icon-compass.png",  when: "Something feels off",   color: "var(--brand-cyan)",    accent: "#00F0FF" },
  { id: "name",      name: "Name It to Tame It",  sub: "Find where it lives in you", mark: "TRACE",  relic: "Pattern Scroll",    imgIcon: "/assets/icons/icon-scroll.png",   when: "Caught in a pattern",   color: "var(--brand-green)",   accent: "#00FFBF" },
  { id: "reframe",   name: "Reframe Forge",       sub: "Rewrite the old story",      mark: "FORGE",  relic: "Belief Flame",      imgIcon: "/assets/icons/icon-flame.png",    when: "An old belief is loud", color: "var(--brand-purple)",  accent: "#7B2CFF" },
  { id: "line",      name: "Hold the Line",       sub: "Breathe through the heat",   mark: "STEADY", relic: "Pressure Crystal",  imgIcon: "/assets/icons/icon-crystal.png",  when: "Anger is rising",       color: "var(--brand-red)",     accent: "#FF3B5C" },
  { id: "integrate", name: "Integration",         sub: "Let it sit. Let it pass.",   mark: "SEAL",   relic: "Moon Gate",         imgIcon: "/assets/icons/icon-moon.png",     when: "Closing the loop",      color: "var(--brand-magenta)", accent: "#D11EFF" },
];

const STORAGE_KEY = "shadow_work_takeaways_v1";

function maskCardSrc(maskId, cardType = "front-card") {
  return `/assets/identity-shift/identity/${maskId.replace(/_/g, "-")}/${cardType}.png`;
}

function loadTakeaways() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); }
  catch { return []; }
}
function saveTakeaways(list) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(list.slice(0, 12))); }
  catch {}
}

// ─── Root ─────────────────────────────────────────────────────────────────────
export default function ShadowWorkPage() {
  const [tool, setTool] = useState(null);
  const [saved, setSaved] = useState(loadTakeaways);
  const { getBrokeKingShadow } = useMapQuestState();
  const brokeKingShadow = getBrokeKingShadow();

  const finish = (toolName, takeaway) => {
    const next = [{ tool: toolName, takeaway, at: Date.now() }, ...saved].slice(0, 12);
    setSaved(next);
    saveTakeaways(next);
    setTool(null);
  };

  return (
    <div style={{ maxWidth: 760, margin: "0 auto" }}>
      {!tool && <Hub open={setTool} brokeKingShadow={brokeKingShadow} />}
      {tool === "stand"     && <DailyStand     onClose={() => setTool(null)} onFinish={finish} />}
      {tool === "spot"      && <SpotMask        onClose={() => setTool(null)} onFinish={finish} />}
      {tool === "name"      && <NameIt          onClose={() => setTool(null)} onFinish={finish} />}
      {tool === "reframe"   && <Reframe         onClose={() => setTool(null)} onFinish={finish} />}
      {tool === "line"      && <HoldLine        onClose={() => setTool(null)} onFinish={finish} />}
      {tool === "integrate" && <Integration     onClose={() => setTool(null)} onFinish={finish} />}
    </div>
  );
}

// ─── Hub ──────────────────────────────────────────────────────────────────────
function Hub({ open, brokeKingShadow }) {
  const [hovered, setHovered] = useState(null);

  return (
    <div>
      <div style={{ marginBottom: 40, paddingTop: 8 }}>
        <p style={{
          fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--brand-cyan)",
          letterSpacing: "0.22em", textTransform: "uppercase", margin: "0 0 10px",
        }}>
          Inner Work
        </p>
        <h1 style={{
          fontFamily: "var(--font-display)", fontSize: "clamp(32px,6vw,48px)",
          fontWeight: 900, margin: 0, lineHeight: 1.05, letterSpacing: "-0.01em",
        }}>
          Shadow Work
        </h1>
      </div>

      {/* Map Quest: Broke King shadow attached */}
      {brokeKingShadow && (
        <div style={{
          marginBottom: 24, padding: "14px 18px", borderRadius: 14,
          background: "linear-gradient(135deg, rgba(255,201,77,0.1), rgba(123,44,255,0.1))",
          border: "1px solid rgba(255,201,77,0.4)",
          boxShadow: "0 0 20px rgba(255,201,77,0.1)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 28 }}>👑</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "#FFC94D", letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 3 }}>
                MAP QUEST · SHADOW ATTACHED
              </div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 700, color: "var(--text-main)" }}>
                The Broke King walks with you
              </div>
              <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 3, lineHeight: 1.4 }}>
                Use &ldquo;Spot the Mask&rdquo; or &ldquo;Name It to Tame It&rdquo; when you feel money panic, shame spirals, or the sense of being behind.
              </div>
            </div>
          </div>
        </div>
      )}


      <div className="shadow-tool-grid" aria-label="Shadow work tools">
        {TOOLS.map((t, i) => {
          const isHovered = hovered === t.id;
          return (
            <button
              key={t.id}
              className={`shadow-tool-card ${isHovered ? "is-hovered" : ""}`}
              onClick={() => open(t.id)}
              onMouseEnter={() => setHovered(t.id)}
              onMouseLeave={() => setHovered(null)}
              style={{ "--tool-accent": t.accent, "--tool-index": i }}
              aria-label={`Open ${t.name}`}
            >
              <div className="shadow-tool-card__aura" />
              <div className="shadow-tool-card__scan" />
              <div className="shadow-tool-card__topline">
                <span>{t.mark}</span>
                <span>{t.when}</span>
              </div>
              <div className="shadow-tool-card__relic" aria-hidden="true">
                <span className="shadow-tool-card__orbit" />
                <img
                  src={t.imgIcon}
                  alt=""
                  className="shadow-tool-card__icon"
                />
              </div>
              <div className="shadow-tool-card__body">
                <span className="shadow-tool-card__relic-name">{t.relic}</span>
                <h2>{t.name}</h2>
                <p>{t.sub}</p>
              </div>
              <span className="shadow-tool-card__launch">Enter</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Shared layout components ─────────────────────────────────────────────────
function Station({ children, color, title, step, total, onClose }) {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <button
          onClick={onClose}
          style={{
            background: "var(--card)", border: "1px solid var(--border)", color: "var(--text-main)",
            borderRadius: 9, padding: "8px 14px", fontSize: 13, cursor: "pointer",
          }}
        >
          ← Back
        </button>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color, textTransform: "uppercase", letterSpacing: "0.18em" }}>
          {title}
        </span>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--text-muted)" }}>
          {step != null ? `${step} / ${total}` : ""}
        </span>
      </div>
      {step != null && (
        <div style={{ display: "flex", gap: 5, marginBottom: 24 }}>
          {Array.from({ length: total }).map((_, k) => (
            <div
              key={k}
              style={{
                flex: 1, height: 4, borderRadius: 3,
                background: k < step ? color : "var(--border)",
                transition: "background .4s",
              }}
            />
          ))}
        </div>
      )}
      {children}
    </div>
  );
}

function Q({ children }) {
  return (
    <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(22px,4vw,28px)", fontWeight: 700, lineHeight: 1.2, margin: "0 0 8px" }}>
      {children}
    </h2>
  );
}

function Sub({ children }) {
  return <p style={{ color: "var(--text-muted)", fontSize: 15, lineHeight: 1.6, margin: "0 0 18px" }}>{children}</p>;
}

function Field({ value, onChange, placeholder, rows = 3 }) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      style={{
        width: "100%", background: "var(--panel-deep)", color: "var(--text-main)",
        border: "1px solid var(--border)", borderRadius: 12, padding: "14px 15px",
        fontSize: 15, lineHeight: 1.5, resize: "vertical", fontFamily: "inherit", outline: "none",
      }}
    />
  );
}

function Bar({ onNext, onBack, label = "Continue", disabled, color }) {
  return (
    <div style={{ display: "flex", gap: 10, marginTop: 22 }}>
      {onBack && (
        <button
          onClick={onBack}
          style={{
            background: "transparent", color: "var(--text-main)", border: "1px solid var(--border)",
            borderRadius: 12, padding: "13px 20px", fontSize: 15, fontWeight: 600, cursor: "pointer",
          }}
        >
          Back
        </button>
      )}
      <button
        onClick={onNext}
        disabled={disabled}
        style={{
          flex: 1, background: color, color: "#000", borderRadius: 12,
          padding: "14px 0", fontSize: 16, fontWeight: 700, cursor: disabled ? "default" : "pointer",
          opacity: disabled ? 0.4 : 1, border: "none",
        }}
      >
        {label}
      </button>
    </div>
  );
}

function Quote({ color, children }) {
  return (
    <div style={{
      background: "var(--card)", border: `1px solid ${color}44`, borderRadius: 14,
      padding: "20px 22px", margin: "8px 0",
    }}>
      <p style={{ fontFamily: "var(--font-display)", fontSize: "clamp(18px,3vw,22px)", lineHeight: 1.45, margin: 0 }}>
        {children}
      </p>
    </div>
  );
}

function Payoff({ color, title, body, stamp, onDone, imgSrc }) {
  return (
    <div style={{ textAlign: "center", padding: "32px 0" }}>
      {imgSrc ? (
        <img
          src={imgSrc}
          alt=""
          onError={(e) => { e.target.style.display = "none"; }}
          style={{ width: 90, height: 126, objectFit: "contain", borderRadius: 10, margin: "0 auto 16px", display: "block" }}
        />
      ) : (
        <div style={{ fontSize: 52, marginBottom: 14 }}>✦</div>
      )}
      <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 900, fontSize: 30, color, margin: "0 0 10px" }}>
        {title}
      </h2>
      <p style={{ color: "var(--text-muted)", fontSize: 15.5, lineHeight: 1.6, maxWidth: 400, margin: "0 auto" }}>
        {body}
      </p>
      {stamp && (
        <div style={{
          margin: "24px auto 0", maxWidth: 400, background: "var(--card)",
          border: `2px solid ${color}`, borderRadius: 16, padding: "18px 22px",
        }}>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color, letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: 8 }}>
            Your Stamp
          </div>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 19, fontWeight: 700, lineHeight: 1.35 }}>
            {stamp}
          </div>
        </div>
      )}
      <button
        onClick={onDone}
        style={{
          marginTop: 28, background: color, color: "#000", borderRadius: 13,
          padding: "14px 36px", fontSize: 17, fontWeight: 700, border: "none", cursor: "pointer",
        }}
      >
        Save & close ✦
      </button>
    </div>
  );
}

// ─── 1. Spot the Mask ─────────────────────────────────────────────────────────
function SpotMask({ onClose, onFinish }) {
  const [step, setStep] = useState(1);
  const [mask, setMask] = useState(null);
  const [tell, setTell] = useState("");
  const [level, setLevel] = useState(null);
  const total = 4;
  const LEVELS = [
    { l: 2, label: "Before",  d: "I felt it coming and noticed in time",    color: "var(--brand-green)" },
    { l: 1, label: "During",  d: "I caught it mid-moment",                  color: "var(--brand-gold)" },
    { l: 0, label: "After",   d: "I only saw it once it had passed",         color: "var(--brand-red)" },
  ];

  if (step > total) {
    return (
      <Station color="var(--brand-cyan)" title="Spot the Mask" onClose={onClose}>
        <Payoff
          color="var(--brand-cyan)"
          title="You saw it."
          imgSrc={maskCardSrc(mask.id, "activated-card")}
          body={`Naming the ${mask.name} is the whole move. A mask you can see can't drive in the dark.`}
          stamp={`I noticed my ${mask.name} — and noticing means I'm at the wheel.`}
          onDone={() => onFinish("Spot the Mask", `Spotted: ${mask.name}${tell ? ` (${tell})` : ""} · caught ${LEVELS.find(x => x.l === level)?.label}`)}
        />
      </Station>
    );
  }

  return (
    <Station color="var(--brand-cyan)" title="Spot the Mask" step={step} total={total} onClose={onClose}>
      {step === 1 && (
        <>
          <Q>Which mask is showing up?</Q>
          <Sub>When you got knocked off-centre, who took over? Pick the one that fits.</Sub>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {MASKS.map((m) => (
              <button
                key={m.id}
                onClick={() => setMask(m)}
                style={{
                  display: "flex", gap: 14, alignItems: "center", textAlign: "left",
                  background: mask?.id === m.id ? "var(--card-hover)" : "var(--card)",
                  border: `1px solid ${mask?.id === m.id ? "var(--brand-cyan)" : "var(--border)"}`,
                  borderRadius: 12, padding: "13px 16px", color: "var(--text-main)", cursor: "pointer",
                }}
              >
                <img
                  src={maskCardSrc(m.id)}
                  alt=""
                  onError={(e) => { e.target.style.display = "none"; }}
                  style={{ width: 40, height: 56, objectFit: "contain", borderRadius: 5, flexShrink: 0 }}
                />
                <span style={{ fontSize: 24, flexShrink: 0 }}>{m.emoji}</span>
                <span>
                  <b style={{ fontSize: 15 }}>{m.name}</b>
                  <br />
                  <span style={{ color: "var(--text-muted)", fontSize: 12.5 }}>{m.tell}</span>
                </span>
              </button>
            ))}
          </div>
          <Bar color="var(--brand-cyan)" disabled={!mask} onNext={() => setStep(2)} />
        </>
      )}
      {step === 2 && (
        <>
          <Q>What did it look like this time?</Q>
          <Sub>Your {mask.name} usually shows as "{mask.tell}". What was the actual moment — what did you do, say, or feel?</Sub>
          <Field value={tell} onChange={setTell} placeholder="Walk me through the moment…" rows={4} />
          <Bar color="var(--brand-cyan)" onBack={() => setStep(1)} onNext={() => setStep(3)} />
        </>
      )}
      {step === 3 && (
        <>
          <Q>When did you catch it?</Q>
          <Sub>This isn't a grade. It tells you where your awareness is sharpening.</Sub>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {LEVELS.map((x) => (
              <button
                key={x.l}
                onClick={() => setLevel(x.l)}
                style={{
                  textAlign: "left", cursor: "pointer",
                  background: level === x.l ? "var(--card-hover)" : "var(--card)",
                  border: `1px solid ${level === x.l ? x.color : "var(--border)"}`,
                  borderRadius: 12, padding: "14px 16px", color: "var(--text-main)",
                }}
              >
                <b style={{ color: x.color }}>{x.label}</b>
                <br />
                <span style={{ color: "var(--text-muted)", fontSize: 13 }}>{x.d}</span>
              </button>
            ))}
          </div>
          <Bar color="var(--brand-cyan)" onBack={() => setStep(2)} disabled={level == null} onNext={() => setStep(4)} />
        </>
      )}
      {step === 4 && (
        <>
          <Q>Here's the reframe.</Q>
          <Sub>The mask isn't the enemy — it was built to protect you once. Read this slowly:</Sub>
          <img
            src={maskCardSrc(mask.id, "shift-card")}
            alt=""
            onError={(e) => { e.target.style.display = "none"; }}
            style={{ width: 80, height: 112, objectFit: "contain", borderRadius: 8, margin: "0 auto 16px", display: "block" }}
          />
          <Quote color="var(--brand-cyan)">
            "My {mask.name} showed up because part of me felt unsafe. I see it now. And underneath it is my {mask.essence}."
          </Quote>
          <div style={{ marginTop: 16, padding: "14px 16px", background: "var(--card)", borderRadius: 12, border: "1px solid var(--border)" }}>
            <p style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--brand-gold)", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 6 }}>
              Declaration
            </p>
            <p style={{ fontSize: 15.5, fontWeight: 600, margin: 0, lineHeight: 1.5 }}>
              "I am {mask.essence}. I embody this truth through small reps of action."
            </p>
          </div>
          <Bar color="var(--brand-cyan)" onBack={() => setStep(3)} label="That lands ✦" onNext={() => setStep(5)} />
        </>
      )}
    </Station>
  );
}

// ─── 2. Name It to Tame It ────────────────────────────────────────────────────
function NameIt({ onClose, onFinish }) {
  const [step, setStep] = useState(1);
  const [ans, setAns] = useState({});
  const total = 4;
  const CHANNELS = [
    { k: "Body",      q: "Where do you feel it physically?",                   ph: "Tight chest, shoulders up, jaw clenched…" },
    { k: "Emotion",   q: "What's the emotion under it?",                       ph: "Anger on top — but really I felt dismissed." },
    { k: "Thoughts",  q: "What was the loop in your head?",                    ph: '"They don\'t respect me. This always happens."' },
    { k: "Behaviour", q: "What did you do, or want to do?",                    ph: "Wanted to shut down and go quiet." },
  ];

  if (step > total) {
    return (
      <Station color="var(--brand-green)" title="Name It to Tame It" onClose={onClose}>
        <Payoff
          color="var(--brand-green)"
          title="Named, so tamed."
          body="What you can name in your body and mind loses its grip on you. You don't need to fix it — you just named it."
          stamp="I can feel it without becoming it."
          onDone={() => onFinish("Name It to Tame It", "Traced the pattern across body, emotion, thought & behaviour")}
        />
      </Station>
    );
  }

  const c = CHANNELS[step - 1];
  return (
    <Station color="var(--brand-green)" title="Name It to Tame It" step={step} total={total} onClose={onClose}>
      <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--brand-green)", letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: 8 }}>
        {c.k}
      </div>
      <Q>{c.q}</Q>
      <Sub>Just notice. Putting words to it is the work — you don't have to fix anything.</Sub>
      <Field value={ans[c.k] || ""} onChange={(v) => setAns({ ...ans, [c.k]: v })} placeholder={c.ph} rows={4} />
      <Bar
        color="var(--brand-green)"
        onBack={step > 1 ? () => setStep(step - 1) : null}
        label={step === total ? "I've named it ✦" : "Next"}
        onNext={() => setStep(step + 1)}
      />
    </Station>
  );
}

// ─── 3. Reframe Forge ─────────────────────────────────────────────────────────
function Reframe({ onClose, onFinish }) {
  const [step, setStep] = useState(1);
  const [oldStory, setOld] = useState("");
  const [evidence, setEv] = useState("");
  const [essence, setEssence] = useState(null);
  const [meaning, setMeaning] = useState("");

  if (step > total) {
    const stamp = meaning.trim() || (essence ? `I am ${essence}.` : "This is my comeback.");
    return (
      <Station color="var(--brand-purple)" title="Reframe Forge" onClose={onClose}>
        <Payoff
          color="var(--brand-purple)"
          title="New story forged."
          body="Old story, met with evidence, becomes new meaning. Reinforce it and it turns into your new default."
          stamp={stamp}
          onDone={() => onFinish("Reframe Forge", `Old: "${oldStory.slice(0, 40)}…" → New: "${stamp}"`)}
        />
      </Station>
    );
  }

  const total = 4;
  return (
    <Station color="var(--brand-purple)" title="Reframe Forge" step={step} total={total} onClose={onClose}>
      {step === 1 && (
        <>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--brand-red)", letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: 8 }}>
            Old Story
          </div>
          <Q>What's the old story you tell about yourself?</Q>
          <Sub>The limiting one. The "I'm the kind of person who…" that keeps you small.</Sub>
          <Field value={oldStory} onChange={setOld} placeholder="I always self-sabotage right before things work out." rows={3} />
          <Bar color="var(--brand-purple)" disabled={!oldStory.trim()} onNext={() => setStep(2)} />
        </>
      )}
      {step === 2 && (
        <>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--brand-cyan)", letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: 8 }}>
            Evidence
          </div>
          <Q>What's the evidence against it?</Q>
          <Sub>One real thing you've done that the old story can't explain. Small counts.</Sub>
          <Field value={evidence} onChange={setEv} placeholder="I showed up today even when I didn't want to." rows={3} />
          <Bar color="var(--brand-purple)" onBack={() => setStep(1)} disabled={!evidence.trim()} onNext={() => setStep(3)} />
        </>
      )}
      {step === 3 && (
        <>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--brand-green)", letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: 8 }}>
            Essence
          </div>
          <Q>Who are you underneath the old story?</Q>
          <Sub>Pick the essence that's truer than the mask.</Sub>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {ESSENCE_WORDS.map((e) => (
              <button
                key={e}
                onClick={() => setEssence(e)}
                style={{
                  background: essence === e ? "var(--brand-purple)" : "var(--card)",
                  color: essence === e ? "#000" : "var(--text-main)",
                  border: `1px solid ${essence === e ? "var(--brand-purple)" : "var(--border)"}`,
                  borderRadius: 30, padding: "10px 18px", fontSize: 15, fontWeight: 700, cursor: "pointer",
                }}
              >
                {e}
              </button>
            ))}
          </div>
          <Bar color="var(--brand-purple)" onBack={() => setStep(2)} disabled={!essence} onNext={() => setStep(4)} />
        </>
      )}
      {step === 4 && (
        <>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--brand-gold)", letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: 8 }}>
            New Meaning
          </div>
          <Q>Stamp the new story.</Q>
          <Sub>Write it as "I am…" — present tense, like it's already true.</Sub>
          <Field value={meaning} onChange={setMeaning} placeholder={`I am ${essence || "Majesty"}. My past is evidence I can change, not proof I can't.`} rows={3} />
          <Bar color="var(--brand-purple)" onBack={() => setStep(3)} label="Forge it ✦" onNext={() => setStep(5)} />
        </>
      )}
    </Station>
  );
}

// ─── 4. Hold the Line ─────────────────────────────────────────────────────────
const BREATH_STEPS = [
  { k: "Breathe in",  s: 4, scale: 1.55, col: "var(--brand-green)" },
  { k: "Hold",        s: 7, scale: 1.55, col: "var(--brand-gold)" },
  { k: "Breathe out", s: 8, scale: 0.85, col: "var(--brand-cyan)" },
];

function Breather({ onDone }) {
  const [si, setSi] = useState(0);
  const [count, setCount] = useState(BREATH_STEPS[0].s);
  const [round, setRound] = useState(0);
  const TARGET = 4;

  useEffect(() => {
    const iv = setInterval(() => {
      setCount((c) => {
        if (c > 1) return c - 1;
        setSi((cur) => {
          const nx = (cur + 1) % BREATH_STEPS.length;
          if (nx === 0) setRound((r) => r + 1);
          return nx;
        });
        return 0;
      });
    }, 1000);
    return () => clearInterval(iv);
  }, []);

  useEffect(() => { setCount(BREATH_STEPS[si].s); }, [si]);

  const step = BREATH_STEPS[si];
  const done = round >= TARGET;

  return (
    <div style={{ textAlign: "center" }}>
      <Q>Follow the orb</Q>
      <Sub>{TARGET} slow rounds. In through the nose, out through the mouth.</Sub>
      <div style={{ height: 240, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{
          width: 130, height: 130, borderRadius: "50%",
          border: `2px solid ${step.col}`,
          background: `radial-gradient(circle at 50% 40%, ${step.col}33, transparent 70%)`,
          transform: `scale(${step.scale})`,
          transition: `transform ${step.s}s ease-in-out`,
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        }}>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 16, color: step.col, fontWeight: 700 }}>{step.k}</div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 28, color: "var(--text-main)" }}>{count || step.s}</div>
        </div>
      </div>
      <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--text-muted)" }}>
        round {Math.min(round + (done ? 0 : 1), TARGET)} / {TARGET}
      </div>
      <div style={{ marginTop: 20 }}>
        <button
          onClick={onDone}
          style={{
            background: done ? "var(--brand-green)" : "transparent",
            color: done ? "#000" : "var(--text-main)",
            border: `1px solid ${done ? "var(--brand-green)" : "var(--border)"}`,
            borderRadius: 12, padding: "14px 28px", fontSize: 15.5, fontWeight: 700, cursor: "pointer",
          }}
        >
          {done ? "I'm calmer →" : "I'm ready to move on"}
        </button>
      </div>
    </div>
  );
}

function HoldLine({ onClose, onFinish }) {
  const [step, setStep] = useState(1);
  const [note, setNote] = useState("");
  const total = 3;

  if (step === 4) {
    return (
      <Station color="var(--brand-red)" title="Hold the Line" onClose={onClose}>
        <Payoff
          color="var(--brand-green)"
          title="You stayed under the line."
          body="You caught it on the way up and brought it down. That pause is the whole skill — the gap where you get to choose."
          stamp="I can feel the heat without letting it drive."
          onDone={() => onFinish("Hold the Line", note.trim() ? `Cooled down · noted: "${note.slice(0, 50)}"` : "Used the breath to stay in control")}
        />
      </Station>
    );
  }

  return (
    <Station color="var(--brand-red)" title="Hold the Line" step={step} total={total} onClose={onClose}>
      {step === 1 && (
        <>
          <Q>Anger rises — judgment drops.</Q>
          <Sub>There's a line where you stop choosing and the reaction takes over. The way back is physical: slow the breath. Let's bring it down together.</Sub>
          <Quote color="var(--brand-red)">
            "The Raging Victim needs someone to blame. But underneath it, there's a man who just wants to feel respected and safe."
          </Quote>
          <Bar color="var(--brand-red)" label="Start breathing →" onNext={() => setStep(2)} />
        </>
      )}
      {step === 2 && <Breather onDone={() => setStep(3)} />}
      {step === 3 && (
        <>
          <Q>What's actually under the anger?</Q>
          <Sub>Now that it's quieter — name the real thing. Hurt, fear, feeling disrespected? You don't have to act on it.</Sub>
          <Field value={note} onChange={setNote} placeholder="Underneath it I think I was scared that…" rows={3} />
          <Quote color="var(--brand-green)">
            "This anger is real, but I don't need to push it away — and I don't need to act on it."
          </Quote>
          <Bar color="var(--brand-green)" label="I'm grounded ✦" onNext={() => setStep(4)} />
        </>
      )}
    </Station>
  );
}

// ─── 5. Daily Stand ───────────────────────────────────────────────────────────
function DailyStand({ onClose, onFinish }) {
  const [step, setStep] = useState(1);
  const [picks, setPicks] = useState([]);
  const [wins, setWins] = useState(["", "", ""]);
  const [improve, setImprove] = useState("");
  const [intention, setIntention] = useState("");
  const total = 4;
  const toggle = (s) => setPicks((p) => p.includes(s) ? p.filter((x) => x !== s) : [...p, s]);

  if (step > total) {
    return (
      <Station color="var(--brand-gold)" title="Daily Stand" onClose={onClose}>
        <Payoff
          color="var(--brand-gold)"
          title="You've taken your stand."
          body="Identity creates the outcome — not the other way around. You spoke into who you are. Now the day follows the story you set."
          stamp={intention.trim() || (picks[0] || "Today, I lead.")}
          onDone={() => onFinish("Daily Stand", `Stood as: ${picks.join(" · ") || "–"}${intention ? ` · intention: ${intention.slice(0, 40)}` : ""}`)}
        />
      </Station>
    );
  }

  return (
    <Station color="var(--brand-gold)" title="Daily Stand" step={step} total={total} onClose={onClose}>
      {step === 1 && (
        <>
          <Q>Who are you today?</Q>
          <Sub>Tap every "I AM" you're choosing to stand in. Pick what's true today — or what you're deciding to become.</Sub>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {IDENTITY_CLAIMS.map((s) => (
              <button
                key={s}
                onClick={() => toggle(s)}
                style={{
                  textAlign: "left", cursor: "pointer",
                  background: picks.includes(s) ? "var(--brand-gold)" : "var(--card)",
                  color: picks.includes(s) ? "#000" : "var(--text-main)",
                  border: `1px solid ${picks.includes(s) ? "var(--brand-gold)" : "var(--border)"}`,
                  borderRadius: 12, padding: "14px 16px", fontSize: 15.5, fontWeight: 600,
                }}
              >
                {picks.includes(s) ? "✓ " : ""}{s}
              </button>
            ))}
          </div>
          <Bar color="var(--brand-gold)" disabled={!picks.length} onNext={() => setStep(2)} />
        </>
      )}
      {step === 2 && (
        <>
          <Q>Three wins.</Q>
          <Sub>Three things going right — however small. Train the eye to see evidence for the new story.</Sub>
          {wins.map((w, i) => (
            <input
              key={i}
              value={w}
              onChange={(e) => { const n = [...wins]; n[i] = e.target.value; setWins(n); }}
              placeholder={`Win ${i + 1}`}
              style={{
                width: "100%", background: "var(--panel-deep)", color: "var(--text-main)",
                border: "1px solid var(--border)", borderRadius: 11, padding: "13px 15px",
                fontSize: 15.5, marginBottom: 8, fontFamily: "inherit", outline: "none",
              }}
            />
          ))}
          <Bar color="var(--brand-gold)" onBack={() => setStep(1)} onNext={() => setStep(3)} />
        </>
      )}
      {step === 3 && (
        <>
          <Q>One thing to improve.</Q>
          <Sub>Just one. Not a beat-down — a single point of growth for today.</Sub>
          <Field value={improve} onChange={setImprove} placeholder="Respond slower when I feel challenged." rows={2} />
          <Bar color="var(--brand-gold)" onBack={() => setStep(2)} onNext={() => setStep(4)} />
        </>
      )}
      {step === 4 && (
        <>
          <Q>Set your intention.</Q>
          <Sub>One line for the day, said as if it's already happening.</Sub>
          <Field value={intention} onChange={setIntention} placeholder="Today I lead with calm and close with confidence." rows={2} />
          <Bar color="var(--brand-gold)" onBack={() => setStep(3)} label="Take my stand ✦" onNext={() => setStep(5)} />
        </>
      )}
    </Station>
  );
}

// ─── 6. Integration ───────────────────────────────────────────────────────────
function Integration({ onClose, onFinish }) {
  const [step, setStep] = useState(1);
  const [feeling, setFeeling] = useState("");
  const [sat, setSat] = useState(false);
  const total = 3;

  if (step > total) {
    return (
      <Station color="var(--text-muted)" title="Integration" onClose={onClose}>
        <Payoff
          color="var(--brand-purple)"
          title="It's integrated."
          body="The goal was never to destroy the shadow — only to let it move through you so it stops running you. You sat with it. That's enough."
          stamp="Yes, it's part of my past — and it doesn't define me."
          onDone={() => onFinish("Integration", feeling.trim() ? `Sat with: "${feeling.slice(0, 50)}"` : "Let it sit, let it pass")}
        />
      </Station>
    );
  }

  return (
    <Station color="var(--text-muted)" title="Integration" step={step} total={total} onClose={onClose}>
      {step === 1 && (
        <>
          <Q>Not solving. Just sitting.</Q>
          <Sub>Some feelings don't need fixing — they need room. What's still sitting with you right now? Name it without judging it.</Sub>
          <Field value={feeling} onChange={setFeeling} placeholder="There's still some leftover frustration humming under the surface…" rows={3} />
          <Bar color="var(--brand-purple)" label="Now let it sit →" onNext={() => setStep(2)} />
        </>
      )}
      {step === 2 && (
        <>
          <Q>Let it move through you.</Q>
          <Sub>Read this slowly, then sit with it for a few breaths. Tap when it feels a little lighter — no rush.</Sub>
          <Quote color="var(--brand-purple)">
            "This is real, and it's allowed to be here. I don't need to push it away or act on it. I let it move through me, so it doesn't control me."
          </Quote>
          <label style={{ display: "flex", gap: 10, alignItems: "center", marginTop: 18, color: "var(--text-muted)", fontSize: 14.5, cursor: "pointer" }}>
            <input type="checkbox" checked={sat} onChange={(e) => setSat(e.target.checked)} style={{ width: 20, height: 20, accentColor: "var(--brand-purple)" }} />
            I gave it some space.
          </label>
          <Bar color="var(--brand-purple)" onBack={() => setStep(1)} disabled={!sat} onNext={() => setStep(3)} />
        </>
      )}
      {step === 3 && (
        <>
          <Q>One last truth.</Q>
          <Sub>The shadow came from something real — pain, loss, betrayal. It's part of your story. It's not the author.</Sub>
          <Quote color="var(--border)">
            "I mistrust from my past — but it doesn't define me. I keep what protects me, and I let go of what limits me."
          </Quote>
          <Bar color="var(--brand-purple)" onBack={() => setStep(2)} label="Integrate it ✦" onNext={() => setStep(4)} />
        </>
      )}
    </Station>
  );
}
