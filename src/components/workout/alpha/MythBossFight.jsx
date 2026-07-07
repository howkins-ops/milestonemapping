import React, { useMemo, useRef, useState } from "react";
import { sfxBossHit, sfxBossDown, sfxChalkPoof } from "../../../lib/sfx.js";

/* ALPHA MODE — "Reject This Thought" battle.
   The boss IS a myth. Round 1: pick the truth from three cards
   (wrong picks crack and teach — no fail state). Round 2: HOLD to
   crush the myth card. Shatter, stamp the truth into the codex. */

const HOLD_MS = 900;

export default function MythBossFight({ boss, onWin, onFlee, settings }) {
  const [phase, setPhase] = useState("intro"); // intro | pick | crush | shatter | aftermath
  const [wrongId, setWrongId] = useState(null);
  const [holdPct, setHoldPct] = useState(0);
  const holdRef = useRef({ timer: null, start: 0 });

  const cards = useMemo(() => {
    const list = [
      { id: "truth", label: boss.truth },
      { id: "decoy", label: boss.decoy },
      { id: "myth", label: boss.myth },
    ];
    // stable shuffle per boss
    return list.sort((a, b) => ((boss.id + a.id).length * 31 % 7) - ((boss.id + b.id).length * 31 % 7));
  }, [boss]);

  const pick = (id) => {
    if (id === "truth") {
      sfxBossHit(settings);
      try { if (navigator.vibrate) navigator.vibrate(25); } catch { /* silent */ }
      setPhase("crush");
    } else {
      setWrongId(id);
      sfxChalkPoof(settings);
      setTimeout(() => setWrongId(null), 900);
    }
  };

  const startHold = () => {
    if (phase !== "crush") return;
    holdRef.current.start = Date.now();
    holdRef.current.timer = setInterval(() => {
      const pct = Math.min(100, ((Date.now() - holdRef.current.start) / HOLD_MS) * 100);
      setHoldPct(pct);
      if (pct >= 100) {
        clearInterval(holdRef.current.timer);
        sfxBossDown(settings);
        try { if (navigator.vibrate) navigator.vibrate([40, 60, 40]); } catch { /* silent */ }
        setPhase("shatter");
        setTimeout(() => setPhase("aftermath"), 1100);
      }
    }, 40);
  };
  const endHold = () => {
    clearInterval(holdRef.current.timer);
    if (phase === "crush") setHoldPct(0);
  };

  return (
    <div className="iw-al-boss">
      <button className="iw-back" onClick={onFlee}>❮ back off — the boss waits</button>

      {phase === "intro" && (
        <div className="iw-al-boss-intro">
          <div className="iw-eyebrow">myth boss · reject this thought</div>
          <div className="iw-al-boss-card iw-al-boss-slam">
            <div className="iw-al-boss-tier" aria-hidden="true">{"◆".repeat(boss.tier)}</div>
            <h2 className="iw-display iw-al-boss-name">{boss.name}</h2>
            <p className="iw-al-boss-myth">“{boss.myth}”</p>
          </div>
          <button className="iw-btn-ember iw-btn-wide" onClick={() => setPhase("pick")}>
            ⚔ face it
          </button>
        </div>
      )}

      {phase === "pick" && (
        <div className="iw-al-boss-pick">
          <div className="iw-eyebrow">round one — which of these is TRUE?</div>
          <div className="iw-stack">
            {cards.map((c) => (
              <button key={c.id}
                className={`iw-al-truth-card ${wrongId === c.id ? "iw-al-truth-wrong" : ""}`}
                onClick={() => pick(c.id)}>
                {c.label}
              </button>
            ))}
          </div>
          {wrongId && (
            <p className="iw-al-mentor-line iw-drop-in">
              “Close. Read it again — the lie always sounds one degree more convenient.”
            </p>
          )}
        </div>
      )}

      {(phase === "crush" || phase === "shatter") && (
        <div className="iw-al-boss-crush">
          <div className="iw-eyebrow">round two — crush the myth</div>
          <div className={`iw-al-boss-card iw-al-crushable ${phase === "shatter" ? "iw-al-shattered" : ""}`}
            style={{ "--iw-al-crack": `${holdPct}%` }}>
            <h2 className="iw-display iw-al-boss-name">{boss.name}</h2>
            <p className="iw-al-boss-myth">“{boss.myth}”</p>
            <div className="iw-al-crack-lines" aria-hidden="true" />
            {phase === "shatter" && (
              <div className="iw-al-shards" aria-hidden="true">
                {Array.from({ length: 9 }).map((_, i) => (
                  <span key={i} className="iw-al-shard" style={{ "--iw-al-sa": `${i * 40}deg`, animationDelay: `${i * 25}ms` }} />
                ))}
              </div>
            )}
          </div>
          {phase === "crush" && (
            <button className="iw-btn-ember iw-btn-wide iw-al-hold-btn"
              onPointerDown={startHold} onPointerUp={endHold} onPointerLeave={endHold}
              style={{ "--iw-al-hold": `${holdPct}%` }}>
              ⬛ HOLD TO CRUSH
            </button>
          )}
        </div>
      )}

      {phase === "aftermath" && (
        <div className="iw-al-boss-after iw-drop-in">
          <div className="iw-eyebrow" style={{ color: "#ff8a4d" }}>myth busted · stamped into the codex</div>
          <div className="iw-al-truth-stamp">
            <p>{boss.truth}</p>
          </div>
          <button className="iw-btn-ember iw-btn-wide" onClick={onWin}>
            ✦ take the truth
          </button>
        </div>
      )}
    </div>
  );
}
