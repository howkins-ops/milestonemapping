import React from "react";

export default function MapBackground({ imageUrl }) {
  return (
    <>
      <div className="trail-world__cosmos" aria-hidden="true" />
      <div className="trail-world__nebula" aria-hidden="true" />
      <div className="trail-world__hexgrid" aria-hidden="true" />
      <div className="trail-world__stars" aria-hidden="true" />
      {imageUrl && (
        <div className="trail-world__custom-bg" aria-hidden="true">
          <img
            src={imageUrl}
            alt=""
            onError={(e) => { e.currentTarget.parentElement.style.display = "none"; }}
          />
        </div>
      )}
    </>
  );
}
