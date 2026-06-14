import React from "react";
import Card from "../ui/Card.jsx";
import SectionHeader from "../ui/SectionHeader.jsx";
import { useSettings } from "../../hooks/useSettings.js";
import { THEMES } from "../../lib/constants.js";

const THEME_SWATCHES = {
  dark_neon: ["#00F0FF", "#00FFBF"],
  gold_warrior: ["#FACC15", "#FB923C"],
  cyber_phoenix: ["#8B5CF6", "#FF3EDB"],
  clean_focus: ["#00F0FF", "#05070A"],
  bloodline: ["#FF3B5C", "#FF3EDB"],
  empire: ["#8B5CF6", "#FACC15"]
};

export default function ThemeSelector() {
  const { settings, updateSettings } = useSettings();

  return (
    <section>
      <SectionHeader title="Theme" icon="🎨" sub="Every theme keeps the black foundation." />
      <Card>
        <div className="grid-stats">
          {THEMES.map((t) => {
            const active = settings.theme === t.value;
            const [c1, c2] = THEME_SWATCHES[t.value];
            return (
              <button
                key={t.value}
                type="button"
                onClick={() => updateSettings({ theme: t.value })}
                aria-pressed={active}
                className="card"
                style={{
                  cursor: "pointer",
                  padding: 14,
                  borderColor: active ? c1 : "var(--border)",
                  boxShadow: active ? `0 0 22px ${c1}44` : "none",
                  textAlign: "center"
                }}
              >
                <div
                  aria-hidden="true"
                  style={{
                    height: 34,
                    borderRadius: 8,
                    background: `linear-gradient(135deg, ${c1}, ${c2})`,
                    opacity: 0.85,
                    marginBottom: 10
                  }}
                />
                <span style={{ fontSize: 13, fontWeight: 700, color: active ? c1 : "var(--text-muted)" }}>
                  {t.label} {active && "✓"}
                </span>
              </button>
            );
          })}
        </div>
      </Card>
    </section>
  );
}
