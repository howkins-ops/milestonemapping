import React, { useState, useMemo } from "react";
import ExerciseImg from "./ExerciseImg.jsx";
import { EXERCISE_GROUPS, exerciseInfo, holdSeconds } from "./data/exercises.js";
import { STEELS, EMBLEMS, TEMPLATES, Stepper, deriveBlocks } from "../IronWorkout.jsx";
import { sfxCoin, sfxChalkPoof } from "../../../lib/sfx.js";

/* ═══════════════════════════════════════════════════════════════
   THE IRON — custom workout BUILDER
   Forge your own routine from the real 55+ move library: search,
   pick by muscle family, set targets, reorder, chain supersets,
   and time your holds. Everything lives inside plan.exercises[] so
   it persists with zero migration and old flat plans still play.
   ═══════════════════════════════════════════════════════════════ */

const FOCUS_MAX = 40;
const NAME_MAX = 48;

/* mint a fresh superset id that's larger than any in use */
const nextGroupId = (exs) =>
  1 + exs.reduce((m, e) => (e.group != null && e.group > m ? e.group : m), 0);

/* collapse group ids to contiguous ints and drop groups of length 1 */
function normalize(exercises) {
  const blocks = deriveBlocks(exercises);
  const out = [];
  let g = 0;
  for (const b of blocks) {
    if (b.members.length > 1) {
      g += 1;
      b.members.forEach((mi) => out.push({ ...exercises[mi], group: g }));
    } else {
      const { group, ...rest } = exercises[b.members[0]];
      out.push(rest);
    }
  }
  return out;
}

/* seed a fresh library pick */
const seedItem = (name) => {
  const info = exerciseInfo(name);
  const hold = !!info?.hold;
  return {
    name,
    sets: 3,
    reps: hold ? 40 : 10,
    weight: 0,
    hold,
  };
};

/* ═══════════════ EXERCISE PICKER ═══════════════ */
function ExercisePicker({ chosen, onPick, onClose }) {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(() => EXERCISE_GROUPS[0]?.id || null);
  const query = q.trim().toLowerCase();

  const groups = useMemo(() => {
    if (!query) return EXERCISE_GROUPS;
    return EXERCISE_GROUPS.map((g) => ({
      ...g,
      exercises: g.exercises.filter(
        (e) =>
          e.name.toLowerCase().includes(query) ||
          (e.muscles || "").toLowerCase().includes(query) ||
          (e.equipment || "").toLowerCase().includes(query)
      ),
    })).filter((g) => g.exercises.length > 0);
  }, [query]);

  return (
    <div className="iw-modal-veil" onClick={onClose}>
      <div className="iw-modal iw-picker" onClick={(e) => e.stopPropagation()}>
        <div className="iw-eyebrow">load the bar · pick your lifts</div>
        <input
          className="iw-input"
          value={q}
          autoFocus
          placeholder="search — bench, hamstrings, cable…"
          onChange={(e) => setQ(e.target.value)}
        />
        <div className="iw-picker-scroll">
          {groups.map((g) => {
            const expanded = query ? true : open === g.id;
            return (
              <div key={g.id} className="iw-pc-libgroup">
                <button
                  className="iw-pc-libhead"
                  onClick={() => setOpen(expanded && !query ? null : g.id)}
                >
                  <span>{g.label}</span>
                  <span className="iw-pc-libcount">{g.exercises.length}</span>
                </button>
                {expanded && (
                  <div className="iw-picker-list">
                    {g.exercises.map((e) => {
                      const info = exerciseInfo(e.name);
                      const count = chosen.filter((c) => c.name === e.name).length;
                      return (
                        <button
                          key={e.name}
                          className="iw-picker-row"
                          onClick={() => { onPick(e.name); sfxCoin(); }}
                        >
                          <span className="iw-picker-thumb">
                            <ExerciseImg name={e.name} className="iw-picker-img" />
                          </span>
                          <span className="iw-picker-meta">
                            <span className="iw-picker-name">{e.name}</span>
                            <span className="iw-picker-muscles">{info?.muscles || e.muscles}</span>
                          </span>
                          <span className="iw-picker-add">
                            {count > 0 ? `×${count} ＋` : "＋"}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
          {groups.length === 0 && (
            <div className="iw-empty">no lift matches “{q}”</div>
          )}
        </div>
        <div className="iw-modal-actions">
          <button className="iw-btn-ember iw-btn-wide" onClick={onClose}>done loading</button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════ EXERCISE ROW ═══════════════ */
function ExerciseRow({
  item, index, total, endsBlock, inSuperset, canLinkNext,
  onChange, onRemove, onMove, onToggleLink,
}) {
  const [noteOpen, setNoteOpen] = useState(!!item.note);
  const info = exerciseInfo(item.name);
  const hold = !!item.hold;

  return (
    <div className={`iw-brow ${inSuperset ? "iw-brow-super" : ""}`}>
      <div className="iw-brow-head">
        <span className="iw-brow-thumb"><ExerciseImg name={item.name} className="iw-picker-img" /></span>
        <span className="iw-brow-meta">
          <span className="iw-brow-name">{item.name}</span>
          <span className="iw-brow-muscles">{info?.muscles || ""}</span>
        </span>
        <span className="iw-brow-order">
          <button className="iw-brow-mini" disabled={index === 0} aria-label="move up"
            onClick={() => onMove(index, -1)}>▲</button>
          <button className="iw-brow-mini" disabled={index === total - 1} aria-label="move down"
            onClick={() => onMove(index, 1)}>▼</button>
          <button className="iw-brow-mini iw-brow-x" aria-label={`remove ${item.name}`}
            onClick={() => onRemove(index)}>✕</button>
        </span>
      </div>

      <div className="iw-brow-steppers">
        <Stepper label="sets" value={item.sets} min={1} max={12}
          onChange={(v) => onChange(index, { sets: v })} />
        {hold ? (
          <Stepper label="seconds" value={item.reps} step={5} min={5} max={600}
            onChange={(v) => onChange(index, { reps: v })} />
        ) : (
          <Stepper label="reps" value={item.reps} min={1} max={100}
            onChange={(v) => onChange(index, { reps: v })} />
        )}
        {hold ? (
          <div className="iw-stepper"><span className="iw-eyebrow">load</span>
            <div className="iw-brow-bw">timed hold</div></div>
        ) : (
          <Stepper label="lbs (0 = BW)" value={item.weight} step={5} min={0}
            onChange={(v) => onChange(index, { weight: v })} wide />
        )}
      </div>

      <div className="iw-brow-tools">
        <button className={`iw-chip-btn ${noteOpen ? "iw-chip-on" : ""}`}
          onClick={() => { const n = !noteOpen; setNoteOpen(n); if (!n) onChange(index, { note: "" }); }}>
          ✎ cue
        </button>
        <label className="iw-chip-btn iw-brow-holdtoggle">
          <input type="checkbox" checked={hold}
            onChange={(e) => onChange(index, {
              hold: e.target.checked,
              reps: e.target.checked ? holdSeconds(String(item.reps)) || 40 : 10,
            })} />
          hold
        </label>
        {canLinkNext && (
          <button className={`iw-chip-btn ${item._linkNext ? "iw-chip-on" : ""}`}
            onClick={() => onToggleLink(index)}>
            ⛓ superset next
          </button>
        )}
      </div>

      {noteOpen && (
        <input className="iw-input iw-input-sub" value={item.note || ""} maxLength={80}
          placeholder="form cue — e.g. slow negatives, pause at bottom"
          onChange={(e) => onChange(index, { note: e.target.value })} />
      )}

      {endsBlock && (
        <div className="iw-brow-rest">
          <Stepper label="rest after (sec)" value={item.rest ?? 90} step={15} min={0} max={300}
            onChange={(v) => onChange(index, { rest: v })} wide />
        </div>
      )}
    </div>
  );
}

/* ═══════════════ BUILDER ═══════════════ */
export default function PlanBuilder({ plan, onSave, onCancel, onDelete, settings }) {
  const editing = !!plan;
  const [draft, setDraft] = useState(() =>
    plan
      ? {
          name: plan.name || "",
          focus: plan.focus || "",
          steel: plan.steel || "gunmetal",
          emblem: plan.emblem || "▲",
          exercises: (plan.exercises || []).map((e) => ({ ...e })),
        }
      : { name: "", focus: "", steel: "gunmetal", emblem: "▲", exercises: [] }
  );
  const [picking, setPicking] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const blocks = useMemo(() => deriveBlocks(draft.exercises), [draft.exercises]);
  /* map each exercise index → { endsBlock, inSuperset, blockRounds } */
  const rowMeta = useMemo(() => {
    const meta = draft.exercises.map(() => ({ endsBlock: true, inSuperset: false }));
    for (const b of blocks) {
      const last = b.members[b.members.length - 1];
      b.members.forEach((mi, k) => {
        meta[mi] = { endsBlock: mi === last, inSuperset: b.members.length > 1 };
      });
    }
    return meta;
  }, [blocks, draft.exercises]);

  const patch = (p) => setDraft((d) => ({ ...d, ...p }));
  const setEx = (list) => setDraft((d) => ({ ...d, exercises: list }));

  const pickTemplate = (t) => patch({
    name: draft.name || t.name,
    focus: draft.focus || t.focus,
    steel: t.steel,
    emblem: t.emblem,
    exercises: [...draft.exercises, ...t.exercises.map((e) => seedItem(e.name))
      .map((seed, i) => ({ ...seed, sets: t.exercises[i].sets, reps: seed.hold ? seed.reps : t.exercises[i].reps, weight: seed.hold ? 0 : t.exercises[i].weight }))],
  });

  const addExercise = (name) => setEx([...draft.exercises, seedItem(name)]);

  const changeAt = (i, p) =>
    setEx(draft.exercises.map((e, j) => (j === i ? { ...e, ...p } : e)));

  const removeAt = (i) =>
    setEx(draft.exercises.filter((_, j) => j !== i).map((e) => ({ ...e })));

  const moveAt = (i, dir) => {
    const j = i + dir;
    if (j < 0 || j >= draft.exercises.length) return;
    const list = [...draft.exercises];
    [list[i], list[j]] = [list[j], list[i]];
    setEx(list);
    sfxChalkPoof(settings);
  };

  /* link exercise i with i+1 into a shared superset group */
  const toggleLink = (i) => {
    const list = draft.exercises.map((e) => ({ ...e }));
    const a = list[i], b = list[i + 1];
    if (!b) return;
    const linked = a.group != null && a.group === b.group;
    if (linked) {
      // unlink: give b (and its downstream same-group run) nothing — simplest: clear b's group
      b.group = undefined;
    } else {
      const gid = a.group != null ? a.group : nextGroupId(list);
      a.group = gid;
      b.group = gid;
    }
    setEx(list);
    sfxCoin(settings);
  };

  const canSave = draft.name.trim().length > 0 && draft.exercises.length > 0;
  const save = () => {
    if (!canSave) return;
    onSave({
      name: draft.name.trim(),
      focus: draft.focus.trim(),
      steel: draft.steel,
      emblem: draft.emblem,
      exercises: normalize(draft.exercises),
    });
  };

  return (
    <div className="iw-page iw-page-in iw-builder">
      <button className="iw-back" onClick={onCancel}>❮ the rack</button>
      <div className="iw-eyebrow">{editing ? "reforge the plan" : "forge a new plan"}</div>
      <h2 className="iw-display iw-page-title">{editing ? draft.name || "Untitled" : "The Builder"}</h2>

      {/* ── metadata ── */}
      <div className="iw-plan-opener iw-builder-preview" style={{ background: STEELS.find((x) => x.id === draft.steel)?.css }}>
        <div className="iw-plan-opener-emblem">{draft.emblem}</div>
        <input className="iw-input iw-builder-nameinput" placeholder="name this plan" value={draft.name} maxLength={NAME_MAX}
          onChange={(e) => patch({ name: e.target.value })} />
        <input className="iw-input iw-input-sub iw-builder-focusinput" placeholder="focus — e.g. chest · triceps (optional)" value={draft.focus} maxLength={FOCUS_MAX}
          onChange={(e) => patch({ focus: e.target.value })} />
      </div>

      <div className="iw-builder-skins">
        <div className="iw-swatch-row">
          {STEELS.map((s) => (
            <button key={s.id} className={`iw-swatch ${draft.steel === s.id ? "iw-swatch-on" : ""}`}
              style={{ background: s.css }} onClick={() => patch({ steel: s.id })} aria-label={s.label} />
          ))}
        </div>
        <div className="iw-swatch-row">
          {EMBLEMS.map((g) => (
            <button key={g} className={`iw-emblem-pick ${draft.emblem === g ? "iw-swatch-on" : ""}`}
              onClick={() => patch({ emblem: g })}>{g}</button>
          ))}
        </div>
      </div>

      {draft.exercises.length === 0 && (
        <>
          <div className="iw-eyebrow iw-shelf-label">start from a template</div>
          <div className="iw-tpl-row">
            {TEMPLATES.map((t) => (
              <button key={t.key} className="iw-tpl-card"
                style={{ background: STEELS.find((x) => x.id === t.steel)?.css }}
                onClick={() => pickTemplate(t)}>
                <span className="iw-tpl-emblem">{t.emblem}</span>
                <span className="iw-tpl-name">{t.name}</span>
              </button>
            ))}
          </div>
        </>
      )}

      {/* ── the lifts ── */}
      <div className="iw-eyebrow iw-shelf-label">the lifts · {draft.exercises.length}</div>
      <div className="iw-stack iw-builder-list">
        {draft.exercises.map((item, i) => (
          <ExerciseRow
            key={i}
            item={item}
            index={i}
            total={draft.exercises.length}
            endsBlock={rowMeta[i]?.endsBlock}
            inSuperset={rowMeta[i]?.inSuperset}
            canLinkNext={i < draft.exercises.length - 1}
            onChange={changeAt}
            onRemove={removeAt}
            onMove={moveAt}
            onToggleLink={toggleLink}
          />
        ))}
        {draft.exercises.length === 0 && (
          <div className="iw-empty">no lifts yet — load the bar below</div>
        )}
      </div>

      <button className="iw-newplan" onClick={() => setPicking(true)}>＋ add a lift</button>

      {/* ── footer ── */}
      <button className={`iw-btn-ember iw-btn-wide ${canSave ? "" : "iw-btn-off"}`} disabled={!canSave} onClick={save}>
        ⚡ save &amp; stamp the steel
      </button>

      {editing && onDelete && (
        !confirmDelete ? (
          <button className="iw-danger-link" onClick={() => setConfirmDelete(true)}>melt this plan down</button>
        ) : (
          <div className="iw-danger-row">
            <span>sure? sessions already logged stay in the book.</span>
            <button className="iw-btn-ghost" onClick={() => setConfirmDelete(false)}>keep it</button>
            <button className="iw-danger-btn" onClick={onDelete}>melt it</button>
          </div>
        )
      )}

      {picking && (
        <ExercisePicker chosen={draft.exercises} onPick={addExercise} onClose={() => setPicking(false)} />
      )}
    </div>
  );
}
