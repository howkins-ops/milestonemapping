import React, { useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'blaze_zeal_module_v1';

const pages = [
  {
    title: 'Zeal Overview: Move With Fire',
    badge: 'Core Lesson',
    body: 'Zeal is the emotional fuel behind B.L.A.Z.E. Being gives you identity. Leadership gives you direction. Alignment gives you integrity. Zeal gives you the fire to move when resistance shows up. The goal is not to be loud. The goal is to be alive, committed, and switched on.',
    lesson: 'In the book language, the upgraded version moves with Zeal: when things go wrong, you reset, adjust, and move forward. Zeal is not panic. Zeal is powerful presence under pressure.',
    cards: [
      ['Zeal is', 'Conviction, urgency, passion, commitment, emotional charge, courage, and life-force.'],
      ['Zeal is not', 'Fake positivity, caffeine panic, pressure addiction, reckless action, or burnout disguised as ambition.'],
    ],
    prompt: 'Where in your life have you been moving without fire — just going through the motions?',
    drill: 'Write one thing today that deserves more of your energy, not because you are forced, but because it actually matters.',
  },
  {
    title: 'Fire vs Hype',
    badge: 'Discernment',
    body: 'Hype needs a crowd. Fire survives in silence. Hype burns hot and disappears. Fire is connected to meaning. This page teaches the difference between emotional noise and true Zeal.',
    lesson: 'When you rely on hype, your execution depends on mood. When you build Zeal, your execution is tied to purpose. Zeal says: I know why this matters, so I can bring energy even when it is not convenient.',
    cards: [
      ['Hype says', 'I feel excited right now, so I will move.'],
      ['Zeal says', 'This matters, so I will move even before I feel ready.'],
      ['Hype collapses when', 'You get rejected, tired, ignored, judged, or uncomfortable.'],
      ['Zeal strengthens when', 'You reconnect the action to mission, identity, and the future you are building.'],
    ],
    prompt: 'What is one area where you have been confusing hype with real commitment?',
    drill: 'Name one action you will take even when the excitement is gone.',
  },
  {
    title: 'Energy Leadership',
    badge: 'State Training',
    body: 'Your energy enters the room before your words. In sales, coaching, leadership, content, and relationships, people feel the state you are operating from. Zeal trains you to bring clean, powerful energy instead of chaotic pressure.',
    lesson: 'Energy leadership is not performing. It is taking responsibility for the emotional tone you bring. Before the pitch, the call, the post, the workout, or the hard conversation, you decide: what energy am I bringing into this?',
    cards: [
      ['Low Zeal Energy', 'Flat, hesitant, apologetic, distracted, waiting to be chosen.'],
      ['Clean Zeal Energy', 'Present, alive, convicted, warm, direct, focused, and grounded.'],
    ],
    prompt: 'What energy have you been bringing lately — and what energy would the next-level version of you bring?',
    drill: 'Before your next important action, pause for 20 seconds and choose 3 words for your energy.',
  },
  {
    title: 'Resilience Reset',
    badge: 'Pressure Protocol',
    body: 'Zeal is tested when the day goes sideways. Slow start. Bad call. Rejection. Low numbers. Someone doubts you. Your old pattern wants to spiral. Zeal teaches you to reset faster.',
    lesson: 'The trained person does not avoid pressure. They recover faster. They do not make a bad moment mean they are a bad person. They reset, adjust, and move forward. That is Zeal under pressure.',
    cards: [
      ['Old reaction', 'Spiral, complain, numb out, blame, quit early, lose presence.'],
      ['Zeal reset', 'Name it, breathe, learn, recommit, take the next clean rep.'],
    ],
    prompt: 'What situation usually steals your fire the fastest?',
    drill: 'Create your reset line: “When ____ happens, I will ____ and take the next rep.”',
  },
  {
    title: 'Conviction Drill',
    badge: 'Embodiment',
    body: 'Conviction is Zeal with a spine. You are not just excited. You are decided. This drill turns vague motivation into a spoken commitment.',
    lesson: 'Most people wait for certainty before acting. Zeal creates certainty through action. You speak the commitment, take the rep, and collect evidence.',
    cards: [
      ['Weak commitment', 'I will try. I hope. Maybe. If things line up.'],
      ['Zeal commitment', 'I choose. I will. I am committed to the next rep.'],
    ],
    prompt: 'Finish this: “I am no longer available for ______ because I am committed to ______.”',
    drill: 'Say your commitment out loud, then take a 10-minute action that proves it.',
  },
  {
    title: 'Zeal Lock-In',
    badge: 'Completion',
    body: 'You have now built the Zeal layer: fire without chaos, intensity without burnout, urgency without panic. Lock it into a statement you can use before execution.',
    lesson: 'Zeal becomes powerful when it is repeatable. Your job is to create a personal activation code you can return to before action.',
    cards: [
      ['Your Zeal Code', 'A short statement that reconnects you to energy, mission, and movement.'],
      ['Proof Rep', 'One immediate action that shows your fire is real.'],
    ],
    prompt: 'Write your final Zeal Statement.',
    drill: 'Example: “I bring clean fire to what matters. I do not wait to feel ready. I reset fast, move with conviction, and take the next rep.”',
  },
];

export default function BlazeZealModule() {
  const [state, setState] = useState(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || { page: 0, answers: {}, done: {} }; }
    catch { return { page: 0, answers: {}, done: {} }; }
  });

  useEffect(() => localStorage.setItem(STORAGE_KEY, JSON.stringify(state)), [state]);

  const progress = useMemo(() => Math.round((Object.values(state.done).filter(Boolean).length / pages.length) * 100), [state.done]);
  const page = pages[state.page];

  const setAnswer = (value) => setState(s => ({ ...s, answers: { ...s.answers, [s.page]: value } }));
  const complete = () => setState(s => ({ ...s, done: { ...s.done, [s.page]: true }, page: Math.min(s.page + 1, pages.length - 1) }));
  const reset = () => { localStorage.removeItem(STORAGE_KEY); setState({ page: 0, answers: {}, done: {} }); };

  return (
    <div className="min-h-screen bg-[#030308] text-[#f2f0f4] p-4 md:p-8">
      <section className="max-w-6xl mx-auto rounded-[30px] border border-white/10 p-7 md:p-10 bg-gradient-to-br from-fuchsia-500/10 to-cyan-400/10 shadow-[0_0_60px_rgba(209,30,255,.22)]">
        <div className="inline-flex rounded-full border border-cyan-300/30 px-4 py-2 text-xs uppercase tracking-[.14em] font-black text-cyan-300">B.L.A.Z.E. Training • Module 4</div>
        <h1 className="text-5xl md:text-7xl font-black tracking-[-.06em] mt-5">Z — <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-fuchsia-500 to-cyan-300">Zeal</span></h1>
        <p className="text-white/65 text-lg max-w-3xl leading-relaxed mt-4">Zeal is the intensity switch — fire, conviction, urgency, and emotional commitment without burnout.</p>
      </section>

      <main className="max-w-6xl mx-auto grid md:grid-cols-[300px_1fr] gap-5 mt-6">
        <aside className="rounded-3xl border border-white/10 bg-white/[.03] p-4 h-fit md:sticky md:top-4">
          {pages.map((p, i) => (
            <button key={p.title} onClick={() => setState(s => ({ ...s, page: i }))} className={`w-full text-left rounded-2xl border p-4 my-2 font-black ${state.page === i ? 'border-pink-400/70 bg-pink-500/15' : state.done[i] ? 'border-emerald-300/40 bg-emerald-400/10' : 'border-white/10 bg-white/[.03]'}`}>{i + 1}. {p.title.split(':')[0]}</button>
          ))}
          <div className="mt-4 rounded-2xl border border-white/10 bg-black/30 p-4"><b>Module Progress</b><div className="h-2 rounded-full bg-white/10 overflow-hidden mt-3"><div className="h-full bg-gradient-to-r from-pink-400 to-cyan-300" style={{ width: `${progress}%` }} /></div><p className="text-white/60">{progress}% complete</p></div>
          <button onClick={reset} className="mt-3 w-full rounded-full border border-white/15 px-4 py-3 font-black">Reset Module</button>
        </aside>

        <section className="rounded-3xl border border-white/10 bg-white/[.04] p-5 md:p-7">
          <span className="inline-block rounded-full border border-cyan-300/30 bg-cyan-300/10 px-3 py-1 text-xs font-black uppercase tracking-wider text-cyan-200">{page.badge}</span>
          <h2 className="text-3xl md:text-4xl font-black tracking-tight mt-3">{page.title}</h2>
          <p className="text-white/65 leading-relaxed mt-3">{page.body}</p>
          <div className="rounded-3xl border border-white/10 bg-fuchsia-500/10 p-5 my-5 text-xl leading-snug border-l-4 border-l-pink-400">{page.lesson}</div>
          <div className="grid md:grid-cols-2 gap-4">{page.cards.map(([h, b]) => <div key={h} className="rounded-3xl border border-white/10 bg-[#101025] p-5"><h3 className="font-black text-lg">{h}</h3><p className="text-white/60 leading-relaxed">{b}</p></div>)}</div>
          <div className="rounded-3xl border border-emerald-300/30 bg-emerald-300/10 p-5 mt-5"><h3 className="font-black">Coaching Prompt</h3><p className="text-white/70">{page.prompt}</p><textarea value={state.answers[state.page] || ''} onChange={e => setAnswer(e.target.value)} placeholder="Write your answer here..." className="w-full min-h-28 rounded-2xl border border-white/10 bg-black/50 p-4 text-white outline-none" /></div>
          <div className="rounded-3xl border border-yellow-300/30 bg-yellow-300/10 p-5 mt-5"><h3 className="font-black">Micro Drill</h3><p className="text-white/70">{page.drill}</p></div>
          <div className="flex flex-wrap gap-3 mt-5"><button onClick={complete} className="rounded-full bg-gradient-to-r from-pink-400 to-cyan-300 text-black px-5 py-3 font-black">Complete This Page</button><button onClick={() => setState(s => ({ ...s, page: Math.max(0, s.page - 1) }))} className="rounded-full border border-white/15 px-5 py-3 font-black">Previous</button><button onClick={() => setState(s => ({ ...s, page: Math.min(pages.length - 1, s.page + 1) }))} className="rounded-full border border-white/15 px-5 py-3 font-black">Next</button></div>
        </section>
      </main>
    </div>
  );
}
