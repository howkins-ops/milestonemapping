import React, { useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'blazeRealTrainingOS.v2';

const pages = [
  { id: 'overview',    badge: '🔥', label: 'Overview'  },
  { id: 'being',       badge: 'B',  label: 'Being'     },
  { id: 'leadership',  badge: 'L',  label: 'Lead'      },
  { id: 'alignment',   badge: 'A',  label: 'Align'     },
  { id: 'zeal',        badge: 'Z',  label: 'Zeal'      },
  { id: 'execution',   badge: 'E',  label: 'Execute'   },
  { id: 'integration', badge: '⚡', label: 'Loop'      },
  { id: 'recap',       badge: '🏆', label: 'Recap'     },
];

const modules = {
  being: {
    color: '#d11eff',
    name: 'Being',
    letter: 'B',
    tagline: 'Identity before action.',
    thesis: 'Your results will always match your identity. Before you chase action, choose the version of you who is leading the action.',
    learn: [
      { num: '01', text: 'Being is not a mood — it is the identity you operate from under pressure.' },
      { num: '02', text: 'The Survival Being waits for certainty. The Boss Being chooses, moves, and owns the outcome.' },
      { num: '03', text: 'Replace "I should" with "I choose." Replace "I\'m trying" with "I\'m training."' },
    ],
    drill: 'Write: "Today I am being the person who ____ even when ____."',
    prompt: 'Who do you need to BE today before you execute? What old identity are you refusing to let lead?',
    stand: ['The Boss', 'The Builder', 'The Closer', 'The Coachable Student', 'The Calm Leader'],
  },
  leadership: {
    color: '#00f0ff',
    name: 'Leadership',
    letter: 'L',
    tagline: 'Self-command before you command anything else.',
    thesis: 'Leadership is not a title. It is the ability to direct your state, decisions, conversations, and future.',
    learn: [
      { num: '01', text: 'Leadership starts with self-command: you do what you said you would when the feeling is gone.' },
      { num: '02', text: 'A leader does not react to the day. A leader frames the day.' },
      { num: '03', text: 'In sales, leadership means guiding the client to clarity without pressure or fake energy.' },
    ],
    drill: 'Write the conversation or decision you need to lead today — then define the standard you will hold.',
    prompt: 'Where are you currently reacting when you should be leading?',
    stand: ['Direct', 'Decisive', 'Grounded', 'Responsible', 'Unshakeable'],
  },
  alignment: {
    color: '#00ffbf',
    name: 'Alignment',
    letter: 'A',
    tagline: 'Actions that match your values.',
    thesis: "No more hustle for hustle's sake. Alignment means your actions match your values, vision, and real target.",
    learn: [
      { num: '01', text: 'Misalignment creates friction: you can work hard and feel off because the effort points at the wrong life.' },
      { num: '02', text: 'Aligned goals are specific, measurable, emotionally honest, and connected to who you are becoming.' },
      { num: '03', text: 'Alignment removes the leak between what you say matters and what your calendar proves matters.' },
    ],
    drill: 'Audit one goal: Does this match my values, my future vision, and the person I said I am becoming?',
    prompt: 'What action would make today feel aligned instead of just busy?',
    stand: ['Clear', 'Congruent', 'Focused', 'Values-Led', 'Locked In'],
  },
  zeal: {
    color: '#ff3edb',
    name: 'Zeal',
    letter: 'Z',
    tagline: 'Directed fire — not burnout.',
    thesis: 'Zeal is the intensity switch: passion, conviction, urgency, and commitment — without burning yourself out.',
    learn: [
      { num: '01', text: 'Zeal is not chaos. It is directed fire.' },
      { num: '02', text: 'Burnout comes from unmanaged pressure. Zeal comes from meaningful mission plus regulated energy.' },
      { num: '03', text: 'The strongest performers know how to turn it on, reset fast, and return with power.' },
    ],
    drill: 'Choose a power phrase for today and attach it to one action you will complete before the day ends.',
    prompt: 'What are you willing to bring real fire to today — and how will you protect your energy while doing it?',
    stand: ['On Fire', 'Committed', 'Courageous', 'Alive', 'All In'],
  },
  execution: {
    color: '#ffd166',
    name: 'Execution',
    letter: 'E',
    tagline: 'Proof, reps, results.',
    thesis: 'Execution turns identity into evidence. No more overthinking — proof, reps, results.',
    learn: [
      { num: '01', text: 'Execution beats intention every time. A goal without a next rep is just a wish.' },
      { num: '02', text: 'Implementation intentions work: pre-decide behavior. If X happens, then I will do Y.' },
      { num: '03', text: 'Daily proof builds identity. Every completed rep tells your nervous system: this is who I am now.' },
    ],
    drill: 'Write one if-then plan: "If ____ happens today, then I will ____." Then complete one proof rep.',
    prompt: 'What is the one rep that would prove you are not just thinking about change — you are becoming it?',
    stand: ['Fast Mover', 'Finisher', 'Operator', 'Proof Builder', 'Relentless'],
  },
};

// ── Field ─────────────────────────────────────────────────────────────────────
function Field({ id, label, placeholder, value, onChange }) {
  return (
    <div className="bl-field">
      <label className="bl-label">{label}</label>
      <textarea
        className="bl-textarea"
        placeholder={placeholder}
        value={value || ''}
        onChange={(e) => onChange(id, e.target.value)}
      />
    </div>
  );
}

// ── StandPicker ───────────────────────────────────────────────────────────────
function StandPicker({ id, items, color, selected, onSelect }) {
  return (
    <div className="bl-stand-grid">
      {items.map((x) => (
        <button
          key={x}
          className={`bl-stand-btn${selected === x ? ' sel' : ''}`}
          style={selected === x ? { borderColor: color, boxShadow: `0 0 18px ${color}44` } : {}}
          onClick={() => onSelect(id, x)}
        >
          {x}
        </button>
      ))}
    </div>
  );
}

// ── ModulePage ────────────────────────────────────────────────────────────────
function ModulePage({ id, m, answers, done, onToggleDone, onSetAnswer }) {
  return (
    <div className="bl-module">
      {/* Header */}
      <div className="bl-mod-header" style={{ borderColor: m.color + '55' }}>
        <div className="bl-mod-letter" style={{ color: m.color, textShadow: `0 0 40px ${m.color}` }}>
          {m.letter}
        </div>
        <div>
          <div className="bl-mod-tag" style={{ color: m.color, borderColor: m.color + '44' }}>
            B.L.A.Z.E. Pillar
          </div>
          <h2 className="bl-mod-name">{m.name}</h2>
          <p className="bl-mod-tagline">{m.tagline}</p>
        </div>
        <button
          className={`bl-done-btn${done ? ' done' : ''}`}
          style={done ? { borderColor: '#00ffbf', color: '#00ffbf' } : {}}
          onClick={() => onToggleDone(id)}
        >
          {done ? '✓ Complete' : 'Mark Complete'}
        </button>
      </div>

      {/* Thesis */}
      <div className="bl-thesis" style={{ borderLeftColor: m.color }}>
        {m.thesis}
      </div>

      {/* Training points */}
      <div className="bl-section-title">Training</div>
      <div className="bl-learn-list">
        {m.learn.map((l) => (
          <div className="bl-learn-item" key={l.num}>
            <span className="bl-learn-num" style={{ color: m.color }}>{l.num}</span>
            <p>{l.text}</p>
          </div>
        ))}
      </div>

      {/* Choose your stand */}
      <div className="bl-section-title">Choose Your Stand</div>
      <StandPicker
        id={`${id}_stand`}
        items={m.stand}
        color={m.color}
        selected={answers[`${id}_stand`]}
        onSelect={onSetAnswer}
      />

      {/* Micro drill */}
      <div className="bl-drill">
        <div className="bl-drill-label">Micro Drill</div>
        <p>{m.drill}</p>
      </div>

      {/* Coaching prompt */}
      <div className="bl-section-title">Coaching Prompt</div>
      <div className="bl-prompt-box" style={{ borderColor: m.color + '44' }}>
        <p>{m.prompt}</p>
      </div>

      <Field
        id={`${id}_reflection`}
        label="Your honest answer"
        placeholder="Write the truth here..."
        value={answers[`${id}_reflection`]}
        onChange={onSetAnswer}
      />

      {/* Proof rep */}
      <div className="bl-section-title">Proof Rep</div>
      <Field
        id={`${id}_proof`}
        label="Today's proof action"
        placeholder="What action will prove this pillar today?"
        value={answers[`${id}_proof`]}
        onChange={onSetAnswer}
      />
      <Field
        id={`${id}_evidence`}
        label="Completion evidence"
        placeholder="E.g. 30 doors knocked, pitch practiced, hard conversation had..."
        value={answers[`${id}_evidence`]}
        onChange={onSetAnswer}
      />
    </div>
  );
}

// ── IntegrationPage ───────────────────────────────────────────────────────────
function IntegrationPage({ answers, done, onToggleDone, onSetAnswer }) {
  return (
    <div className="bl-module">
      <div className="bl-mod-header" style={{ borderColor: '#00f0ff33' }}>
        <div className="bl-mod-letter" style={{ color: '#00f0ff', textShadow: '0 0 40px #00f0ff', fontSize: 48 }}>⚡</div>
        <div>
          <div className="bl-mod-tag" style={{ color: '#00f0ff', borderColor: '#00f0ff44' }}>Integration</div>
          <h2 className="bl-mod-name">The Blaze Loop</h2>
          <p className="bl-mod-tagline">Choose → Clarify → Commit → Execute → Integrate.</p>
        </div>
        <button
          className={`bl-done-btn${done ? ' done' : ''}`}
          style={done ? { borderColor: '#00ffbf', color: '#00ffbf' } : {}}
          onClick={() => onToggleDone('integration')}
        >
          {done ? '✓ Complete' : 'Mark Complete'}
        </button>
      </div>

      <div className="bl-thesis" style={{ borderLeftColor: '#00f0ff' }}>
        Run all five pillars in sequence. Use this as your daily morning activation or pre-session reset.
      </div>

      <div className="bl-section-title">Run Today's B.L.A.Z.E. Loop</div>
      <Field id="loop_being"      label="B — Who am I being today?"                  placeholder="I am being a calm closer who moves before fear talks me out of it."  value={answers.loop_being}      onChange={onSetAnswer} />
      <Field id="loop_leadership" label="L — What must I lead today?"                placeholder="I must lead my energy and one hard conversation."                    value={answers.loop_leadership} onChange={onSetAnswer} />
      <Field id="loop_alignment"  label="A — What aligned action am I taking?"       placeholder="40 quality conversations, not busy work."                           value={answers.loop_alignment}  onChange={onSetAnswer} />
      <Field id="loop_zeal"       label="Z — What fire am I bringing?"               placeholder="Urgency without panic, conviction without pressure."                value={answers.loop_zeal}       onChange={onSetAnswer} />
      <Field id="loop_execution"  label="E — What proof rep will be done by end of day?"  placeholder="Pitch roleplay + first 20 doors before 4 PM."             value={answers.loop_execution}  onChange={onSetAnswer} />

      <div className="bl-section-title" style={{ marginTop: 32 }}>Pillar Scores (1–10)</div>
      <p className="bl-score-hint">Rate each pillar. Your lowest score is your training priority today.</p>
      {Object.keys(modules).map((k) => {
        const val = parseInt(answers[`${k}_score`] || 5, 10);
        const m = modules[k];
        return (
          <div className="bl-score-row" key={k}>
            <span className="bl-score-label" style={{ color: m.color }}>{m.name}</span>
            <input
              type="range"
              min="1"
              max="10"
              value={val}
              style={{ accentColor: m.color }}
              onChange={(e) => onSetAnswer(`${k}_score`, e.target.value)}
            />
            <span className="bl-score-val" style={{ color: val <= 4 ? '#ff477e' : val <= 7 ? '#ffd166' : '#00ffbf' }}>
              {val}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ── RecapPage ─────────────────────────────────────────────────────────────────
function RecapPage({ answers, done, onToggleDone, onReset }) {
  return (
    <div className="bl-module">
      <div className="bl-recap-hero">
        <div className="bl-recap-icon">🏆</div>
        <h2>Training Locked In</h2>
        <p>You do not need more hype. You need a state, a standard, a target, a fire, and a rep.</p>
      </div>

      <div className="bl-section-title">Your Pillar Reflections</div>
      {Object.entries(modules).map(([k, m]) => (
        <div className="bl-recap-card" key={k} style={{ borderLeftColor: m.color }}>
          <div className="bl-recap-pill" style={{ color: m.color }}>
            <span className="bl-recap-letter" style={{ background: m.color + '22', borderColor: m.color + '44' }}>{m.letter}</span>
            {m.name}
          </div>
          <p className="bl-recap-answer">
            {answers[`${k}_reflection`] || <span className="bl-recap-empty">No answer yet — go back and complete this pillar.</span>}
          </p>
        </div>
      ))}

      <div className="bl-recap-actions">
        <button
          className={`bl-done-btn big${done ? ' done' : ''}`}
          style={done ? { borderColor: '#00ffbf', color: '#00ffbf' } : { borderColor: '#d11eff', color: '#d11eff' }}
          onClick={() => onToggleDone('recap')}
        >
          {done ? '🏆 B.L.A.Z.E. Complete!' : 'Complete Training'}
        </button>
        <button className="bl-reset-btn" onClick={onReset}>
          Reset & Start Over
        </button>
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function BlazeRealTrainingOS() {
  const [state, setState] = useState(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); }
    catch { return {}; }
  });

  const answers = state.answers || {};
  const done    = state.done    || {};
  const current = state.current || 'overview';

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const setAnswer  = (key, value) => setState((s) => ({ ...s, answers: { ...(s.answers || {}), [key]: value } }));
  const setPage    = (id)         => setState((s) => ({ ...s, current: id }));
  const toggleDone = (id)         => setState((s) => ({ ...s, done: { ...(s.done || {}), [id]: !(s.done || {})[id] } }));
  const handleReset = () => { localStorage.removeItem(STORAGE_KEY); setState({}); };

  const completeAndGo = (id) => {
    const idx  = pages.findIndex((p) => p.id === id);
    const next = pages[Math.min(pages.length - 1, idx + 1)].id;
    setState((s) => ({ ...s, current: next, done: { ...(s.done || {}), [id]: true } }));
  };

  const progress = useMemo(
    () => Math.round((pages.filter((p) => done[p.id]).length / pages.length) * 100),
    [done]
  );

  const currentIndex = pages.findIndex((p) => p.id === current);
  const prevPage     = pages[Math.max(0, currentIndex - 1)].id;
  const nextPage     = pages[Math.min(pages.length - 1, currentIndex + 1)].id;

  const renderPage = () => {
    if (current === 'overview') return (
      <div className="bl-module">
        <div className="bl-overview-hero">
          <div className="bl-overview-eyebrow">Execution Engine</div>
          <h1 className="bl-overview-title">B.L.A.Z.E.</h1>
          <p className="bl-overview-sub">
            Five pillars. One engine. <b>Being, Leadership, Alignment, Zeal, Execution.</b>{' '}
            Not motivation — a method. Choose the stand, answer the prompt, create the proof.
          </p>
          <button className="bl-start-btn" onClick={() => setPage('being')}>
            Start Training →
          </button>
        </div>

        <div className="bl-pillar-list">
          {Object.entries(modules).map(([k, m]) => (
            <button key={k} className="bl-pillar-row" onClick={() => setPage(k)}>
              <span className="bl-pillar-row-letter" style={{ color: m.color, borderColor: m.color + '44' }}>
                {m.letter}
              </span>
              <div className="bl-pillar-row-text">
                <b>{m.name}</b>
                <span>{m.tagline}</span>
              </div>
              <span className="bl-pillar-row-check" style={{ color: done[k] ? '#00ffbf' : 'transparent' }}>✓</span>
            </button>
          ))}
        </div>

        <div className="bl-stats-row">
          <div className="bl-stat-card"><b>85%</b><span>of coaches say clients want mental well-being support</span></div>
          <div className="bl-stat-card"><b>$5.34B</b><span>global coaching industry revenue (ICF 2025)</span></div>
          <div className="bl-stat-card"><b>d=.65</b><span>effect size for if-then planning on goal attainment</span></div>
        </div>
      </div>
    );

    if (modules[current]) return (
      <ModulePage
        id={current}
        m={modules[current]}
        answers={answers}
        done={done[current]}
        onToggleDone={toggleDone}
        onSetAnswer={setAnswer}
      />
    );

    if (current === 'integration') return (
      <IntegrationPage answers={answers} done={done.integration} onToggleDone={toggleDone} onSetAnswer={setAnswer} />
    );

    return (
      <RecapPage answers={answers} done={done.recap} onToggleDone={toggleDone} onReset={handleReset} />
    );
  };

  return (
    <div className="bl-shell">
      <style>{CSS}</style>

      {/* Top bar */}
      <div className="bl-topbar">
        <div className="bl-topbar-left">
          <div className="bl-topbar-logo">B</div>
          <div>
            <div className="bl-topbar-name">B.L.A.Z.E. Training OS</div>
            <div className="bl-topbar-sub">Execution Engine</div>
          </div>
        </div>
        <div className="bl-topbar-right">
          <div className="bl-progress-pill">
            <div className="bl-progress-fill" style={{ width: `${progress}%` }} />
            <span>{progress}%</span>
          </div>
        </div>
      </div>

      {/* Tab nav */}
      <div className="bl-tabs-wrap">
        <nav className="bl-tabs">
          {pages.map((p) => (
            <button
              key={p.id}
              className={`bl-tab${current === p.id ? ' active' : ''}${done[p.id] ? ' done' : ''}`}
              onClick={() => setPage(p.id)}
            >
              <span className="bl-tab-badge">{p.badge}</span>
              <span className="bl-tab-label">{p.label}</span>
              {done[p.id] && <span className="bl-tab-check">✓</span>}
            </button>
          ))}
        </nav>
      </div>

      {/* Page content */}
      <div className="bl-content">
        {renderPage()}
      </div>

      {/* Footer nav */}
      <div className="bl-footer">
        <button
          className="bl-nav-btn"
          onClick={() => setPage(prevPage)}
          disabled={currentIndex === 0}
        >
          ← Prev
        </button>
        <button className="bl-nav-btn primary" onClick={() => completeAndGo(current)}>
          {currentIndex === pages.length - 1 ? 'Complete ✓' : 'Done & Next →'}
        </button>
      </div>
    </div>
  );
}

// ── CSS ───────────────────────────────────────────────────────────────────────
const CSS = `
/* Shell */
.bl-shell{
  display:flex;flex-direction:column;min-height:100%;
  background:linear-gradient(180deg,#05000b 0%,#080111 60%,#020006 100%);
  color:#f2f0f4;font-family:Inter,system-ui,-apple-system,sans-serif;
}
.bl-shell *{box-sizing:border-box}

/* Top bar */
.bl-topbar{
  display:flex;align-items:center;justify-content:space-between;
  padding:14px 18px;border-bottom:1px solid rgba(255,255,255,.08);
  background:rgba(5,0,11,.9);backdrop-filter:blur(16px);
  position:sticky;top:0;z-index:20;
}
.bl-topbar-left{display:flex;align-items:center;gap:12px}
.bl-topbar-logo{
  width:38px;height:38px;border-radius:12px;flex-shrink:0;
  background:linear-gradient(135deg,#d11eff,#ff3edb,#00f0ff);
  display:grid;place-items:center;font-weight:950;font-size:18px;color:#05000b;
  box-shadow:0 0 20px rgba(209,30,255,.45);
}
.bl-topbar-name{font-weight:800;font-size:15px}
.bl-topbar-sub{font-size:11px;color:#aaa0ba;letter-spacing:.1em;text-transform:uppercase}
.bl-topbar-right{display:flex;align-items:center;gap:10px}
.bl-progress-pill{
  position:relative;width:90px;height:28px;border-radius:999px;
  background:#130d22;border:1px solid rgba(255,255,255,.1);overflow:hidden;
  display:flex;align-items:center;justify-content:center;
}
.bl-progress-fill{
  position:absolute;left:0;top:0;bottom:0;
  background:linear-gradient(90deg,#d11eff,#00f0ff);
  transition:.4s;opacity:.7;
}
.bl-progress-pill span{position:relative;font-size:11px;font-weight:800;color:#fff}

/* Tab nav */
.bl-tabs-wrap{
  overflow-x:auto;-webkit-overflow-scrolling:touch;
  border-bottom:1px solid rgba(255,255,255,.08);
  background:rgba(8,1,17,.85);
  scrollbar-width:none;
}
.bl-tabs-wrap::-webkit-scrollbar{display:none}
.bl-tabs{display:flex;gap:6px;padding:10px 14px;min-width:max-content}
.bl-tab{
  all:unset;cursor:pointer;display:flex;align-items:center;gap:6px;
  padding:8px 14px;border-radius:12px;
  border:1px solid rgba(255,255,255,.1);
  background:rgba(255,255,255,.04);
  font-size:13px;font-weight:700;white-space:nowrap;
  transition:border-color .15s,background .15s;
  position:relative;
}
.bl-tab:hover{border-color:rgba(0,240,255,.4);background:rgba(0,240,255,.06)}
.bl-tab.active{
  border-color:rgba(255,62,219,.7);
  background:linear-gradient(135deg,rgba(209,30,255,.22),rgba(0,240,255,.1));
  box-shadow:0 0 18px rgba(209,30,255,.2);
}
.bl-tab.done{border-color:rgba(0,255,191,.35)}
.bl-tab-badge{font-size:15px}
.bl-tab-label{color:#e0d8f0}
.bl-tab-check{color:#00ffbf;font-size:11px;font-weight:900;margin-left:2px}

/* Content */
.bl-content{flex:1;padding:20px 18px 100px;max-width:800px;width:100%;margin:0 auto}

/* Module wrapper */
.bl-module{display:flex;flex-direction:column;gap:0}

/* Overview */
.bl-overview-hero{
  border:1px solid rgba(255,255,255,.1);
  background:linear-gradient(135deg,rgba(13,7,24,.95),rgba(6,1,12,.9));
  border-radius:24px;padding:28px 24px;margin-bottom:20px;
}
.bl-overview-eyebrow{
  font-size:11px;letter-spacing:.2em;text-transform:uppercase;
  color:#00f0ff;font-weight:800;margin-bottom:10px;
}
.bl-overview-title{
  font-size:clamp(52px,12vw,88px);font-weight:950;line-height:.9;margin:0 0 14px;
  background:linear-gradient(90deg,#fff,#00f0ff,#ff3edb);
  -webkit-background-clip:text;color:transparent;
}
.bl-overview-sub{color:#aaa0ba;font-size:16px;line-height:1.6;margin:0 0 22px}
.bl-overview-sub b{color:#f2f0f4}
.bl-start-btn{
  all:unset;cursor:pointer;display:inline-block;
  padding:14px 24px;border-radius:14px;font-weight:850;font-size:15px;
  background:linear-gradient(135deg,#d11eff,#ff3edb);
  color:#05000b;box-shadow:0 0 28px rgba(209,30,255,.35);
}

.bl-pillar-list{display:flex;flex-direction:column;gap:10px;margin-bottom:20px}
.bl-pillar-row{
  all:unset;cursor:pointer;display:flex;align-items:center;gap:14px;
  padding:16px;border-radius:16px;
  border:1px solid rgba(255,255,255,.09);
  background:rgba(255,255,255,.03);
  transition:border-color .15s,background .15s;
}
.bl-pillar-row:hover{background:rgba(255,255,255,.065)}
.bl-pillar-row-letter{
  width:44px;height:44px;border-radius:12px;
  display:grid;place-items:center;font-size:20px;font-weight:950;flex-shrink:0;
  border:1px solid;background:rgba(255,255,255,.05);
}
.bl-pillar-row-text{display:flex;flex-direction:column;gap:2px;flex:1}
.bl-pillar-row-text b{font-size:15px;font-weight:800}
.bl-pillar-row-text span{font-size:12px;color:#aaa0ba}
.bl-pillar-row-check{font-size:16px;font-weight:900}

.bl-stats-row{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:4px}
@media(max-width:500px){.bl-stats-row{grid-template-columns:1fr}}
.bl-stat-card{
  border:1px solid rgba(0,240,255,.15);border-radius:16px;padding:16px;
  background:rgba(0,240,255,.04);
}
.bl-stat-card b{display:block;font-size:26px;color:#00f0ff;margin-bottom:6px}
.bl-stat-card span{font-size:12px;color:#aaa0ba;line-height:1.4}

/* Module header */
.bl-mod-header{
  display:flex;align-items:flex-start;gap:16px;
  padding:22px;border-radius:22px;
  border:1px solid;
  background:linear-gradient(135deg,rgba(255,255,255,.05),rgba(255,255,255,.02));
  margin-bottom:20px;
}
.bl-mod-letter{font-size:64px;font-weight:950;line-height:1;flex-shrink:0;margin-top:-4px}
.bl-mod-tag{
  display:inline-block;border:1px solid;border-radius:999px;
  padding:4px 10px;font-size:11px;font-weight:800;letter-spacing:.1em;
  text-transform:uppercase;margin-bottom:6px;
}
.bl-mod-name{margin:0 0 4px;font-size:26px;font-weight:900;line-height:1.1}
.bl-mod-tagline{margin:0;font-size:14px;color:#aaa0ba}
.bl-done-btn{
  all:unset;cursor:pointer;margin-left:auto;flex-shrink:0;
  padding:10px 16px;border-radius:12px;border:1px solid rgba(255,255,255,.2);
  font-size:13px;font-weight:800;color:#aaa0ba;white-space:nowrap;
  transition:border-color .15s,color .15s;
}
.bl-done-btn.big{padding:14px 22px;font-size:15px;border-radius:14px}
.bl-done-btn:hover{border-color:rgba(0,240,255,.5)}

/* Thesis */
.bl-thesis{
  border-left:3px solid;padding:14px 16px;border-radius:0 12px 12px 0;
  background:rgba(255,255,255,.04);margin-bottom:22px;
  font-size:15px;line-height:1.65;color:#d8d0e8;
}

/* Section title */
.bl-section-title{
  font-size:11px;letter-spacing:.2em;text-transform:uppercase;
  color:#00f0ff;font-weight:800;margin:22px 0 12px;
}

/* Learn list */
.bl-learn-list{display:flex;flex-direction:column;gap:10px;margin-bottom:4px}
.bl-learn-item{
  display:flex;gap:14px;align-items:flex-start;
  padding:14px;border-radius:14px;
  border:1px solid rgba(255,255,255,.08);
  background:rgba(255,255,255,.03);
}
.bl-learn-num{font-size:20px;font-weight:950;line-height:1;flex-shrink:0;min-width:28px}
.bl-learn-item p{margin:0;font-size:14px;line-height:1.6;color:#d8d0e8}

/* Stand picker */
.bl-stand-grid{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:4px}
.bl-stand-btn{
  all:unset;cursor:pointer;padding:10px 16px;border-radius:12px;
  border:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.04);
  font-size:13px;font-weight:700;color:#d8d0e8;
  transition:border-color .15s,box-shadow .15s,background .15s;
}
.bl-stand-btn:hover{background:rgba(255,255,255,.08)}
.bl-stand-btn.sel{background:rgba(255,255,255,.09)}

/* Drill */
.bl-drill{
  margin:16px 0 4px;border:1px dashed rgba(0,255,191,.35);
  border-radius:16px;padding:16px;background:rgba(0,255,191,.04);
}
.bl-drill-label{
  font-size:11px;letter-spacing:.18em;text-transform:uppercase;
  color:#00ffbf;font-weight:800;margin-bottom:8px;
}
.bl-drill p{margin:0;font-size:14px;line-height:1.6;color:#d8d0e8}

/* Prompt box */
.bl-prompt-box{
  border:1px solid;border-radius:14px;padding:16px;
  background:rgba(255,255,255,.04);margin-bottom:4px;
}
.bl-prompt-box p{margin:0;font-size:15px;line-height:1.6;color:#f2f0f4;font-weight:600}

/* Field */
.bl-field{display:flex;flex-direction:column;gap:6px;margin-top:14px}
.bl-label{font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:#00f0ff;font-weight:800}
.bl-textarea{
  width:100%;min-height:100px;resize:vertical;
  background:#07000f;border:1px solid rgba(255,255,255,.12);
  border-radius:14px;padding:14px;color:#f2f0f4;font:inherit;font-size:14px;
  outline:none;line-height:1.6;
}
.bl-textarea:focus{border-color:#00f0ff;box-shadow:0 0 0 3px rgba(0,240,255,.1)}
.bl-textarea::placeholder{color:#5a4d6e}

/* Score */
.bl-score-hint{font-size:13px;color:#aaa0ba;margin:0 0 16px}
.bl-score-row{display:flex;align-items:center;gap:12px;margin-bottom:12px}
.bl-score-label{font-size:13px;font-weight:800;min-width:80px}
.bl-score-row input[type=range]{flex:1;height:6px}
.bl-score-val{font-size:17px;font-weight:950;min-width:24px;text-align:right}

/* Recap */
.bl-recap-hero{
  text-align:center;padding:28px 20px;border-radius:24px;
  background:radial-gradient(circle at top,rgba(0,240,255,.12),transparent 60%),
             linear-gradient(135deg,rgba(209,30,255,.1),rgba(255,62,219,.06));
  border:1px solid rgba(0,240,255,.2);margin-bottom:22px;
}
.bl-recap-icon{font-size:52px;margin-bottom:12px}
.bl-recap-hero h2{font-size:32px;margin:0 0 10px;background:linear-gradient(90deg,#00f0ff,#ff3edb);-webkit-background-clip:text;color:transparent}
.bl-recap-hero p{color:#aaa0ba;font-size:15px;line-height:1.6;margin:0}

.bl-recap-card{
  border-left:3px solid;padding:16px 16px 16px 18px;border-radius:0 14px 14px 0;
  background:rgba(255,255,255,.03);border-top:1px solid rgba(255,255,255,.06);
  border-right:1px solid rgba(255,255,255,.06);border-bottom:1px solid rgba(255,255,255,.06);
  margin-bottom:10px;
}
.bl-recap-pill{display:flex;align-items:center;gap:8px;font-size:13px;font-weight:800;margin-bottom:8px}
.bl-recap-letter{
  width:28px;height:28px;border-radius:8px;display:grid;place-items:center;
  font-size:14px;font-weight:950;border:1px solid;
}
.bl-recap-answer{margin:0;font-size:14px;color:#d8d0e8;line-height:1.6}
.bl-recap-empty{color:#5a4d6e;font-style:italic}

.bl-recap-actions{display:flex;flex-direction:column;gap:10px;margin-top:24px;align-items:center}
.bl-reset-btn{
  all:unset;cursor:pointer;font-size:13px;color:#5a4d6e;
  text-decoration:underline;text-underline-offset:3px;
}

/* Footer nav */
.bl-footer{
  position:fixed;bottom:54px;left:0;right:0;z-index:10;
  display:flex;gap:10px;padding:12px 18px;
  background:linear-gradient(0deg,rgba(5,0,11,.98) 60%,transparent);
  max-width:800px;margin:0 auto;
}
.bl-nav-btn{
  all:unset;cursor:pointer;flex:1;text-align:center;
  padding:13px 18px;border-radius:14px;font-weight:800;font-size:14px;
  border:1px solid rgba(255,255,255,.15);color:#aaa0ba;
  background:rgba(255,255,255,.05);
  transition:.15s;
}
.bl-nav-btn:disabled{opacity:.3;cursor:default}
.bl-nav-btn.primary{
  background:linear-gradient(135deg,#d11eff,#ff3edb);
  color:#05000b;border:none;
  box-shadow:0 0 22px rgba(209,30,255,.35);
}
`;
