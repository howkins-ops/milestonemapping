import React from "react";
import IdentityForm from "./IdentityForm.jsx";
import IdentityRules from "./IdentityRules.jsx";
export default function IdentityPage() {
  return (
    <div className="anim-fade-in">
      <header className="page-header">
        <div className="page-header__kicker">IDENTITY BUILDER</div>
        <h1 className="page-header__title">
          Goals change what you chase. Identity changes what you keep.
        </h1>
        <p className="page-header__sub">
          Name the old version. Name the new one. Then write the rules the new one lives by.
        </p>
      </header>

      <IdentityForm />

      <div style={{ marginTop: 16 }}>
        <IdentityRules />
      </div>
    </div>
  );
}
