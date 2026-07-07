import React from "react";
import useAutoPlayVideo from "../../hooks/useAutoPlayVideo";
import { useAppData } from "../../hooks/useAppData.js";

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Deterministic ember field — stable across re-renders, no layout thrash.
// Warm phoenix embers low in the mix, cool cyan sparks as accents.
const EMBERS = [
  { x: "6%",  s: 3, dur: 17, delay: 0,    dx: "26px",  c: "rgba(255, 176, 0, 0.85)",  o: 0.55 },
  { x: "14%", s: 2, dur: 21, delay: -6,   dx: "-18px", c: "rgba(255, 62, 219, 0.75)", o: 0.4 },
  { x: "23%", s: 4, dur: 15, delay: -11,  dx: "34px",  c: "rgba(255, 140, 40, 0.9)",  o: 0.6 },
  { x: "32%", s: 2, dur: 24, delay: -3,   dx: "-24px", c: "rgba(0, 240, 255, 0.7)",   o: 0.35 },
  { x: "41%", s: 3, dur: 18, delay: -14,  dx: "20px",  c: "rgba(255, 176, 0, 0.8)",   o: 0.5 },
  { x: "52%", s: 2, dur: 26, delay: -8,   dx: "-30px", c: "rgba(209, 30, 255, 0.7)",  o: 0.38 },
  { x: "61%", s: 4, dur: 16, delay: -2,   dx: "28px",  c: "rgba(255, 120, 30, 0.9)",  o: 0.62 },
  { x: "70%", s: 2, dur: 22, delay: -17,  dx: "-16px", c: "rgba(0, 240, 255, 0.65)",  o: 0.32 },
  { x: "78%", s: 3, dur: 19, delay: -5,   dx: "22px",  c: "rgba(255, 176, 0, 0.85)",  o: 0.52 },
  { x: "86%", s: 2, dur: 25, delay: -12,  dx: "-26px", c: "rgba(255, 62, 219, 0.7)",  o: 0.36 },
  { x: "93%", s: 3, dur: 17, delay: -9,   dx: "18px",  c: "rgba(255, 150, 50, 0.85)", o: 0.55 },
  { x: "47%", s: 2, dur: 28, delay: -20,  dx: "30px",  c: "rgba(123, 44, 255, 0.75)", o: 0.4 },
];

export default function AnimatedBackground() {
  const videoRef = useAutoPlayVideo();
  const { settings } = useAppData();
  const still = settings?.reducedMotion || prefersReducedMotion();

  // Reduced motion: static poster, no looping video, no ember animation.
  if (still) {
    return (
      <div
        style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none", overflow: "hidden" }}
        aria-hidden="true"
      >
        <img
          src="/bg-loop-poster.jpg"
          alt=""
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: 0.75 }}
        />
        <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.45)" }} />
      </div>
    );
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        pointerEvents: "none",
        overflow: "hidden"
      }}
      aria-hidden="true"
    >
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        poster="/bg-loop-poster.jpg"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          opacity: 0.75
        }}
      >
        <source src="/bg-loop.mp4" type="video/mp4" />
      </video>

      {/* dark overlay to keep text readable */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(0,0,0,0.45)"
        }}
      />

      {/* living atmosphere: drifting light rays + rising embers + depth vignette */}
      <div className="ambient-fx">
        <div className="ambient-fx__ray" style={{ left: "8%" }} />
        <div className="ambient-fx__ray ambient-fx__ray--b" style={{ left: "58%" }} />
        {EMBERS.map((e, i) => (
          <span
            key={i}
            className="ambient-fx__ember"
            style={{
              "--x": e.x,
              "--s": `${e.s}px`,
              "--dur": `${e.dur}s`,
              "--delay": `${e.delay}s`,
              "--dx": e.dx,
              "--c": e.c,
              "--o": e.o
            }}
          />
        ))}
        <div className="ambient-fx__vignette" />
      </div>
    </div>
  );
}
