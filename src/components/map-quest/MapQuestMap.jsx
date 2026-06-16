import React from "react";
import { QUEST_CHAPTERS } from "./questChapters.js";

function getChapterState(chapter, isChapterComplete) {
  const complete = isChapterComplete(chapter.key);
  const prereqComplete = !chapter.requires || isChapterComplete(chapter.requires);

  if (!chapter.available) return "coming";
  if (!prereqComplete) return "locked";
  if (complete) return "complete";
  return "ready";
}

function getActiveIndex(chapters) {
  const readyIndex = chapters.findIndex((chapter) => chapter.state === "ready");
  if (readyIndex >= 0) return readyIndex;
  const completeIndex = chapters.map((chapter) => chapter.state).lastIndexOf("complete");
  return Math.max(0, completeIndex);
}

export default function MapQuestMap({ isChapterComplete, onEnterChapter }) {
  const chapters = QUEST_CHAPTERS.map((chapter) => ({
    ...chapter,
    state: getChapterState(chapter, isChapterComplete),
  }));
  const activeIndex = getActiveIndex(chapters);
  const completeCount = chapters.filter((chapter) => chapter.state === "complete").length;
  const availableCount = chapters.filter((chapter) => chapter.available).length;

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

      <div className="mq-book__page">
        <svg className="mq-book__trail" viewBox="0 0 620 660" aria-hidden="true">
          <defs>
            <linearGradient id="questInk" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#00F0FF" />
              <stop offset="44%" stopColor="#8B5CF6" />
              <stop offset="100%" stopColor="#D11EFF" />
            </linearGradient>
            <filter id="questInkGlow">
              <feGaussianBlur stdDeviation="7" />
            </filter>
          </defs>
          <path
            className="mq-book__trail-glow"
            d="M150 106 C462 126, 474 242, 326 296 C178 350, 160 460, 292 504 C424 548, 432 606, 330 628"
          />
          <path
            className="mq-book__trail-line"
            d="M150 106 C462 126, 474 242, 326 296 C178 350, 160 460, 292 504 C424 548, 432 606, 330 628"
          />
        </svg>

        <div className="mq-book__nodes">
          {chapters.map((chapter, index) => (
            <ChapterSeal
              key={chapter.key}
              chapter={chapter}
              index={index}
              active={index === activeIndex}
              onEnter={() => onEnterChapter(chapter.key)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function ChapterSeal({ chapter, index, active, onEnter }) {
  const clickable = chapter.state === "ready" || chapter.state === "complete";
  const actionLabel = chapter.state === "complete" ? "Replay" : "Enter";
  const statusLabel =
    chapter.state === "locked" ? "Locked" :
    chapter.state === "coming" ? "Soon" :
    chapter.state === "complete" ? "Done" :
    "Start";

  return (
    <article className={`mq-seal mq-seal--${index + 1} is-${chapter.state} ${active ? "is-active" : ""}`}>
      <button
        type="button"
        className="mq-seal__card-art"
        onClick={clickable ? onEnter : undefined}
        disabled={!clickable}
        aria-label={`${actionLabel}: ${chapter.title}`}
      >
        <img src={chapter.cardImage} alt="" />
        <span>{chapter.state === "complete" ? "\u2713" : chapter.number}</span>
      </button>

      <div className="mq-seal__label">
        <h3>{chapter.title}</h3>
        {active && <p>{chapter.subtitle}</p>}
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
