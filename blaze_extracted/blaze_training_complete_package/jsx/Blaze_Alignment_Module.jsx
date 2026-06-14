import React, { useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "blaze_alignment_module_v1";

const pages = [
  {
    id: "truth",
    title: "1. Alignment Truth",
    body: (
      <>
        <h2>Alignment is power without friction.</h2>
        <p>Most people are not tired because they are doing too much. They are tired because they are split. Their mouth says one thing, their calendar says another. Their vision says freedom, but their habits say comfort.</p>
        <div className="quote">Alignment means your inner world and outer actions are finally telling the same story.</div>
        <div className="cards"><div className="card"><h3>Misalignment sounds like:</h3><ul><li>“I want more,” but I keep choosing comfort.</li><li>“This matters,” but I keep delaying it.</li><li>“I’m serious,” but my calendar has no proof.</li></ul></div><div className="card"><h3>Alignment sounds like:</h3><ul><li>“This is who I am becoming.”</li><li>“This is the move that matches that.”</li><li>“This is the proof I will create today.”</li></ul></div></div>
      </>
    )
  },
  { id: "values", title: "2. Values Audit", prompt: "What do you say matters most right now — and what are your current actions proving matters most?", placeholder: "I say freedom matters, but my actions prove comfort and distraction are still winning..." },
  { id: "vision", title: "3. Future Filter", prompt: "Name one decision you need to make. Then write the aligned choice.", placeholder: "Decision: ... Aligned choice: ..." },
  { id: "friction", title: "4. Find the Friction", prompt: "Where are you currently out of alignment?", placeholder: "The biggest friction point is..." },
  { id: "standard", title: "5. Build the Standard", prompt: "Complete this: Because I am aligned with ________, I no longer ________, and I now ________.", placeholder: "Because I am aligned with my future, I no longer negotiate with distraction, and I now execute the first proof rep before comfort..." },
  { id: "proof", title: "6. Alignment Proof Rep", prompt: "What aligned action will you complete in the next 10 minutes?", placeholder: "In the next 10 minutes, I will..." },
  { id: "lock", title: "7. Alignment Lock-In", prompt: "Write your Alignment Statement: I am aligned when...", placeholder: "I am aligned when my values, vision, calendar, conversations, and actions are all pointing toward the same future..." }
];

export default function BlazeAlignmentModule() {
  const [current, setCurrent] = useState(0);
  const [done, setDone] = useState({});
  const [answers, setAnswers] = useState({});

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
      setDone(saved.done || {});
      setAnswers(saved.answers || {});
    } catch {}
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ done, answers }));
  }, [done, answers]);

  const pct = useMemo(() => Math.round((Object.values(done).filter(Boolean).length / pages.length) * 100), [done]);
  const page = pages[current];

  function completePage() {
    setDone((d) => ({ ...d, [page.id]: true }));
  }

  function updateAnswer(value) {
    setAnswers((a) => ({ ...a, [page.id]: value }));
  }

  return (
    <div className="blaze-align-shell">
      <style>{css}</style>
      <section className="hero">
        <div className="eyebrow">B.L.A.Z.E. Framework™ / Module 03</div>
        <h1>A — Alignment</h1>
        <p>Alignment is the end of fake hustle. It is where your values, vision, goals, words, environment, and daily actions stop fighting each other — and start pulling in one direction.</p>
        <div><span className="pill">Values → Vision → Action</span><span className="pill">No hustle for hustle’s sake</span><span className="pill">Congruence creates power</span></div>
      </section>
      <section className="grid">
        <aside className="side">
          <h3>Training Path</h3>
          <div className="progress"><div style={{ width: `${pct}%` }} /></div>
          <p><strong>{pct}%</strong> complete</p>
          {pages.map((p, i) => <button key={p.id} className={i === current ? "active" : ""} onClick={() => setCurrent(i)}>{done[p.id] ? "✓ " : "○ "}{p.title}</button>)}
          <div className="card"><h3>Alignment Check</h3><p>Does this move match the person, mission, and future you say you want?</p></div>
        </aside>
        <main className="main">
          {page.body || <LessonPage page={page} value={answers[page.id] || ""} onChange={updateAnswer} />}
          <div className="btns"><button onClick={completePage}>Complete This Page</button><button className="secondary" onClick={() => setCurrent(Math.max(0, current - 1))}>Back</button><button className="secondary" onClick={() => setCurrent(Math.min(pages.length - 1, current + 1))}>Next</button></div>
          {done[page.id] && <div className="complete">Saved. This page is complete.</div>}
        </main>
      </section>
    </div>
  );
}

function LessonPage({ page, value, onChange }) {
  const intros = {
    values: "Your values are not what you claim. They are what you consistently choose.",
    vision: "Stop making decisions from fear. Make them from your future.",
    friction: "Misalignment creates drag: procrastination, overthinking, low energy, and constant restarting.",
    standard: "Alignment becomes real when it becomes a standard, not a mood.",
    proof: "Alignment is not proven by what you understand. It is proven by what you do next.",
    lock: "This is the line that turns the module into a stand. Keep it usable under pressure."
  };
  return <><h2>{page.title}</h2><p>{intros[page.id]}</p><div className="prompt"><h3>Coaching Prompt</h3><p>{page.prompt}</p><textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder={page.placeholder} /></div></>;
}

const css = `
.blaze-align-shell{min-height:100vh;padding:28px 18px 80px;background:radial-gradient(circle at top left,rgba(209,30,255,.18),transparent 35%),radial-gradient(circle at top right,rgba(0,240,255,.15),transparent 33%),linear-gradient(180deg,#030006,#05000b 55%,#000);color:#f7edff;font-family:Inter,system-ui,sans-serif}.hero,.side,.main{max-width:1180px;margin:0 auto;border:1px solid rgba(255,255,255,.13);background:rgba(13,7,20,.9);border-radius:30px;padding:24px}.hero h1{font-size:clamp(38px,7vw,78px);line-height:.9;margin:12px 0;background:linear-gradient(90deg,#d11eff,#ff3edb,#00f0ff);-webkit-background-clip:text;color:transparent}.hero p,.main p,.card p,.main li{color:#bca9cf;line-height:1.65}.eyebrow{letter-spacing:.22em;text-transform:uppercase;color:#00f0ff;font-size:12px;font-weight:900}.pill{display:inline-flex;border:1px solid rgba(255,255,255,.13);border-radius:999px;padding:8px 11px;background:#08030e;color:#bca9cf;font-size:12px;font-weight:800;margin:5px}.grid{max-width:1180px;margin:20px auto;display:grid;grid-template-columns:320px 1fr;gap:18px}.side button{width:100%;text-align:left;margin:7px 0;border:1px solid rgba(255,255,255,.13);background:#08030e;color:#f7edff;padding:14px;border-radius:16px;font-weight:800;cursor:pointer}.side button.active{border-color:rgba(0,240,255,.8);box-shadow:0 0 20px rgba(0,240,255,.18);background:linear-gradient(90deg,rgba(209,30,255,.18),rgba(0,240,255,.08))}.progress{height:13px;background:#07020d;border-radius:999px;overflow:hidden;border:1px solid rgba(255,255,255,.13);margin:14px 0}.progress div{height:100%;background:linear-gradient(90deg,#d11eff,#ff3edb,#00f0ff);transition:.4s}.cards{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px;margin:16px 0}.card{border:1px solid rgba(255,255,255,.13);background:linear-gradient(180deg,rgba(19,10,32,.95),rgba(8,3,14,.95));border-radius:20px;padding:17px}.quote{border-left:4px solid #00f0ff;padding:14px 16px;background:rgba(0,240,255,.06);border-radius:14px;margin:16px 0;color:#eafcff;font-weight:750}.prompt{border:1px solid rgba(209,30,255,.35);background:rgba(209,30,255,.08);border-radius:22px;padding:16px;margin:16px 0}textarea{width:100%;min-height:120px;background:#05020a;color:#f7edff;border:1px solid rgba(255,255,255,.13);border-radius:16px;padding:14px;font:inherit}.btns{display:flex;gap:10px;flex-wrap:wrap;margin-top:14px}.btns button{border:0;border-radius:999px;padding:13px 18px;font-weight:950;cursor:pointer;color:#07020d;background:linear-gradient(90deg,#d11eff,#ff3edb,#00f0ff)}.btns .secondary{background:#0b0412;color:#f7edff;border:1px solid rgba(255,255,255,.13)}.complete{margin-top:15px;border:1px solid rgba(0,255,191,.35);background:rgba(0,255,191,.08);border-radius:18px;padding:14px;color:#dffff7}@media(max-width:850px){.grid{grid-template-columns:1fr}.cards{grid-template-columns:1fr}}`;
