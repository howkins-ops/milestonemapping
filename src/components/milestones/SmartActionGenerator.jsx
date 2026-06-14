import React, { useState } from "react";
import Card from "../ui/Card.jsx";
import Button from "../ui/Button.jsx";
import { useMilestones } from "../../hooks/useMilestones.js";
import { getCurrentWeekNumber } from "../../lib/dates.js";

// Rule-based action suggestions per category — no AI, no network.
const SUGGESTIONS = {
  Fitness: [
    "Schedule 3 workouts this week",
    "Plan meals for 5 days",
    "Track morning weight",
    "Complete first training session",
    "Review progress Sunday"
  ],
  Health: [
    "Book overdue checkup",
    "Set a consistent sleep window",
    "Drink water before every meal",
    "Walk 20 minutes daily",
    "Review energy levels Sunday"
  ],
  Money: [
    "Define exact income target",
    "Track all expenses this week",
    "Pick one income action",
    "Follow up with 10 leads",
    "Review progress Sunday"
  ],
  Business: [
    "Define the offer",
    "Build first version",
    "Share with 5 people",
    "Collect feedback",
    "Improve one feature"
  ],
  Sales: [
    "Set daily door/lead target",
    "Practice objection handling",
    "Track closes",
    "Review pitch improvements",
    "Reward high-output day"
  ],
  Faith: [
    "Set a daily quiet-time block",
    "Read one chapter each morning",
    "Write one gratitude prayer",
    "Serve someone this week",
    "Reflect on growth Sunday"
  ],
  Relationships: [
    "Plan one intentional date or call",
    "Send 3 appreciation messages",
    "Schedule weekly family time",
    "Resolve one lingering conversation",
    "Review connection quality Sunday"
  ],
  "Personal Growth": [
    "Pick one book and read 10 pages daily",
    "Journal 5 minutes each night",
    "Remove one daily distraction",
    "Learn one new skill block this week",
    "Review lessons Sunday"
  ]
};

export default function SmartActionGenerator({ milestone }) {
  const { addMilestoneAction } = useMilestones();
  const [suggestions, setSuggestions] = useState(null);

  const generate = () => {
    const base = SUGGESTIONS[milestone.category] || SUGGESTIONS["Personal Growth"];
    const existing = new Set((milestone.actions || []).map((a) => a.text.toLowerCase()));
    setSuggestions(base.filter((s) => !existing.has(s.toLowerCase())));
  };

  const add = (text) => {
    addMilestoneAction(milestone.id, text, getCurrentWeekNumber());
    setSuggestions((prev) => prev.filter((s) => s !== text));
  };

  return (
    <Card variant="glass" style={{ marginTop: 16 }}>
      <div className="row row--between row--wrap">
        <div>
          <h3 style={{ fontSize: 15.5 }}>⚙️ Smart Action Generator</h3>
          <p className="soft" style={{ fontSize: 12.5, marginTop: 3 }}>
            Battle-tested moves for {milestone.category}.
          </p>
        </div>
        <Button variant="neon" size="sm" onClick={generate}>
          Generate Next Actions
        </Button>
      </div>

      {suggestions && (
        <ul style={{ listStyle: "none", margin: "14px 0 0", padding: 0, display: "flex", flexDirection: "column", gap: 8 }}>
          {suggestions.length === 0 && (
            <li className="soft" style={{ fontSize: 13 }}>
              All suggestions already on your list. You're ahead of the playbook.
            </li>
          )}
          {suggestions.map((s) => (
            <li key={s} className="row anim-slide-up">
              <span style={{ flex: 1, fontSize: 14 }}>{s}</span>
              <Button variant="secondary" size="sm" onClick={() => add(s)}>
                + Add
              </Button>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
