import React, { useEffect, useRef, useState } from "react";
import { castVote } from "./clearDayStore.js";
import { tapLight } from "../../lib/haptics.js";

/* ═══════════════════════════════════════════════════════════════
   THE CORNER — the always-awake corner man. Mid-urge or late-night
   chat; the Mask only wins fights nobody knows are happening, and
   at 2am the AI corner is the human-shaped voice that's actually
   awake. Server relay: /.netlify/functions/corner (key server-side).
   First real exchange of the day files a "reachout" exhibit —
   breaking secrecy IS the rep.
   ═══════════════════════════════════════════════════════════════ */

const OPENERS = [
  "I'm in your corner. What's going on right now?",
  "Still awake, still here. Talk to me — what's the pull tonight?",
  "You opened the corner, that already broke the secret. What's happening?",
];

export default function CornerChat({ S, day, onClose }) {
  const [msgs, setMsgs] = useState([{ role: "assistant", content: OPENERS[day % OPENERS.length] }]);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [offline, setOffline] = useState(false);
  const logged = useRef(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [msgs, busy]);

  const send = async () => {
    const clean = text.trim();
    if (!clean || busy) return;
    tapLight();
    const next = [...msgs, { role: "user", content: clean }];
    setMsgs(next);
    setText("");
    setBusy(true);
    try {
      const res = await fetch("/.netlify/functions/corner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: next.slice(1), // opener is client-side scenery, not history
          ctx: {
            track: S.tracks.length === 1 ? S.tracks[0] : "both",
            day,
            claim: S.identity.statement,
            law: S.laws[S.tracks[0]] || "",
            maskName: S.identity.maskName,
          },
        }),
      });
      if (!res.ok) throw new Error("corner down");
      const data = await res.json();
      setMsgs((m) => [...m, { role: "assistant", content: data.reply }]);
      if (!logged.current && !S.ballot.some((b) => b.day === day && b.kind === "reachout")) {
        logged.current = true;
        castVote("reachout", "Reached the corner mid-fight — said it out loud instead of carrying it alone.");
      }
    } catch {
      setOffline(true);
      setMsgs((m) => [
        ...m,
        {
          role: "assistant",
          content:
            "The corner just went dark — connection issue, not you. The move is the same: cold water, leave the room, or start the Urge Battle. The wave still breaks.",
        },
      ]);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="cd-corner" role="dialog" aria-label="The Corner">
      <div className="cd-corner-card">
        <div className="cd-corner-head">
          <div>
            <div className="cd-corner-title">📡 THE CORNER</div>
            <div className="cd-corner-sub">{offline ? "reconnecting…" : "always awake · nothing leaves this room"}</div>
          </div>
          <button type="button" className="cd-corner-x" onClick={onClose} aria-label="Close">×</button>
        </div>

        <div className="cd-corner-scroll" ref={scrollRef}>
          {msgs.map((m, i) => (
            <div key={i} className={`cd-corner-msg ${m.role === "user" ? "cd-corner-msg--me" : ""}`}>
              {m.content}
            </div>
          ))}
          {busy && <div className="cd-corner-msg cd-corner-msg--typing">…</div>}
        </div>

        <div className="cd-corner-inputrow">
          <textarea
            className="cd-corner-input"
            rows={1}
            maxLength={600}
            value={text}
            placeholder="Say what's actually happening…"
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
          />
          <button type="button" className="cd-corner-send" disabled={!text.trim() || busy} onClick={send}>
            ➤
          </button>
        </div>
      </div>
    </div>
  );
}
