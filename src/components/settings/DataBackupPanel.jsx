import React, { useRef } from "react";
import Card from "../ui/Card.jsx";
import Button from "../ui/Button.jsx";
import SectionHeader from "../ui/SectionHeader.jsx";
import { useAppData } from "../../hooks/useAppData.js";
import { getTodayKey } from "../../lib/dates.js";

export default function DataBackupPanel() {
  const { exportData, importData, pushToast } = useAppData();
  const fileRef = useRef(null);

  const handleExport = () => {
    try {
      const data = exportData();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `milestone-mapping-backup-${getTodayKey()}.json`;
      a.click();
      URL.revokeObjectURL(url);
      pushToast({ type: "success", title: "Backup exported", message: "Mission data secured." });
    } catch (err) {
      console.error("Export failed", err);
      pushToast({ type: "error", title: "Export failed", message: "Could not create the backup file." });
    }
  };

  const handleImportFile = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        importData(JSON.parse(reader.result));
      } catch (err) {
        console.error("Import failed", err);
        pushToast({ type: "error", title: "Import failed", message: "That file is not valid JSON." });
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  return (
    <section>
      <SectionHeader title="Data Backup" icon="💾" sub="Local-first. Your data never leaves this device." />
      <Card>
        <div className="row row--wrap">
          <Button variant="secondary" onClick={handleExport}>
            ⬇ Export All Data (JSON)
          </Button>
          <Button variant="secondary" onClick={() => fileRef.current && fileRef.current.click()}>
            ⬆ Import JSON Backup
          </Button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            style={{ display: "none" }}
            onChange={handleImportFile}
            aria-label="Import backup file"
          />
        </div>
        <p className="soft" style={{ fontSize: 12.5, marginTop: 14 }}>
          Importing replaces all current data with the backup's contents.
        </p>
      </Card>
    </section>
  );
}
