import React, { useState } from "react";
import Modal from "../ui/Modal.jsx";
import Button from "../ui/Button.jsx";
import TextInput from "../ui/TextInput.jsx";
import TextArea from "../ui/TextArea.jsx";
import Select from "../ui/Select.jsx";
import ProgressBar from "../ui/ProgressBar.jsx";
import { CATEGORIES, PROJECT_ICONS, PROJECT_COLORS } from "../../lib/constants.js";
import { uid } from "../../lib/id.js";

const STEPS = ["Name the Project", "Why & Vision", "Target Date", "Map the Milestones"];

const EMPTY = {
  title: "",
  category: "Business",
  icon: "🚀",
  color: "cyan",
  description: "",
  whyItMatters: "",
  futureVision: "",
  targetDate: ""
};

export default function ProjectWizard({ open, onClose, onCreate, onUpdate, initial = null }) {
  const isEdit = Boolean(initial);
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(() => (initial ? { ...EMPTY, ...initial } : EMPTY));
  const [milestoneDrafts, setMilestoneDrafts] = useState([]);
  const [draft, setDraft] = useState("");

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const addDraft = () => {
    const text = draft.trim();
    if (!text || milestoneDrafts.length >= 8) return;
    setMilestoneDrafts((prev) => [...prev, { id: uid("md"), text }]);
    setDraft("");
  };

  const finish = () => {
    if (isEdit) {
      onUpdate(initial.id, form);
    } else {
      onCreate(form, milestoneDrafts.map((d) => d.text));
    }
    onClose();
  };

  const isLast = step === STEPS.length - 1;
  const canAdvance = step !== 0 || form.title.trim().length > 0;

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? "Recalibrate Project" : "Map New Project"} wide>
      <ProgressBar
        value={step + 1}
        max={STEPS.length}
        label={`Step ${step + 1} of ${STEPS.length} — ${STEPS[step]}`}
        showPercent={false}
      />

      <div style={{ minHeight: 270, marginTop: 22 }} className="anim-fade-in" key={step}>
        {step === 0 && (
          <div className="stack">
            <h3 style={{ fontSize: 22 }}>What are you building?</h3>
            <TextInput
              label="Project name"
              value={form.title}
              onChange={set("title")}
              placeholder="Example: Launch my dream app, transform my body, hit $100K..."
              autoFocus
            />
            <Select label="Category" value={form.category} onChange={set("category")} options={CATEGORIES} />

            <div className="field">
              <span className="field__label">Island icon</span>
              <div className="row row--wrap" style={{ gap: 6 }}>
                {PROJECT_ICONS.map((ic) => (
                  <button
                    key={ic}
                    type="button"
                    className="badge"
                    style={{
                      fontSize: 19,
                      padding: "8px 12px",
                      cursor: "pointer",
                      borderColor: form.icon === ic ? "var(--accent)" : undefined,
                      boxShadow: form.icon === ic ? "0 0 14px rgba(0,240,255,0.3)" : undefined
                    }}
                    onClick={() => setForm((f) => ({ ...f, icon: ic }))}
                    aria-pressed={form.icon === ic}
                    aria-label={`Icon ${ic}`}
                  >
                    {ic}
                  </button>
                ))}
              </div>
            </div>

            <div className="field">
              <span className="field__label">Glow color</span>
              <div className="row row--wrap" style={{ gap: 8 }}>
                {PROJECT_COLORS.map((c) => (
                  <button
                    key={c.key}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, color: c.key }))}
                    aria-pressed={form.color === c.key}
                    aria-label={`Color ${c.label}`}
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: "50%",
                      cursor: "pointer",
                      background: `radial-gradient(circle at 35% 30%, ${c.hex}, ${c.hex}55)`,
                      border: form.color === c.key ? "2px solid #EAFBFF" : "2px solid transparent",
                      boxShadow: form.color === c.key ? `0 0 16px ${c.hex}` : `0 0 8px ${c.hex}44`
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="stack">
            <h3 style={{ fontSize: 22 }}>Why does this project matter?</h3>
            <p className="muted">A project without emotional weight will not survive resistance.</p>
            <TextArea rows={3} value={form.whyItMatters} onChange={set("whyItMatters")} autoFocus
              placeholder="What breaks if you don't finish this? What opens if you do?" />
            <TextArea
              label="Describe the version of you who has finished it"
              rows={3}
              value={form.futureVision}
              onChange={set("futureVision")}
            />
          </div>
        )}

        {step === 2 && (
          <div className="stack">
            <h3 style={{ fontSize: 22 }}>When is the treasure claimed?</h3>
            <TextInput label="Target date" type="date" value={form.targetDate} onChange={set("targetDate")} />
            <TextArea
              label="Project description (optional)"
              rows={2}
              value={form.description}
              onChange={set("description")}
            />
          </div>
        )}

        {step === 3 && (
          <div className="stack">
            <h3 style={{ fontSize: 22 }}>
              {isEdit ? "Milestones" : "What milestones lead to the treasure?"}
            </h3>
            {isEdit ? (
              <p className="muted">Milestones are managed on the project's treasure map.</p>
            ) : (
              <>
                <p className="muted">
                  Add 2–8 milestones, in order. Each becomes a node on the treasure trail — you'll
                  add weekly actions and rewards inside each one.
                </p>
                <ol style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 8 }}>
                  {milestoneDrafts.map((d, i) => (
                    <li key={d.id} className="row">
                      <span className="mono" style={{ color: "var(--brand-cyan)", fontSize: 13 }}>
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span style={{ flex: 1 }}>{d.text}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        style={{ color: "var(--brand-red)" }}
                        onClick={() => setMilestoneDrafts((prev) => prev.filter((x) => x.id !== d.id))}
                        aria-label={`Remove milestone: ${d.text}`}
                      >
                        ✕
                      </Button>
                    </li>
                  ))}
                </ol>
                {milestoneDrafts.length < 8 && (
                  <div className="row">
                    <input
                      className="input"
                      value={draft}
                      onChange={(e) => setDraft(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") addDraft();
                      }}
                      placeholder={`Milestone ${milestoneDrafts.length + 1}...`}
                      aria-label="New milestone title"
                    />
                    <Button variant="secondary" onClick={addDraft} disabled={!draft.trim()}>
                      Add
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>

      <div className="row row--between" style={{ marginTop: 24 }}>
        <Button variant="ghost" onClick={() => (step === 0 ? onClose() : setStep(step - 1))}>
          {step === 0 ? "Cancel" : "← Back"}
        </Button>
        {isLast ? (
          <Button
            variant="gold"
            size="lg"
            onClick={finish}
            disabled={!form.title.trim() || (!isEdit && milestoneDrafts.length === 0)}
          >
            {isEdit ? "Save Changes" : "🗺 Map This Project"}
          </Button>
        ) : (
          <Button variant="primary" onClick={() => setStep(step + 1)} disabled={!canAdvance}>
            Next →
          </Button>
        )}
      </div>
    </Modal>
  );
}
