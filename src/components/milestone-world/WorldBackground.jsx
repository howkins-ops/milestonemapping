import React from "react";

export default function WorldBackground({ bgUrl }) {
  return (
    <div
      className="rpg-world__bg"
      style={{ backgroundImage: `url(${bgUrl})` }}
    />
  );
}
