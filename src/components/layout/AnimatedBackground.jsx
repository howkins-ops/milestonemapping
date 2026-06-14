import React from "react";

export default function AnimatedBackground() {
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
        autoPlay
        loop
        muted
        playsInline
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
    </div>
  );
}
