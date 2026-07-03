import React, { useEffect, useState } from "react";
import { useZoneCtx } from "../../../hooks/useZone.js";
import { useAppData } from "../../../hooks/useAppData.js";
import { react, unreact } from "../../../lib/zoneService.js";
import { REACTION_EMOJI, zoneErrorMessage } from "../../../lib/zoneFire.js";
import { playSound } from "../../../lib/sounds.js";

function buildState(reactions, myId) {
  const counts = {};
  const mine = {};
  (reactions || []).forEach((r) => {
    counts[r.emoji] = (counts[r.emoji] || 0) + 1;
    if (r.user_id === myId) mine[r.emoji] = true;
  });
  return { counts, mine };
}

function flip(prev, emoji, on) {
  const counts = { ...prev.counts };
  const mine = { ...prev.mine };
  if (on) {
    counts[emoji] = (counts[emoji] || 0) + 1;
    mine[emoji] = true;
  } else {
    counts[emoji] = Math.max(0, (counts[emoji] || 0) - 1);
    delete mine[emoji];
  }
  return { counts, mine };
}

// The 9 sanctioned reactions with optimistic toggling. Counts come from the
// event's joined `reactions` rows; my picks glow.
export default function ReactionBar({ event, onChanged }) {
  const { userId } = useZoneCtx();
  const { pushToast, settings } = useAppData();
  const [state, setState] = useState(() => buildState(event.reactions, userId));

  useEffect(() => {
    setState(buildState(event.reactions, userId));
    // Re-seed only when the event itself changes — optimistic state owns the rest.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [event.id, userId]);

  const toggle = async (emoji) => {
    const had = !!state.mine[emoji];
    playSound("click", settings);
    setState((prev) => flip(prev, emoji, !had));
    try {
      if (had) await unreact(event.id, emoji, userId);
      else await react(event.id, emoji, userId);
      if (onChanged) onChanged();
    } catch (err) {
      setState((prev) => flip(prev, emoji, had));
      pushToast({ type: "error", title: "Reaction didn't land", message: zoneErrorMessage(err) });
    }
  };

  return (
    <div className="zn-reactbar">
      {REACTION_EMOJI.map((emoji) => {
        const count = state.counts[emoji] || 0;
        const isMine = !!state.mine[emoji];
        return (
          <button
            key={emoji}
            type="button"
            className={`zn-react${isMine ? " zn-react--mine" : ""}`}
            onClick={() => toggle(emoji)}
            aria-pressed={isMine}
            aria-label={`React with ${emoji}`}
          >
            <span aria-hidden="true">{emoji}</span>
            {count > 0 && <span className="zn-react__count">{count}</span>}
          </button>
        );
      })}
    </div>
  );
}
