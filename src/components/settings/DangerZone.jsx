import React, { useState } from "react";
import Card from "../ui/Card.jsx";
import Button from "../ui/Button.jsx";
import Modal from "../ui/Modal.jsx";
import SectionHeader from "../ui/SectionHeader.jsx";
import { useAppData } from "../../hooks/useAppData.js";

export default function DangerZone() {
  const { clearAllData } = useAppData();
  const [open, setOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");

  const close = () => {
    setOpen(false);
    setConfirmText("");
  };

  const confirm = () => {
    if (confirmText !== "DELETE") return;
    clearAllData();
    close();
  };

  return (
    <section>
      <SectionHeader title="Danger Zone" icon="☢️" sub="Irreversible operations live here." />
      <Card variant="danger">
        <p className="muted" style={{ marginBottom: 14, fontSize: 14 }}>
          Wipes every milestone, log, review, vision, identity, achievement, and XP point from
          this browser. There is no undo.
        </p>
        <Button variant="danger" onClick={() => setOpen(true)}>
          Clear All Data
        </Button>
      </Card>

      <Modal open={open} onClose={close} title="Confirm total wipe">
        <p className="muted" style={{ marginBottom: 16 }}>
          Type <strong style={{ color: "var(--brand-red)" }}>DELETE</strong> to confirm. This
          permanently erases all Milestone Mapping data on this device.
        </p>
        <input
          className="input"
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value)}
          placeholder="Type DELETE"
          aria-label="Type DELETE to confirm"
          autoFocus
        />
        <div className="row" style={{ justifyContent: "flex-end", marginTop: 18 }}>
          <Button variant="ghost" onClick={close}>
            Cancel
          </Button>
          <Button variant="danger" onClick={confirm} disabled={confirmText !== "DELETE"}>
            Erase Everything
          </Button>
        </div>
      </Modal>
    </section>
  );
}
