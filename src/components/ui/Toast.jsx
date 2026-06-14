import React, { useEffect } from "react";
import { useToasts } from "../../hooks/useToasts.js";

const TYPE_ICONS = {
  success: "✅",
  info: "💡",
  warning: "⚠️",
  error: "⛔",
  achievement: "🏅",
  xp: "✦"
};

function ToastItem({ toast, onDismiss }) {
  useEffect(() => {
    const ms = toast.type === "achievement" ? 5200 : 3400;
    const timer = setTimeout(() => onDismiss(toast.id), ms);
    return () => clearTimeout(timer);
  }, [toast, onDismiss]);

  return (
    <div className={`toast toast--${toast.type}`} role="status">
      <span className="toast__icon" aria-hidden="true">
        {toast.icon || TYPE_ICONS[toast.type] || "💡"}
      </span>
      <div>
        <div className="toast__title">{toast.title}</div>
        {toast.message && <div className="toast__message">{toast.message}</div>}
      </div>
      <button
        type="button"
        className="toast__close"
        onClick={() => onDismiss(toast.id)}
        aria-label="Dismiss notification"
      >
        ✕
      </button>
    </div>
  );
}

export default function ToastStack() {
  const { toasts, dismissToast } = useToasts();
  if (toasts.length === 0) return null;

  return (
    <div className="toast-stack" aria-live="polite">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onDismiss={dismissToast} />
      ))}
    </div>
  );
}
