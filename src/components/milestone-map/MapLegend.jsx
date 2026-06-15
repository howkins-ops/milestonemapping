import React from "react";

export default function MapLegend() {
  return (
    <aside className="trail-world__panel trail-world__panel--right" aria-label="Map legend">
      <span className="trail-world__panel-title">MAP LEGEND</span>
      <div className="trail-world__legend-row"><i className="is-completed" /> Completed</div>
      <div className="trail-world__legend-row"><i className="is-in_progress" /> Active</div>
      <div className="trail-world__legend-row"><i className="is-active" /> Next Up</div>
      <div className="trail-world__legend-row"><i className="is-locked" /> Locked</div>
      <div className="trail-world__legend-row"><i className="is-treasure" /> Treasure</div>
      <div className="trail-world__legend-row"><i className="is-phoenix" /> Phoenix Shrine</div>
    </aside>
  );
}
