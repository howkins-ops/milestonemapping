// Boss Forge — the squad's weekly co-op boss (Köhler effect). Every squadmate's
// real check-in chips the boss down; a quiet day just lets it breathe (never a
// shame wall). HP is DERIVED server-side (az_arena_boss_state) — the client only
// reads it. Slaying it together is the full-screen win.
//
// Ownership: this file + BossForge.css only. All game data flows through
// arenaService.js; all witness/notification copy through witnessLines.js.

import { useCallback, useEffect, useRef, useState } from "react";
import { useZoneCtx } from "../../../../hooks/useZone.js";
import { useAppData } from "../../../../hooks/useAppData.js";
import { bossState } from "../../../../lib/arenaService.js";
import { useReveal, useArenaBurst } from "../useArenaFX.js";
import { witnessSay } from "../../witness/witnessLines.js";
import { sfxPhoenix, sfxImpact, sfxWhoosh } from "../../../../lib/sfx.js";
import "./BossForge.css";

// Cosmetic only — maps a server boss_key to a face + name. Unknown keys fall
// back to the tyrant so the screen never breaks on new server content.
const BOSS_ART = {
  procrastigon: { face: "🦥", name: "The Procrastigon" },
  doubt_wraith: { face: "👻", name: "The Doubt Wraith" },
  excuse_hydra: { face: "🐉", name: "The Excuse Hydra" },
  comfort_blob: { face: "🫠", name: "The Comfort Blob" },
  inner_tyrant: { face: "👹", name: "The Inner Tyrant" },
};
const bossArt = (key) => BOSS_ART[key] || BOSS_ART.inner_tyrant;

const todaySeed = () => new Date().toISOString().slice(0, 10);

// Local fallback for "time left in the week" — week resets Monday 00:00 local.
function weekTimeLeft() {
  const now = new Date();
  const end = new Date(now);
  const daysToMonday = (8 - now.getDay()) % 7 || 7; // Sun=0 → 1, Mon=1 → 7
  end.setDate(now.getDate() + daysToMonday);
  end.setHours(0, 0, 0, 0);
  const ms = Math.max(0, end - now);
  const days = Math.floor(ms / 86400000);
  const hrs = Math.floor((ms % 86400000) / 3600000);
  const mins = Math.floor((ms % 3600000) / 60000);
  if (days > 0) return `${days}d ${hrs}h left`;
  if (hrs > 0) return `${hrs}h ${mins}m left`;
  return `${mins}m left`;
}

export default function BossForge({ go }) {
  const { member, fire, squads = [] } = useZoneCtx();
  const { celebrate, pushToast } = useAppData();
  const reveal = useReveal();
  const burst = useArenaBurst();

  const squad = squads[0] || null;
  const squadId = squad?.id || squad?.squad_id || null;

  const [boss, setBoss] = useState(null);
  const [status, setStatus] = useState("loading"); // loading | ready | offline | nosquad | error
  const [timeLeft, setTimeLeft] = useState(weekTimeLeft());
  const slainCelebrated = useRef(false);
  const aliveRef = useRef(true);

  const squadName = squad?.name || "your squad";
  const myName = member?.username ? `@${member.username}` : "You";

  const load = useCallback(async () => {
    if (!squadId) {
      setStatus("nosquad");
      return;
    }
    try {
      const res = await bossState({ squadId });
      if (!aliveRef.current) return;
      if (res && res.offline) {
        setStatus("offline");
        return;
      }
      setBoss(res || null);
      setStatus("ready");
    } catch {
      if (aliveRef.current) setStatus("error");
    }
  }, [squadId]);

  useEffect(() => {
    aliveRef.current = true;
    load();
    return () => {
      aliveRef.current = false;
    };
  }, [load]);

  // Slow, cheap 60s clock for the week countdown (no per-frame work).
  useEffect(() => {
    const t = setInterval(() => setTimeLeft(weekTimeLeft()), 60000);
    return () => clearInterval(t);
  }, []);

  const maxHp = Math.max(1, Number(boss?.max_hp) || 1);
  const hp = Math.max(0, Math.min(maxHp, Number(boss?.hp ?? maxHp)));
  const damageDone = Number(boss?.damage_done ?? maxHp - hp);
  const hpPct = Math.round((hp / maxHp) * 100);
  const isSlain = Boolean(boss?.defeated_at) || (status === "ready" && hp <= 0);
  const contributors = Array.isArray(boss?.contributors) ? boss.contributors : [];
  const art = bossArt(boss?.boss_key);

  // Fire-slain celebration exactly once when the squad brings it down.
  useEffect(() => {
    if (isSlain && status === "ready" && !slainCelebrated.current) {
      slainCelebrated.current = true;
      try {
        sfxPhoenix();
      } catch {
        /* audio never blocks */
      }
      const line = witnessSay("boss_slain", { squad: squadName, today: todaySeed() }).line;
      celebrate?.({
        variant: "reward",
        title: "BOSS DOWN",
        subtitle: `${squadName} took it together — nobody carried this one alone.`,
        detail: line,
      });
    }
  }, [isSlain, status, squadName, celebrate]);

  // Tapping the boss is pure FX + a nudge toward the real hit (a check-in).
  // It NEVER changes HP — damage is server-derived from logged proofs only.
  const pokeBoss = useCallback(
    (e) => {
      if (isSlain) return;
      try {
        sfxImpact(1);
      } catch {
        /* noop */
      }
      const x = e?.clientX ?? window.innerWidth / 2;
      const y = e?.clientY ?? window.innerHeight / 2;
      burst(x, y, "#FF3B5C");
    },
    [burst, isSlain]
  );

  const goCheckIn = useCallback(() => {
    try {
      sfxWhoosh();
    } catch {
      /* noop */
    }
    pushToast?.({
      type: "info",
      title: "Land the real hit",
      message: "Post today's proof — that's the strike that damages the boss.",
    });
    go?.("home");
  }, [go, pushToast]);

  // Neutral, shame-free line under the meter (research: quiet days = ash, never
  // shame). Copy always resolves through witnessLines.js.
  const witnessLine =
    status === "ready"
      ? isSlain
        ? witnessSay("boss_slain", { squad: squadName, today: todaySeed() }).line
        : damageDone > 0
        ? witnessSay("boss_hit", { name: myName, squad: squadName, today: todaySeed() }).line
        : `${squadName}'s boss is at full strength. One check-in lands the first hit.`
      : "";

  return (
    <div className="boss-wrap" ref={reveal}>
      <button type="button" className="zn-back boss-back" onClick={() => go?.("squad")}>
        ← Squad
      </button>

      <header className="boss-head arena-reveal">
        <p className="zn-eyebrow">Boss Forge · Co-op</p>
        <h2 className="boss-title">The weakest link fights hardest</h2>
        <p className="boss-sub">
          Every squadmate's check-in damages this week's boss. Miss a day and it just
          catches its breath — no blame, only ash. Bring it down together.
        </p>
      </header>

      {status === "loading" && (
        <div className="zn-card boss-card arena-reveal">
          <div className="boss-skeleton" aria-hidden="true" />
          <p className="boss-loadtext">Rousing the boss…</p>
        </div>
      )}

      {status === "nosquad" && (
        <div className="zn-card boss-card arena-reveal">
          <div className="zn-empty">
            <div className="zn-empty__icon">👹</div>
            Boss Forge is a squad hunt. Join or forge a squad, then face the week's boss
            together.
            <div className="boss-cta">
              <button type="button" className="zn-btn" onClick={() => go?.("squad")}>
                Find your squad
              </button>
            </div>
          </div>
        </div>
      )}

      {status === "offline" && (
        <div className="zn-card boss-card arena-reveal">
          <div className="zn-empty">
            <div className="zn-empty__icon">👹</div>
            The boss is resting while you're offline. Reconnect to see this week's fight.
          </div>
        </div>
      )}

      {status === "error" && (
        <div className="zn-card boss-card arena-reveal">
          <div className="zn-empty">
            <div className="zn-empty__icon">🌫️</div>
            Couldn't reach the boss right now.
            <div className="boss-cta">
              <button type="button" className="zn-btn zn-btn--ghost" onClick={load}>
                Try again
              </button>
            </div>
          </div>
        </div>
      )}

      {status === "ready" && (
        <>
          <div className={`zn-card zn-card--glow boss-card ${isSlain ? "boss-card--slain" : ""}`}>
            <div className="boss-stage">
              <button
                type="button"
                className={`boss-face ${isSlain ? "boss-face--slain" : ""}`}
                onClick={pokeBoss}
                aria-label={isSlain ? `${art.name} defeated` : `Provoke ${art.name}`}
              >
                {isSlain ? "💥" : art.face}
              </button>
              <div className="boss-idwrap">
                <span className="boss-name">{art.name}</span>
                <span className="boss-week">{isSlain ? "Defeated" : timeLeft}</span>
              </div>
            </div>

            <div className="boss-hprow">
              <span className="boss-hplabel">{isSlain ? "0" : hp} / {maxHp} HP</span>
              <span className="boss-hppct">{isSlain ? "SLAIN" : `${hpPct}%`}</span>
            </div>
            <div className="zn-meter boss-meter" role="progressbar" aria-valuenow={hp} aria-valuemin={0} aria-valuemax={maxHp}>
              <div
                className={`zn-meter__fill boss-meter__fill ${isSlain ? "boss-meter__fill--slain" : ""}`}
                style={{ width: `${isSlain ? 0 : hpPct}%` }}
              />
            </div>

            {witnessLine && <p className="boss-witness">{witnessLine}</p>}
          </div>

          <div className="zn-2col boss-stats">
            <div className="zn-card zn-stat boss-stat">
              <div className="zn-stat__num">{damageDone}</div>
              <div className="zn-stat__label">Damage this week</div>
            </div>
            <div className="zn-card zn-stat boss-stat">
              <div className="zn-stat__num">{contributors.length}</div>
              <div className="zn-stat__label">Fighters in</div>
            </div>
          </div>

          <div className="zn-card boss-card arena-reveal">
            <p className="zn-eyebrow">The fight party</p>
            {contributors.length === 0 ? (
              <div className="boss-partyempty">
                No hits landed yet this week. Be the first strike — {squadName} follows the
                spark.
              </div>
            ) : (
              <ul className="boss-party">
                {contributors.map((c, i) => {
                  const name = c.username || c.name || "Squadmate";
                  const dmg = Number(c.damage ?? c.hits ?? c.count ?? c.checkins ?? 0);
                  const mine = member?.username && name === member.username;
                  return (
                    <li key={c.user_id || c.username || i} className={`boss-fighter ${mine ? "boss-fighter--me" : ""}`}>
                      <span className="zn-avatar zn-avatar--sm boss-fighteravatar">
                        {(name[0] || "?").toUpperCase()}
                      </span>
                      <span className="boss-fightername">
                        @{name}
                        {mine ? " · you" : ""}
                      </span>
                      <span className="boss-fighterdmg">{dmg} dmg</span>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {!isSlain && (
            <div className="boss-cta boss-cta--sticky">
              <button type="button" className="zn-btn" onClick={goCheckIn}>
                Land a hit — post today's proof
              </button>
              <p className="boss-ctahint">
                Real check-ins are the only thing that damages the boss.
              </p>
            </div>
          )}

          {isSlain && (
            <div className="boss-cta">
              <div className="boss-slainbanner">🌋 {squadName} brought it down.</div>
              <button type="button" className="zn-btn zn-btn--ghost" onClick={() => go?.("squad")}>
                Back to the squad
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
