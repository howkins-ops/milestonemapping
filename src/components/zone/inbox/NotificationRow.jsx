import React from "react";
import { timeAgo } from "../home/ZoneHome.jsx";

function nameOf(p) {
  return p?.display_name || p?.username || "Someone";
}

// One inbox line: icon + warm copy + where tapping takes you.
// Tone law: partner actions are always framed as warmth, never demand.
function describe(n) {
  const p = n.payload || {};
  const name = nameOf(p);
  switch (n.kind) {
    case "friend_request":
      return { icon: "🤝", text: `${name} wants to connect`, target: "friends" };
    case "friend_accept":
      return { icon: "🤝", text: `${name} accepted — you're connected`, target: "friends" };
    case "reaction":
      return { icon: p.emoji || "🔥", text: `${name} reacted to your post`, target: "feed" };
    case "comment":
      return { icon: "💬", text: `${name}: ${p.snippet || ""}`, target: "feed" };
    case "message":
      return {
        icon: "💬",
        text: `${name}: ${p.snippet || ""}`,
        target: "messages",
        param: p.conversation_id || null,
      };
    case "partner_invite":
      return { icon: "⚭", text: `${name} wants to be your accountability partner`, target: "partner" };
    case "partner_accept":
      return { icon: "⚭", text: `${name} said yes — you're partners now`, target: "partner" };
    case "partner_action": {
      const kind = p.action_kind || p.kind;
      if (kind === "celebrate") {
        return { icon: "🎉", text: `${name} celebrated your proof`, note: p.note, target: "partner" };
      }
      if (kind === "request_proof") {
        return { icon: "👀", text: `${name} can't wait to see today's win`, note: p.note, target: "partner" };
      }
      return { icon: "🔥", text: `${name} sent warmth`, note: p.note, target: "partner" };
    }
    case "eruption":
      return { icon: "🌋", text: `${p.squad_name || "Your squad"} erupted!`, target: "squad", param: n.ref_id || null };
    case "challenge_complete":
      return {
        icon: "🏆",
        text: `${p.title || "Challenge"} is complete${p.winner ? ` — ${p.winner} took the crown` : ""}`,
        target: "challenges",
        param: n.ref_id || null,
      };
    case "challenge_join":
      return { icon: "🏆", text: `${name} joined ${p.title || "a challenge"}`, target: "challenges", param: n.ref_id || null };
    case "squad_join":
      return { icon: "🛡️", text: `${name} joined ${p.squad_name || "your squad"}`, target: "squad" };
    case "system":
      return { icon: "✨", text: p.message || p.text || "A note from the Zone" };
    default:
      return { icon: "✨", text: p.message || "Something stirred in the Zone" };
  }
}

export default function NotificationRow({ n, go }) {
  const d = describe(n);
  const unread = !n.read_at;

  return (
    <button
      type="button"
      className={`zn-row${unread ? " zn-row--accent" : ""}`}
      onClick={() => {
        if (d.target && go) go(d.target, d.param || null);
      }}
    >
      <div className="zn-row__thumb" aria-hidden="true">{d.icon}</div>
      <div className="zn-row__body">
        <div className="zn-row__title">{d.text}</div>
        {d.note && <div className="zn-row__meta">“{d.note}”</div>}
      </div>
      <span className="zn-row__time">{timeAgo(n.created_at)}</span>
    </button>
  );
}
