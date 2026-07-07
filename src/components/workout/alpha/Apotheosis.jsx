import React, { useEffect, useMemo, useState } from "react";
import { SCROLLS } from "./data/scrolls.js";
import { ScrollCard } from "./WisdomScroll.jsx";
import { condition } from "./engine/hormones.js";
import { sfxPhoenix, sfxScrollUnfurl, sfxPlateClank } from "../../../lib/sfx.js";

/* ═══════════════════════════════════════════════════════════════
   APOTHEOSIS — the campaign finale.
   The ledger rises out of the dark: every real number the player
   earned across four phases. Then the line. Then the elixir.
   Then the torch. The last words land last, on purpose.
   ═══════════════════════════════════════════════════════════════ */

export default function Apotheosis({ alpha, workoutData, addXP, onClose, settings }) {
  const [act, setAct] = useState(0); // 0 dark → 1 ledger → 2 line → 3 elixir → 4 torch
  const { state } = alpha;

  const ledger = useMemo(() => {
    const alphaSessions = (workoutData.sessions || []).filter((s) => s.meta?.alpha);
    const volume = alphaSessions.reduce((s, x) => s + Number(x.total_volume || 0), 0);
    const sets = alphaSessions.reduce((s, x) => s + Number(x.total_sets || 0), 0);
    const bosses = (state.flags.bossesDefeated || []).length;
    const scrolls = (state.flags.scrolls || []).length;
    const fasts = alpha.events.filter((e) => e.kind === "fast_complete").length;
    const cheats = alpha.events.filter((e) => e.kind === "cheat_day").length;
    const prsInCampaign = (workoutData.prs || []).length;
    return { sessions: alphaSessions.length, volume, sets, bosses, scrolls, fasts, cheats, prs: prsInCampaign };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    sfxPhoenix(settings);
    const t1 = setTimeout(() => setAct(1), 1600);
    const t2 = setTimeout(() => setAct(2), 5200);
    return () => { clearTimeout(t1); clearTimeout(t2); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const takeElixir = () => {
    sfxScrollUnfurl(settings);
    const scrolls = state.flags.scrolls || [];
    if (!scrolls.includes("elixir")) {
      alpha.patchState({ stage: 11, flags: { ...state.flags, scrolls: [...scrolls, "elixir"], apotheosisDone: true } });
      alpha.logEvent("scroll", { scrollId: "elixir" });
      alpha.logEvent("stage_up", { from: 10, to: 11 });
      addXP(200, "APOTHEOSIS — the campaign is yours");
    }
    setAct(3);
  };

  const elixirScroll = SCROLLS.find((s) => s.id === "elixir");
  const LEDGER_ROWS = [
    ["sessions racked", ledger.sessions],
    ["pounds moved", Math.round(ledger.volume).toLocaleString()],
    ["sets in the book", ledger.sets],
    ["PRs on the wall", ledger.prs],
    ["myths busted", ledger.bosses],
    ["fasts sealed", ledger.fasts],
    ["deliberate feasts", ledger.cheats],
    ["scrolls collected", ledger.scrolls],
  ];

  return (
    <div className="iw-al-apo">
      {act === 0 && <div className="iw-al-apo-dark"><span className="iw-al-apo-spark" aria-hidden="true" /></div>}

      {act >= 1 && act < 3 && (
        <div className="iw-al-apo-ledger">
          <div className="iw-eyebrow" style={{ color: "#E9C46A" }}>the ordeal · your ledger</div>
          <div className="iw-al-apo-rows">
            {LEDGER_ROWS.map(([label, val], i) => (
              <div key={label} className="iw-al-apo-row" style={{ animationDelay: `${i * 320}ms` }}>
                <span className="iw-al-apo-val">{val}</span>
                <span className="iw-al-apo-label">{label}</span>
              </div>
            ))}
          </div>
          {act >= 2 && (
            <div className="iw-al-apo-line iw-drop-in">
              <p>“If you can change this —<br />you can change anything.”</p>
              <button className="iw-btn-ember iw-btn-wide" onClick={takeElixir}>take the elixir</button>
            </div>
          )}
        </div>
      )}

      {act === 3 && (
        <div className="iw-al-apo-elixir iw-drop-in">
          <ScrollCard scroll={elixirScroll} unfurl />
          <div className="iw-al-apo-sheet">
            <div className="iw-eyebrow" style={{ color: "#E9C46A" }}>I, ALPHA</div>
            <div className="iw-al-sheet-row">
              <div className="iw-al-sheet-stat"><span className="iw-al-sheet-num">{ledger.sessions}</span><span className="iw-al-sheet-label">sessions</span></div>
              <div className="iw-al-sheet-stat"><span className="iw-al-sheet-num">{condition(state.hormones)}</span><span className="iw-al-sheet-label">condition</span></div>
              <div className="iw-al-sheet-stat"><span className="iw-al-sheet-num">11/11</span><span className="iw-al-sheet-label">stages</span></div>
            </div>
          </div>
          <button className="iw-btn-ember iw-btn-wide" onClick={() => { sfxPlateClank(settings); setAct(4); }}>
            carry it forward
          </button>
        </div>
      )}

      {act === 4 && (
        <div className="iw-al-apo-torch iw-drop-in">
          <div className="iw-eyebrow" style={{ color: "#E9C46A" }}>return with the elixir</div>
          <p className="iw-al-mentor-line">
            “The revolution was never just yours. Somebody in your circle is
            still in the ordinary world, pretending familiar means fine.
            You know a door they haven't noticed. Knock — quietly.”
          </p>
          <p className="iw-al-mentor-line iw-al-final-line">
            “The Iron stays open. COMPLETE keeps rotating, the ladders keep
            rising. Endgame isn't an ending — it's maintenance on a kingdom.”
          </p>
          <button className="iw-btn-ember iw-btn-wide" onClick={onClose}>back to the iron — endless mode</button>
        </div>
      )}
    </div>
  );
}
