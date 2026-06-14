import React, { useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'blazeRealTrainingOS.v1';

const pages = [
  { id: 'overview', badge: '🔥', title: 'Blaze Overview', small: 'The engine' },
  { id: 'being', badge: 'B', title: 'Being', small: 'Identity before action' },
  { id: 'leadership', badge: 'L', title: 'Leadership', small: 'Self-command' },
  { id: 'alignment', badge: 'A', title: 'Alignment', small: 'Values into motion' },
  { id: 'zeal', badge: 'Z', title: 'Zeal', small: 'Fire without burnout' },
  { id: 'execution', badge: 'E', title: 'Execution', small: 'Proof, reps, results' },
  { id: 'integration', badge: '∞', title: 'Integration Lab', small: 'Run the loop' },
  { id: 'recap', badge: '🏆', title: 'Final Recap', small: 'Lock it in' },
];

const modules = {
  being: {
    name: 'Being',
    thesis: 'Your results will always match your identity. Before you chase action, choose the version of you who is leading the action.',
    learn: [
      'Being is not a mood. It is the identity you operate from under pressure.',
      'The Survival Being waits for permission, certainty, and comfort. The Boss Being chooses, moves, and owns the outcome.',
      'The fastest shift is language: replace “I should” with “I choose,” “I hope” with “I will,” and “I’m trying” with “I’m training.”',
    ],
    drill: 'Before your day starts, write: “Today I am being the person who ____ even when ____.”',
    prompt: 'Who do you need to BE today before you execute? What old identity are you refusing to let lead?',
    stand: ['The Boss', 'The Builder', 'The Closer', 'The Coachable Student', 'The Calm Leader'],
  },
  leadership: {
    name: 'Leadership',
    thesis: 'Leadership is not a title. It is the ability to direct your state, decisions, conversations, and future.',
    learn: [
      'Leadership starts with self-command: you do what you said you would do when the feeling is gone.',
      'A leader does not react to the day. A leader frames the day.',
      'In sales, leadership means guiding the client to clarity without pressure, force, or fake energy.',
    ],
    drill: 'Write the conversation, decision, or moment you need to lead today — then define the standard you will hold.',
    prompt: 'Where are you currently reacting when you should be leading?',
    stand: ['Direct', 'Decisive', 'Grounded', 'Responsible', 'Unshakeable'],
  },
  alignment: {
    name: 'Alignment',
    thesis: 'No more hustle for hustle’s sake. Alignment means your actions match your values, vision, and real target.',
    learn: [
      'Misalignment creates friction: you can work hard and still feel off because the work is pointed at the wrong life.',
      'Aligned goals are specific, measurable, emotionally honest, and connected to who you are becoming.',
      'Alignment removes the leak between what you say matters and what your calendar proves matters.',
    ],
    drill: 'Audit one goal: Does this match my values, my future vision, and the person I said I am becoming?',
    prompt: 'What action would make today feel aligned instead of just busy?',
    stand: ['Clear', 'Congruent', 'Focused', 'Values-Led', 'Locked In'],
  },
  zeal: {
    name: 'Zeal',
    thesis: 'Zeal is the intensity switch: passion, conviction, urgency, and commitment — without burning yourself out.',
    learn: [
      'Zeal is not chaos. It is directed fire.',
      'Burnout comes from unmanaged pressure. Zeal comes from meaningful mission plus regulated energy.',
      'The strongest performers know how to turn it on, reset fast, and return with power.',
    ],
    drill: 'Choose a power phrase for today and attach it to one action you will complete before the day ends.',
    prompt: 'What are you willing to bring real fire to today — and how will you protect your energy while doing it?',
    stand: ['On Fire', 'Committed', 'Courageous', 'Alive', 'All In'],
  },
  execution: {
    name: 'Execution',
    thesis: 'Execution turns identity into evidence. No more overthinking — proof, reps, results.',
    learn: [
      'Execution beats intention every time. A goal without a next rep is just a wish.',
      'Implementation intentions work because they pre-decide behavior: If X happens, then I will do Y.',
      'Daily proof builds identity. Every completed rep tells your nervous system: this is who I am now.',
    ],
    drill: 'Write one if-then plan: “If ____ happens today, then I will ____.” Then complete one proof rep.',
    prompt: 'What is the one rep that would prove you are not just thinking about change — you are becoming it?',
    stand: ['Fast Mover', 'Finisher', 'Operator', 'Proof Builder', 'Relentless'],
  },
};

const styles = `
.blazeOS{--bg:#05000b;--card:#0b0714;--card2:#11091d;--pink:#ff3edb;--purple:#d11eff;--cyan:#00f0ff;--green:#00ffbf;--white:#f2f0f4;--muted:#aaa0ba;--line:rgba(255,255,255,.1);min-height:100vh;background:radial-gradient(circle at 20% 0%,rgba(209,30,255,.22),transparent 30%),radial-gradient(circle at 80% 10%,rgba(0,240,255,.18),transparent 28%),linear-gradient(180deg,#05000b,#080111 50%,#020006);color:var(--white);font-family:Inter,system-ui,-apple-system,Segoe UI,sans-serif;display:grid;grid-template-columns:310px 1fr}.blazeOS *{box-sizing:border-box}.blazeSidebar{border-right:1px solid var(--line);background:rgba(5,0,11,.88);backdrop-filter:blur(20px);padding:26px;position:sticky;top:0;height:100vh;overflow:auto}.blazeBrand{display:flex;gap:14px;align-items:center;margin-bottom:22px}.blazeLogo{width:54px;height:54px;border-radius:18px;background:linear-gradient(135deg,var(--purple),var(--pink),var(--cyan));box-shadow:0 0 28px rgba(209,30,255,.55);display:grid;place-items:center;font-weight:950;color:#05000b}.blazeKicker{font-size:12px;letter-spacing:.22em;color:var(--cyan);text-transform:uppercase}.blazeBrand h1{font-size:20px;margin:4px 0 0}.blazeProgressShell{margin:18px 0 22px}.blazeProgressTop{display:flex;justify-content:space-between;font-size:12px;color:var(--muted);margin-bottom:8px}.blazeBar{height:11px;background:#130d22;border:1px solid var(--line);border-radius:999px;overflow:hidden}.blazeFill{height:100%;background:linear-gradient(90deg,var(--purple),var(--cyan),var(--green));box-shadow:0 0 20px var(--cyan);transition:.35s}.blazeNav{display:flex;flex-direction:column;gap:9px}.blazeNav button{all:unset;cursor:pointer;border:1px solid var(--line);border-radius:16px;padding:13px 14px;background:rgba(255,255,255,.035);display:grid;grid-template-columns:34px 1fr auto;gap:10px;align-items:center;transition:.2s}.blazeNav button:hover{border-color:rgba(0,240,255,.5);transform:translateX(3px)}.blazeNav button.active{background:linear-gradient(135deg,rgba(209,30,255,.28),rgba(0,240,255,.12));border-color:rgba(255,62,219,.7);box-shadow:0 0 22px rgba(209,30,255,.16)}.blazeBadge{width:31px;height:31px;border-radius:11px;display:grid;place-items:center;background:#090412;border:1px solid rgba(255,255,255,.12);font-weight:900}.blazeNav small{color:var(--muted);display:block;margin-top:2px;font-size:11px}.blazeCheck{color:var(--green);font-weight:900}.blazeMain{padding:34px;overflow:hidden}.blazeHero{border:1px solid rgba(255,255,255,.12);background:linear-gradient(135deg,rgba(13,7,24,.94),rgba(6,1,12,.92));border-radius:32px;padding:30px;box-shadow:0 0 60px rgba(0,240,255,.06);position:relative;overflow:hidden}.blazePill{display:inline-flex;border:1px solid rgba(0,240,255,.35);color:var(--cyan);padding:8px 12px;border-radius:999px;background:rgba(0,240,255,.06);font-size:12px;text-transform:uppercase;letter-spacing:.16em}.blazeHero h2{font-size:clamp(34px,5vw,74px);line-height:.93;margin:18px 0;background:linear-gradient(90deg,var(--white),var(--cyan),var(--pink));-webkit-background-clip:text;color:transparent;max-width:980px}.blazeHero p{color:var(--muted);font-size:18px;line-height:1.55;max-width:900px}.blazeGrid{display:grid;gap:18px}.blazeTwo{grid-template-columns:1.15fr .85fr}.blazeThree{grid-template-columns:repeat(3,1fr)}.blazeFive{grid-template-columns:repeat(5,1fr)}.blazeCard{border:1px solid var(--line);background:linear-gradient(180deg,rgba(255,255,255,.055),rgba(255,255,255,.025));border-radius:24px;padding:22px;position:relative;overflow:hidden}.blazeCard h3{margin:0 0 10px;font-size:22px}.blazeCard p,.blazeCard li{color:var(--muted);line-height:1.55}.blazeLetter{font-size:50px;font-weight:950;background:linear-gradient(135deg,var(--purple),var(--cyan));-webkit-background-clip:text;color:transparent}.blazeBtnRow{display:flex;flex-wrap:wrap;gap:12px;margin-top:20px}.blazeBtn{all:unset;cursor:pointer;border-radius:16px;padding:13px 18px;font-weight:850;background:linear-gradient(135deg,var(--purple),var(--pink));color:#05000b;box-shadow:0 0 22px rgba(209,30,255,.25)}.blazeBtn.secondary{background:rgba(255,255,255,.06);color:var(--white);border:1px solid var(--line);box-shadow:none}.blazeBtn.cyan{background:linear-gradient(135deg,var(--cyan),var(--green));color:#04100e}.blazeInput,.blazeTextarea{width:100%;background:#090412;border:1px solid rgba(255,255,255,.12);border-radius:16px;color:var(--white);padding:14px 15px;font:inherit;outline:none}.blazeTextarea{min-height:110px;resize:vertical}.blazeInput:focus,.blazeTextarea:focus{border-color:var(--cyan);box-shadow:0 0 0 3px rgba(0,240,255,.08)}.blazeLabel{font-size:12px;letter-spacing:.13em;text-transform:uppercase;color:var(--cyan);display:block;margin:16px 0 8px}.blazeChoiceGrid{display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:14px}.blazeChoice{border:1px solid var(--line);border-radius:20px;padding:18px;background:#090412;cursor:pointer;transition:.18s}.blazeChoice:hover{border-color:var(--cyan);transform:translateY(-2px)}.blazeChoice.selected{border-color:var(--green);box-shadow:0 0 24px rgba(0,255,191,.16);background:linear-gradient(135deg,rgba(0,255,191,.13),rgba(0,240,255,.05))}.blazeMicro{font-size:12px;color:var(--muted)}.blazeQuote{font-size:24px;line-height:1.3;color:var(--white);font-weight:800}.blazeStat{border-left:3px solid var(--cyan);padding-left:15px}.blazeStat b{font-size:27px;color:var(--white)}.blazeTrainingList{display:grid;gap:12px;margin-top:14px}.blazeTrainingStep{display:grid;grid-template-columns:42px 1fr;gap:13px;padding:15px;border:1px solid var(--line);background:#090412;border-radius:18px}.blazeNum{width:42px;height:42px;border-radius:14px;background:linear-gradient(135deg,var(--purple),var(--cyan));display:grid;place-items:center;color:#05000b;font-weight:950}.blazeModuleHeader{display:flex;justify-content:space-between;gap:18px;align-items:flex-start;margin-bottom:22px}.blazeModuleHeader h2{font-size:42px;margin:5px 0}.blazeTag{display:inline-block;background:rgba(255,62,219,.12);border:1px solid rgba(255,62,219,.35);color:var(--pink);padding:8px 10px;border-radius:999px;font-size:12px;font-weight:800}.blazeCompleteBox{margin-top:18px;border:1px dashed rgba(0,255,191,.45);background:rgba(0,255,191,.05);border-radius:22px;padding:18px}.blazeFooterActions{position:sticky;bottom:0;margin-top:26px;padding:18px;background:linear-gradient(180deg,transparent,rgba(5,0,11,.96) 25%);display:flex;justify-content:space-between;gap:12px}.blazeCertificate{background:radial-gradient(circle at top,rgba(0,240,255,.17),transparent 40%),linear-gradient(135deg,rgba(209,30,255,.12),rgba(255,62,219,.06));border:1px solid rgba(0,240,255,.28);border-radius:34px;padding:34px;text-align:center}.blazeCertificate h2{font-size:52px;margin:12px 0;background:linear-gradient(90deg,var(--cyan),var(--pink));-webkit-background-clip:text;color:transparent}@media(max-width:900px){.blazeOS{display:block}.blazeSidebar{position:relative;height:auto}.blazeMain{padding:18px}.blazeTwo,.blazeThree,.blazeFive{grid-template-columns:1fr}.blazeHero h2{font-size:42px}.blazeModuleHeader{display:block}.blazeFooterActions{position:relative}.blazeNav{max-height:420px;overflow:auto}}
`;

export default function BlazeRealTrainingOS() {
  const [state, setState] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    } catch {
      return {};
    }
  });

  const safeState = {
    answers: state.answers || {},
    done: state.done || {},
    current: state.current || 'overview',
  };

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(safeState));
  }, [state]);

  const setAnswer = (key, value) => setState((s) => ({ ...safeState, ...s, answers: { ...(s.answers || {}), [key]: value } }));
  const setPage = (id) => setState((s) => ({ ...safeState, ...s, current: id }));
  const toggleDone = (id) => setState((s) => ({ ...safeState, ...s, done: { ...(s.done || {}), [id]: !(s.done || {})[id] } }));
  const completeAndGo = (id) => {
    const idx = pages.findIndex((p) => p.id === id);
    const next = pages[Math.min(pages.length - 1, idx + 1)].id;
    setState((s) => ({ ...safeState, ...s, current: next, done: { ...(s.done || {}), [id]: true } }));
  };

  const progress = useMemo(() => Math.round((pages.filter((p) => safeState.done[p.id]).length / pages.length) * 100), [safeState.done]);
  const currentIndex = pages.findIndex((p) => p.id === safeState.current);
  const prev = pages[Math.max(0, currentIndex)].id;

  const Field = ({ id, label, placeholder }) => (
    <>
      <label className="blazeLabel">{label}</label>
      <textarea className="blazeTextarea" placeholder={placeholder} value={safeState.answers[id] || ''} onChange={(e) => setAnswer(id, e.target.value)} />
    </>
  );

  const Choices = ({ id, items }) => (
    <div className="blazeChoiceGrid">
      {items.map((x) => (
        <div key={x} className={`blazeChoice ${safeState.answers[id] === x ? 'selected' : ''}`} onClick={() => setAnswer(id, x)}>
          <b>{x}</b>
          <p className="blazeMicro">Choose this as today’s operating state.</p>
        </div>
      ))}
    </div>
  );

  const ModulePage = ({ id }) => {
    const m = modules[id];
    return (
      <>
        <div className="blazeModuleHeader">
          <div>
            <span className="blazeTag">B.L.A.Z.E. Pillar</span>
            <h2><span className="blazeLetter">{id[0].toUpperCase()}</span> {m.name}</h2>
            <p className="blazeQuote">{m.thesis}</p>
          </div>
          <button className="blazeBtn secondary" onClick={() => toggleDone(id)}>{safeState.done[id] ? 'Completed ✓' : 'Mark Complete'}</button>
        </div>
        <div className="blazeGrid blazeTwo">
          <div className="blazeCard"><h3>Training</h3><div className="blazeTrainingList">{m.learn.map((l, i) => <div className="blazeTrainingStep" key={l}><div className="blazeNum">{i + 1}</div><p>{l}</p></div>)}</div></div>
          <div className="blazeCard"><h3>Choose Your {m.name} Stand</h3><Choices id={`${id}_stand`} items={m.stand} /><div className="blazeCompleteBox"><b>Micro Drill</b><p>{m.drill}</p></div></div>
        </div>
        <div className="blazeGrid blazeTwo" style={{ marginTop: 18 }}>
          <div className="blazeCard"><h3>Coaching Prompt</h3><p>{m.prompt}</p><Field id={`${id}_reflection`} label="Your Answer" placeholder="Write the honest answer here..." /></div>
          <div className="blazeCard"><h3>Proof Rep</h3><Field id={`${id}_proof`} label="Today’s proof" placeholder="What action will prove this pillar today?" /><label className="blazeLabel">Completion Evidence</label><input className="blazeInput" placeholder="Example: 30 doors knocked, pitch practiced, hard conversation had..." value={safeState.answers[`${id}_evidence`] || ''} onChange={(e) => setAnswer(`${id}_evidence`, e.target.value)} /></div>
        </div>
      </>
    );
  };

  const renderMain = () => {
    if (safeState.current === 'overview') return <><div className="blazeHero"><span className="blazePill">Framework Training • Not Motivation</span><h2>B.L.A.Z.E. turns identity into execution.</h2><p>This training is built around one engine: <b>Being, Leadership, Alignment, Zeal, Execution.</b> It helps someone choose who they are being, lead themselves, align the target, bring directed fire, and create proof through action.</p><div className="blazeBtnRow"><button className="blazeBtn" onClick={() => setPage('being')}>Start Training</button><button className="blazeBtn secondary" onClick={() => toggleDone('overview')}>Mark Overview Complete</button></div></div><div className="blazeGrid blazeFive" style={{ marginTop: 18 }}>{Object.entries(modules).map(([k, m]) => <div className="blazeCard" key={k}><div className="blazeLetter">{k[0].toUpperCase()}</div><h3>{m.name}</h3><p>{m.thesis}</p></div>)}</div><div className="blazeGrid blazeThree" style={{ marginTop: 18 }}><div className="blazeCard blazeStat"><b>85%</b><p>ICF reports 85% of coaches say clients want mental well-being support.</p></div><div className="blazeCard blazeStat"><b>$5.34B</b><p>ICF’s 2025 Global Coaching Study reported global coaching revenue of $5.34B USD.</p></div><div className="blazeCard blazeStat"><b>d=.65</b><p>Implementation-intention research found a medium-to-large effect on goal attainment.</p></div></div></>;
    if (modules[safeState.current]) return <ModulePage id={safeState.current} />;
    if (safeState.current === 'integration') return <><div className="blazeModuleHeader"><div><span className="blazeTag">Integration</span><h2><span className="blazeLetter">∞</span> The Blaze Loop</h2><p className="blazeQuote">Choose → Clarify → Commit → Execute → Integrate.</p></div><button className="blazeBtn secondary" onClick={() => toggleDone('integration')}>{safeState.done.integration ? 'Completed ✓' : 'Mark Complete'}</button></div><div className="blazeGrid blazeTwo"><div className="blazeCard"><h3>Run Today’s B.L.A.Z.E. Loop</h3><Field id="loop_being" label="B — Who am I being today?" placeholder="Example: I am being a calm closer who moves before fear talks me out of it." /><Field id="loop_leadership" label="L — What must I lead?" placeholder="Example: I must lead my energy and one hard conversation." /><Field id="loop_alignment" label="A — What action is aligned?" placeholder="Example: 40 quality conversations, not busy work." /><Field id="loop_zeal" label="Z — What fire am I bringing?" placeholder="Example: urgency without panic, conviction without pressure." /><Field id="loop_execution" label="E — What proof rep will be complete today?" placeholder="Example: pitch roleplay + first 20 doors before 4 PM." /></div><div className="blazeCard"><h3>Blaze Score</h3><p>Score each pillar 1–10. The weakest score becomes the training focus.</p>{Object.keys(modules).map((k) => <div key={k}><label className="blazeLabel">{modules[k].name} Score</label><input type="range" min="1" max="10" value={safeState.answers[`${k}_score`] || 5} onChange={(e) => setAnswer(`${k}_score`, e.target.value)} /> <b>{safeState.answers[`${k}_score`] || 5}</b></div>)}</div></div></>;
    return <div className="blazeCertificate"><span className="blazePill">B.L.A.Z.E. Recap</span><h2>Training Locked In</h2><p className="blazeQuote">You do not need more hype. You need a state, a standard, a target, a fire, and a rep.</p><div className="blazeGrid blazeFive" style={{ marginTop: 22, textAlign: 'left' }}>{Object.entries(modules).map(([k, m]) => <div className="blazeCard" key={k}><h3>{k[0].toUpperCase()} — {m.name}</h3><p>{safeState.answers[`${k}_reflection`] || 'No answer yet.'}</p></div>)}</div><div className="blazeBtnRow" style={{ justifyContent: 'center' }}><button className="blazeBtn cyan" onClick={() => toggleDone('recap')}>Complete B.L.A.Z.E. Training</button><button className="blazeBtn secondary" onClick={() => { localStorage.removeItem(STORAGE_KEY); window.location.reload(); }}>Reset Training</button></div></div>;
  };

  return (
    <div className="blazeOS">
      <style>{styles}</style>
      <aside className="blazeSidebar">
        <div className="blazeBrand"><div className="blazeLogo">B</div><div><div className="blazeKicker">Execution Engine</div><h1>B.L.A.Z.E. Training OS</h1></div></div>
        <div className="blazeProgressShell"><div className="blazeProgressTop"><span>Training Progress</span><b>{progress}%</b></div><div className="blazeBar"><div className="blazeFill" style={{ width: `${progress}%` }} /></div></div>
        <nav className="blazeNav">{pages.map((p) => <button key={p.id} className={safeState.current === p.id ? 'active' : ''} onClick={() => setPage(p.id)}><span className="blazeBadge">{p.badge}</span><span>{p.title}<small>{p.small}</small></span><span className="blazeCheck">{safeState.done[p.id] ? '✓' : ''}</span></button>)}</nav>
      </aside>
      <main className="blazeMain">
        {renderMain()}
        <div className="blazeFooterActions"><button className="blazeBtn secondary" onClick={() => setPage(prev)}>← Previous</button><button className="blazeBtn" onClick={() => completeAndGo(safeState.current)}>Complete & Continue →</button></div>
      </main>
    </div>
  );
}
