import React from "react";
import { QUEST_CHAPTERS, prevAvailableKey } from "./questChapters.js";

// ── Data-driven layout ──────────────────────────────────────────────────────
// Nodes alternate left/right down a tall, scrollable "book"; the neon trail is
// generated through the node positions. Works for any number of chapters.
const ROW = 150;        // vertical px between node centers
const PAD_TOP = 70;     // px above the first node
const PAD_BOTTOM = 200; // px below the last node (room for its label)
const X_LEFT = 24;      // trail x for left nodes  (0..100 space)
const X_RIGHT = 76;     // trail x for right nodes (0..100 space)

function getChapterState(chapter, isChapterComplete) {
  if (!chapter.available) return "coming";
  const prevKey = prevAvailableKey(chapter.key);
  const prereqComplete = !prevKey || isChapterComplete(prevKey);
  if (!prereqComplete) return "locked";
  if (isChapterComplete(chapter.key)) return "complete";
  return "ready";
}

function getActiveIndex(chapters) {
  const readyIndex = chapters.findIndex((c) => c.state === "ready");
  if (readyIndex >= 0) return readyIndex;
  const lastComplete = chapters.map((c) => c.state).lastIndexOf("complete");
  return Math.max(0, lastComplete);
}

// Build a smooth serpentine path through the node centers (S-curves).
function buildTrail(points) {
  if (!points.length) return "";
  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    const p0 = points[i - 1];
    const p1 = points[i];
    const ym = (p0.y + p1.y) / 2;
    d += ` C ${p0.x} ${ym}, ${p1.x} ${ym}, ${p1.x} ${p1.y}`;
  }
  return d;
}

export default function MapQuestMap({ isChapterComplete, onEnterChapter }) {
  const chapters = QUEST_CHAPTERS.map((chapter, index) => {
    const side = index % 2 === 0 ? "left" : "right";
    const top = PAD_TOP + index * ROW;
    return {
      ...chapter,
      state: getChapterState(chapter, isChapterComplete),
      side,
      top,
      trailX: side === "left" ? X_LEFT : X_RIGHT,
      trailY: top + 56,
    };
  });

  const activeIndex = getActiveIndex(chapters);
  const completeCount = chapters.filter((c) => c.state === "complete").length;
  const availableCount = chapters.filter((c) => c.available).length;
  const pageHeight = PAD_TOP + (chapters.length - 1) * ROW + PAD_BOTTOM;
  const trailD = buildTrail(chapters.map((c) => ({ x: c.trailX, y: c.trailY })));

  return (
    <section className="mq-book" aria-label="Alchemist quest book map">
      <header className="mq-book__header">
        <div>
          <span>Quest Book</span>
          <h2>The Alchemist Path</h2>
        </div>
        <strong aria-label={`${completeCount} of ${availableCount} chapters complete`}>
          {completeCount}/{availableCount}
        </strong>
      </header>

      <div className="mq-book__page" style={{ height: `${pageHeight}px`, maxWidth: "720px" }}>
        <svg
          className="mq-book__trail"
          viewBox={`0 0 100 ${pageHeight}`}
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="questInk" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#00F0FF" />
              <stop offset="50%" stopColor="#7B2CFF" />
              <stop offset="100%" stopColor="#D11EFF" />
            </linearGradient>
            <filter id="questInkGlow">
              <feGaussianBlur stdDeviation="2" />
            </filter>
          </defs>
          <path className="mq-book__trail-glow" d={trailD} vectorEffect="non-scaling-stroke" />
          <path className="mq-book__trail-line" d={trailD} vectorEffect="non-scaling-stroke" />
        </svg>

        <div className="mq-book__nodes">
          {chapters.map((chapter, index) => (
            <ChapterSeal
              key={chapter.key}
              chapter={chapter}
              active={index === activeIndex}
              onEnter={() => onEnterChapter(chapter.key)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function ChapterSeal({ chapter, active, onEnter }) {
  const clickable = chapter.state === "ready" || chapter.state === "complete";
  const actionLabel = chapter.state === "complete" ? "Replay" : "Enter";
  const statusLabel =
    chapter.state === "locked" ? "Locked" :
    chapter.state === "coming" ? "Soon" :
    chapter.state === "complete" ? "Done" :
    "Start";
  const badge = chapter.state === "complete" ? "✓" : chapter.number;

  return (
    <article
      className={`mq-seal is-${chapter.side} is-${chapter.state} ${active ? "is-active" : ""}`}
      style={{ top: `${chapter.top}px`, [chapter.side]: "24px" }}
    >
      {chapter.cardImage ? (
        <button
          type="button"
          className="mq-seal__card-art"
          onClick={clickable ? onEnter : undefined}
          disabled={!clickable}
          aria-label={`${actionLabel}: ${chapter.title}`}
        >
          <img src={chapter.cardImage} alt="" />
          <span>{badge}</span>
        </button>
      ) : (
        <button
          type="button"
          className="mq-seal__stone"
          onClick={clickable ? onEnter : undefined}
          disabled={!clickable}
          aria-label={`${actionLabel}: ${chapter.title}`}
        >
          <span>{badge}</span>
        </button>
      )}

      <div className="mq-seal__label">
        <h3>{chapter.title}</h3>
        {active && chapter.subtitle && <p>{chapter.subtitle}</p>}
        {clickable ? (
          <button type="button" onClick={onEnter}>
            {actionLabel}
          </button>
        ) : (
          <em>{statusLabel}</em>
        )}
      </div>
    </article>
  );
}
