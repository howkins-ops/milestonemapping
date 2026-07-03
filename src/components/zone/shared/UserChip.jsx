import React from "react";

// Avatar + name + subline. `member` = { username, display_name, avatar_url, identity_title }.
export default function UserChip({ member, sub, size = "md", right = null }) {
  if (!member) return null;
  const name = member.display_name || member.username || "someone";
  const subline = sub != null ? sub : member.identity_title || (member.username ? `@${member.username}` : "");
  const cls = size === "lg" ? "zn-avatar zn-avatar--lg" : size === "sm" ? "zn-avatar zn-avatar--sm" : "zn-avatar";
  return (
    <div className="zn-userchip">
      {member.avatar_url ? (
        <img
          className={cls}
          src={member.avatar_url}
          alt=""
          onError={(e) => {
            e.currentTarget.style.visibility = "hidden";
          }}
        />
      ) : (
        <div className={cls} aria-hidden="true">{name.slice(0, 1).toUpperCase()}</div>
      )}
      <div style={{ minWidth: 0, flex: 1 }}>
        <div className="zn-userchip__name">{name}</div>
        {subline ? <div className="zn-userchip__sub">{subline}</div> : null}
      </div>
      {right}
    </div>
  );
}
