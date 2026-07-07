import React from "react";

/* ALPHA MODE — the A/B/C/D four-act bar (SURGE sessions).
   Bookend → grind → grind → light closer. */

const ACT_LABELS = { A: "bookend", B: "the grind", C: "the grind II", D: "closer" };

export default function SegmentTracker({ blocks, currentKey, accent }) {
  return (
    <div className="iw-al-segments" style={accent ? { "--iw-al-accent": accent } : undefined}>
      {blocks.map((b) => {
        const idx = blocks.indexOf(b);
        const curIdx = blocks.findIndex((x) => x.key === currentKey);
        const state = idx < curIdx ? "done" : idx === curIdx ? "now" : "next";
        return (
          <div key={b.key} className={`iw-al-seg iw-al-seg-${state}`}>
            <span className="iw-al-seg-key">{b.key}</span>
            <span className="iw-al-seg-label">{ACT_LABELS[b.key] || b.kind}</span>
          </div>
        );
      })}
    </div>
  );
}
