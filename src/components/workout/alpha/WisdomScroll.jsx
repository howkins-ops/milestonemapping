import React from "react";
import { SCROLLS } from "./data/scrolls.js";

/* ALPHA MODE — Wisdom Scrolls: the single unfurl card + the shelf. */

export function ScrollCard({ scroll, unfurl = false }) {
  if (!scroll) return null;
  return (
    <div className={`iw-al-scroll ${unfurl ? "iw-al-scroll-unfurl" : ""}`}>
      <div className="iw-eyebrow">wisdom scroll</div>
      <div className="iw-al-scroll-line">“{scroll.line}”</div>
      <div className="iw-al-scroll-voice">— {scroll.voice}</div>
    </div>
  );
}

export default function ScrollShelf({ alpha }) {
  const collected = new Set(alpha.state.flags.scrolls || []);
  return (
    <div className="iw-al-scrollshelf">
      <div className="iw-eyebrow">the shelf</div>
      <h2 className="iw-display iw-page-title">Wisdom Scrolls</h2>
      <div className="iw-al-shelf-count">{collected.size} of {SCROLLS.length} collected</div>
      <div className="iw-stack">
        {SCROLLS.map((s) => {
          const got = collected.has(s.id);
          return got ? (
            <div key={s.id} className="iw-al-scroll">
              <div className="iw-al-scroll-line">“{s.line}”</div>
              <div className="iw-al-scroll-voice">— {s.voice}</div>
            </div>
          ) : (
            <div key={s.id} className="iw-al-scroll iw-al-scroll-locked">
              <div className="iw-al-scroll-line">· · ·</div>
              <div className="iw-al-scroll-voice">unlocks by {s.unlock}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
