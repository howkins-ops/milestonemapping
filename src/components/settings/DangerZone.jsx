import React, { useState } from "react";
import Card from "../ui/Card.jsx";
import Button from "../ui/Button.jsx";
import Modal from "../ui/Modal.jsx";
import SectionHeader from "../ui/SectionHeader.jsx";
import { useAppData } from "../../hooks/useAppData.js";
import { supabase } from "../../lib/supabaseClient.js";
import { SUPPORT_EMAIL } from "../../lib/constants.js";

export default function DangerZone() {
  const { clearAllData, pushToast, userId } = useAppData();
  const [open, setOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [accountOpen, setAccountOpen] = useState(false);
  const [accountText, setAccountText] = useState("");
  const [deleting, setDeleting] = useState(false);

  const close = () => {
    setOpen(false);
    setConfirmText("");
  };

  const confirm = () => {
    if (confirmText !== "DELETE") return;
    clearAllData();
    close();
  };

  const closeAccount = () => {
    if (deleting) return;
    setAccountOpen(false);
    setAccountText("");
  };

  const confirmAccount = async () => {
    if (accountText !== "DELETE ACCOUNT" || deleting) return;
    setDeleting(true);
    try {
      if (supabase) {
        const { error } = await supabase.functions.invoke("delete-account", { method: "POST" });
        if (error) throw error;
      }
      clearAllData();
      if (supabase) await supabase.auth.signOut();
      // signOut drops the session; AuthGate returns to the landing screen.
    } catch {
      setDeleting(false);
      pushToast?.({
        type: "error",
        title: "Couldn't delete account",
        message: `Something went wrong. Try again, or email ${SUPPORT_EMAIL}.`,
      });
    }
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

      {userId && (
        <Card variant="danger" style={{ marginTop: 14 }}>
          <p className="muted" style={{ marginBottom: 14, fontSize: 14 }}>
            Permanently delete your account and everything tied to it — profile, posts, messages,
            proofs, journal, squads, and uploaded media. Deletion is immediate and cannot be undone.
          </p>
          <Button variant="danger" onClick={() => setAccountOpen(true)}>
            Delete Account &amp; All Data
          </Button>
        </Card>
      )}

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

      <Modal open={accountOpen} onClose={closeAccount} title="Delete your account?">
        <p className="muted" style={{ marginBottom: 16 }}>
          This deletes your account and all data on our servers right away — there is no
          recovery. Type <strong style={{ color: "var(--brand-red)" }}>DELETE ACCOUNT</strong> to
          confirm.
        </p>
        <input
          className="input"
          value={accountText}
          onChange={(e) => setAccountText(e.target.value)}
          placeholder="Type DELETE ACCOUNT"
          aria-label="Type DELETE ACCOUNT to confirm"
          autoFocus
        />
        <div className="row" style={{ justifyContent: "flex-end", marginTop: 18 }}>
          <Button variant="ghost" onClick={closeAccount} disabled={deleting}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={confirmAccount}
            disabled={accountText !== "DELETE ACCOUNT" || deleting}
          >
            {deleting ? "Deleting…" : "Delete Forever"}
          </Button>
        </div>
      </Modal>
    </section>
  );
}
