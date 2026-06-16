import React from "react";
import FormulaStepCard from "./FormulaStepCard.jsx";

const STEPS = [
  {
    label: "Signal",
    title: "Set Specific Intentions",
    concept: "Desire becomes a target lock.",
    accent: "#00F0FF",
    explanation:
      "Vague desires produce vague effort. A specific intention tells your brain exactly what to scan for and exactly what done looks like.",
    prompt: "Write your goal as one sentence so specific a stranger could verify it.",
    example: '"Earn $10,000/month from my business by December 31" - not "make more money."'
  },
  {
    label: "Vision",
    title: "Create a Clear Future Vision",
    concept: "The nervous system gets a destination.",
    accent: "#8B5CF6",
    explanation:
      "Your nervous system moves toward pictures, not paragraphs. A vivid future vision makes the goal feel real before it is.",
    prompt: "Describe one full day of your life after the milestone is achieved.",
    example: "Waking up without an alarm, checking the dashboard of a business that ran overnight."
  },
  {
    label: "Edge",
    title: "Tap Into Your Strengths + Skills",
    concept: "Your natural advantages become leverage.",
    accent: "#00FFBF",
    explanation:
      "The fastest route runs through what you're already good at. Strengths compound; weaknesses leak energy.",
    prompt: "List your top 3 strengths and attach each to a milestone action.",
    example: "Great talker? Sell by phone, not by cold email."
  },
  {
    label: "Allies",
    title: "Utilize Resources Around You",
    concept: "Hidden support gets pulled into the map.",
    accent: "#38BDF8",
    explanation:
      "You're not starting from zero. People, tools, communities, and free knowledge are lying around unclaimed.",
    prompt: "Name 3 resources you already have access to and how each shortens the path.",
    example: "A friend who's done it, a library card, and 45 free minutes every lunch break."
  },
  {
    label: "Charge",
    title: "Integrate The Power of Rewards",
    concept: "Effort gets an emotional battery.",
    accent: "#FACC15",
    explanation:
      "Discipline without payoff burns out. Attaching rewards trains your brain to associate execution with winning.",
    prompt: "Choose one reward you genuinely want and lock it behind a progress threshold.",
    example: "The new running shoes only arrive when 33% of training sessions are logged."
  },
  {
    label: "Route",
    title: "Reverse-Engineer Your Timeline",
    concept: "The deadline becomes a breadcrumb trail.",
    accent: "#FB923C",
    explanation:
      "Start at the deadline and walk backwards. Each step backward reveals what this week - and today - must produce.",
    prompt: "From your target date, write the monthly checkpoints in reverse order.",
    example: "Launch in June -> beta in April -> prototype in February -> spec written this week."
  },
  {
    label: "Quest",
    title: "Take Focused Action + Set a Milestone",
    concept: "The next checkpoint becomes playable.",
    accent: "#FF3EDB",
    explanation:
      "Motion beats meditation. One named milestone with weekly actions converts a dream into coordinates.",
    prompt: "Map one milestone right now with 3-5 actions for week one.",
    example: 'Milestone: "First paying customer." Week 1: define offer, list 20 prospects, pitch 5.'
  },
  {
    label: "Loop",
    title: "Attach Rewards to Your Milestones",
    concept: "Progress becomes proof, proof becomes identity.",
    accent: "#D11EFF",
    explanation:
      "The full loop: milestone -> execution -> progress -> reward -> identity. Each claimed reward is proof you follow through, and proof becomes identity.",
    prompt: "Attach a small (33%), medium (66%), and large (100%) reward to every active milestone.",
    example: "33%: favorite dinner. 66%: gear upgrade. 100%: the celebration trip."
  }
];

export default function FormulaPage() {
  return (
    <div className="formula-page anim-fade-in">
      <header className="formula-hero page-header">
        <div className="formula-hero__grid" aria-hidden="true" />
        <div className="formula-hero__copy">
          <div className="page-header__kicker">THE OPERATING SYSTEM</div>
          <h1 className="page-header__title">The Milestone Mastery Formula</h1>
          <p className="page-header__sub">
            Turn the dream into a playable chain: target, vision, leverage, route, action, reward.
          </p>
        </div>

        <div className="formula-reactor" aria-hidden="true">
          <span className="formula-reactor__ring formula-reactor__ring--outer" />
          <span className="formula-reactor__ring formula-reactor__ring--middle" />
          <span className="formula-reactor__ring formula-reactor__ring--inner" />
          <span className="formula-reactor__beam formula-reactor__beam--a" />
          <span className="formula-reactor__beam formula-reactor__beam--b" />
          <span className="formula-reactor__core">8</span>
          <span className="formula-reactor__label">layers online</span>
        </div>
      </header>

      <section className="formula-flow" aria-label="Milestone Mastery Formula layers">
        <div className="formula-flow__spine" aria-hidden="true" />
        {STEPS.map((step, i) => (
          <FormulaStepCard key={step.title} step={step} index={i} />
        ))}
      </section>
    </div>
  );
}
