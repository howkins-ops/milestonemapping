import React from "react";

// ════════════════════════════════════════════════════════════════════════
// MAPQUEST WORLD — touch controls
// Two visible arrow buttons in the bottom corners plus invisible hold
// halves along the bottom of the scene. Pointer events only (same hold
// pattern as RideTheWave): down = press, up/cancel/leave = release.
// Keyboard users never need these — the engine listens to the window.
// ════════════════════════════════════════════════════════════════════════

export default function WorldControls({ controls, heldDir }) {
  const bind = (dir) => ({
    onPointerDown: (e) => {
      e.preventDefault();
      if (e.currentTarget.setPointerCapture && e.pointerId != null) {
        try {
          e.currentTarget.setPointerCapture(e.pointerId);
        } catch {
          /* no-op */
        }
      }
      controls.press(dir);
    },
    onPointerUp: () => controls.release(),
    onPointerCancel: () => controls.release(),
    onPointerLeave: () => controls.release(),
    onContextMenu: (e) => e.preventDefault(),
  });

  return (
    <>
      <button
        type="button"
        className="mqw-holdzone mqw-holdzone--left"
        aria-hidden="true"
        tabIndex={-1}
        {...bind(-1)}
      />
      <button
        type="button"
        className="mqw-holdzone mqw-holdzone--right"
        aria-hidden="true"
        tabIndex={-1}
        {...bind(1)}
      />
      <button
        type="button"
        className={`mqw-ctrl mqw-ctrl--left${heldDir === -1 ? " is-held" : ""}`}
        aria-label="Walk left"
        {...bind(-1)}
      >
        ◀
      </button>
      <button
        type="button"
        className={`mqw-ctrl mqw-ctrl--right${heldDir === 1 ? " is-held" : ""}`}
        aria-label="Walk right"
        {...bind(1)}
      >
        ▶
      </button>
    </>
  );
}
