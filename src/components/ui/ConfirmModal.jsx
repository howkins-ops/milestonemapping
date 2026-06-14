import React from "react";
import Modal from "./Modal.jsx";
import Button from "./Button.jsx";

export default function ConfirmModal({
  open,
  onClose,
  onConfirm,
  title = "Are you sure?",
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  danger = false
}) {
  return (
    <Modal open={open} onClose={onClose} title={title}>
      {message && <p className="muted" style={{ marginBottom: 22 }}>{message}</p>}
      <div className="row" style={{ justifyContent: "flex-end" }}>
        <Button variant="ghost" onClick={onClose}>
          {cancelLabel}
        </Button>
        <Button
          variant={danger ? "danger" : "primary"}
          onClick={() => {
            onConfirm && onConfirm();
            onClose && onClose();
          }}
        >
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}
