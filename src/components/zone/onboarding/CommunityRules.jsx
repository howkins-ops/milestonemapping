import React from "react";

export const RULES_VERSION = 1;

const RULES = [
  { icon: "🔥", title: "Encourage, always", body: "This is a place people come to become someone. Celebrate effort, never mock a miss." },
  { icon: "🚫", title: "No shame, no interrogation", body: "Nobody owes anyone an explanation for a missed day. \"What's the plan for today?\" is the only follow-up." },
  { icon: "🛡️", title: "Private by design", body: "Only friends and squad-mates see your missions and proof. Never share someone else's content outside the Zone." },
  { icon: "📷", title: "Proof is yours", body: "Post only your own photos and words. Nothing harmful, hateful, or explicit — this is a locker room, not a battleground." },
  { icon: "⚑", title: "Report, don't retaliate", body: "See something off? Every post, message, and profile has a report button. Blocking is instant and two-way." },
];

// Explicit acceptance of community rules — required before entering (UGC apps
// need this for App Store review, and it sets the tone from second one).
export default function CommunityRules({ accepted, onToggle }) {
  return (
    <div>
      {RULES.map((r) => (
        <div key={r.title} style={{ display: "flex", gap: 12, marginBottom: 14, alignItems: "flex-start" }}>
          <span style={{ fontSize: 20 }} aria-hidden="true">{r.icon}</span>
          <div>
            <div style={{ fontWeight: 800, fontSize: 13.5, color: "var(--text-main)" }}>{r.title}</div>
            <div style={{ fontSize: 12.5, color: "var(--text-soft)", lineHeight: 1.5 }}>{r.body}</div>
          </div>
        </div>
      ))}
      <label
        style={{
          display: "flex", gap: 10, alignItems: "center", cursor: "pointer",
          padding: "12px 14px", borderRadius: 14, border: "1px solid var(--zn-border)",
          background: accepted ? "var(--zfire-soft)" : "rgba(255,255,255,0.03)", marginTop: 6,
        }}
      >
        <input type="checkbox" checked={accepted} onChange={(e) => onToggle(e.target.checked)} style={{ width: 18, height: 18, accentColor: "#FF7A1A" }} />
        <span style={{ fontSize: 13.5, fontWeight: 700 }}>I'm in. Fire over shame — I'll hold the line.</span>
      </label>
    </div>
  );
}
