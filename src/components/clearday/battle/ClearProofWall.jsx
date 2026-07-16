import React, { useEffect, useMemo, useState } from "react";
import { loadClearProof } from "./clearProofMedia.js";

function ProofTile({ battle }) {
  const [url, setUrl] = useState("");
  useEffect(() => {
    let active = true;
    let objectUrl = "";
    loadClearProof(battle.proofId).then((record) => {
      if (!active || !record?.blob) return;
      objectUrl = URL.createObjectURL(record.blob);
      setUrl(objectUrl);
    }).catch(() => {});
    return () => { active = false; if (objectUrl) URL.revokeObjectURL(objectUrl); };
  }, [battle.proofId]);
  if (!url) return <div className="cd-proof-tile cd-proof-tile--loading" aria-label="Loading private proof" />;
  return <figure className="cd-proof-tile"><img src={url} alt={`Private proof: ${battle.nextAction || "protective action"}`} /><figcaption><strong>{battle.nextAction || "Proof posted"}</strong><span>Day {battle.day} · private</span></figcaption></figure>;
}

export default function ClearProofWall({ battles = [] }) {
  const proofs = useMemo(() => battles.filter((battle) => battle?.proofId).slice(0, 8), [battles]);
  if (!proofs.length) return null;
  return <section className="cd-proof-wall"><div className="cd-label cd-label--dawn">PRIVATE PROOF WALL</div><p className="cd-proof-wall-copy">Real-world evidence attached to the actions you completed. These photos stay on this device.</p><div className="cd-proof-grid">{proofs.map((battle) => <ProofTile key={battle.proofId} battle={battle} />)}</div></section>;
}
