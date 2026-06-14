import React, { useState } from "react";
import Modal from "../ui/Modal.jsx";
import Button from "../ui/Button.jsx";
import TextInput from "../ui/TextInput.jsx";
import TextArea from "../ui/TextArea.jsx";
import Select from "../ui/Select.jsx";
import ProgressBar from "../ui/ProgressBar.jsx";
import { CATEGORIES, PRIORITIES } from "../../lib/constants.js";
import { uid } from "../../lib/id.js";

const STEPS = [
  "Mission Name",
  "Why It Matters",
  "Future Vision",
  "Identity Shift",
  "Target & Priority",
  "First Weekly Actions",
  "Rewards"
];

const EMPTY_FORM = {
  title: "",
  category: "Business",
  description: "",
  whyItMatters: "",
  futureVision: "",
  oldIdentity: "",
  newIdentity: "",
  targetDate: "",
  priority: "medium",
  rewardSmall: "",
  rewardMedium: "",
  rewardLarge: ""
};

export default function MilestoneWizard({ open, onClose, onCreate, onUpdate, initial = null }) {
  const isEdit = Boolean(initial);
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(() => (initial ? { ...EMPTY_FORM, ...initial } : EMPTY_FORM));
  const [starterActions, setStarterActions] = useState(initial ? null : []);
  const [actionDraft, setActionDraft] = useState("");

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const reset = () => {
    setStep(0);
    setForm(initial ? { ...EMPTY_FORM, ...initial } : EMPTY_FORM);
    setStarterActions(initial ? null : []);
    setActionDraft("");
  };

  const close = () => {
    reset();
    onClose();
  };

  const addStarterAction = () => {
    const text = actionDraft.trim();
    if (!text || !starterActions || starterActions.length >= 10) return;
    setStarterActions((prev) => [...prev, { id: uid("act"), text }]);
    setActionDraft("");
  };

  const finish = () => {
    if (isEdit) {
      onUpdate(initial.id, form);
    } else {
      onCreate({
        ...form,
        status: "active",
        actions: (starterActions || []).map((a) => ({
          id: a.id,
          weekNumber: 1,
          text: a.text,
          done: false,
          createdAt: new Date().toISOString(),
          completedAt: null
        }))
      });
    }
    close();
  };

  const canAdvance = step !== 0 || form.title.trim().length > 0;
  const isLast = step === STEPS.length - 1;

  return (
    <Modal open={open} onClose={close} title={isEdit ? "Recalibrate Milestone" : "Map New Milestone"} wide>
      <ProgressBar value={step + 1} max={STEPS.length} label={`Step ${step + 1} of ${STEPS.length} — ${STEPS[step]}`} showPercent={false} />

      <div style={{ minHeight: 280, marginTop: 22 }} className="anim-fade-in" key={step}>
        {step === 0 && (
          <div className="stack">
            <h3 style={{ fontSize: 22 }}>What are you building?</h3>
            <TextInput
              label="Mission name"
              value={form.title}
              onChange={set("title")}
              placeholder="Example: Build my dream app, transform my body, hit $100K, write my book..."
              autoFocus
            />
            <Select label="Category" value={form.category} onChange={set("category")} options={CATEGORIES} />
            <TextArea
              label="Mission description (optional)"
              rows={2}
              value={form.description}
              onChange={set("description")}
            />
          </div>
        )}

        {step === 1 && (
          <div className="stack">
            <h3 style={{ fontSize: 22 }}>Why does this matter to your future?</h3>
            <p className="muted">A milestone without emotional weight will not survive resistance.</p>
            <TextArea rows={5} value={form.whyItMatters} onChange={set("whyItMatters")} autoFocus
              placeholder="What breaks if you don't do this? What opens if you do?" />
          </div>
        )}

        {step === 2 && (
          <div className="stack">
            <h3 style={{ fontSize: 22 }}>Describe the version of you who has already achieved this.</h3>
            <TextArea rows={5} value={form.futureVision} onChange={set("futureVision")} autoFocus
              placeholder="What does their day look like? How do they carry themselves?" />
          </div>
        )}

        {step === 3 && (
          <div className="stack">
            <h3 style={{ fontSize: 22 }}>Identity Shift</h3>
            <TextArea
              label="Old identity: What version of you are you leaving behind?"
              rows={3}
              value={form.oldIdentity}
              onChange={set("oldIdentity")}
            />
            <TextArea
              label="New identity: Who do you need to become?"
              rows={3}
              value={form.newIdentity}
              onChange={set("newIdentity")}
            />
          </div>
        )}

        {step === 4 && (
          <div className="stack">
            <h3 style={{ fontSize: 22 }}>Target Date & Priority</h3>
            <TextInput label="Target date" type="date" value={form.targetDate} onChange={set("targetDate")} />
            <Select label="Priority" value={form.priority} onChange={set("priority")} options={PRIORITIES} />
            {form.priority === "mission_critical" && (
              <p
                className="mono"
                style={{
                  color: "var(--brand-red)",
                  fontSize: 13,
                  textShadow: "0 0 12px rgba(255,59,92,0.6)",
                  animation: "flame-flicker 1.4s ease-in-out infinite"
                }}
              >
                ⚠ MISSION CRITICAL — failure is not on the map.
              </p>
            )}
          </div>
        )}

        {step === 5 && (
          <div className="stack">
            <h3 style={{ fontSize: 22 }}>What are the first moves that make this real?</h3>
            {isEdit ? (
              <p className="muted">Actions are managed from the milestone detail page.</p>
            ) : (
              <>
                <p className="muted">Add 3–10 starter actions for week one.</p>
                <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 8 }}>
                  {(starterActions || []).map((a, i) => (
                    <li key={a.id} className="row">
                      <span className="mono soft" style={{ fontSize: 12 }}>{String(i + 1).padStart(2, "0")}</span>
                      <span style={{ flex: 1 }}>{a.text}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        style={{ color: "var(--brand-red)" }}
                        onClick={() => setStarterActions((prev) => prev.filter((x) => x.id !== a.id))}
                        aria-label={`Remove: ${a.text}`}
                      >
                        ✕
                      </Button>
                    </li>
                  ))}
                </ul>
                {(starterActions || []).length < 10 && (
                  <div className="row">
                    <input
                      className="input"
                      value={actionDraft}
                      onChange={(e) => setActionDraft(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") addStarterAction();
                      }}
                      placeholder="First move..."
                      aria-label="New starter action"
                    />
                    <Button variant="secondary" onClick={addStarterAction} disabled={!actionDraft.trim()}>
                      Add
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {step === 6 && (
          <div className="stack">
            <h3 style={{ fontSize: 22 }}>What reward makes the chase exciting?</h3>
            <TextInput
              label="Small reward — unlocked at 33%"
              value={form.rewardSmall}
              onChange={set("rewardSmall")}
              placeholder="A small win for early momentum..."
            />
            <TextInput
              label="Medium reward — unlocked at 66%"
              value={form.rewardMedium}
              onChange={set("rewardMedium")}
              placeholder="Something worth pushing through the middle for..."
            />
            <TextInput
              label="Large reward — unlocked at 100%"
              value={form.rewardLarge}
              onChange={set("rewardLarge")}
              placeholder="The trophy at the summit..."
            />
          </div>
        )}
      </div>

      <div className="row row--between" style={{ marginTop: 24 }}>
        <Button variant="ghost" onClick={() => (step === 0 ? close() : setStep(step - 1))}>
          {step === 0 ? "Cancel" : "← Back"}
        </Button>
        {isLast ? (
          <Button variant="gold" size="lg" onClick={finish} disabled={!form.title.trim()}>
            {isEdit ? "Save Changes" : "🗺 Map This Milestone"}
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
