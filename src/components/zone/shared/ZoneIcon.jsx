import React from "react";

export default function ZoneIcon({ src, name, className = "", alt = "" }) {
  const path = src || (name ? `/assets/zone/icons/${name}.svg` : "");
  if (!path) return null;

  return (
    <img
      className={`zn-icon-img${className ? ` ${className}` : ""}`}
      src={path}
      alt={alt}
      aria-hidden={alt ? undefined : "true"}
      draggable="false"
    />
  );
}
