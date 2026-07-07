import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useZoneCtx } from "../../../../hooks/useZone.js";
import { useAppData } from "../../../../hooks/useAppData.js";
import { vowCreate, vowList, vowDefuse } from "../../../../lib/arenaService.js";
import { squadDetail } from "../../../../lib/zoneService.js";
import { zoneErrorMessage } from "../../../../lib/zoneFire.js";
import { sfxWhoosh, sfxPhoenix, sfxPop } from "../../../../lib/sfx.js";
import { useReveal, useArenaBurst } from "../useArenaFX.js";
import { witnessSay } from "../../witness/witnessLines.js";
import PostProof from "../../proof/PostProof.jsx";
import VowFuse from "./VowFuse.jsx";
import "./TheVow.css";

const TODAY = () => new Date().toISOString().slice(0, 10);

// Due-time presets → a concrete Date. The fuse IS the appointment (research:
// a dated commitment to a person makes the 10%→95% jump), so we make picking a
// real deadline one tap.
function presetDue(key) {
  const now = new Date();
  const d = new Date(now);
  switch (key) {
    case "1h":
      d.setHours(d.getHours() + 1);
      return d;
    case "3h":
      d.setHours(d.getHours() + 3);
      return d;
    case "tonight":
      d.setHours(21, 0, 0, 0);
      if (d <= now) d.setDate(d.getDate() + 1);
      return d;
    case "morning":
      d.setDate(d.getDate() + 1);
      d.setHours(9, 0, 0, 0);
      return d;
    case "24h":
      d.setHours(d.getHours() + 24);
      return d;
    default:
      d.setHours(d.getHours() + 3);
      return d;
  }
}

const DUE_PRESETS = [
  { key: "1h", label: "1 hour" },
  { key: "3h", label: "3 hours" },
  { key: "tonight", label: "By tonight" },
  { key: "morning", label: "By 9am" },
  { key: "24h", label: "24 hours" },
];

// A datetime-local value string for the datetime input (local, minute res).
function toLocalInput(date) {
  const d = new Date(date);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function nameOf(m) {
  return m?.display_name || m?.username || "someone";
}

function Initial({ member }) {
  const label = nameOf(member).slice(0, 1).toUpperCase();
  if (member?.avatar_url) {
    return (
      <img
        className="vow-av"
        src={member.avatar_url}
        alt=""
        onError={(e) => {
          e.currentTarget.style.visibility = "hidden";
        }}
      />
    );
  }
  return <span className="vow-av" aria-hidden="true">{label}</span>;
}

export default function TheVow({ go }) {
  const { member, fire, squads, partner } = useZoneCtx();
  const { celebrate, pushToast, settings } = useAppData();
  const burst = useArenaBurst();
  const headRef = useReveal();

  const [vows, setVows] = useState({ live: [], defused: [], detonated: [] });
  const [loading, setLoading] = useState(true);
  const [offline, setOffline] = useState(false);

  // create form
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [ifCue, setIfCue] = useState("");
  const [stake, setStake] = useState("");
  const [duePreset, setDuePreset] = useState("3h");
  const [customDue, setCustomDue] = useState("");
  const [witnessKey, setWitnessKey] = useState(""); // "" = private
  const [saving, setSaving] = useState(false);
  const formRef = useRef(null);

  // defuse flow
  const [defusing, setDefusing] = useState(null); // the vow being proven

  const myTint = fire?.tint || "#FF7A1A";

  /* ---------------- witness candidates (partner + squadmates) ------------- */
  const [squadMembers, setSquadMembers] = useState([]);

  useEffect(() => {
    let alive = true;
    if (!squads || squads.length === 0) {
      setSquadMembers([]);
      return () => {
        alive = false;
      };
    }
    Promise.all(
      squads.map((s) =>
        squadDetail(s.id)
          .then((res) =>
            res && !res.offline
              ? (res.members || []).map((m) => ({ ...m, squadId: s.id }))
              : []
          )
          .catch(() => [])
      )
    ).then((lists) => {
      if (alive) setSquadMembers(lists.flat());
    });
    return () => {
      alive = false;
    };
  }, [squads]);

  const witnesses = useMemo(() => {
    const out = [];
    const seen = new Set();
    const myId = member?.user_id;
    const add = (m, squadId, source) => {
      if (!m || !m.user_id || m.user_id === myId || seen.has(m.user_id)) return;
      seen.add(m.user_id);
      out.push({
        key: m.user_id,
        userId: m.user_id,
        squadId: squadId || null,
        source,
        display_name: m.display_name,
        username: m.username,
        avatar_url: m.avatar_url,
      });
    };
    if (partner?.link?.status === "active" && partner.partner) {
      add(partner.partner, null, "partner");
    }
    squadMembers.forEach((m) => add(m, m.squadId, "squad"));
    return out;
  }, [partner, squadMembers, member]);

  const selectedWitness = witnesses.find((w) => w.key === witnessKey) || null;

  /* ---------------- load vows --------------------------------------------- */
  const load = useCallback(async () => {
    try {
      const res = await vowList({});
      if (res?.offline) {
        setOffline(true);
        return;
      }
      setOffline(false);
      setVows({
        live: res?.live || [],
        defused: res?.defused || [],
        detonated: res?.detonated || [],
      });
    } catch (err) {
      pushToast({ type: "error", title: "Couldn't load vows", message: zoneErrorMessage(err) });
    } finally {
      setLoading(false);
    }
  }, [pushToast]);

  useEffect(() => {
    load();
  }, [load]);

  /* ---------------- create ------------------------------------------------ */
  const resetForm = () => {
    setTitle("");
    setIfCue("");
    setStake("");
    setDuePreset("3h");
    setCustomDue("");
  };

  const computeDue = () => {
    if (customDue) {
      const d = new Date(customDue);
      if (!Number.isNaN(d.getTime())) return d;
    }
    return presetDue(duePreset);
  };

  const submit = async (e) => {
    const due = computeDue();
    if (!title.trim()) return;
    if (due.getTime() <= Date.now() + 30 * 1000) {
      pushToast({ type: "error", title: "Pick a future time", message: "The fuse needs room to burn." });
      return;
    }
    if (e && typeof e.clientX === "number") burst(e.clientX, e.clientY, myTint);
    setSaving(true);
    try {
      const res = await vowCreate({
        title: title.trim(),
        ifCue: ifCue.trim() || null,
        dueAt: due.toISOString(),
        squadId: selectedWitness?.squadId || null,
        witnessId: selectedWitness?.userId || null,
        stake: stake.trim() || null,
      });
      if (res?.offline) {
        pushToast({ type: "error", title: "Offline", message: zoneErrorMessage("offline") });
        return;
      }
      sfxWhoosh(settings);
      const line = witnessSay("vow_created", {
        title: title.trim(),
        name: nameOf(member),
        witness: selectedWitness ? nameOf(selectedWitness) : "the Zone",
        today: TODAY(),
      });
      celebrate({ variant: "day", title: "Vow set — fuse lit 🧨", subtitle: line.line });
      resetForm();
      setShowForm(false);
      await load();
    } catch (err) {
      pushToast({ type: "error", title: "Couldn't set the vow", message: zoneErrorMessage(err) });
    } finally {
      setSaving(false);
    }
  };

  /* ---------------- defuse (post proof) ----------------------------------- */
  const onProofDone = async (proofRes) => {
    const vow = defusing;
    setDefusing(null);
    if (!vow) return;
    try {
      // Link the just-posted proof to the vow so the defuse carries its receipt.
      const res = await vowDefuse({ vowId: vow.id, proofId: proofRes?.proof_id || null });
      if (res?.offline) return;
      sfxPhoenix(settings);
      const line = witnessSay("vow_defused", {
        title: vow.title,
        name: nameOf(member),
        witness: vow.witness ? nameOf(vow.witness) : "the Zone",
        today: TODAY(),
      });
      pushToast({ type: "success", title: "Defused 🔥", message: line.line });
    } catch (err) {
      pushToast({ type: "error", title: "Couldn't defuse", message: zoneErrorMessage(err) });
    } finally {
      await load();
    }
  };

  // A live vow's fuse hit zero on-screen → server detonates lazily; refresh to
  // pull the neutral detonated state (witness already notified server-side).
  const onExpire = useCallback(() => {
    sfxPop(settings);
    load();
  }, [load, settings]);

  // One-tap re-vow: pre-fill the form from a detonated vow. Shame-free comeback.
  const revow = (vow) => {
    setTitle(vow.title || "");
    setIfCue(vow.if_cue || "");
    setStake(vow.stake || "");
    setDuePreset("3h");
    setCustomDue("");
    if (vow.witness_id) {
      const w = witnesses.find((x) => x.userId === vow.witness_id);
      if (w) setWitnessKey(w.key);
    }
    setShowForm(true);
    requestAnimationFrame(() => {
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  };

  /* ---------------- render ------------------------------------------------ */
  if (offline) {
    return (
      <div className="vow-wrap">
        <VowHeader headRef={headRef} go={go} />
        <div className="zn-empty">
          <div className="zn-empty__icon" aria-hidden="true">🧨</div>
          <p style={{ margin: 0 }}>
            The Vow needs a connection. Come back online to light a fuse your
            partner can watch.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="vow-wrap">
      <VowHeader headRef={headRef} go={go} />

      {!showForm && (
        <button
          type="button"
          className="zn-btn vow-cta"
          onClick={(e) => {
            burst(e.clientX, e.clientY, myTint);
            setShowForm(true);
          }}
        >
          🧨 Make a vow
        </button>
      )}

      {showForm && (
        <div className="vow-form arena-reveal is-in" ref={formRef}>
          <p className="zn-eyebrow">New vow — the fuse is the appointment</p>

          <div className="zn-field">
            <label className="zn-label" htmlFor="vow-if">IF (optional cue)</label>
            <input
              id="vow-if"
              className="zn-input"
              value={ifCue}
              onChange={(e) => setIfCue(e.target.value)}
              placeholder="9am Monday · after lunch · before I leave"
              maxLength={80}
            />
          </div>

          <div className="zn-field">
            <label className="zn-label" htmlFor="vow-title">→ THEN I will</label>
            <input
              id="vow-title"
              className="zn-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="make my 20 dials · ship the proposal · run 5k"
              maxLength={160}
            />
          </div>

          <div className="zn-field">
            <span className="zn-label">Fuse burns for</span>
            <div className="zn-chipbar">
              {DUE_PRESETS.map((p) => (
                <button
                  key={p.key}
                  type="button"
                  className={`zn-react${duePreset === p.key && !customDue ? " zn-react--mine" : ""}`}
                  onClick={() => {
                    setDuePreset(p.key);
                    setCustomDue("");
                  }}
                >
                  ⏱ {p.label}
                </button>
              ))}
            </div>
            <input
              type="datetime-local"
              className="zn-input vow-custom"
              value={customDue}
              min={toLocalInput(new Date(Date.now() + 60000))}
              onChange={(e) => setCustomDue(e.target.value)}
            />
          </div>

          <div className="zn-field">
            <span className="zn-label">Witnessed by</span>
            <div className="vow-witnesses">
              <button
                type="button"
                className={`vow-witchip${witnessKey === "" ? " vow-witchip--on" : ""}`}
                onClick={() => setWitnessKey("")}
              >
                <span className="vow-av vow-av--ghost" aria-hidden="true">·</span>
                <span className="vow-witchip__name">Private</span>
              </button>
              {witnesses.map((w) => (
                <button
                  key={w.key}
                  type="button"
                  className={`vow-witchip${witnessKey === w.key ? " vow-witchip--on" : ""}`}
                  onClick={() => setWitnessKey(w.key)}
                >
                  <Initial member={w} />
                  <span className="vow-witchip__name">{nameOf(w)}</span>
                  {w.source === "partner" && <span className="vow-witchip__tag">⚭</span>}
                </button>
              ))}
            </div>
            {witnesses.length === 0 && (
              <p className="zn-hint">
                Pair with a partner or join a squad to be witnessed — a watched
                vow keeps far better than a private one.
              </p>
            )}
          </div>

          <div className="zn-field">
            <label className="zn-label" htmlFor="vow-stake">Stake (optional — fire / cups / ego, no money)</label>
            <input
              id="vow-stake"
              className="zn-input"
              value={stake}
              onChange={(e) => setStake(e.target.value)}
              placeholder="50 cups · a public shout-out · 20 push-ups on camera"
              maxLength={80}
            />
          </div>

          <div className="zn-2col">
            <button
              type="button"
              className="zn-btn zn-btn--ghost"
              onClick={() => {
                setShowForm(false);
                resetForm();
              }}
            >
              Cancel
            </button>
            <button
              type="button"
              className="zn-btn"
              onClick={submit}
              disabled={saving || !title.trim()}
            >
              {saving ? "Lighting the fuse…" : "🔥 Light the fuse"}
            </button>
          </div>
        </div>
      )}

      {/* ---------------- live vows ---------------- */}
      {loading ? (
        <div className="zn-empty">Reading the fuses…</div>
      ) : (
        <>
          {vows.live.length > 0 && (
            <div className="vow-section">
              <p className="zn-eyebrow">🔥 Burning now</p>
              {vows.live.map((v) => (
                <VowCard
                  key={v.id}
                  vow={v}
                  onDefuse={() => setDefusing(v)}
                  onExpire={onExpire}
                />
              ))}
            </div>
          )}

          {vows.live.length === 0 && !showForm && (
            <div className="zn-empty">
              <div className="zn-empty__icon" aria-hidden="true">🕯️</div>
              <p style={{ margin: 0 }}>
                No fuses burning. A vow is a dated promise someone watches — light
                one and it becomes real.
              </p>
            </div>
          )}

          {vows.detonated.length > 0 && (
            <div className="vow-section">
              <p className="zn-eyebrow">Timed out — no shame, just re-light</p>
              {vows.detonated.map((v) => (
                <VowCard key={v.id} vow={v} onRevow={() => revow(v)} />
              ))}
            </div>
          )}

          {vows.defused.length > 0 && (
            <div className="vow-section">
              <p className="zn-eyebrow">✅ Kept</p>
              {vows.defused.slice(0, 6).map((v) => (
                <VowCard key={v.id} vow={v} />
              ))}
            </div>
          )}
        </>
      )}

      {defusing && (
        <PostProof onClose={() => setDefusing(null)} onDone={onProofDone} />
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */

function VowHeader({ headRef, go }) {
  return (
    <div className="vow-head arena-reveal" ref={headRef}>
      <button type="button" className="zn-back" onClick={() => go?.("arena", null)}>
        ← Arena
      </button>
      <span className="vow-badge">✦ The Vow — burning fuses</span>
      <h1 className="vow-title-h">A promise, on a fuse</h1>
      <p className="vow-lede">
        A commitment isn't a checkbox. It becomes a live fuse burning down in
        front of your witness. Post proof to defuse it — or it detonates,
        shame-free, and you re-vow in one tap.
      </p>
    </div>
  );
}

function VowCard({ vow, onDefuse, onExpire, onRevow }) {
  const mine = vow.is_mine;
  const witness = vow.witness;
  const owner = vow.owner;
  return (
    <div className={`vow-card vow-card--${vow.status}`}>
      {vow.if_cue && <div className="vow-if">IF {vow.if_cue} →</div>}
      <div className="vow-text">{vow.title}</div>

      <div className="vow-meta">
        {!mine && owner && (
          <span className="vow-tagline">
            You're witnessing <b>{nameOf(owner)}</b>
          </span>
        )}
        {mine && witness && (
          <span className="vow-tagline">
            <span className="vow-av vow-av--sm" aria-hidden="true">
              {nameOf(witness).slice(0, 1).toUpperCase()}
            </span>
            Witnessed by <b>{nameOf(witness)}</b>
          </span>
        )}
        {mine && !witness && <span className="vow-tagline">Private vow</span>}
        {vow.stake && <span className="vow-stake-chip">🎯 {vow.stake}</span>}
      </div>

      <VowFuse
        createdAt={vow.created_at}
        dueAt={vow.due_at}
        status={vow.status}
        onExpire={onExpire}
      />

      {vow.status === "live" && mine && onDefuse && (
        <button type="button" className="zn-btn vow-defuse" onClick={onDefuse}>
          🔥 Post proof — defuse
        </button>
      )}
      {vow.status === "detonated" && mine && onRevow && (
        <button type="button" className="zn-btn zn-btn--ghost vow-revow" onClick={onRevow}>
          ↻ Re-vow in one tap
        </button>
      )}
    </div>
  );
}
