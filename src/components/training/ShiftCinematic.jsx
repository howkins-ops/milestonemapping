import React, { useState, useEffect, useCallback, useRef } from "react";
import ParticleCanvas from "./ParticleCanvas.jsx";
import CinematicScene from "./CinematicScene.jsx";

const SHIFT_THEMES = {
  intro: "cosmic",
  shift1: "crystal",
  shift2: "neural",
  shift3: "shadow",
  shift4: "lightning"
};

const THEME_BACKGROUNDS = {
  cosmic: "radial-gradient(ellipse at 50% 35%, #150025 0%, #0a0010 55%, #0d001a 100%)",
  crystal: "radial-gradient(ellipse at 50% 35%, #001a20 0%, #000e14 100%)",
  neural: "radial-gradient(ellipse at 50% 35%, #001a12 0%, #000d0a 100%)",
  shadow: "radial-gradient(ellipse at 50% 35%, #100020 0%, #08000f 100%)",
  lightning: "radial-gradient(ellipse at 50% 35%, #1a1200 0%, #0f0a00 100%)"
};

function hexToRgba(hex, alpha) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

export default function ShiftCinematic({ module, onComplete }) {
  const [index, setIndex] = useState(0);
  const [timerKey, setTimerKey] = useState(0);
  const [paused, setPaused] = useState(false);
  const longPressRef = useRef(null);

  const scenes = module.scenes || [];
  const total = scenes.length;
  const currentScene = scenes[index];
  const duration = currentScene?.duration || 5;

  const theme = SHIFT_THEMES[module.id] || "cosmic";
  const bg = THEME_BACKGROUNDS[theme] || THEME_BACKGROUNDS.cosmic;

  const advance = useCallback(() => {
    setIndex(i => {
      const next = i + 1;
      if (next >= total) {
        onComplete();
        return i;
      }
      setTimerKey(k => k + 1);
      return next;
    });
  }, [total, onComplete]);

  const goBack = useCallback(() => {
    setIndex(i => Math.max(0, i - 1));
    setTimerKey(k => k + 1);
  }, []);

  // Auto-advance
  useEffect(() => {
    if (paused) return;
    const id = setTimeout(advance, duration * 1000);
    return () => clearTimeout(id);
  }, [index, advance, paused, duration]);

  const fireRipple = (clientX, clientY) => {
    const ripple = document.createElement("div");
    ripple.className = "tap-ripple";
    ripple.style.cssText = `
      position: fixed;
      left: ${clientX - 30}px;
      top: ${clientY - 30}px;
      width: 60px;
      height: 60px;
      border-radius: 50%;
      border: 2px solid ${module.color};
      pointer-events: none;
      z-index: 99999;
      animation: tap-ripple 0.55s ease-out forwards;
    `;
    document.body.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
  };

  const handleClick = (e) => {
    fireRipple(e.clientX, e.clientY);

    // Back zone: left 15%
    if (e.clientX < window.innerWidth * 0.15 && index > 0) {
      goBack();
      return;
    }

    if (index >= total - 1) {
      onComplete();
    } else {
      setTimerKey(k => k + 1);
      setIndex(i => i + 1);
    }
  };

  const handlePointerDown = () => {
    longPressRef.current = setTimeout(() => setPaused(true), 500);
  };

  const handlePointerUp = () => {
    if (longPressRef.current) {
      clearTimeout(longPressRef.current);
      longPressRef.current = null;
    }
    setPaused(false);
  };

  if (!currentScene) return null;

  return (
    <div
      className="cinematic-overlay"
      style={{
        background: bg,
        "--shift-color": module.color,
        "--shift-color-glow": hexToRgba(module.color, 0.4),
        "--shift-color-dim": hexToRgba(module.color, 0.15)
      }}
    >
      {/* Ambient particles — absolute, z-index 0 */}
      <ParticleCanvas theme={theme} color={module.color} />

      {/* Header strip */}
      <div style={{
        position: "relative",
        zIndex: 2,
        padding: "10px 20px 8px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexShrink: 0
      }}>
        <span style={{
          fontFamily: "var(--font-mono)",
          fontSize: 11,
          textTransform: "uppercase",
          letterSpacing: "0.1em",
          color: module.color
        }}>
          {module.label} — {module.title}
        </span>
        <button
          onClick={onComplete}
          style={{
            background: "transparent",
            border: "none",
            color: "rgba(234,251,255,0.4)",
            fontFamily: "var(--font-body)",
            fontSize: 13,
            cursor: "pointer",
            padding: "4px 8px",
            letterSpacing: "0.04em",
            position: "relative",
            zIndex: 3
          }}
        >
          Skip →
        </button>
      </div>

      {/* Timer bar */}
      <div className="cinematic-timer-bar" style={{ position: "relative", zIndex: 2 }}>
        <div
          key={timerKey}
          className="cinematic-timer-fill"
          style={{
            background: `linear-gradient(90deg, ${module.color}, ${module.color}88)`,
            animationDuration: `${duration}s`
          }}
        />
      </div>

      {/* Scene content — tap zone */}
      <div
        style={{
          flex: 1,
          position: "relative",
          zIndex: 1,
          overflow: "hidden",
          cursor: "pointer",
          WebkitTapHighlightColor: "transparent"
        }}
        onClick={handleClick}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      >
        <CinematicScene
          key={`${module.id}-${index}`}
          scene={currentScene}
          shiftColor={module.color}
        />

        {/* Pause indicator */}
        {paused && (
          <div style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(0,0,0,0.4)",
            zIndex: 10,
            pointerEvents: "none"
          }}>
            <div style={{
              fontFamily: "var(--font-mono)",
              fontSize: 13,
              color: module.color,
              letterSpacing: "0.15em",
              textTransform: "uppercase"
            }}>
              ⏸ Paused
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="cinematic-footer" style={{ position: "relative", zIndex: 2 }}>
        <span style={{
          fontFamily: "var(--font-mono)",
          fontSize: 12,
          color: "rgba(234,251,255,0.35)"
        }}>
          {index + 1} / {total}
        </span>
        <span style={{
          fontFamily: "var(--font-body)",
          fontSize: 11,
          color: "rgba(234,251,255,0.25)"
        }}>
          Tap to advance
        </span>
        {/* Dot indicators */}
        <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
          {scenes.map((_, i) => (
            <div
              key={i}
              style={{
                width: i === index ? 16 : 4,
                height: 4,
                borderRadius: 2,
                background: i === index ? module.color : "rgba(255,255,255,0.12)",
                transition: "all 0.3s cubic-bezier(0.16,1,0.3,1)"
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
