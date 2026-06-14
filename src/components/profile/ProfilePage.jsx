import React, { useState, useEffect, useCallback } from "react";
import Card from "../ui/Card.jsx";
import Button from "../ui/Button.jsx";
import TextInput from "../ui/TextInput.jsx";
import TextArea from "../ui/TextArea.jsx";
import SectionHeader from "../ui/SectionHeader.jsx";
import { useAppData } from "../../hooks/useAppData.js";
import { upsertProfile } from "../../lib/profileService.js";
import { setMemory } from "../../lib/memoryService.js";

const ESSENCE_SUGGESTIONS = [
  "Resilient", "Focused", "Disciplined", "Creative", "Bold",
  "Grounded", "Relentless", "Authentic", "Visionary", "Warrior",
  "Builder", "Leader", "Calm", "Fierce", "Present",
];

export default function ProfilePage({ onNavigate }) {
  const { userId, userEmail, profile, setProfile, pushToast } = useAppData();

  const [form, setForm] = useState({
    full_name: "",
    display_name: "",
    current_identity: "",
    mission_statement: "",
    main_goal: "",
    essence_words: [],
  });
  const [essenceInput, setEssenceInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Populate form from profile when it loads
  useEffect(() => {
    if (profile) {
      setForm({
        full_name: profile.full_name ?? "",
        display_name: profile.display_name ?? "",
        current_identity: profile.current_identity ?? "",
        mission_statement: profile.mission_statement ?? "",
        main_goal: profile.main_goal ?? "",
        essence_words: Array.isArray(profile.essence_words) ? profile.essence_words : [],
      });
    }
  }, [profile]);

  const addEssenceWord = useCallback((word) => {
    const w = word.trim();
    if (!w || form.essence_words.includes(w) || form.essence_words.length >= 8) return;
    setForm((prev) => ({ ...prev, essence_words: [...prev.essence_words, w] }));
    setEssenceInput("");
  }, [form.essence_words]);

  const removeEssenceWord = useCallback((word) => {
    setForm((prev) => ({ ...prev, essence_words: prev.essence_words.filter((w) => w !== word) }));
  }, []);

  const handleSave = async () => {
    if (!userId) {
      pushToast({ type: "error", title: "Not signed in", message: "Sign in to save your profile." });
      return;
    }
    setSaving(true);
    setSaved(false);
    const { data, error } = await upsertProfile(userId, {
      ...form,
      email: userEmail ?? profile?.email ?? "",
      updated_at: new Date().toISOString(),
    });
    setSaving(false);
    if (error) {
      pushToast({ type: "error", title: "Save failed", message: error.message });
      return;
    }
    if (data) setProfile(data);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
    pushToast({ type: "success", title: "Profile saved.", message: "Identity locked in." });

    // Write to memory
    if (form.essence_words.length > 0) {
      setMemory(userId, "identity", "essence_words", form.essence_words, "profile_save");
    }
    if (form.display_name) {
      setMemory(userId, "preference", "display_name", form.display_name, "profile_save");
    }
  };

  const field = (key, label, placeholder, multiline = false, rows = 2) => {
    const props = {
      label,
      placeholder,
      value: form[key],
      onChange: (e) => setForm((prev) => ({ ...prev, [key]: e.target.value })),
    };
    return multiline
      ? <TextArea {...props} rows={rows} />
      : <TextInput {...props} />;
  };

  return (
    <div className="anim-fade-in" style={{ paddingBottom: 80 }}>
      <header className="page-header">
        <div className="page-header__kicker">IDENTITY FILE</div>
        <h1 className="page-header__title">Who are you becoming?</h1>
        <p className="page-header__sub">
          {profile?.display_name || profile?.full_name
            ? `Welcome back, ${profile.display_name || profile.full_name}.`
            : userEmail
            ? `Signed in as ${userEmail}`
            : "Build your identity."}
        </p>
      </header>

      {/* Account Info */}
      <Card style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 12, color: "var(--text-soft)", letterSpacing: "0.1em", marginBottom: 8 }}>ACCOUNT</div>
        <div style={{ fontSize: 14, color: "var(--text-main)" }}>{userEmail || "Offline mode"}</div>
      </Card>

      {/* Name */}
      <SectionHeader title="Your Name" icon="👤" sub="How the app addresses you." />
      <Card>
        <div className="stack">
          {field("full_name", "Full Name", "Your full name")}
          {field("display_name", "Display Name (optional)", "What you want to be called")}
        </div>
      </Card>

      {/* Essence Words */}
      <SectionHeader title="Essence Words" icon="⚡" sub="The 3–8 words that describe your highest self." />
      <Card>
        <div className="stack">
          {form.essence_words.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {form.essence_words.map((w) => (
                <span
                  key={w}
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 6,
                    padding: "4px 12px", borderRadius: 20,
                    background: "rgba(0,240,255,0.12)", border: "1px solid rgba(0,240,255,0.4)",
                    color: "#00F0FF", fontSize: 13, fontWeight: 600,
                  }}
                >
                  {w}
                  <button
                    type="button"
                    onClick={() => removeEssenceWord(w)}
                    style={{ background: "none", border: "none", color: "#00F0FF", cursor: "pointer", padding: 0, fontSize: 14, lineHeight: 1 }}
                    aria-label={`Remove ${w}`}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}

          <div style={{ display: "flex", gap: 8 }}>
            <input
              className="input"
              placeholder="Add essence word..."
              value={essenceInput}
              onChange={(e) => setEssenceInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addEssenceWord(essenceInput); } }}
              disabled={form.essence_words.length >= 8}
              style={{ flex: 1 }}
            />
            <Button
              variant="secondary"
              onClick={() => addEssenceWord(essenceInput)}
              disabled={!essenceInput.trim() || form.essence_words.length >= 8}
            >
              Add
            </Button>
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {ESSENCE_SUGGESTIONS.filter((s) => !form.essence_words.includes(s)).slice(0, 8).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => addEssenceWord(s)}
                disabled={form.essence_words.length >= 8}
                style={{
                  padding: "3px 10px", borderRadius: 16, cursor: "pointer",
                  background: "transparent", border: "1px solid rgba(123,44,255,0.4)",
                  color: "rgba(234,251,255,0.6)", fontSize: 12, fontWeight: 500,
                }}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Identity */}
      <SectionHeader title="Current Identity" icon="🦅" sub="The version of you operating right now." />
      <Card>
        <div className="stack">
          {field("current_identity", "I am...", "I am a disciplined entrepreneur who...", true, 3)}
          {field("mission_statement", "Mission Statement", "My mission is to...", true, 3)}
        </div>
      </Card>

      {/* Primary Goal */}
      <SectionHeader title="Primary Goal" icon="🎯" sub="The one thing you're building toward." />
      <Card>
        {field("main_goal", "Main Goal", "My #1 goal right now is...", true, 2)}
      </Card>

      {/* Save */}
      <div style={{ marginTop: 24, display: "flex", gap: 12, alignItems: "center" }}>
        <Button
          variant="primary"
          onClick={handleSave}
          disabled={saving || !userId}
          style={{ minWidth: 160 }}
        >
          {saving ? "Saving..." : saved ? "✓ Saved" : "Save Profile"}
        </Button>
        {!userId && (
          <span style={{ fontSize: 12, color: "var(--text-soft)" }}>
            Sign in to save your profile permanently.
          </span>
        )}
      </div>
    </div>
  );
}
