import React, { useMemo, useState, useEffect } from 'react';

const STORAGE_KEY = 'blaze_being_module_v1';

const defaultState = {
  stand: '',
  oldBeing: '',
  bossBeing: '',
  evidence: '',
  ifThen: '',
  actionRep: '',
  reflection: '',
  completed: false,
};

const neon = {
  purple: '#D11EFF',
  cyan: '#00F0FF',
  pink: '#FF3EDB',
  mint: '#00FFBF',
  white: '#F2F0F4',
};

function loadState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? { ...defaultState, ...JSON.parse(saved) } : defaultState;
  } catch {
    return defaultState;
  }
}

export default function BlazeBeingModule() {
  const [state, setState] = useState(defaultState);
  const [step, setStep] = useState(0);

  useEffect(() => setState(loadState()), []);
  useEffect(() => localStorage.setItem(STORAGE_KEY, JSON.stringify(state)), [state]);

  const progress = useMemo(() => {
    const fields = ['stand', 'oldBeing', 'bossBeing', 'evidence', 'ifThen', 'actionRep', 'reflection'];
    const done = fields.filter((f) => state[f]?.trim()).length + (state.completed ? 1 : 0);
    return Math.round((done / 8) * 100);
  }, [state]);

  const update = (key, value) => setState((s) => ({ ...s, [key]: value }));

  const steps = [
    {
      eyebrow: 'B.L.A.Z.E. Module 01',
      title: 'B — Being: Identity Before Action',
      lesson: 'Most people try to change their life by changing tasks. Blaze starts deeper: change the operator. Being is the identity, state, and standard you act from before strategy, scripts, or pressure hit.',
      callout: 'Your results will always fight to match who you believe you are.',
      prompt: 'Today I am choosing to be...',
      key: 'stand',
      placeholder: 'Example: decisive, powerful, calm, coachable, relentless, grounded...',
    },
    {
      eyebrow: 'Lesson 01',
      title: 'The Two Versions Running the Show',
      lesson: 'Your book teaches that there are two identities: the Survival Being and the Essence Self. Survival acts from fear, validation, comfort, and “what if it doesn’t work?” Essence acts from alignment, ownership, purpose, and “what if it does?”',
      callout: 'Awareness is the first rep. You cannot shift what you cannot see.',
      prompt: 'What old version has been making decisions lately?',
      key: 'oldBeing',
      placeholder: 'Example: the overthinker, the avoider, the people pleaser, the scared employee...',
    },
    {
      eyebrow: 'Lesson 02',
      title: 'Be The Boss Is Not a Title — It Is Ownership',
      lesson: 'Being the boss means owning your habits, mindset, decisions, communication, standards, and destiny. It is not about waiting until you have money, status, or a perfect plan. It is deciding who leads before the day starts.',
      callout: 'You do not need permission to be powerful.',
      prompt: 'What would the boss version of you do today?',
      key: 'bossBeing',
      placeholder: 'Example: knock the next door, make the call, post the content, tell the truth, train the skill...',
    },
    {
      eyebrow: 'Proof Principle',
      title: 'Identity Needs Evidence',
      lesson: 'Being is not fantasy. It becomes real when you stack evidence. Every proof rep tells your nervous system, “This is who I am now.” Small wins matter because they turn an identity claim into lived proof.',
      callout: 'Do not affirm it once. Prove it once. Then prove it again.',
      prompt: 'What evidence would prove this new Being today?',
      key: 'evidence',
      placeholder: 'Example: 30 doors, 10 calls, one hard conversation, one hour of focused training...',
    },
    {
      eyebrow: 'Science Drill',
      title: 'If–Then Identity Lock',
      lesson: 'Turn the identity into an automatic response. When pressure shows up, you need a pre-decided move. The formula: If [trigger], then I will [Being-based action].',
      callout: 'Pressure does not decide. Your pre-chosen Being decides.',
      prompt: 'Write your if–then Being lock.',
      key: 'ifThen',
      placeholder: 'Example: If I feel fear at the door, then I stand tall, breathe, smile, and lead the conversation.',
    },
    {
      eyebrow: 'Action Rep',
      title: 'The 10-Minute Being Rep',
      lesson: 'Now put it in motion. Set a 10-minute rep where you act only from the chosen identity. No fixing your whole life. No overthinking. Just one clean rep from the new Being.',
      callout: 'One clean rep beats another hour of thinking.',
      prompt: 'What is your 10-minute proof rep?',
      key: 'actionRep',
      placeholder: 'Example: rehearse pitch, send message, clean workspace, start workout, write the first page...',
    },
    {
      eyebrow: 'Integration',
      title: 'Lock the Lesson Into Wisdom',
      lesson: 'At the end of the rep, do not just move on. Integrate. Wisdom is created when action becomes awareness. Ask: what did I learn about who I am when I actually moved?',
      callout: 'The win is not just what you did. The win is who you became while doing it.',
      prompt: 'What did this rep teach you about your Being?',
      key: 'reflection',
      placeholder: 'Example: I learned I do not need to feel ready to lead. I just need to choose and move.',
    },
    {
      eyebrow: 'Completion',
      title: 'B Is Complete When Being Becomes Behavior',
      lesson: 'You complete this module when you can name your old Being, choose your new Being, create evidence, and act before your feelings negotiate you back into the old identity.',
      callout: 'Being is the source code. Behavior is the output.',
      final: true,
    },
  ];

  const current = steps[step];

  return (
    <div style={styles.shell}>
      <div style={styles.bgGlowOne} />
      <div style={styles.bgGlowTwo} />
      <main style={styles.app}>
        <section style={styles.hero}>
          <div>
            <p style={styles.kicker}>B.L.A.Z.E. Training OS</p>
            <h1 style={styles.h1}>B — Being</h1>
            <p style={styles.sub}>Identity before strategy. Essence before fear. Ownership before action.</p>
          </div>
          <div style={styles.progressCard}>
            <span style={styles.progressNumber}>{progress}%</span>
            <span style={styles.progressLabel}>Being Locked</span>
            <div style={styles.progressTrack}><div style={{ ...styles.progressFill, width: `${progress}%` }} /></div>
          </div>
        </section>

        <nav style={styles.stepNav}>
          {steps.map((s, i) => (
            <button key={s.title} style={{ ...styles.dot, ...(i === step ? styles.dotActive : {}) }} onClick={() => setStep(i)}>
              {i + 1}
            </button>
          ))}
        </nav>

        <section style={styles.card}>
          <p style={styles.eyebrow}>{current.eyebrow}</p>
          <h2 style={styles.h2}>{current.title}</h2>
          <p style={styles.lesson}>{current.lesson}</p>
          <div style={styles.callout}>{current.callout}</div>

          {!current.final ? (
            <label style={styles.label}>
              {current.prompt}
              <textarea
                style={styles.textarea}
                value={state[current.key]}
                onChange={(e) => update(current.key, e.target.value)}
                placeholder={current.placeholder}
              />
            </label>
          ) : (
            <div style={styles.finalBox}>
              <h3 style={styles.h3}>Your Being Statement</h3>
              <p><strong>I am choosing to be:</strong> {state.stand || '—'}</p>
              <p><strong>I am no longer led by:</strong> {state.oldBeing || '—'}</p>
              <p><strong>The boss version of me will:</strong> {state.bossBeing || '—'}</p>
              <p><strong>Today’s proof:</strong> {state.evidence || '—'}</p>
              <p><strong>My pressure lock:</strong> {state.ifThen || '—'}</p>
              <button style={styles.completeButton} onClick={() => update('completed', !state.completed)}>
                {state.completed ? 'Module Complete ✓' : 'Mark B — Being Complete'}
              </button>
            </div>
          )}

          <div style={styles.controls}>
            <button style={styles.secondaryButton} onClick={() => setStep(Math.max(0, step - 1))}>Back</button>
            <button style={styles.primaryButton} onClick={() => setStep(Math.min(steps.length - 1, step + 1))}>Next</button>
          </div>
        </section>

        <section style={styles.proofGrid}>
          <div style={styles.proofCard}><strong>Book Principle</strong><span>Being the boss means ownership of habits, mindset, decisions, and destiny.</span></div>
          <div style={styles.proofCard}><strong>Coaching Principle</strong><span>Transformational coaching begins with awareness, responsibility, and client-owned action.</span></div>
          <div style={styles.proofCard}><strong>Science Principle</strong><span>Identity and habit are linked; if–then planning helps translate intention into action.</span></div>
        </section>
      </main>
    </div>
  );
}

const styles = {
  shell: { minHeight: '100vh', background: '#050006', color: neon.white, fontFamily: 'Inter, system-ui, sans-serif', position: 'relative', overflow: 'hidden' },
  bgGlowOne: { position: 'fixed', width: 460, height: 460, borderRadius: 999, background: 'rgba(209,30,255,.18)', filter: 'blur(60px)', top: -140, right: -100 },
  bgGlowTwo: { position: 'fixed', width: 420, height: 420, borderRadius: 999, background: 'rgba(0,240,255,.13)', filter: 'blur(70px)', bottom: -150, left: -100 },
  app: { width: 'min(1120px, 92vw)', margin: '0 auto', padding: '42px 0 60px', position: 'relative', zIndex: 1 },
  hero: { display: 'flex', gap: 20, justifyContent: 'space-between', alignItems: 'stretch', flexWrap: 'wrap', marginBottom: 24 },
  kicker: { color: neon.mint, letterSpacing: 3, textTransform: 'uppercase', fontSize: 12, fontWeight: 800 },
  h1: { fontSize: 'clamp(42px, 8vw, 92px)', margin: '0 0 8px', lineHeight: .9, textShadow: `0 0 30px ${neon.purple}` },
  sub: { maxWidth: 690, fontSize: 18, color: '#d9cce0', margin: 0 },
  progressCard: { minWidth: 230, background: 'rgba(0,0,0,.7)', border: '1px solid rgba(0,240,255,.35)', borderRadius: 24, padding: 22, boxShadow: '0 0 40px rgba(0,240,255,.1)' },
  progressNumber: { fontSize: 42, fontWeight: 900, color: neon.cyan, display: 'block' },
  progressLabel: { color: '#d9cce0', fontWeight: 700 },
  progressTrack: { height: 10, borderRadius: 999, background: 'rgba(255,255,255,.08)', marginTop: 15, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 999, background: `linear-gradient(90deg, ${neon.purple}, ${neon.cyan}, ${neon.mint})` },
  stepNav: { display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 20 },
  dot: { width: 42, height: 42, borderRadius: 14, border: '1px solid rgba(255,255,255,.16)', background: 'rgba(0,0,0,.72)', color: neon.white, fontWeight: 900, cursor: 'pointer' },
  dotActive: { borderColor: neon.cyan, boxShadow: `0 0 24px rgba(0,240,255,.35)`, color: neon.cyan },
  card: { background: 'linear-gradient(145deg, rgba(12,0,18,.96), rgba(0,0,0,.95))', border: '1px solid rgba(209,30,255,.35)', borderRadius: 32, padding: 'clamp(24px, 5vw, 48px)', boxShadow: '0 0 80px rgba(209,30,255,.13)' },
  eyebrow: { color: neon.pink, textTransform: 'uppercase', letterSpacing: 2, fontSize: 12, fontWeight: 900 },
  h2: { fontSize: 'clamp(30px, 5vw, 58px)', margin: '6px 0 18px', lineHeight: 1 },
  lesson: { fontSize: 18, lineHeight: 1.75, color: '#eee6f2', maxWidth: 900 },
  callout: { margin: '24px 0', padding: 18, borderRadius: 20, background: 'rgba(0,240,255,.08)', border: '1px solid rgba(0,240,255,.25)', color: neon.cyan, fontWeight: 900 },
  label: { display: 'block', color: neon.mint, fontWeight: 900, marginTop: 24 },
  textarea: { width: '100%', minHeight: 140, marginTop: 10, borderRadius: 18, padding: 18, border: '1px solid rgba(255,255,255,.16)', background: '#07020a', color: neon.white, fontSize: 16, outline: 'none' },
  controls: { display: 'flex', justifyContent: 'space-between', gap: 12, marginTop: 24 },
  primaryButton: { border: 0, borderRadius: 16, padding: '14px 22px', background: `linear-gradient(90deg, ${neon.purple}, ${neon.cyan})`, color: '#050006', fontWeight: 1000, cursor: 'pointer' },
  secondaryButton: { border: '1px solid rgba(255,255,255,.18)', borderRadius: 16, padding: '14px 22px', background: '#07020a', color: neon.white, fontWeight: 900, cursor: 'pointer' },
  finalBox: { background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.1)', borderRadius: 24, padding: 22 },
  h3: { color: neon.cyan, fontSize: 24 },
  completeButton: { marginTop: 12, width: '100%', border: 0, borderRadius: 16, padding: 16, background: `linear-gradient(90deg, ${neon.mint}, ${neon.cyan})`, color: '#050006', fontWeight: 1000, cursor: 'pointer' },
  proofGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginTop: 22 },
  proofCard: { display: 'grid', gap: 8, background: 'rgba(0,0,0,.68)', border: '1px solid rgba(255,255,255,.1)', borderRadius: 20, padding: 18, color: '#d9cce0' },
};
