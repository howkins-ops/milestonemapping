import React from "react";

const BLOCK_ART = {
  circuit: "/assets/iron/icons/block-circuit.png",
  density: "/assets/iron/icons/block-density.png",
  straight: "/assets/iron/icons/block-straight.png",
  tempo: "/assets/iron/icons/block-tempo.png",
  totalreps: "/assets/iron/icons/block-totalreps.png",
};

export default function BlockArt({ kind, className = "", label = "" }) {
  const src = BLOCK_ART[kind];
  if (!src) return null;

  return (
    <span className={`iw-block-art ${className}`} aria-hidden={label ? undefined : "true"}>
      <img src={src} alt={label} loading="lazy" />
    </span>
  );
}
