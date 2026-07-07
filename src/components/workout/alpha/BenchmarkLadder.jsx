import React from "react";
import { ladderLifts } from "./engine/ladder.js";

/* ALPHA MODE — benchmark ladders.
   Numeric rungs per lift, fed straight from the PR wall. A goal you
   can point at: not "get stronger" — the next number on the pole. */

export default function BenchmarkLadder({ prs }) {
  const lifts = ladderLifts(prs);
  return (
    <div className="iw-al-ladders">
      <div className="iw-eyebrow">fixed rungs · no vague goals</div>
      <h2 className="iw-display iw-page-title">Benchmark Ladders</h2>
      {lifts.length === 0 && (
        <div className="iw-empty">ladders grow from the PR wall — rack a weighted lift and the first pole rises</div>
      )}
      <div className="iw-stack">
        {lifts.map((l) => (
          <div key={l.lift} className="iw-al-ladder">
            <div className="iw-al-card-head">
              <span className="iw-al-ladder-lift">{l.lift}</span>
              <span className="iw-al-ladder-best">{l.best} lbs</span>
            </div>
            <div className="iw-al-ladder-rungs">
              {l.rungs.map((r) => {
                const hit = r <= l.best;
                const next = r === l.next;
                return (
                  <div key={r} className={`iw-al-rung ${hit ? "iw-al-rung-hit" : ""} ${next ? "iw-al-rung-next" : ""}`}>
                    <span className="iw-al-rung-num">{r}</span>
                    {next && <span className="iw-al-rung-tag">next</span>}
                  </div>
                );
              })}
            </div>
            {l.next && (
              <div className="iw-al-fastline">{l.next - l.best} lbs between you and the next rung</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
