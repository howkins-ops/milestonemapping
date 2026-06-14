import React, { useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "blaze_execution_module_v1";

const pages = [
  {
    title: "Execution Is Evidence",
    tag: "Core Lesson",
    lesson: [
      "Execution is the final letter because nothing becomes real until it moves. Being chooses the identity. Leadership directs the day. Alignment removes friction. Zeal brings fire. Execution creates evidence.",
      "B.L.A.Z.E. turns overthinking into movement by helping people move fast, create trackable wins, and finish what they start."
    ],
    prompts: [
      ["identity", "Who are you becoming through execution?"],
      ["oldPattern", "What pattern of overthinking or delay are you done repeating?"]
    ],
    cards: [
      ["Intention is not proof.", "Wanting it, thinking about it, talking about it, and planning it are not the same as moving."],
      ["Proof changes identity.", "Every completed rep tells your nervous system: ‘This is who I am now.’"]
    ]
  },
  {
    title: "Kill Overthinking",
    tag: "Decision Drill",
    lesson: [
      "Overthinking usually pretends to be intelligence. Most of the time, it is fear looking for a better costume.",
      "Reduce the decision, choose the next rep, and move before fear builds a case."
    ],
    prompts: [
      ["nextRep", "What is the smallest proof rep you can complete today?"],
      ["ifThen", "Create an if–then plan: If I start overthinking, then I will..."]
    ],
    cards: [
      ["The 3-Minute Rule", "When the next step is obvious, give yourself three minutes to start. Not finish. Start."],
      ["The One-Rep Rule", "When the full task feels heavy, shrink it to one proof rep: one call, one page, one pitch, one message, one workout set."]
    ]
  },
  {
    title: "Build Proof Reps",
    tag: "Behavior Stack",
    lesson: [
      "Proof reps are the bridge between who you say you are and who you are becoming.",
      "You are not trying to transform your whole life in one heroic push. You are stacking evidence."
    ],
    prompts: [
      ["proofRep", "Write the exact proof rep you will complete."],
      ["evidence", "What will count as evidence that it is done?"]
    ],
    cards: [
      ["Sales Rep", "One pitch, one follow-up, one objection roleplay, one CRM update."],
      ["Health Rep", "One walk, one workout, one clean meal, one stretch session."],
      ["Creation Rep", "One page, one post, one module, one asset, one recorded idea."],
      ["Leadership Rep", "One hard conversation, one standard set, one team message, one coaching moment."]
    ]
  },
  {
    title: "Track the Scoreboard",
    tag: "Numbers Create Clarity",
    lesson: [
      "Execution becomes powerful when it becomes trackable.",
      "If you know the rep, the number, the target, and the follow-through, you stop guessing and start leading the game."
    ],
    prompts: [
      ["lag", "What is the result you want?"],
      ["lead", "What controllable reps create that result?"],
      ["scoreboard", "What number will you track daily?"]
    ],
    cards: [
      ["Lag Measure", "The result you want: sales, income, weight lost, pages finished, deals closed."],
      ["Lead Measure", "The reps you control: doors knocked, calls made, workouts done, pages written, follow-ups sent."]
    ]
  },
  {
    title: "Finish What You Start",
    tag: "Completion Energy",
    lesson: [
      "Most people do not lose because they lack dreams. They lose because they leak completion.",
      "Execution trains a different identity: the finisher. Do not worship the emotional high of starting. Build the standard of finishing."
    ],
    prompts: [
      ["openLoop", "What open loop needs to be closed?"],
      ["finishLine", "What does finished look like today?"],
      ["standard", "What standard are you installing by finishing this?"]
    ],
    cards: [
      ["Completion beats intensity.", "Starting feels exciting. Finishing builds trust."],
      ["Close the loop.", "Every open loop drains confidence. Every closed loop builds trust with yourself."]
    ]
  },
  {
    title: "Execution Lock-In",
    tag: "Final Integration",
    lesson: [
      "Execution is not panic. It is not random hustle. It is clean, fast, trackable movement from the person you are choosing to be.",
      "Lock in the E pillar by writing your execution statement."
    ],
    prompts: [
      ["statement", "Complete this: I execute because..."],
      ["today", "Today, I will prove it by..."],
      ["tomorrow", "Tomorrow, I will continue by..."]
    ],
    cards: [
      ["Choose", "Name the move."],
      ["Move", "Take the rep."],
      ["Track", "Capture the evidence."],
      ["Finish", "Close the loop."]
    ]
  }
];

export default function BlazeExecutionModule() {
  const [current, setCurrent] = useState(0);
  const [data, setData] = useState({});

  useEffect(() => {
    try {
      setData(JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}"));
    } catch {
      setData({});
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  const progress = useMemo(() => {
    const done = pages.filter((_, i) => data[`page_${i}`]).length;
    return { done, pct: Math.round((done / pages.length) * 100) };
  }, [data]);

  const page = pages[current];
  const update = (key, value) => setData((d) => ({ ...d, [key]: value }));
  const complete = () => {
    update(`page_${current}`, true);
    if (current < pages.length - 1) setCurrent(current + 1);
  };

  return (
    <div className="min-h-screen bg-[#030006] text-[#f8f2ff] p-4 md:p-8" style={{ backgroundImage: "radial-gradient(circle at 15% 0%, rgba(209,30,255,.22), transparent 32%), radial-gradient(circle at 85% 20%, rgba(0,240,255,.16), transparent 30%)" }}>
      <div className="max-w-6xl mx-auto">
        <section className="rounded-[30px] border border-white/10 bg-[#080010]/90 p-6 md:p-8 shadow-2xl">
          <p className="uppercase tracking-[.28em] text-[#00f0ff] text-xs font-black">B.L.A.Z.E. Framework Training</p>
          <h1 className="text-5xl md:text-7xl font-black tracking-[-.06em] mt-2 bg-gradient-to-r from-[#ff3edb] via-[#d11eff] to-[#00f0ff] text-transparent bg-clip-text">E — Execution</h1>
          <p className="text-lg md:text-2xl text-[#eadcff] max-w-3xl mt-3">Stop overthinking. Move fast. Create proof. Execution is where identity becomes evidence.</p>
        </section>

        <div className="grid md:grid-cols-[300px_1fr] gap-5 mt-5">
          <aside className="rounded-3xl border border-white/10 bg-[#080010]/90 p-4 h-fit md:sticky md:top-4">
            <div className="text-[#00ffbf] uppercase tracking-[.16em] text-xs font-black">Execution Module</div>
            <div className="h-3 bg-white/10 rounded-full overflow-hidden mt-4"><div className="h-full bg-gradient-to-r from-[#ff3edb] via-[#00f0ff] to-[#00ffbf]" style={{ width: `${progress.pct}%` }} /></div>
            <p className="text-sm text-[#bfaed2] mt-2">{progress.pct}% complete • {progress.done}/{pages.length} pages locked</p>
            <div className="mt-5 space-y-2">
              {pages.map((p, i) => (
                <button key={p.title} onClick={() => setCurrent(i)} className={`w-full text-left rounded-2xl px-4 py-3 border font-black ${i === current ? "bg-[#d11eff]/25 border-[#00f0ff]/40" : "bg-white/5 border-white/10"}`}>
                  {i + 1}. {p.title}
                </button>
              ))}
            </div>
          </aside>

          <main className="rounded-3xl border border-white/10 bg-[#080010]/90 p-5 md:p-7">
            <p className="text-[#00ffbf] uppercase tracking-[.16em] text-xs font-black">{page.tag}</p>
            <h2 className="text-4xl font-black tracking-[-.04em] mt-2">{page.title}</h2>
            <div className="mt-5 space-y-4">
              {page.lesson.map((line) => <p key={line} className="text-lg leading-8 text-[#eadcff]">{line}</p>)}
            </div>

            <div className="grid md:grid-cols-2 gap-4 mt-6">
              {page.cards.map(([title, copy]) => (
                <div key={title} className="rounded-3xl border border-white/10 bg-white/[.035] p-5">
                  <h3 className="text-xl font-black">{title}</h3>
                  <p className="text-[#bfaed2] mt-2 leading-6">{copy}</p>
                </div>
              ))}
            </div>

            <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-[#ff3edb]/10 to-[#00f0ff]/10 p-5 mt-6">
              {page.prompts.map(([key, label]) => (
                <label key={key} className="block mt-4 first:mt-0">
                  <span className="block text-[#00f0ff] uppercase tracking-[.14em] text-xs font-black mb-2">{label}</span>
                  <textarea value={data[key] || ""} onChange={(e) => update(key, e.target.value)} className="w-full min-h-[105px] rounded-2xl border border-white/10 bg-black/40 p-4 outline-none text-[#f8f2ff]" />
                </label>
              ))}
              <div className="flex flex-wrap gap-3 mt-5">
                <button onClick={complete} className="rounded-2xl px-5 py-3 font-black text-black bg-gradient-to-r from-[#ff3edb] to-[#00f0ff]">Mark Page Complete</button>
                <button onClick={() => setCurrent(Math.min(pages.length - 1, current + 1))} className="rounded-2xl px-5 py-3 font-black border border-white/10 bg-white/5">Next Page</button>
                <button onClick={() => setData({})} className="rounded-2xl px-5 py-3 font-black border border-white/10 bg-white/5">Reset Module</button>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
