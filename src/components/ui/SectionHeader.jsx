import React from "react";

export default function SectionHeader({ title, icon, sub, action }) {
  return (
    <div className="section-header">
      <div>
        <h2 className="section-header__title">
          {icon && <span aria-hidden="true">{icon}</span>}
          {title}
        </h2>
        {sub && <p className="section-header__sub">{sub}</p>}
      </div>
      {action}
    </div>
  );
}
