import React from "react";
import Card from "../ui/Card.jsx";
import SectionHeader from "../ui/SectionHeader.jsx";
import DataBackupPanel from "./DataBackupPanel.jsx";
import ThemeSelector from "./ThemeSelector.jsx";
import DangerZone from "./DangerZone.jsx";
import { useSettings } from "../../hooks/useSettings.js";
import { useAppData } from "../../hooks/useAppData.js";
import Button from "../ui/Button.jsx";

function ToggleRow({ label, hint, checked, onChange }) {
  return (
    <div className="row row--between" style={{ padding: "10px 0" }}>
      <div>
        <p style={{ fontWeight: 600, fontSize: 14.5 }}>{label}</p>
        {hint && <p className="soft" style={{ fontSize: 12.5, marginTop: 2 }}>{hint}</p>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        style={{
          width: 52,
          height: 28,
          borderRadius: 999,
          border: "1px solid",
          borderColor: checked ? "var(--accent)" : "var(--border)",
          background: checked ? "rgba(0,240,255,0.18)" : "#020304",
          position: "relative",
          transition: "background 200ms, border-color 200ms",
          flexShrink: 0
        }}
      >
        <span
          aria-hidden="true"
          style={{
            position: "absolute",
            top: 3,
            left: checked ? 26 : 3,
            width: 20,
            height: 20,
            borderRadius: "50%",
            background: checked ? "var(--accent)" : "var(--text-soft)",
            boxShadow: checked ? "0 0 10px var(--accent)" : "none",
            transition: "left 200ms var(--ease-out), background 200ms"
          }}
        />
      </button>
    </div>
  );
}

export default function SettingsPage() {
  const { settings, updateSettings } = useSettings();
  const { loadSampleData } = useAppData();

  return (
    <div className="anim-fade-in">
      <header className="page-header">
        <div className="page-header__kicker">SYSTEM CONFIG</div>
        <h1 className="page-header__title">Settings</h1>
        <p className="page-header__sub">Tune mission control to fit your rhythm.</p>
      </header>

      <SectionHeader title="Experience" icon="🎛" />
      <Card>
        <ToggleRow
          label="Sound effects"
          hint="Synth pops, chimes, and level-up fanfares."
          checked={settings.soundEnabled}
          onChange={(v) => updateSettings({ soundEnabled: v })}
        />
        <hr className="divider" style={{ margin: "4px 0" }} />
        <ToggleRow
          label="Boot intro"
          hint="The mission control boot sequence on app launch."
          checked={settings.introEnabled}
          onChange={(v) => updateSettings({ introEnabled: v })}
        />
        <hr className="divider" style={{ margin: "4px 0" }} />
        <ToggleRow
          label="Reduced motion"
          hint="Disables ambient animation, particles, and confetti."
          checked={settings.reducedMotion}
          onChange={(v) => updateSettings({ reducedMotion: v })}
        />
      </Card>

      <ThemeSelector />
      <DataBackupPanel />

      <SectionHeader title="Starter Content" icon="🧪" />
      <Card variant="glass">
        <p className="muted" style={{ fontSize: 14, marginBottom: 12 }}>
          Want to see the system in motion before mapping your own missions?
        </p>
        <Button variant="neon" size="sm" onClick={loadSampleData}>
          Load Example Mission Map
        </Button>
      </Card>

      <DangerZone />
    </div>
  );
}
