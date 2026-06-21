import React from "react";
import useAutoPlayVideo from "../../hooks/useAutoPlayVideo";

export default function AnimatedBackground() {
  const videoRef = useAutoPlayVideo();

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
    </div>
  );
}
