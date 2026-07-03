import React from "react";
import { WITNESS } from "../witness/witnessLines.js";

// Empty state in the Witness's voice. `which` keys into WITNESS.empty.
export default function ZoneEmpty({ which = "feed", icon = "🔥", children }) {
  return (
    <div className="zn-empty">
      <div className="zn-empty__icon" aria-hidden="true">{icon}</div>
      <p style={{ margin: 0 }}>{WITNESS.empty[which] || WITNESS.empty.feed}</p>
      {children}
    </div>
  );
}
