import React, { useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'blaze_leadership_module_v1';

const pages = [
  {
    id: 'overview',
    tab: 'Overview',
    title: 'Leadership Is Direction, Not Position',
    body: 'Being chooses who you are. Leadership directs that version of you under pressure. A leader does not wait for permission. A leader makes a clean decision, sets the standard, communicates clearly, and moves first.',
    prompt: 'Where in your life are you currently reacting instead of leading?',
    drill: 'Name one situation where you will stop waiting and start directing today.',
  },
  {
    id: 'self',
    tab: 'Self',
    title: 'Self-Leadership: Lead Yourself First',
    body: 'If you cannot lead your own energy, attention, and standards, you will leak power everywhere else. Self-leadership means mood, fear, comparison, and comfort do not get to manage your life.',
    prompt: 'What is one standard you need to lead yourself with today?',
    drill: 'Create a non-negotiable: “Today, I lead myself by…”',
  },
  {
    id: 'energy',
    tab: 'Energy',
    title: 'Energy Leadership: Your State Enters First',
    body: 'Your energy closes before your words do. Leadership is not being loud; it is being anchored. When pressure hits, the leader resets, breathes, chooses the next move, and brings certainty back into the room.',
    prompt: 'What emotional state do you need to lead from today?',
    drill: 'Build your reset command: “When I feel ___, I will ___.”',
  },
  {
    id: 'conversation',
    tab: 'Voice',
    title: 'Conversation Leadership: Say the Thing Clean',
    body: 'A leader does not manipulate. A leader communicates. You lead a conversation by listening, naming what is real, asking better questions, and guiding the next step.',
    prompt: 'What conversation have you been avoiding that leadership would handle cleanly?',
    drill: 'Write the opening sentence you will use to lead that conversation.',
  },
  {
    id: 'future',
    tab: 'Future',
    title: 'Future Leadership: Make Decisions From Where You Are Going',
    body: 'Most people make decisions from fear, comfort, or yesterday. Future leadership asks: what would the version of me I am building choose right now?',
    prompt: 'What decision would your future self make faster than you are making it right now?',
    drill: 'Write the decision, then write the first visible action.',
  },
  {
    id: 'lockin',
    tab: 'Lock-In',
    title: 'Leadership Lock-In',
    body: 'Leadership becomes real when it is visible. Not in your head. Not in theory. In behavior. This final page turns the module into a leadership statement you can carry into the day.',
    prompt: 'Write your Leadership Statement.',
    drill: 'Finish: “Today I lead by…”',
  },
];

export default function BlazeLeadershipModule() {
  const [active, setActive] = useState('overview');
  const [data, setData] = useState({});

  useEffect(() => {
    try {
      setData(JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'));
    } catch {
      setData({});
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  const doneCount = pages.filter((p) => data[p.id]?.done).length;
  const progress = Math.round((doneCount / pages.length) * 100);
  const page = pages.find((p) => p.id === active) || pages[0];
  const activeIndex = pages.findIndex((p) => p.id === active);

  const standPreview = useMemo(() => {
    const stand = ['self', 'energy', 'conversation', 'future', 'lockin']
      .map((key) => data[key]?.answer)
      .filter(Boolean);
    return stand.length ? stand[stand.length - 1] : 'Complete the drills to generate your stand.';
  }, [data]);

  const setAnswer = (id, answer) => setData((prev) => ({ ...prev, [id]: { ...prev[id], answer } }));
  const complete = (id) => setData((prev) => ({ ...prev, [id]: { ...prev[id], done: true } }));
  const reset = () => {
    localStorage.removeItem(STORAGE_KEY);
    setData({});
    setActive('overview');
  };

  return (
    <div className="min-h-screen bg-[#030009] text-[#f7ecff] px-4 py-8">
      <div className="mx-auto max-w-6xl">
        <section className="rounded-[2rem] border border-white/10 bg-gradient-to-br from-[#11001f] to-[#030009] p-7 shadow-[0_0_60px_rgba(209,30,255,.20)]">
          <div className="inline-flex rounded-full border border-cyan-300/30 bg-cyan-300/10 px-4 py-2 text-xs font-black uppercase tracking-widest text-cyan-100">B.L.A.Z.E. Module 02</div>
          <h1 className="mt-5 text-5xl font-black leading-none tracking-tighter md:text-7xl"><span className="bg-gradient-to-r from-[#ff3edb] via-[#d11eff] to-[#00f0ff] bg-clip-text text-transparent">L — Leadership</span><br />Direct the Room. Direct Your Life.</h1>
          <p className="mt-5 max-w-4xl text-lg leading-8 text-[#bca9cb]">Leadership is the moment you stop reacting to pressure and start directing your energy, choices, standards, conversations, and future.</p>
        </section>

        <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_360px]">
          <main className="rounded-3xl border border-white/10 bg-[#090012] p-5">
            <div className="grid grid-cols-2 gap-2 md:grid-cols-6">
              {pages.map((p) => (
                <button key={p.id} onClick={() => setActive(p.id)} className={`rounded-2xl border px-3 py-3 font-black ${active === p.id ? 'border-cyan-300/50 bg-cyan-300/10' : 'border-white/10 bg-white/5'}`}>{p.tab}</button>
              ))}
            </div>

            <article className="mt-6">
              <h2 className="text-3xl font-black">{page.title}</h2>
              <p className="mt-3 leading-8 text-[#bca9cb]">{page.body}</p>
              <div className="my-5 rounded-3xl border border-pink-400/30 bg-pink-400/10 p-5 text-2xl font-black">Leader question: “What am I directing right now — my fear, or my future?”</div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-3xl border border-white/10 bg-white/[.03] p-5"><h3 className="font-black">Training Point</h3><p className="mt-2 text-[#bca9cb]">Leadership is ownership in motion. It turns identity into direction.</p></div>
                <div className="rounded-3xl border border-white/10 bg-white/[.03] p-5"><h3 className="font-black">Field Application</h3><p className="mt-2 text-[#bca9cb]">Sales: lead the conversation. Life: lead the decision. Team: lead the energy. Self: lead the next rep.</p></div>
              </div>
              <label className="mt-6 block text-xs font-black uppercase tracking-widest text-[#d8c6e8]">Coaching Prompt</label>
              <textarea value={data[page.id]?.answer || ''} onChange={(e) => setAnswer(page.id, e.target.value)} placeholder={page.prompt} className="mt-2 min-h-32 w-full rounded-2xl border border-white/15 bg-[#05000d] p-4 text-white outline-none" />
              <div className="mt-5 rounded-3xl border border-white/10 bg-white/[.03] p-5"><h3 className="font-black">Micro Drill</h3><p className="mt-2 text-[#bca9cb]">{page.drill}</p></div>
              <label className="mt-5 flex gap-3 border-t border-white/10 pt-4"><input type="checkbox" checked={!!data[page.id]?.done} onChange={() => complete(page.id)} /><span><strong>I completed this leadership rep.</strong><br /><span className="text-sm text-[#bca9cb]">Check this only when you wrote evidence, not just when you read it.</span></span></label>
              <div className="mt-6 flex justify-between gap-3"><button onClick={() => setActive(pages[Math.max(0, activeIndex - 1)].id)} className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 font-black">Back</button><button onClick={() => { complete(page.id); setActive(pages[Math.min(pages.length - 1, activeIndex + 1)].id); }} className="rounded-2xl bg-gradient-to-r from-[#ff3edb] to-[#00f0ff] px-5 py-3 font-black text-[#090012]">Complete + Continue</button></div>
            </article>
          </main>

          <aside className="rounded-3xl border border-white/10 bg-[#090012] p-5">
            <h2 className="text-2xl font-black">Leadership Progress</h2>
            <div className="mt-4 h-3 overflow-hidden rounded-full bg-white/10"><div className="h-full bg-gradient-to-r from-[#ff3edb] via-[#d11eff] to-[#00ffbf]" style={{ width: `${progress}%` }} /></div>
            <p className="mt-2 font-black">{progress}% complete</p>
            <div className="mt-5 space-y-3">
              <div className="rounded-2xl border border-cyan-300/20 bg-cyan-300/10 p-4"><strong>85%</strong><p className="text-sm text-[#bca9cb]">ICF reports most coaches say clients are seeking mental well-being support.</p></div>
              <div className="rounded-2xl border border-cyan-300/20 bg-cyan-300/10 p-4"><strong>d=.65</strong><p className="text-sm text-[#bca9cb]">Implementation intentions show a medium-to-large goal attainment effect.</p></div>
            </div>
            <div className="mt-5 rounded-3xl border border-emerald-300/30 bg-emerald-300/10 p-4"><h3 className="font-black">Your Leadership Stand</h3><p className="mt-2 text-[#bca9cb]">{standPreview}</p></div>
            <button onClick={reset} className="mt-4 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 font-black">Reset Leadership Module</button>
          </aside>
        </div>
      </div>
    </div>
  );
}
