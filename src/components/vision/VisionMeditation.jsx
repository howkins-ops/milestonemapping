import React, { useEffect, useMemo, useRef, useState } from "react";
import ParticleCanvas from "../training/ParticleCanvas.jsx";
import { useAppData } from "../../hooks/useAppData.js";
import { playSound } from "../../lib/sounds.js";
import { createLineAudio, playLine, stopNarration } from "../../lib/voiceOver.js";
import { VISION_MEDITATION_LINES, visionLineAudio } from "../../data/visionMeditationScript.js";

// How long each guided line lingers on screen (ms). Generous so the voice
// has time to play and the breath can complete.
const LINE_MS = 8500;
const SLIDE_MS = 6200;

// Streamed Pollinations voice used ONLY as a fallback if a pre-baked line fails to load.
const FALLBACK_VOICE = "shimmer";

export default function VisionMeditation({ images = [], projectTitle = "", onClose }) {
  const { settings } = useAppData();
  const reduced = Boolean(settings?.reducedMotion);

  const script = VISION_MEDITATION_LINES;
  const pics = useMemo(() => images.filter(Boolean), [images]);

  const [stage, setStage] = useState("intro"); // intro | playing | paused | complete
  const [lineIndex, setLineIndex] = useState(0);
  const [imgIndex, setImgIndex] = useState(0);

  const audiosRef = useRef([]);

  // Build the preloaded audio lazily — only when narration actually starts —
  // so the <audio> elements (and any fallback TTS requests) aren't created
  // until the user taps Begin.
  const buildAudio = () => {
    stopNarration(audiosRef.current);
    // Pre-baked ElevenLabs mp3 per line; streamed Pollinations voice is the fallback.
    audiosRef.current = script.map((l) =>
      createLineAudio(l.text, FALLBACK_VOICE, visionLineAudio(l.id))
    );
  };

  // Stop any narration when the meditation closes / unmounts.
  useEffect(() => () => stopNarration(audiosRef.current), []);

  const playing = stage === "playing";
  const line = script[lineIndex];
  const phase = stage === "complete" ? "hold" : line?.breath || "inhale";

  // Drive the guided sequence: speak the current line, cue the breath, and
  // advance after LINE_MS. Cleanup stops narration so pause/close is instant.
  useEffect(() => {
    if (!playing) return undefined;
    playLine(audiosRef.current[lineIndex], script[lineIndex].text, settings);
    playSound(
      line.breath === "inhale" ? "breatheIn" : line.breath === "exhale" ? "breatheOut" : "breatheHold",
      settings
    );
    const t = window.setTimeout(() => {
      if (lineIndex < script.length - 1) {
        setLineIndex((i) => i + 1);
      } else {
        setStage("complete");
      }
    }, LINE_MS);
    return () => {
      window.clearTimeout(t);
      stopNarration(audiosRef.current);
    };
  }, [playing, lineIndex]); // eslint-disable-line react-hooks/exhaustive-deps

  // Slow Ken-Burns slideshow of the vision images while playing.
  useEffect(() => {
    if (!playing || reduced || pics.length < 2) return undefined;
    const t = window.setInterval(() => setImgIndex((i) => (i + 1) % pics.length), SLIDE_MS);
    return () => window.clearInterval(t);
  }, [playing, reduced, pics.length]);

  // Esc closes.
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const begin = () => {
    buildAudio();
    setLineIndex(0);
    setImgIndex(0);
    setStage("playing");
  };
  const togglePause = () => setStage((s) => (s === "playing" ? "paused" : "playing"));
  const replay = () => {
    buildAudio();
    setLineIndex(0);
    setImgIndex(0);
    setStage("playing");
  };

  const currentPic = pics.length ? pics[imgIndex % pics.length] : null;

  return (
    <div className="vision-med" role="dialog" aria-modal="true" aria-label="Vision meditation">
      {/* Ambient particle backdrop */}
      {!reduced && (
        <div className="vision-med__particles" aria-hidden="true">
          <ParticleCanvas theme="cosmic" color="#7B2CFF" />
        </div>
      )}

      {/* Vision image slideshow */}
      <div className="vision-med__stage" aria-hidden="true">
        {currentPic ? (
          <img
            key={currentPic + imgIndex}
            src={currentPic}
            alt=""
            className={`vision-med__img${reduced ? "" : " is-kenburns"}`}
          />
        ) : (
          <div className="vision-med__gradient" />
        )}
        <div className="vision-med__vignette" />
      </div>

      {/* Breathing orb */}
      <div className={`vision-med__orb vision-med__orb--${phase}`} data-reduced={reduced} aria-hidden="true">
        <span className="vision-med__orb-core" />
      </div>

      {/* Close */}
      <button className="vision-med__close" onClick={onClose} aria-label="Close meditation">✕</button>

      {/* Content layers per stage */}
      {stage === "intro" && (
        <div className="vision-med__panel">
          <p className="vision-med__kicker">Guided Visualization</p>
          <h2 className="vision-med__heading">
            {projectTitle ? `See ${projectTitle} already real` : "See your vision already real"}
          </h2>
          <p className="vision-med__sub">
            A two-minute guided meditation. Find a quiet seat, turn your sound up, and let the voice lead.
          </p>

          <p className="vision-med__sub" style={{ opacity: 0.72, fontSize: "0.85rem", marginTop: "-0.25rem" }}>
            🔊 Narrated by Lily — a soft, velvety British voice
          </p>

          <button className="vision-med__begin" onClick={begin}>▶ Begin</button>
          {settings?.soundEnabled === false && (
            <p className="vision-med__note">Sound is off in Settings — turn it on to hear the voice.</p>
          )}
        </div>
      )}

      {(stage === "playing" || stage === "paused") && (
        <div className="vision-med__line-wrap">
          <p key={lineIndex} className="vision-med__line">{line.text}</p>
          <div className="vision-med__phase">{phase === "inhale" ? "Breathe in" : phase === "exhale" ? "Breathe out" : "Hold"}</div>
          <div className="vision-med__controls">
            <button className="vision-med__ctrl" onClick={togglePause}>
              {stage === "playing" ? "❚❚ Pause" : "▶ Resume"}
            </button>
            <div className="vision-med__progress" aria-hidden="true">
              {script.map((_, i) => (
                <span key={i} className={i <= lineIndex ? "is-lit" : ""} />
              ))}
            </div>
          </div>
        </div>
      )}

      {stage === "complete" && (
        <div className="vision-med__panel">
          <p className="vision-med__kicker">Visualization complete</p>
          <h2 className="vision-med__heading">Carry it with you.</h2>
          <p className="vision-med__sub">You just rehearsed your future. Now go take one small step toward it.</p>
          <div className="vision-med__done-actions">
            <button className="vision-med__ctrl" onClick={replay}>↻ Replay</button>
            <button className="vision-med__begin" onClick={onClose}>Done</button>
          </div>
        </div>
      )}
    </div>
  );
}
