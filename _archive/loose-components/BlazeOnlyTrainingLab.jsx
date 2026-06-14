import React, { useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "blaze_only_training_lab_v1";

const pillars = [
  {
    key: "B",
    name: "Being",
    title: "Identity Before Intensity",
    line: "Your results start with the version of you making the decision.",
    proof: "ICF coaching competencies emphasize evoking awareness and facilitating client growth — transformation starts by seeing the self clearly before chasing tactics.",
    question: "Who am I choosing to be before I move?",
    drill: "Write one identity sentence beginning with: Today, I am the kind of person who...",
    prompts: [
      "What version of me would handle today powerfully?",
      "What fear-based identity am I refusing to let lead?",
      "What would my higher standard do in the next 10 minutes?"
    ],
    affirmation: "I do not wait to feel ready. I choose my state, then I move."
  },
  {
    key: "L",
    name: "Leadership",
    title: "Direct Your Life Like a Boss",
    line: "Leadership is not a title. It is the ability to direct energy, decisions, and standards.",
    proof: "ICF’s coaching model puts strong weight on presence, active listening, awareness, and growth — the same skills leaders use to move people without force.",
    question: "Where am I reacting instead of leading?",
    drill: "Name one conversation, action, or decision you are taking ownership of today.",
    prompts: [
      "What am I tolerating that a leader would address?",
      "Who needs my calm, clarity, or direction today?",
      "What decision would remove the most confusion?"
    ],
    affirmation: "I lead myself first. My energy gives others permission to rise."
  },
  {
    key: "A",
    name: "Alignment",
    title: "Match Your Actions to Your Values",
    line: "Hustle without alignment creates burnout. Alignment turns effort into momentum.",
    proof: "Research on implementation intentions shows action plans work best when connected to strong, meaningful goals — not random pressure or borrowed goals.",
    question: "Does this action match who I say I am becoming?",
    drill: "Pick one value, one outcome, and one action that prove the same direction.",
    prompts: [
      "What am I doing that does not match my future?",
      "What goal actually matters to me right now?",
      "What is the cleanest next action?"
    ],
    affirmation: "I do not chase everything. I move on what matches my mission."
  },
  {
    key: "Z",
    name: "Zeal",
    title: "Bring Fire Without Burning Out",
    line: "Zeal is not chaos. It is conviction with energy behind it.",
    proof: "Coaching demand for mental well-being is rising; sustainable energy matters because people are not just chasing performance — they are fighting burnout and disconnection.",
    question: "What would I fight for today if I remembered why it mattered?",
    drill: "Write the one reason today matters enough to bring real fire.",
    prompts: [
      "What makes this mission worth my energy?",
      "Where have I been moving with low conviction?",
      "How can I bring intensity and still stay grounded?"
    ],
    affirmation: "My fire is focused. My energy has direction. I move with heart."
  },
  {
    key: "E",
    name: "Execution",
    title: "Turn the Stand Into Proof",
    line: "Execution is where identity becomes evidence.",
    proof: "A major implementation-intentions meta-analysis found if-then planning has a medium-to-large effect on goal achievement. Translation: decide the action before the moment tests you.",
    question: "What proof will I create before the day ends?",
    drill: "Build one if-then plan: If it is [time/trigger], then I will [specific action].",
    prompts: [
      "What is the next rep, not the perfect plan?",
      "What can I complete today that future me will respect?",
      "Where am I overthinking instead of moving?"
    ],
    affirmation: "I finish reps. I create evidence. I become undeniable through action."
  }
];

const proofStats = [
  { value: "85%", label: "of coaches report clients want mental well-being support", source: "ICF 2024 Coaching & Mental Well-Being Snapshot" },
  { value: "122,974", label: "coach practitioners worldwide", source: "ICF Global Coaching Study 2025" },
  { value: "$5.34B", label: "estimated global coaching revenue", source: "ICF Global Coaching Study 2025" },
  { value: "64 RCTs", label: "gratitude interventions linked to better mental health and fewer anxiety/depression symptoms", source: "2023 systematic review/meta-analysis" },
  { value: "d = .65", label: "implementation intentions showed a medium-to-large effect on goal attainment", source: "Gollwitzer & Sheeran meta-analysis" }
];

const modes = ["Locked In", "Calm Power", "Coach Mode", "Closer Energy", "Builder", "Unshakeable"];

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export default function BlazeOnlyTrainingLab() {
  const saved = typeof window !== "undefined" ? loadState() : null;
  const [active, setActive] = useState(saved?.active || "B");
  const [mode, setMode] = useState(saved?.mode || "Locked In");
  const [answers, setAnswers] = useState(saved?.answers || {});
  const [completed, setCompleted] = useState(saved?.completed || {});
  const [pulse, setPulse] = useState(0);

  const current = useMemo(() => pillars.find(p => p.key === active) || pillars[0], [active]);
  const completion = Math.round((Object.keys(completed).filter(k => completed[k]).length / pillars.length) * 100);

  useEffect(() => {
    const id = setInterval(() => setPulse(p => (p + 1) % 100), 2200);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ active, mode, answers, completed }));
  }, [active, mode, answers, completed]);

  const updateAnswer = (field, value) => {
    setAnswers(prev => ({ ...prev, [active]: { ...(prev[active] || {}), [field]: value } }));
  };

  const reset = () => {
    setActive("B");
    setMode("Locked In");
    setAnswers({});
    setCompleted({});
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <div className="blazeLab">
      <style>{css}</style>
      <div className="bgGlow one" />
      <div className="bgGlow two" />

      <header className="hero">
        <div className="eyebrow">B.L.A.Z.E. Framework™ Training Lab</div>
        <h1>Become the Person Who Executes.</h1>
        <p>
          A focused coaching experience built around one engine only: <b>Being, Leadership, Alignment, Zeal, Execution.</b>
          Choose your state, train the principle, answer the prompt, and turn insight into proof.
        </p>
        <div className="heroActions">
          <button onClick={() => setActive("B")}>Start Blaze Training</button>
          <button className="ghost" onClick={reset}>Reset Lab</button>
        </div>
      </header>

      <section className="dashboard">
        <div className="statMain">
          <span>Training Completion</span>
          <strong>{completion}%</strong>
          <div className="bar"><i style={{ width: `${completion}%` }} /></div>
        </div>
        <div className="modeCard">
          <span>Today’s Stand</span>
          <select value={mode} onChange={e => setMode(e.target.value)}>
            {modes.map(m => <option key={m}>{m}</option>)}
          </select>
        </div>
        <div className="statMain small">
          <span>Active Pillar</span>
          <strong>{current.key}</strong>
          <p>{current.name}</p>
        </div>
      </section>

      <nav className="pillarNav">
        {pillars.map(p => (
          <button key={p.key} onClick={() => setActive(p.key)} className={active === p.key ? "active" : ""}>
            <b>{p.key}</b><span>{p.name}</span>{completed[p.key] && <em>✓</em>}
          </button>
        ))}
      </nav>

      <main className="trainingGrid">
        <section className="trainingCard">
          <div className="letterOrb" data-pulse={pulse}>{current.key}</div>
          <div className="cardCopy">
            <p className="mini">{current.name}</p>
            <h2>{current.title}</h2>
            <p className="line">{current.line}</p>
            <div className="proofBox"><b>Why it works:</b> {current.proof}</div>
          </div>
        </section>

        <section className="workshop">
          <h3>Coach Yourself Through {current.name}</h3>
          <label>
            Core Question
            <textarea value={answers[active]?.question || ""} onChange={e => updateAnswer("question", e.target.value)} placeholder={current.question} />
          </label>
          <label>
            Training Drill
            <textarea value={answers[active]?.drill || ""} onChange={e => updateAnswer("drill", e.target.value)} placeholder={current.drill} />
          </label>
          <label>
            Execution Proof
            <textarea value={answers[active]?.proof || ""} onChange={e => updateAnswer("proof", e.target.value)} placeholder="Before the day ends, I will prove this by..." />
          </label>
          <div className="promptDeck">
            {current.prompts.map(prompt => <button key={prompt} onClick={() => updateAnswer("question", prompt)}>{prompt}</button>)}
          </div>
          <div className="commitRow">
            <button onClick={() => setCompleted(prev => ({ ...prev, [active]: !prev[active] }))}>
              {completed[active] ? "Mark Incomplete" : "Lock This Pillar"}
            </button>
            <p>{current.affirmation}</p>
          </div>
        </section>
      </main>

      <section className="proofStats">
        <div className="sectionHead">
          <p className="mini">Proof + Credibility</p>
          <h2>Blaze Is Built on Identity, Coaching, Energy, and Execution Science.</h2>
          <p>Use these inside the training as credibility cards, onboarding screens, or unlockable “wisdom stats.”</p>
        </div>
        <div className="statsGrid">
          {proofStats.map(s => (
            <article key={s.value}>
              <strong>{s.value}</strong>
              <p>{s.label}</p>
              <small>{s.source}</small>
            </article>
          ))}
        </div>
      </section>

      <section className="blazeScript">
        <h2>The Blaze Loop</h2>
        <div className="loopGrid">
          <div><b>1. Choose</b><span>Pick the state you are standing in today.</span></div>
          <div><b>2. Clarify</b><span>Answer the pillar question honestly.</span></div>
          <div><b>3. Commit</b><span>Name the proof you will create.</span></div>
          <div><b>4. Execute</b><span>Move before overthinking takes the wheel.</span></div>
          <div><b>5. Integrate</b><span>Lock the lesson into identity through reflection.</span></div>
        </div>
      </section>
    </div>
  );
}

const css = `
.blazeLab{min-height:100vh;background:#030006;color:#f9f2ff;font-family:Inter,ui-sans-serif,system-ui,-apple-system,Segoe UI,sans-serif;padding:32px;position:relative;overflow:hidden}.blazeLab *{box-sizing:border-box}.bgGlow{position:fixed;filter:blur(70px);opacity:.34;border-radius:999px;pointer-events:none}.bgGlow.one{width:420px;height:420px;background:#d11eff;top:-120px;left:-110px}.bgGlow.two{width:520px;height:520px;background:#00f0ff;right:-170px;bottom:0}.hero,.dashboard,.pillarNav,.trainingGrid,.proofStats,.blazeScript{max-width:1180px;margin:0 auto;position:relative}.hero{padding:64px 0 34px}.eyebrow,.mini{color:#00ffbf;text-transform:uppercase;letter-spacing:.18em;font-size:12px;font-weight:800}.hero h1{font-size:clamp(42px,8vw,88px);line-height:.9;margin:12px 0;background:linear-gradient(90deg,#fff,#00f0ff,#ff3edb,#d11eff);-webkit-background-clip:text;color:transparent;text-transform:uppercase}.hero p{max-width:780px;color:#ccb9d9;font-size:18px;line-height:1.7}.heroActions{display:flex;gap:14px;flex-wrap:wrap;margin-top:26px}button,select{border:0;border-radius:18px;background:linear-gradient(135deg,#d11eff,#00f0ff);color:#050008;font-weight:900;padding:14px 18px;cursor:pointer;box-shadow:0 0 28px rgba(209,30,255,.26)}button.ghost{background:rgba(255,255,255,.04);color:#f9f2ff;border:1px solid rgba(255,255,255,.12)}.dashboard{display:grid;grid-template-columns:1.4fr 1fr .8fr;gap:16px}.statMain,.modeCard{background:rgba(14,5,24,.78);border:1px solid rgba(255,255,255,.1);border-radius:28px;padding:22px;box-shadow:inset 0 0 30px rgba(0,240,255,.04),0 24px 80px rgba(0,0,0,.4)}.statMain span,.modeCard span{display:block;color:#a98abb;font-size:12px;text-transform:uppercase;letter-spacing:.15em}.statMain strong{font-size:44px}.statMain.small strong{color:#00f0ff}.bar{height:12px;border-radius:999px;background:#13091d;overflow:hidden;margin-top:14px}.bar i{display:block;height:100%;background:linear-gradient(90deg,#00ffbf,#00f0ff,#d11eff);border-radius:999px}.modeCard select{width:100%;margin-top:12px;background:#090011;color:#fff;border:1px solid rgba(0,240,255,.35)}.pillarNav{display:grid;grid-template-columns:repeat(5,1fr);gap:12px;margin-top:18px}.pillarNav button{background:rgba(255,255,255,.04);color:#fff;border:1px solid rgba(255,255,255,.1);box-shadow:none;text-align:left;position:relative}.pillarNav button.active{border-color:#00f0ff;box-shadow:0 0 34px rgba(0,240,255,.22)}.pillarNav b{font-size:28px;display:block}.pillarNav span{color:#c5adc9}.pillarNav em{position:absolute;top:10px;right:14px;color:#00ffbf}.trainingGrid{display:grid;grid-template-columns:.88fr 1.12fr;gap:18px;margin-top:18px}.trainingCard,.workshop,.proofStats,.blazeScript{background:linear-gradient(180deg,rgba(18,5,29,.86),rgba(6,0,10,.92));border:1px solid rgba(255,255,255,.1);border-radius:32px;padding:26px;box-shadow:0 24px 90px rgba(0,0,0,.5)}.letterOrb{width:150px;height:150px;border-radius:42px;background:radial-gradient(circle at 30% 20%,#fff,#00f0ff 24%,#d11eff 60%,#14001f 100%);display:grid;place-items:center;color:#08000c;font-weight:1000;font-size:86px;box-shadow:0 0 70px rgba(209,30,255,.42);margin-bottom:22px;animation:float 4s ease-in-out infinite}.cardCopy h2,.proofStats h2,.blazeScript h2{font-size:36px;line-height:1;margin:8px 0 10px}.line{font-size:19px;color:#e6d8f0;line-height:1.5}.proofBox{margin-top:18px;background:rgba(0,240,255,.08);border:1px solid rgba(0,240,255,.22);border-radius:22px;padding:18px;color:#d9faff;line-height:1.55}.workshop h3{font-size:26px;margin-top:0}.workshop label{display:block;color:#00ffbf;font-weight:800;margin:16px 0 6px}.workshop textarea{width:100%;min-height:90px;border-radius:20px;border:1px solid rgba(255,255,255,.1);background:#07000d;color:#fff;padding:16px;font:inherit;outline:none;resize:vertical}.workshop textarea:focus{border-color:#d11eff;box-shadow:0 0 0 4px rgba(209,30,255,.12)}.promptDeck{display:flex;gap:10px;flex-wrap:wrap;margin:16px 0}.promptDeck button{background:rgba(255,255,255,.06);color:#f8efff;border:1px solid rgba(255,255,255,.1);box-shadow:none;font-size:12px}.commitRow{display:grid;grid-template-columns:190px 1fr;gap:16px;align-items:center}.commitRow p{color:#ffccff;font-weight:800}.proofStats,.blazeScript{margin-top:18px}.sectionHead{max-width:800px}.sectionHead p{color:#cbb7d8;line-height:1.6}.statsGrid{display:grid;grid-template-columns:repeat(5,1fr);gap:12px;margin-top:18px}.statsGrid article{background:#07000d;border:1px solid rgba(255,255,255,.1);border-radius:24px;padding:18px;min-height:190px}.statsGrid strong{display:block;font-size:31px;color:#00f0ff;margin-bottom:10px}.statsGrid p{color:#f3e5ff}.statsGrid small{color:#a58fb0}.loopGrid{display:grid;grid-template-columns:repeat(5,1fr);gap:12px}.loopGrid div{background:rgba(255,255,255,.045);border:1px solid rgba(255,255,255,.1);border-radius:22px;padding:18px}.loopGrid b{display:block;color:#00ffbf;margin-bottom:8px}.loopGrid span{color:#d8c6e3;line-height:1.45}@keyframes float{0%,100%{transform:translateY(0) rotate(-1deg)}50%{transform:translateY(-10px) rotate(1deg)}}@media(max-width:900px){.blazeLab{padding:18px}.dashboard,.trainingGrid{grid-template-columns:1fr}.pillarNav,.statsGrid,.loopGrid{grid-template-columns:1fr}.commitRow{grid-template-columns:1fr}.hero{padding-top:38px}.trainingCard,.workshop,.proofStats,.blazeScript{padding:20px}.letterOrb{width:120px;height:120px;font-size:68px}}
`;
