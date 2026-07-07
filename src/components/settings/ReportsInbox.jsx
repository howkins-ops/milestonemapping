import React, { useEffect, useState, useCallback } from "react";
import Card from "../ui/Card.jsx";
import SectionHeader from "../ui/SectionHeader.jsx";
import Button from "../ui/Button.jsx";
import { supabase } from "../../lib/supabase.js";

// Admin-only moderation inbox (Guideline 1.2). The ToS promises reports are
// reviewed within 24 hours — this is where that review actually happens.
// Renders nothing for non-admin accounts.
export default function ReportsInbox() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [reports, setReports] = useState([]);
  const [filter, setFilter] = useState("open");
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState("");

  const load = useCallback(async (status) => {
    const { data, error: err } = await supabase.rpc("az_admin_list_reports", {
      p_status: status === "all" ? null : status,
    });
    if (err) {
      setError(err.message);
      return;
    }
    setReports(data || []);
  }, []);

  useEffect(() => {
    if (!supabase) return;
    let cancelled = false;
    supabase.rpc("az_is_admin").then(({ data }) => {
      if (cancelled || !data) return;
      setIsAdmin(true);
      load("open");
    });
    return () => {
      cancelled = true;
    };
  }, [load]);

  if (!isAdmin) return null;

  const resolve = async (id, status) => {
    setBusyId(id);
    setError("");
    const { error: err } = await supabase.rpc("az_admin_resolve_report", {
      p_id: id,
      p_status: status,
    });
    setBusyId(null);
    if (err) {
      setError(err.message);
      return;
    }
    load(filter);
  };

  const openCount = reports.filter((r) => r.status === "open").length;

  return (
    <>
      <SectionHeader title={`Reports Inbox${openCount ? ` (${openCount} open)` : ""}`} icon="🚨" />
      <Card variant="glass">
        <div className="row" style={{ gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
          {["open", "reviewing", "resolved", "dismissed", "all"].map((s) => (
            <Button
              key={s}
              size="sm"
              variant={filter === s ? "neon" : "ghost"}
              onClick={() => {
                setFilter(s);
                load(s);
              }}
            >
              {s}
            </Button>
          ))}
        </div>
        {error && <p style={{ color: "#ff405d", fontSize: 13, marginBottom: 10 }}>{error}</p>}
        {reports.length === 0 ? (
          <p className="muted" style={{ fontSize: 13.5 }}>
            No {filter === "all" ? "" : filter + " "}reports. The Zone is quiet.
          </p>
        ) : (
          reports.map((r) => (
            <div
              key={r.id}
              style={{ padding: "12px 0", borderBottom: "1px solid var(--border, rgba(255,255,255,0.08))" }}
            >
              <p style={{ fontSize: 13.5, fontWeight: 700 }}>
                {r.content_type} · {r.reason}
                <span className="soft" style={{ fontWeight: 400, marginLeft: 8, fontSize: 12 }}>
                  {new Date(r.created_at).toLocaleString()}
                </span>
              </p>
              <p className="muted" style={{ fontSize: 13, margin: "3px 0" }}>
                by @{r.reporter_name || "unknown"}
                {r.target_name ? ` → against @${r.target_name}` : ""}
                {" · "}status: {r.status}
              </p>
              {r.details && <p className="soft" style={{ fontSize: 12.5, margin: "3px 0 8px" }}>"{r.details}"</p>}
              {(r.status === "open" || r.status === "reviewing") && (
                <div className="row" style={{ gap: 8, marginTop: 6 }}>
                  {r.status === "open" && (
                    <Button size="sm" variant="ghost" disabled={busyId === r.id} onClick={() => resolve(r.id, "reviewing")}>
                      Mark reviewing
                    </Button>
                  )}
                  <Button size="sm" variant="neon" disabled={busyId === r.id} onClick={() => resolve(r.id, "resolved")}>
                    Resolve
                  </Button>
                  <Button size="sm" variant="ghost" disabled={busyId === r.id} onClick={() => resolve(r.id, "dismissed")}>
                    Dismiss
                  </Button>
                </div>
              )}
            </div>
          ))
        )}
      </Card>
    </>
  );
}
