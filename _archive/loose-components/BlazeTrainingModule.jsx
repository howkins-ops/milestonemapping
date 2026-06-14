import React, { useEffect, useMemo, useState } from 'react';

/**
 * BLAZE Training Module - drop-in React component
 * Brand: Milestone Mapping / B.L.A.Z.E.
 * Persistence: localStorage
 * Styling: pure JSX + inline CSS so it can be dropped into most React apps.
 */

const STORAGE_KEY = 'blaze_training_module_v1';
const HERO_IMAGE = '/images/blaze-cyberpunk-lab.png';
const TRAINING_ASSET = '/images/blaze-training/';

const brand = {
  magenta: '#D11EFF',
  cyan: '#00F0FF',
  pink: '#FF3EDB',
  mint: '#00FFBF',
  amber: '#FFB000',
  white: '#F2F0F4',
  black: '#030008',
  panel: '#080011',
  deep: '#12001f',
};

const imageUrl = (file) => `${TRAINING_ASSET}${file}`;

const pillars = [
  {
    key: 'being',
    letter: 'B',
    title: 'Being',
    stand: 'I return to essence before I chase outcomes.',
    question: 'Who am I choosing to be before I execute?',
    coachingMove: 'Presence, grounding, self-awareness, values alignment.',
    essence: ['Radiance', 'Love', 'Joy', 'Power', 'Majesty'],
    ritual: '60-second breath reset: inhale identity, exhale survival mask.',
    image: '8_Who-Am-I.png',
  },
  {
    key: 'leadership',
    letter: 'L',
    title: 'Leadership',
    stand: 'I create motion for myself and others.',
    question: 'Where am I waiting for permission instead of leading?',
    coachingMove: 'Ownership, standards, courageous communication, responsibility.',
    essence: ['Inspiring', 'Leader', 'Connector'],
    ritual: 'Name one room, person, or result that needs your leadership today.',
    image: '40_AI-Identity-Coaching.png',
  },
  {
    key: 'alignment',
    letter: 'A',
    title: 'Alignment',
    stand: 'My actions match my values, vision, and commitments.',
    question: 'What is the cleanest next action that matches the person I say I am?',
    coachingMove: 'Integrity audit, values hierarchy, goal-to-action mapping.',
    essence: ['Clarity', 'Integrity', 'Truth'],
    ritual: 'Pick one commitment and remove one contradiction before noon.',
    image: '10_Shift-To-Integrity.png',
  },
  {
    key: 'zeal',
    letter: 'Z',
    title: 'Zeal',
    stand: 'I bring energy, devotion, and emotional fire to the mission.',
    question: 'What would I attack today if I remembered the mission mattered?',
    coachingMove: 'Meaning, gratitude, emotional activation, future visualization.',
    essence: ['Fire', 'Gratitude', 'Devotion'],
    ritual: 'Write three wins, one blessing, and one reason the mission is worth it.',
    image: '46_Your-Shift.png',
  },
  {
    key: 'execution',
    letter: 'E',
    title: 'Execution',
    stand: 'I plan today, execute tomorrow, and prove it daily.',
    question: 'What proof will exist by tonight that I moved?',
    coachingMove: 'Implementation intention, daily proof, milestone reward loop.',
    essence: ['Discipline', 'Proof', 'Momentum'],
    ritual: 'Create one if-then plan: If obstacle X appears, then I will do Y.',
    image: '42_How-It-Works.png',
  },
];

const stages = [
  {
    id: 1,
    title: 'Choose Your Stand',
    subtitle: 'Start by selecting the version of you that needs to lead today.',
    prompt: 'Today, I am standing in...',
    image: '8_Who-Am-I.png',
  },
  {
    id: 2,
    title: 'Expose the Mask',
    subtitle: 'Name the survival mechanism without becoming it.',
    prompt: 'The mask trying to run me today is...',
    image: '26_Mask-Examples.png',
  },
  {
    id: 3,
    title: 'Return to Essence',
    subtitle: 'Move from reaction to identity before making a plan.',
    prompt: 'The essence I am returning to is...',
    image: '32_Choose-Essence.png',
  },
  {
    id: 4,
    title: 'Map the Milestone',
    subtitle: 'Convert vision into the next visible checkpoint.',
    prompt: 'The milestone I am moving toward is...',
    image: 'worldmap.png',
  },
  {
    id: 5,
    title: 'Attach the Reward',
    subtitle: 'Give your nervous system a reason to enjoy progress.',
    prompt: 'When I complete this, I will reward myself with...',
    image: 'treasure-trail.png',
  },
  {
    id: 6,
    title: 'Plan Today, Execute Tomorrow',
    subtitle: 'Pre-decide the when, where, and how before resistance hits.',
    prompt: 'Tomorrow, at this time/place, I will execute...',
    image: '42_How-It-Works.png',
  },
  {
    id: 7,
    title: 'Daily Proof',
    subtitle: 'No drama. No story. Just evidence.',
    prompt: 'The proof I created today was...',
    image: 'conquered-trail.png',
  },
  {
    id: 8,
    title: 'Weekly Wisdom Review',
    subtitle: 'Turn experience into learning, growth, and wisdom.',
    prompt: 'This week taught me...',
    image: '25_Awareness.png',
  },
];

const masks = [
  { name: 'Broke King', flip: 'I create value before I demand a crown.' },
  { name: 'Addict Saint', flip: 'I create intimacy, energy, and integrity instead of consuming escape.' },
  { name: 'Wasted Genius', flip: 'I turn potential into proof.' },
  { name: 'Raging Victim', flip: 'I take my power back without needing life to be fair first.' },
  { name: 'Naive Warrior', flip: 'I stay open-hearted and build stronger discernment.' },
];

const stats = [
  {
    stat: '85%',
    label: 'of coaches say clients want support for mental well-being',
    source: 'ICF 2024 Coaching Snapshot',
    use: 'Position BLAZE as performance + inner game, not just productivity.',
  },
  {
    stat: '122,974',
    label: 'coach practitioners estimated globally in the 2025 ICF Global Coaching Study',
    source: 'ICF 2025 Global Coaching Study',
    use: 'Coaching is a global category, so this module should feel premium and legitimate.',
  },
  {
    stat: '$5.34B',
    label: 'estimated global coaching industry revenue in 2025',
    source: 'ICF 2025 Global Coaching Study',
    use: 'The app can become a serious training/product ecosystem.',
  },
  {
    stat: '64 RCTs',
    label: 'gratitude intervention trials in a 2023 systematic review/meta-analysis',
    source: 'Diniz et al., 2023',
    use: 'Morning gratitude belongs inside the daily ritual because it supports better mental health and fewer anxiety/depression symptoms.',
  },
  {
    stat: 'd = .65',
    label: 'medium-to-large effect reported for implementation intentions on goal attainment',
    source: 'Gollwitzer & Sheeran, 2006',
    use: 'This backs the plan today, execute tomorrow mechanic.',
  },
];

const trainingSlides = [
  {
    title: 'The 5 Simple Shifts',
    kicker: 'Foundation',
    image: '1_The-5-Simple-Shifts.png',
  },
  {
    title: 'The Big Question',
    kicker: 'Identity prompt',
    image: '6_THE-BIG-QUESTION.png',
  },
  {
    title: 'Your Identity Is',
    kicker: 'Being layer',
    image: '18_Your-Identity-Is.png',
  },
  {
    title: 'Survival Mechanisms',
    kicker: 'Mask work',
    image: '24_Survival-Mechanisms.png',
  },
  {
    title: 'The Yin and Yang',
    kicker: 'Integration',
    image: '23_The-Yin-and-Yang.png',
  },
  {
    title: 'Your Shift',
    kicker: 'Activation',
    image: '46_Your-Shift.png',
  },
];

const defaultState = {
  selectedPillar: 'being',
  activeStage: 1,
  completedStages: [],
  entries: {},
  dailyProof: [],
  wisdomScore: 0,
};

function loadState() {
  if (typeof window === 'undefined') return defaultState;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? { ...defaultState, ...JSON.parse(raw) } : defaultState;
  } catch {
    return defaultState;
  }
}

export default function BlazeTrainingModule() {
  const [state, setState] = useState(loadState);
  const [coachMode, setCoachMode] = useState('Training');

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const selected = useMemo(
    () => pillars.find((p) => p.key === state.selectedPillar) || pillars[0],
    [state.selectedPillar]
  );

  const activeStage = useMemo(
    () => stages.find((stage) => stage.id === state.activeStage) || stages[0],
    [state.activeStage]
  );

  const progress = Math.round((state.completedStages.length / stages.length) * 100);

  const updateEntry = (stageId, value) => {
    setState((s) => ({ ...s, entries: { ...s.entries, [stageId]: value } }));
  };

  const completeStage = (stageId) => {
    setState((s) => {
      const completed = s.completedStages.includes(stageId)
        ? s.completedStages
        : [...s.completedStages, stageId];
      return {
        ...s,
        completedStages: completed,
        activeStage: Math.min(stageId + 1, stages.length),
        wisdomScore: completed.length * 12 + (s.dailyProof.length * 3),
      };
    });
  };

  const addProof = () => {
    const proof = state.entries[7];
    if (!proof || !proof.trim()) return;
    setState((s) => ({
      ...s,
      dailyProof: [{ text: proof.trim(), at: new Date().toLocaleString() }, ...s.dailyProof].slice(0, 12),
      entries: { ...s.entries, 7: '' },
      wisdomScore: s.wisdomScore + 5,
    }));
  };

  const reset = () => {
    setState(defaultState);
    window.localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <div className="blaze-shell">
      <style>{css}</style>

      <section className="hero" style={{ '--hero-image': `url(${HERO_IMAGE})` }}>
        <div className="hero-backdrop" />
        <div className="scanlines" />
        <div className="hero-copy">
          <div className="eyebrow">Milestone Mapping Training OS</div>
          <h1>B.L.A.Z.E. Transformation Lab</h1>
          <p>
            A coaching-grade identity module for Being, Leadership, Alignment, Zeal, and Execution.
            Choose the stand, expose the mask, map the milestone, and create proof before motivation fades.
          </p>
          <div className="hero-actions" aria-label="Training mode">
            {['Training', 'Daily Stand', 'Coach View'].map((mode) => (
              <button key={mode} onClick={() => setCoachMode(mode)} className={coachMode === mode ? 'active' : ''}>
                {mode}
              </button>
            ))}
          </div>
        </div>

        <div className="hero-visual">
          <img src={HERO_IMAGE} alt="Cyberpunk holographic milestone map" />
          <div className="hero-terminal">
            <span>ACTIVE PROTOCOL</span>
            <b>{selected.letter} / {selected.title}</b>
            <small>{progress}% transmission synced</small>
          </div>
        </div>
      </section>

      <section className="image-strip" aria-label="BLAZE training visuals">
        {trainingSlides.map((slide) => (
          <article className="slide-card" key={slide.title}>
            <img src={imageUrl(slide.image)} alt={slide.title} />
            <div>
              <span>{slide.kicker}</span>
              <b>{slide.title}</b>
            </div>
          </article>
        ))}
      </section>

      <section className="dashboard-grid">
        <div className="panel progress-panel">
          <div className="panel-top">
            <span>Transformation Progress</span>
            <strong>{progress}%</strong>
          </div>
          <div className="progress-track"><div style={{ width: `${progress}%` }} /></div>
          <div className="score-row">
            <div><b>{state.completedStages.length}/{stages.length}</b><span>stages complete</span></div>
            <div><b>{state.wisdomScore}</b><span>wisdom score</span></div>
            <div><b>{state.dailyProof.length}</b><span>proof logs</span></div>
          </div>
        </div>

        <div className="panel stand-panel">
          <div className="stand-image">
            <img src={imageUrl(selected.image)} alt={`${selected.title} visual`} />
          </div>
          <span className="mini-label">Today's Stand</span>
          <h2>{selected.title}</h2>
          <p>{selected.stand}</p>
          <div className="essence-row">
            {selected.essence.map((word) => <span key={word}>{word}</span>)}
          </div>
        </div>
      </section>

      <section className="pillar-grid">
        {pillars.map((pillar) => (
          <button
            key={pillar.key}
            className={`pillar-card ${state.selectedPillar === pillar.key ? 'selected' : ''}`}
            onClick={() => setState((s) => ({ ...s, selectedPillar: pillar.key }))}
          >
            <img src={imageUrl(pillar.image)} alt="" aria-hidden="true" />
            <div className="pillar-card-content">
              <div className="pillar-letter">{pillar.letter}</div>
              <h3>{pillar.title}</h3>
              <p>{pillar.question}</p>
            </div>
          </button>
        ))}
      </section>

      {coachMode === 'Daily Stand' && (
        <section className="panel ritual-panel">
          <div>
            <span className="mini-label">60-second activation</span>
            <h2>{selected.ritual}</h2>
            <p>{selected.coachingMove}</p>
          </div>
          <div className="breath-orbit" aria-hidden="true"><span /></div>
        </section>
      )}

      {coachMode === 'Coach View' && (
        <section className="panel coach-panel">
          <div className="coach-image">
            <img src={imageUrl('40_AI-Identity-Coaching.png')} alt="AI identity coaching slide" />
          </div>
          <span className="mini-label">Coach lens</span>
          <h2>Ask, don't tell. Create awareness, then convert awareness into proof.</h2>
          <div className="coach-grid">
            <div><b>ICF-style move</b><p>Maintains presence, evokes awareness, listens actively, and facilitates client growth.</p></div>
            <div><b>BLAZE move</b><p>Identity first, mask second, milestone third, proof fourth.</p></div>
            <div><b>App mechanic</b><p>Every insight must become a next action, reward, or weekly review.</p></div>
          </div>
        </section>
      )}

      <section className="training-layout">
        <aside className="stage-rail" aria-label="Training stages">
          {stages.map((stage) => (
            <button
              key={stage.id}
              className={`stage-tab ${state.activeStage === stage.id ? 'active' : ''} ${state.completedStages.includes(stage.id) ? 'done' : ''}`}
              onClick={() => setState((s) => ({ ...s, activeStage: stage.id }))}
            >
              <span>{stage.id}</span>
              {stage.title}
            </button>
          ))}
        </aside>

        <main className="panel stage-panel">
          <div className="stage-visual">
            <img src={imageUrl(activeStage.image)} alt={`${activeStage.title} visual`} />
            <div>
              <span>STAGE {activeStage.id}</span>
              <b>{activeStage.title}</b>
            </div>
          </div>
          <div className="stage-copy">
            <span className="mini-label">Stage {activeStage.id}</span>
            <h2>{activeStage.title}</h2>
            <p>{activeStage.subtitle}</p>
            <label>{activeStage.prompt}</label>
            {activeStage.id === 2 ? (
              <div className="mask-grid">
                {masks.map((mask) => (
                  <button
                    key={mask.name}
                    onClick={() => updateEntry(activeStage.id, `${mask.name}: ${mask.flip}`)}
                    className={state.entries[activeStage.id]?.startsWith(mask.name) ? 'selected-mask' : ''}
                  >
                    <b>{mask.name}</b><span>{mask.flip}</span>
                  </button>
                ))}
              </div>
            ) : (
              <textarea
                value={state.entries[activeStage.id] || ''}
                onChange={(e) => updateEntry(activeStage.id, e.target.value)}
                placeholder="Write the truth. Keep it clean. Make it actionable."
              />
            )}
            <div className="stage-actions">
              {activeStage.id === 7 && <button className="secondary" onClick={addProof}>Add Daily Proof</button>}
              <button onClick={() => completeStage(activeStage.id)}>Complete Stage</button>
            </div>
          </div>
        </main>
      </section>

      <section className="stats-grid">
        {stats.map((item) => (
          <article className="stat-card" key={item.stat}>
            <strong>{item.stat}</strong>
            <h3>{item.label}</h3>
            <p>{item.use}</p>
            <span>{item.source}</span>
          </article>
        ))}
      </section>

      <section className="panel proof-panel">
        <div className="panel-top">
          <div>
            <span className="mini-label">Evidence Wall</span>
            <h2>Daily proof beats emotional noise.</h2>
          </div>
          <button className="danger" onClick={reset}>Reset Module</button>
        </div>
        {state.dailyProof.length === 0 ? (
          <p className="empty">No proof logged yet. Complete Stage 7 to start building evidence.</p>
        ) : (
          <div className="proof-list">
            {state.dailyProof.map((proof, index) => (
              <div key={`${proof.at}-${index}`}><b>{proof.at}</b><p>{proof.text}</p></div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

const css = `
  :root {
    --blaze-magenta: ${brand.magenta};
    --blaze-cyan: ${brand.cyan};
    --blaze-pink: ${brand.pink};
    --blaze-mint: ${brand.mint};
    --blaze-amber: ${brand.amber};
    --blaze-white: ${brand.white};
    --blaze-black: ${brand.black};
    --blaze-panel: ${brand.panel};
    --blaze-deep: ${brand.deep};
  }

  .blaze-shell {
    min-height: 100vh;
    color: var(--blaze-white);
    padding: 28px;
    font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    background:
      linear-gradient(90deg, rgba(0,240,255,.045) 1px, transparent 1px),
      linear-gradient(0deg, rgba(255,62,219,.04) 1px, transparent 1px),
      linear-gradient(135deg, #030008 0%, #080012 42%, #0c0018 100%);
    background-size: 34px 34px, 34px 34px, auto;
  }

  .hero,
  .panel,
  .pillar-card,
  .stat-card,
  .slide-card {
    border: 1px solid rgba(242,240,244,.14);
    background: linear-gradient(145deg, rgba(8,0,17,.96), rgba(18,0,31,.9));
    box-shadow: 0 0 32px rgba(209,30,255,.12), inset 0 0 30px rgba(0,240,255,.035);
    border-radius: 8px;
  }

  .hero {
    position: relative;
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(340px, .72fr);
    gap: 28px;
    overflow: hidden;
    min-height: 560px;
    padding: 42px;
    margin-bottom: 18px;
    isolation: isolate;
  }

  .hero-backdrop {
    position: absolute;
    inset: 0;
    background:
      linear-gradient(90deg, rgba(3,0,8,.96) 0%, rgba(3,0,8,.68) 45%, rgba(3,0,8,.28) 100%),
      var(--hero-image) center / cover no-repeat;
    z-index: -2;
  }

  .hero-backdrop::after {
    content: '';
    position: absolute;
    inset: 0;
    background:
      linear-gradient(90deg, rgba(0,240,255,.11) 1px, transparent 1px),
      linear-gradient(0deg, rgba(255,62,219,.1) 1px, transparent 1px);
    background-size: 72px 72px;
    mix-blend-mode: screen;
    opacity: .38;
  }

  .scanlines {
    pointer-events: none;
    position: absolute;
    inset: 0;
    background: repeating-linear-gradient(0deg, rgba(255,255,255,.055), rgba(255,255,255,.055) 1px, transparent 1px, transparent 8px);
    opacity: .22;
    z-index: -1;
  }

  .hero-copy {
    align-self: end;
    max-width: 900px;
    position: relative;
    z-index: 2;
  }

  .eyebrow,
  .mini-label {
    color: var(--blaze-mint);
    text-transform: uppercase;
    letter-spacing: .16em;
    font-size: 12px;
    font-weight: 900;
  }

  h1,
  h2,
  h3,
  p {
    overflow-wrap: anywhere;
  }

  h1 {
    max-width: 860px;
    font-size: clamp(46px, 7.3vw, 106px);
    line-height: .9;
    margin: 12px 0 18px;
    color: #fff;
    text-shadow: 0 0 20px rgba(0,240,255,.42), 0 0 46px rgba(209,30,255,.38);
  }

  h2 {
    font-size: clamp(24px, 3.5vw, 42px);
    margin: 8px 0 10px;
    letter-spacing: 0;
  }

  h3 {
    margin: 8px 0;
    letter-spacing: 0;
  }

  p {
    color: rgba(242,240,244,.78);
    line-height: 1.55;
  }

  .hero p {
    max-width: 720px;
    font-size: 18px;
  }

  button {
    color: var(--blaze-white);
    border: 1px solid rgba(0,240,255,.25);
    background: rgba(3,0,8,.56);
    border-radius: 8px;
    padding: 12px 16px;
    cursor: pointer;
    font-weight: 900;
    transition: transform .2s ease, border-color .2s ease, box-shadow .2s ease, background .2s ease;
  }

  button:hover,
  button.active,
  .pillar-card.selected {
    transform: translateY(-2px);
    border-color: var(--blaze-cyan);
    box-shadow: 0 0 22px rgba(0,240,255,.22);
  }

  .hero-actions {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
    position: relative;
    z-index: 2;
    margin-top: 24px;
  }

  .hero-actions button.active {
    color: var(--blaze-black);
    background: linear-gradient(90deg, var(--blaze-cyan), var(--blaze-mint));
  }

  .hero-visual {
    align-self: center;
    position: relative;
    min-height: 440px;
    border: 1px solid rgba(0,240,255,.28);
    border-radius: 8px;
    overflow: hidden;
    background: rgba(0,0,0,.42);
    box-shadow: 0 0 36px rgba(0,240,255,.18);
  }

  .hero-visual img,
  .stand-image img,
  .pillar-card img,
  .stage-visual img,
  .coach-image img,
  .slide-card img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  .hero-visual::after,
  .stage-visual::after,
  .slide-card::after {
    content: '';
    position: absolute;
    inset: 0;
    border: 1px solid rgba(255,255,255,.08);
    pointer-events: none;
  }

  .hero-terminal {
    position: absolute;
    left: 18px;
    right: 18px;
    bottom: 18px;
    display: grid;
    gap: 6px;
    padding: 16px;
    border: 1px solid rgba(0,255,191,.42);
    background: rgba(3,0,8,.78);
    backdrop-filter: blur(12px);
    border-radius: 8px;
  }

  .hero-terminal span,
  .hero-terminal small {
    color: var(--blaze-mint);
    font-size: 12px;
    font-weight: 900;
    letter-spacing: .12em;
  }

  .hero-terminal b {
    color: #fff;
    font-size: 28px;
  }

  .image-strip {
    display: grid;
    grid-template-columns: repeat(6, minmax(150px, 1fr));
    gap: 12px;
    margin-bottom: 18px;
  }

  .slide-card {
    position: relative;
    min-height: 190px;
    overflow: hidden;
  }

  .slide-card img {
    filter: saturate(1.15) contrast(1.05);
  }

  .slide-card div {
    position: absolute;
    inset: auto 10px 10px 10px;
    display: grid;
    gap: 3px;
    padding: 10px;
    border: 1px solid rgba(242,240,244,.16);
    border-radius: 8px;
    background: rgba(3,0,8,.74);
    backdrop-filter: blur(10px);
  }

  .slide-card span {
    color: var(--blaze-cyan);
    font-size: 11px;
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: .12em;
  }

  .slide-card b {
    font-size: 14px;
  }

  .dashboard-grid {
    display: grid;
    grid-template-columns: 1.35fr .9fr;
    gap: 18px;
    margin-bottom: 18px;
  }

  .panel {
    padding: 24px;
  }

  .panel-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
  }

  .progress-panel strong {
    font-size: 34px;
    color: var(--blaze-cyan);
    text-shadow: 0 0 18px rgba(0,240,255,.35);
  }

  .progress-track {
    height: 14px;
    border-radius: 8px;
    background: rgba(242,240,244,.07);
    overflow: hidden;
    margin: 18px 0;
  }

  .progress-track div {
    height: 100%;
    background: linear-gradient(90deg, var(--blaze-magenta), var(--blaze-cyan), var(--blaze-mint));
    box-shadow: 0 0 22px rgba(0,240,255,.5);
  }

  .score-row {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
  }

  .score-row div,
  .coach-grid div,
  .proof-list div {
    border: 1px solid rgba(242,240,244,.1);
    border-radius: 8px;
    padding: 14px;
    background: rgba(255,255,255,.025);
  }

  .score-row b {
    display: block;
    font-size: 24px;
  }

  .score-row span {
    color: rgba(242,240,244,.58);
    font-size: 12px;
  }

  .stand-panel {
    overflow: hidden;
  }

  .stand-image {
    height: 170px;
    margin: -8px -8px 18px;
    border: 1px solid rgba(0,240,255,.18);
    border-radius: 8px;
    overflow: hidden;
  }

  .essence-row {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }

  .essence-row span {
    border: 1px solid rgba(255,62,219,.32);
    color: var(--blaze-pink);
    border-radius: 8px;
    padding: 8px 10px;
    font-size: 12px;
    font-weight: 900;
    background: rgba(255,62,219,.08);
  }

  .pillar-grid {
    display: grid;
    grid-template-columns: repeat(5, minmax(0, 1fr));
    gap: 14px;
    margin-bottom: 18px;
  }

  .pillar-card {
    position: relative;
    min-height: 260px;
    padding: 0;
    overflow: hidden;
    text-align: left;
  }

  .pillar-card img {
    position: absolute;
    inset: 0;
    filter: saturate(1.12) contrast(1.1);
    opacity: .62;
  }

  .pillar-card::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(180deg, rgba(3,0,8,.1), rgba(3,0,8,.92));
  }

  .pillar-card-content {
    position: absolute;
    inset: auto 16px 16px;
    z-index: 2;
  }

  .pillar-letter {
    width: 52px;
    height: 52px;
    border-radius: 8px;
    display: grid;
    place-items: center;
    background: linear-gradient(135deg, var(--blaze-magenta), var(--blaze-cyan));
    color: var(--blaze-black);
    font-size: 28px;
    font-weight: 1000;
    box-shadow: 0 0 20px rgba(0,240,255,.24);
  }

  .pillar-card p {
    margin-bottom: 0;
  }

  .ritual-panel {
    display: grid;
    grid-template-columns: 1fr 180px;
    align-items: center;
    margin-bottom: 18px;
  }

  .breath-orbit {
    width: 150px;
    height: 150px;
    border-radius: 8px;
    border: 1px solid rgba(0,240,255,.26);
    display: grid;
    place-items: center;
    animation: breathe 5s infinite ease-in-out;
    justify-self: center;
    background:
      linear-gradient(90deg, rgba(0,240,255,.18) 1px, transparent 1px),
      linear-gradient(0deg, rgba(255,62,219,.18) 1px, transparent 1px);
    background-size: 18px 18px;
  }

  .breath-orbit span {
    width: 72px;
    height: 72px;
    border-radius: 8px;
    background: linear-gradient(135deg, var(--blaze-mint), var(--blaze-cyan));
    box-shadow: 0 0 28px rgba(0,255,191,.45);
  }

  .coach-panel {
    position: relative;
    overflow: hidden;
    margin-bottom: 18px;
  }

  .coach-image {
    height: 210px;
    margin: -8px -8px 18px;
    border: 1px solid rgba(255,62,219,.22);
    border-radius: 8px;
    overflow: hidden;
  }

  .coach-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 14px;
  }

  .training-layout {
    display: grid;
    grid-template-columns: 290px 1fr;
    gap: 18px;
    margin-bottom: 18px;
  }

  .stage-rail {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .stage-tab {
    min-height: 54px;
    text-align: left;
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .stage-tab span {
    width: 28px;
    height: 28px;
    border-radius: 8px;
    display: grid;
    flex: 0 0 auto;
    place-items: center;
    background: rgba(209,30,255,.25);
  }

  .stage-tab.done span {
    background: var(--blaze-mint);
    color: var(--blaze-black);
  }

  .stage-tab.active {
    background: rgba(0,240,255,.08);
  }

  .stage-panel {
    display: grid;
    grid-template-columns: minmax(240px, .72fr) minmax(0, 1fr);
    gap: 22px;
  }

  .stage-visual {
    position: relative;
    min-height: 520px;
    border: 1px solid rgba(0,240,255,.2);
    border-radius: 8px;
    overflow: hidden;
    align-self: stretch;
  }

  .stage-visual div {
    position: absolute;
    left: 14px;
    right: 14px;
    bottom: 14px;
    display: grid;
    gap: 5px;
    padding: 14px;
    border: 1px solid rgba(0,255,191,.36);
    border-radius: 8px;
    background: rgba(3,0,8,.76);
    backdrop-filter: blur(10px);
  }

  .stage-visual span {
    color: var(--blaze-mint);
    font-size: 12px;
    font-weight: 900;
    letter-spacing: .12em;
  }

  .stage-visual b {
    font-size: 24px;
  }

  .stage-copy label {
    display: block;
    color: var(--blaze-cyan);
    font-weight: 900;
    margin: 18px 0 10px;
  }

  textarea {
    width: 100%;
    min-height: 180px;
    border-radius: 8px;
    padding: 18px;
    color: var(--blaze-white);
    background: #030008;
    border: 1px solid rgba(0,240,255,.22);
    outline: none;
    resize: vertical;
    font-size: 16px;
    box-sizing: border-box;
  }

  textarea:focus {
    box-shadow: 0 0 24px rgba(0,240,255,.22);
  }

  .stage-actions {
    display: flex;
    gap: 12px;
    margin-top: 16px;
    justify-content: flex-end;
    flex-wrap: wrap;
  }

  .stage-actions button:last-child {
    background: linear-gradient(90deg, var(--blaze-magenta), var(--blaze-cyan));
    border: 0;
    color: var(--blaze-black);
  }

  .secondary {
    border-color: rgba(0,255,191,.45);
  }

  .danger {
    border-color: rgba(255,62,219,.32);
    color: var(--blaze-pink);
  }

  .mask-grid {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 10px;
  }

  .mask-grid button {
    min-height: 160px;
    text-align: left;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .mask-grid span {
    color: rgba(242,240,244,.67);
    font-size: 13px;
    line-height: 1.4;
  }

  .selected-mask {
    border-color: var(--blaze-pink);
    box-shadow: 0 0 22px rgba(255,62,219,.2);
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 14px;
    margin-bottom: 18px;
  }

  .stat-card {
    padding: 20px;
    min-height: 260px;
    position: relative;
    overflow: hidden;
  }

  .stat-card::before {
    content: '';
    position: absolute;
    inset: 0;
    background:
      linear-gradient(90deg, rgba(0,240,255,.07) 1px, transparent 1px),
      linear-gradient(0deg, rgba(255,62,219,.06) 1px, transparent 1px);
    background-size: 24px 24px;
    opacity: .55;
    pointer-events: none;
  }

  .stat-card > * {
    position: relative;
  }

  .stat-card strong {
    font-size: 38px;
    color: var(--blaze-cyan);
    text-shadow: 0 0 18px rgba(0,240,255,.36);
  }

  .stat-card span {
    color: var(--blaze-pink);
    font-size: 12px;
    font-weight: 900;
  }

  .empty {
    border: 1px dashed rgba(242,240,244,.2);
    border-radius: 8px;
    padding: 18px;
  }

  .proof-list {
    display: grid;
    gap: 10px;
  }

  .proof-list b {
    color: var(--blaze-mint);
    font-size: 12px;
  }

  @keyframes breathe {
    0%, 100% {
      transform: scale(.88);
      box-shadow: 0 0 18px rgba(0,240,255,.15);
    }
    50% {
      transform: scale(1.08);
      box-shadow: 0 0 42px rgba(0,240,255,.35);
    }
  }

  @media (max-width: 1240px) {
    .image-strip,
    .pillar-grid,
    .stats-grid {
      grid-template-columns: repeat(3, 1fr);
    }

    .stage-panel {
      grid-template-columns: 1fr;
    }

    .stage-visual {
      min-height: 340px;
    }

    .mask-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  @media (max-width: 900px) {
    .hero,
    .dashboard-grid,
    .training-layout,
    .ritual-panel,
    .coach-grid {
      grid-template-columns: 1fr;
    }

    .hero {
      min-height: 0;
    }

    .hero-copy {
      align-self: start;
    }

    .hero-visual {
      min-height: 320px;
    }

    .stage-rail {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
    }
  }

  @media (max-width: 640px) {
    .blaze-shell {
      padding: 14px;
    }

    .hero,
    .panel {
      padding: 18px;
    }

    h1 {
      font-size: 42px;
    }

    .image-strip,
    .pillar-grid,
    .stats-grid,
    .score-row,
    .mask-grid,
    .stage-rail {
      grid-template-columns: 1fr;
    }

    .panel-top {
      align-items: flex-start;
      flex-direction: column;
    }

    .hero-visual,
    .stage-visual {
      min-height: 260px;
    }

    .slide-card {
      min-height: 220px;
    }
  }
`;
