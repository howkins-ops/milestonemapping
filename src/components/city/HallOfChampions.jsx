import React, { useEffect, useRef, useState } from "react";
import "../../styles/cityPlaza.css";

// ════════════════════════════════════════════════════════════════════════
// MAPQUEST CITY — Hall of Champions
// Full-sheet 7-day leaderboard for the citizen's circle. Celebration, not
// shame: only people who showed up are ranked. Top 3 stand on a neon podium
// (gold / silver / bronze, #1 raised at center), everyone else gets a ranked
// row with a consistency bar, streak and proof count. The current user's row
// carries a "YOU" chip. Escape and the scrim both close the sheet.
// Uses Agent A's .mqc-sheet primitives; all extensions here are .mqc-pl-*.
// ════════════════════════════════════════════════════════════════════════

function HallAvatar({ url, name, className }) {
  const [broken, setBroken] = useState(false);
  useEffect(() => {
    setBroken(false);
  }, [url]);
  const monogram = String(name || "?").trim().charAt(0).toUpperCase() || "?";
  if (url && !broken) {
    return (
      <img
        className={`mqc-pl-avatar ${className || ""}`}
        src={url}
        alt=""
        loading="lazy"
        onError={() => setBroken(true)}
      />
    );
  }
  return (
    <span
      className={`mqc-pl-avatar mqc-pl-avatar--mono ${className || ""}`}
      aria-hidden="true"
    >
      {monogram}
    </span>
  );
}

const PODIUM_MODS = ["mqc-pl-spot--gold", "mqc-pl-spot--silver", "mqc-pl-spot--bronze"];
const PODIUM_TITLES = ["Champion", "Second", "Third"];

function rowName(row) {
  return row.display_name || row.username || "someone";
}

function rowPct(row) {
  return Math.max(0, Math.min(100, Number(row.consistency_pct) || 0));
}

export default function HallOfChampions({ social, onClose }) {
  const sheetRef = useRef(null);

  // Escape closes the sheet.
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose && onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  // Lock the page behind the sheet and move focus into it.
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    if (sheetRef.current) sheetRef.current.focus({ preventScroll: true });
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  const online = !!(social && social.online);
  const rows = online && Array.isArray(social.leaderboard) ? social.leaderboard : [];
  const member = online ? social.member : null;

  const isMe = (row) => {
    if (!member || !row) return false;
    if (row.user_id && member.user_id && row.user_id === member.user_id) return true;
    if (
      row.username &&
      member.username &&
      String(row.username).toLowerCase() === String(member.username).toLowerCase()
    ) {
      return true;
    }
    return false;
  };

  const podium = rows.slice(0, 3);
  const rest = rows.slice(3);
  const empty = !online || rows.length === 0;

  return (
    <div
      className="mqc-scrim mqc-pl-hallscrim"
      role="presentation"
      onClick={() => onClose && onClose()}
    >
      <section
        ref={sheetRef}
        className="mqc-sheet mqc-pl-hall"
        role="dialog"
        aria-modal="true"
        aria-labelledby="mqc-pl-hall-title"
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
      >
        <span className="mqc-pl-hall__handle" aria-hidden="true" />

        <header className="mqc-pl-hall__head">
          <div className="mqc-pl-hall__titles">
            <h2 id="mqc-pl-hall-title" className="mqc-pl-hall__title">
              Hall of Champions
            </h2>
            <p className="mqc-pl-hall__sub">
              celebration, not shame — only those who showed up are ranked
            </p>
          </div>
          <button
            type="button"
            className="mqc-btn mqc-pl-hall__close"
            onClick={() => onClose && onClose()}
            aria-label="Close Hall of Champions"
          >
            ✕
          </button>
        </header>

        <div className="mqc-pl-hall__body">
          {empty ? (
            <div className="mqc-pl-empty">
              <span className="mqc-pl-empty__glyph" aria-hidden="true">
                🏛️
              </span>
              <p className="mqc-pl-empty__txt">
                The Hall lights up when your circle shows up.
              </p>
            </div>
          ) : (
            <>
              <span className="mqc-pl-hall__window">Last 7 days</span>

              {/* ── Podium: top 3 ─────────────────────────────────────── */}
              <ol className="mqc-pl-podium" role="list" aria-label="Top three champions">
                {podium.map((row, i) => {
                  const me = isMe(row);
                  const pct = rowPct(row);
                  const streak = Math.max(0, Number(row.zone_streak) || 0);
                  return (
                    <li
                      key={row.user_id || row.username || `podium-${i}`}
                      className={`mqc-pl-spot ${PODIUM_MODS[i]}${me ? " mqc-pl-spot--you" : ""}`}
                      aria-label={`${PODIUM_TITLES[i]}: ${rowName(row)}${me ? " (you)" : ""}, ${pct}% consistency, ${streak} day streak`}
                    >
                      {i === 0 ? (
                        <span className="mqc-pl-spot__crown" aria-hidden="true">
                          👑
                        </span>
                      ) : null}
                      <span className="mqc-pl-spot__aura">
                        <HallAvatar
                          url={row.avatar_url}
                          name={rowName(row)}
                          className="mqc-pl-spot__avatar"
                        />
                      </span>
                      <span className="mqc-pl-spot__name">{rowName(row)}</span>
                      {me ? <span className="mqc-pl-you">You</span> : null}
                      <span className="mqc-pl-spot__pct">{pct}%</span>
                      <span className="mqc-pl-spot__streak" aria-hidden="true">
                        🔥 {streak}
                      </span>
                      <span className="mqc-pl-spot__base" aria-hidden="true">
                        {i + 1}
                      </span>
                    </li>
                  );
                })}
              </ol>

              {/* ── Ranked rows: everyone after the podium ────────────── */}
              {rest.length > 0 ? (
                <ol className="mqc-pl-rows" role="list" aria-label="Ranked champions">
                  {rest.map((row, i) => {
                    const me = isMe(row);
                    const pct = rowPct(row);
                    const streak = Math.max(0, Number(row.zone_streak) || 0);
                    const proofs = Math.max(0, Number(row.proofs) || 0);
                    return (
                      <li
                        key={row.user_id || row.username || `row-${i}`}
                        className={`mqc-pl-row${me ? " mqc-pl-row--you" : ""}`}
                      >
                        <span className="mqc-pl-row__rank" aria-hidden="true">
                          {i + 4}
                        </span>
                        <HallAvatar
                          url={row.avatar_url}
                          name={rowName(row)}
                          className="mqc-pl-row__avatar"
                        />
                        <span className="mqc-pl-row__main">
                          <span className="mqc-pl-row__name">
                            {rowName(row)}
                            {me ? <span className="mqc-pl-you">You</span> : null}
                          </span>
                          <span
                            className="mqc-pl-bar"
                            role="img"
                            aria-label={`${pct}% consistency`}
                          >
                            <span
                              className="mqc-pl-bar__fill"
                              style={{ width: `${pct}%` }}
                            />
                          </span>
                        </span>
                        <span className="mqc-pl-row__stats">
                          <span className="mqc-pl-row__pct">{pct}%</span>
                          <span className="mqc-pl-row__meta">🔥 {streak}</span>
                          <span className="mqc-pl-row__meta">
                            {proofs} proof{proofs === 1 ? "" : "s"}
                          </span>
                        </span>
                      </li>
                    );
                  })}
                </ol>
              ) : null}

              <p className="mqc-pl-hall__oath">
                Every name here kept a promise this week.
              </p>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
