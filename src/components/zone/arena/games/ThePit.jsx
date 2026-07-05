// The Pit — opt-in commitment-device stakes. You put fire / Cups / ego (NEVER
// money) on the line against a vow or a challenge, and your accountability
// partner is the REFEREE who verifies whether you kept your word. StickK-style:
// skin in the game lifts follow-through ~3×, and the ladder escalates with each
// miss so quitting keeps getting more expensive.
//
// Server-authoritative: every mutation flows through arenaService stake* RPCs
// (create → referee verify kept/forfeit → settle). The client only reads what
// those RPCs return; a small per-user cache keeps your own pending stakes on
// screen between visits. Forfeits are NEUTRAL and one-tap recoverable — a lost
// stake honored is its own kind of showing up, never a shame wall.
//
// Ownership: this file + ThePit.css only. Data via arenaService.js; all
// witness/notification copy via witnessLines.js.

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useZoneCtx } from "../../../../hooks/useZone.js";
import { useAppData } from "../../../../hooks/useAppData.js";
import {
  stakeCreate,
  stakeVerify,
  stakeSettle,
  vowList,
} from "../../../../lib/arenaService.js";
import { listChallenges } from "../../../../lib/zoneService.js";
import { zoneErrorMessage } from "../../../../lib/zoneFire.js";
import { sfxCoin, sfxImpact, sfxPop, sfxWhoosh } from "../../../../lib/sfx.js";
import { useReveal, useArenaBurst } from "../useArenaFX.js";
import { witnessSay } from "../../witness/witnessLines.js";
import "./ThePit.css";

const TODAY = () => new Date().toISOString().slice(0, 10);

// Stakes are fire / Cups / ego ONLY — there is no money column anywhere.
const KINDS = [
  { key: "fire", glyph: "🔥", label: "Fire", unit: "🔥", note: "burn from your streak fuel" },
  { key: "cups", glyph: "🏆", label: "Cups", unit: "🏆", note: "wagered into the pot" },
  { key: "ego", glyph: "😤", label: "Ego", unit: "L", note: "public bragging rights" },
];

// The escalating ladder — each rung is a bigger commitment. One tap sets both
// the ladder level and its default amount; the amount stays editable.
const LADDER = [
  { level: 1, amount: 1, tag: "warm-up" },
  { level: 2, amount: 2, tag: "real" },
  { level: 3, amount: 3, tag: "no ducking it" },
  { level: 4, amount: 5, tag: "all in" },
];

function nameOf(m) {
  return m?.display_name || (m?.username ? `@${m.username}` : "someone");
}

function kindOf(key) {
  return KINDS.find((k) => k.key === key) || KINDS[0];
}

function amountLabel(stake) {
  const k = kindOf(stake.stake_kind);
  return `${stake.amount} ${k.unit}`;
}

// Tolerant read of a stake row (server shape) → the fields we render on.
function normStake(row, fallbackLabel) {
  if (!row) return null;
  return {
    id: row.id,
    user_id: row.user_id,
    referee_id: row.referee_id,
    ref_kind: row.ref_kind,
    ref_id: row.ref_id,
    stake_kind: row.stake_kind || "fire",
    amount: Number(row.amount) || 0,
    ladder_level: Number(row.ladder_level) || 1,
    status: row.status || "pending",
    ref_label: row.ref_label || fallbackLabel || null,
  };
}

/* -------- per-user display cache (mutations still go through the server) ----- */
function cacheKey(userId) {
  return `arena_pit_stakes_${userId || "anon"}`;
}
function loadCache(userId) {
  try {
    const raw = localStorage.getItem(cacheKey(userId));
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr.map((r) => normStake(r)).filter(Boolean) : [];
  } catch {
    return [];
  }
}
function saveCache(userId, stakes) {
  try {
    localStorage.setItem(cacheKey(userId), JSON.stringify(stakes.slice(0, 30)));
  } catch {
    /* storage full / disabled — cache is best-effort only */
  }
}

export default function ThePit({ go }) {
  const { userId, member, fire, partner } = useZoneCtx();
  const { celebrate, pushToast, settings } = useAppData();
  const headRef = useReveal();
  const burst = useArenaBurst();

  const myTint = fire?.tint || "#FF7A1A";
  const partnerActive =
    partner?.link?.status === "active" && partner?.partner ? partner.partner : null;
  const refereeId = partnerActive?.user_id || null;
  const refereeName = partnerActive ? nameOf(partnerActive) : "your partner";

  const [offline, setOffline] = useState(false);
  const [stakes, setStakes] = useState([]);
  const [busyId, setBusyId] = useState(null);

  // create form
  const [refKind, setRefKind] = useState("vow"); // 'vow' | 'challenge'
  const [refId, setRefId] = useState("");
  const [stakeKind, setStakeKind] = useState("fire");
  const [rung, setRung] = useState(1);
  const [amount, setAmount] = useState(1);
  const [saving, setSaving] = useState(false);

  // tie targets
  const [vows, setVows] = useState([]);
  const [challenges, setChallenges] = useState([]);
  const formRef = useRef(null);

  /* ---------------- load tie targets + cached stakes ---------------------- */
  useEffect(() => {
    setStakes(loadCache(userId));
  }, [userId]);

  const loadTargets = useCallback(async () => {
    try {
      const [vres, cres] = await Promise.all([
        vowList({}).catch(() => ({ offline: true })),
        listChallenges().catch(() => ({ offline: true })),
      ]);
      if (vres?.offline && cres?.offline) {
        setOffline(true);
        return;
      }
      setOffline(false);
      setVows(vres?.offline ? [] : vres?.live || []);
      setChallenges(cres?.offline ? [] : cres?.active || []);
    } catch (err) {
      pushToast?.({
        type: "error",
        title: "Couldn't load the ring",
        message: zoneErrorMessage(err),
      });
    }
  }, [pushToast]);

  useEffect(() => {
    loadTargets();
  }, [loadTargets]);

  const targets = refKind === "vow" ? vows : challenges;
  const selectedTarget = targets.find((t) => t.id === refId) || null;

  /* ---------------- upsert a returned stake into state + cache ------------- */
  const upsert = useCallback(
    (row, fallbackLabel) => {
      const next = normStake(row, fallbackLabel);
      if (!next) return;
      setStakes((prev) => {
        const merged = [next, ...prev.filter((s) => s.id !== next.id)];
        saveCache(userId, merged);
        return merged;
      });
    },
    [userId]
  );

  const pickRung = (r) => {
    setRung(r.level);
    setAmount(r.amount);
  };

  /* ---------------- create a stake ---------------------------------------- */
  const create = async (e) => {
    if (!refereeId) {
      pushToast?.({
        type: "error",
        title: "Need a referee",
        message: "Pair with an accountability partner — they verify the stake.",
      });
      return;
    }
    if (!refId) {
      pushToast?.({
        type: "error",
        title: "Tie it to something real",
        message: "Pick the vow or challenge this stake is riding on.",
      });
      return;
    }
    const amt = Math.max(1, Number(amount) || 1);
    if (e && typeof e.clientX === "number") burst(e.clientX, e.clientY, myTint);
    setSaving(true);
    try {
      const res = await stakeCreate({
        refereeId,
        refKind,
        refId,
        stakeKind,
        amount: amt,
        ladderLevel: rung,
      });
      if (res?.offline) {
        pushToast?.({ type: "error", title: "Offline", message: zoneErrorMessage("offline") });
        return;
      }
      sfxCoin(settings);
      upsert(res, selectedTarget?.title || "your commitment");
      const line = witnessSay("stake_set", {
        name: nameOf(member),
        witness: refereeName,
        amount: `${amt} ${kindOf(stakeKind).unit}`,
        today: TODAY(),
      }).line;
      celebrate?.({
        variant: "day",
        title: "Stake locked in 🏛️",
        subtitle: line,
      });
      setRefId("");
    } catch (err) {
      pushToast?.({
        type: "error",
        title: "Couldn't set the stake",
        message: zoneErrorMessage(err),
      });
    } finally {
      setSaving(false);
    }
  };

  /* ---------------- referee verify (kept / forfeit) ----------------------- */
  const verify = async (stake, kept) => {
    setBusyId(stake.id);
    try {
      const res = await stakeVerify({ stakeId: stake.id, kept });
      if (res?.offline) {
        pushToast?.({ type: "error", title: "Offline", message: zoneErrorMessage("offline") });
        return;
      }
      upsert(res || { ...stake, status: kept ? "kept" : "forfeit" }, stake.ref_label);
      if (kept) {
        sfxCoin(settings);
        const line = witnessSay("stake_kept", {
          name: nameOf(member),
          witness: refereeName,
          amount: amountLabel(stake),
          today: TODAY(),
        }).line;
        pushToast?.({ type: "success", title: "Kept 🔥", message: line });
      } else {
        sfxPop(settings);
        const line = witnessSay("stake_forfeit", {
          name: nameOf(member),
          witness: refereeName,
          amount: amountLabel(stake),
          today: TODAY(),
        }).line;
        pushToast?.({ type: "info", title: "Forfeit — no shame", message: line });
      }
    } catch (err) {
      pushToast?.({ type: "error", title: "Couldn't verify", message: zoneErrorMessage(err) });
    } finally {
      setBusyId(null);
    }
  };

  /* ---------------- settle (finalize the verified outcome) ---------------- */
  const settle = async (stake) => {
    setBusyId(stake.id);
    try {
      const res = await stakeSettle({ stakeId: stake.id });
      if (res?.offline) {
        pushToast?.({ type: "error", title: "Offline", message: zoneErrorMessage("offline") });
        return;
      }
      sfxImpact(1, settings);
      upsert(res || stake, stake.ref_label);
      pushToast?.({
        type: "success",
        title: "Settled",
        message: "The pot's cleared. Slate's clean — set the next one when you're ready.",
      });
    } catch (err) {
      pushToast?.({ type: "error", title: "Couldn't settle", message: zoneErrorMessage(err) });
    } finally {
      setBusyId(null);
    }
  };

  // One-tap re-stake after a forfeit — comeback framing, no shame.
  const restake = (stake) => {
    setRefKind(stake.ref_kind || "vow");
    setRefId(stake.ref_id || "");
    setStakeKind(stake.stake_kind || "fire");
    const nextLevel = Math.min(LADDER.length, (stake.ladder_level || 1) + 1);
    const r = LADDER.find((l) => l.level === nextLevel) || LADDER[0];
    pickRung(r);
    sfxWhoosh(settings);
    requestAnimationFrame(() =>
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "center" })
    );
  };

  const pending = stakes.filter((s) => s.status === "pending");
  const settled = stakes.filter((s) => s.status !== "pending");

  /* ---------------- render ------------------------------------------------ */
  if (offline) {
    return (
      <div className="pit-wrap">
        <PitHeader headRef={headRef} go={go} />
        <div className="zn-empty">
          <div className="zn-empty__icon" aria-hidden="true">🏛️</div>
          <p style={{ margin: 0 }}>
            The Pit needs a connection. Come back online to put skin in the game
            with your referee watching.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="pit-wrap">
      <PitHeader headRef={headRef} go={go} />

      {!partnerActive ? (
        <div className="zn-empty pit-teaser">
          <div className="zn-empty__icon" aria-hidden="true">⚖️</div>
          <p style={{ margin: 0 }}>
            A stake needs a referee. Pair with one accountability partner — they
            verify whether you kept your word, so the stake actually means
            something.
          </p>
          <button type="button" className="zn-btn pit-pairbtn" onClick={() => go?.("partner")}>
            ⚭ Pair with a partner
          </button>
        </div>
      ) : (
        <>
          {/* ---------------- create a stake ---------------- */}
          <div className="pit-card pit-form arena-reveal is-in" ref={formRef}>
            <p className="zn-eyebrow">Set a stake — {refereeName} referees</p>

            <div className="zn-field">
              <span className="zn-label">Riding on</span>
              <div className="pit-seg">
                <button
                  type="button"
                  className={`pit-segbtn${refKind === "vow" ? " pit-segbtn--on" : ""}`}
                  onClick={() => {
                    setRefKind("vow");
                    setRefId("");
                  }}
                >
                  ✦ A vow
                </button>
                <button
                  type="button"
                  className={`pit-segbtn${refKind === "challenge" ? " pit-segbtn--on" : ""}`}
                  onClick={() => {
                    setRefKind("challenge");
                    setRefId("");
                  }}
                >
                  🏁 A challenge
                </button>
              </div>

              {targets.length > 0 ? (
                <div className="pit-targets">
                  {targets.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      className={`pit-target${refId === t.id ? " pit-target--on" : ""}`}
                      onClick={() => setRefId(t.id)}
                    >
                      <span className="pit-target__glyph" aria-hidden="true">
                        {refKind === "vow" ? "✦" : t.emblem || "🏁"}
                      </span>
                      <span className="pit-target__name">{t.title || "Untitled"}</span>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="zn-hint">
                  {refKind === "vow"
                    ? "No live vows to back yet. "
                    : "You're not in an active challenge yet. "}
                  <button
                    type="button"
                    className="pit-link"
                    onClick={() => go?.(refKind === "vow" ? "arena" : "challenges", refKind === "vow" ? "the_vow" : null)}
                  >
                    {refKind === "vow" ? "Light a vow first →" : "Join a challenge first →"}
                  </button>
                </p>
              )}
            </div>

            <div className="zn-field">
              <span className="zn-label">Stake — no money, ever</span>
              <div className="pit-kinds">
                {KINDS.map((k) => (
                  <button
                    key={k.key}
                    type="button"
                    className={`pit-kind${stakeKind === k.key ? " pit-kind--on" : ""}`}
                    onClick={() => setStakeKind(k.key)}
                  >
                    <span className="pit-kind__glyph" aria-hidden="true">{k.glyph}</span>
                    <span className="pit-kind__label">{k.label}</span>
                    <span className="pit-kind__note">{k.note}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="zn-field">
              <span className="zn-label">Ladder rung — it escalates with each miss</span>
              <div className="pit-ladder">
                {LADDER.map((l) => (
                  <button
                    key={l.level}
                    type="button"
                    className={`pit-rung${rung === l.level ? " pit-rung--on" : ""}`}
                    onClick={() => pickRung(l)}
                  >
                    <span className="pit-rung__amt">
                      {l.amount} {kindOf(stakeKind).unit}
                    </span>
                    <span className="pit-rung__tag">{l.tag}</span>
                  </button>
                ))}
              </div>
              <div className="pit-amount">
                <span className="zn-label pit-amount__lbl">Amount</span>
                <div className="pit-stepper">
                  <button
                    type="button"
                    className="pit-step"
                    aria-label="less"
                    onClick={() => setAmount((a) => Math.max(1, (Number(a) || 1) - 1))}
                  >
                    −
                  </button>
                  <input
                    className="zn-input pit-amtinput"
                    type="number"
                    min="1"
                    inputMode="numeric"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                  <button
                    type="button"
                    className="pit-step"
                    aria-label="more"
                    onClick={() => setAmount((a) => (Number(a) || 1) + 1)}
                  >
                    +
                  </button>
                  <span className="pit-amtunit" aria-hidden="true">{kindOf(stakeKind).unit}</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              className="zn-btn pit-setbtn"
              onClick={create}
              disabled={saving || !refId}
            >
              {saving ? "Locking it in…" : `🏛️ Put it in the pit`}
            </button>
            <p className="pit-fineprint">
              {refereeName} confirms the proof. Kept → honored. Forfeit → you
              settle it and the slate's clean. No money, no shame.
            </p>
          </div>

          {/* ---------------- pending stakes ---------------- */}
          {pending.length > 0 && (
            <div className="pit-section">
              <p className="zn-eyebrow">⏳ In the pit</p>
              {pending.map((s) => (
                <StakeCard
                  key={s.id}
                  stake={s}
                  userId={userId}
                  refereeName={refereeName}
                  busy={busyId === s.id}
                  onVerify={verify}
                  onSettle={settle}
                />
              ))}
            </div>
          )}

          {pending.length === 0 && (
            <div className="zn-empty pit-empty">
              <div className="zn-empty__icon" aria-hidden="true">🪙</div>
              <p style={{ margin: 0 }}>
                Nothing in the pit yet. A stake turns "I'll try" into "I'm on the
                hook" — and follow-through jumps about 3×.
              </p>
            </div>
          )}

          {/* ---------------- settled history ---------------- */}
          {settled.length > 0 && (
            <div className="pit-section">
              <p className="zn-eyebrow">Settled</p>
              {settled.slice(0, 8).map((s) => (
                <StakeCard
                  key={s.id}
                  stake={s}
                  userId={userId}
                  refereeName={refereeName}
                  busy={busyId === s.id}
                  onRestake={restake}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */

function PitHeader({ headRef, go }) {
  return (
    <div className="pit-head arena-reveal" ref={headRef}>
      <button type="button" className="zn-back" onClick={() => go("arena", null)}>
        ← Arena
      </button>
      <span className="pit-badge">🏛️ The Pit — opt-in stakes</span>
      <h1 className="pit-title-h">Put skin in the game</h1>
      <p className="pit-lede">
        Stake fire, Cups, or ego — never money — on a vow or a challenge. Your
        partner is the referee who verifies the proof. The ladder climbs with
        each miss, so quitting keeps getting more expensive. Forfeit is
        settled clean and shame-free.
      </p>
      <div className="pit-potrow" aria-hidden="true">
        <span className="pit-pot">🔥</span>
        <span className="pit-potlabel">the pot · escrowed on your word</span>
      </div>
    </div>
  );
}

function StakeCard({ stake, userId, refereeName, busy, onVerify, onSettle, onRestake }) {
  const k = kindOf(stake.stake_kind);
  const isOwner = stake.user_id === userId;
  const isReferee = stake.referee_id === userId;
  const statusLabel =
    stake.status === "kept" ? "Kept" : stake.status === "forfeit" ? "Forfeit" : "Pending";

  return (
    <div className={`pit-stake pit-stake--${stake.status}`}>
      <div className="pit-stake__top">
        <span className="pit-stake__amt">
          {stake.amount} <span aria-hidden="true">{k.unit}</span>
        </span>
        <span className={`pit-stake__status pit-stake__status--${stake.status}`}>
          {statusLabel}
        </span>
      </div>

      <div className="pit-stake__meta">
        <span className="pit-chip">{k.glyph} {k.label}</span>
        <span className="pit-chip pit-chip--ghost">rung {stake.ladder_level}</span>
        {stake.ref_label && (
          <span className="pit-stake__on">
            on <b>{stake.ref_label}</b>
          </span>
        )}
      </div>

      <div className="pit-stake__ref">
        {isReferee
          ? `You're refereeing this one.`
          : `${refereeName} is refereeing.`}
      </div>

      {/* Referee-only verify (kept / forfeit). Shame-free either way. */}
      {stake.status === "pending" && isReferee && onVerify && (
        <div className="pit-stake__actions">
          <button
            type="button"
            className="zn-btn pit-kept"
            onClick={() => onVerify(stake, true)}
            disabled={busy}
          >
            ✓ They kept it
          </button>
          <button
            type="button"
            className="zn-btn zn-btn--ghost pit-forfeit"
            onClick={() => onVerify(stake, false)}
            disabled={busy}
          >
            Forfeit
          </button>
        </div>
      )}

      {/* Owner waiting on the referee. */}
      {stake.status === "pending" && isOwner && !isReferee && (
        <p className="pit-stake__wait">
          Post your proof, then {refereeName} calls it. No move until they verify.
        </p>
      )}

      {/* Settle a verified outcome. */}
      {(stake.status === "kept" || stake.status === "forfeit") && onSettle && (
        <button
          type="button"
          className="zn-btn zn-btn--ghost pit-settle"
          onClick={() => onSettle(stake)}
          disabled={busy}
        >
          Settle it
        </button>
      )}

      {/* One-tap re-stake after a forfeit — climb the ladder, no shame. */}
      {stake.status === "forfeit" && isOwner && onRestake && (
        <button
          type="button"
          className="zn-btn zn-btn--ghost pit-restake"
          onClick={() => onRestake(stake)}
          disabled={busy}
        >
          ↻ Re-stake — one rung up
        </button>
      )}
    </div>
  );
}
