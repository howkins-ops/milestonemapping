import React, { useEffect, useRef, useState } from "react";
import { supabase } from "../../../lib/supabase.js";
import { useAppData } from "../../../hooks/useAppData.js";
import { zoneErrorMessage } from "../../../lib/zoneFire.js";
import MediaImage from "../shared/MediaImage.jsx";
import ZoneEmpty from "../shared/ZoneEmpty.jsx";
import { ProofSheet } from "./PhotoCalendar.jsx";

const PROOF_COLUMNS = "id, proof_date, media_path, caption, kind, xp_earned, duration_minutes, created_at";

// Latest 30 photo proofs in a 3-up grid. Direct table read — RLS filters
// visibility for viewers, so this works for any profile the viewer may see.
export default function ProofGallery({ userId }) {
  const { pushToast } = useAppData();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const aliveRef = useRef(true);

  useEffect(() => {
    aliveRef.current = true;
    if (!supabase || !userId) {
      setLoading(false);
      return undefined;
    }
    (async () => {
      try {
        const { data, error } = await supabase
          .from("zone_proofs")
          .select(PROOF_COLUMNS)
          .eq("user_id", userId)
          .not("media_path", "is", null)
          .order("created_at", { ascending: false })
          .limit(30);
        if (error) throw error;
        if (aliveRef.current) setItems(data || []);
      } catch (err) {
        if (aliveRef.current) {
          pushToast({ type: "error", title: "Couldn't load the gallery", message: zoneErrorMessage(err) });
        }
      } finally {
        if (aliveRef.current) setLoading(false);
      }
    })();
    return () => {
      aliveRef.current = false;
    };
  }, [userId, pushToast]);

  if (loading) {
    return <div className="zn-empty">Developing the photos…</div>;
  }
  if (!items.length) {
    return <ZoneEmpty which="gallery" icon="📸" />;
  }

  return (
    <div className="zn-card">
      <p className="zn-eyebrow">Proof gallery</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6 }}>
        {items.map((p) => (
          <button
            key={p.id}
            type="button"
            aria-label={p.caption || "Proof photo"}
            onClick={() => setSelected(p)}
            style={{
              padding: 0,
              border: "none",
              background: "transparent",
              cursor: "pointer",
              borderRadius: 12,
              overflow: "hidden",
            }}
          >
            <MediaImage
              path={p.media_path}
              alt=""
              style={{
                width: "100%",
                aspectRatio: "1",
                objectFit: "cover",
                borderRadius: 12,
                display: "block",
              }}
            />
          </button>
        ))}
      </div>

      {selected && (
        <ProofSheet
          title={formatDay(selected.proof_date)}
          proofs={[selected]}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}

function formatDay(key) {
  if (!key) return "Proof";
  const d = new Date(`${key}T00:00:00`);
  if (Number.isNaN(d.getTime())) return key;
  return d.toLocaleDateString([], { weekday: "long", month: "long", day: "numeric" });
}
