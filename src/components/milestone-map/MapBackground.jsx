import React from "react";

export default function MapBackground({ bgUrl }) {
  return (
    <>
      <div
        key={bgUrl}
        className="trail-world__image"
        aria-hidden="true"
        style={{ backgroundImage: `url(${bgUrl})` }}
      />
      <div className="trail-world__vignette" aria-hidden="true" />
      <div className="trail-world__stars" aria-hidden="true" />
    </>
  );
}
