import React from "react";

const ICONS = {
  dashboard: (
    <>
      <path d="M12 3.5 19.5 8v8L12 20.5 4.5 16V8L12 3.5Z" />
      <path d="M12 8.25v7.5" />
      <path d="m7.25 10.5 4.75 2.75 4.75-2.75" />
      <path d="M8.2 5.9 12 8.25l3.8-2.35" className="nav-icon__spark" />
    </>
  ),
  daily: (
    <>
      <path d="M13.25 2.75 5.5 13h5.5l-1.25 8.25L18.5 10h-5.75l.5-7.25Z" />
      <path d="M5 20.5h14" className="nav-icon__spark" />
    </>
  ),
  milestones: (
    <>
      <path d="M5 18.5c2.5-5.5 11.5-.5 14-6 1.1-2.4-.6-5-3.4-5.2" />
      <path d="M7.75 6.5 5 9.25 2.25 6.5 5 3.75l2.75 2.75Z" />
      <path d="M21.75 17.5 19 20.25l-2.75-2.75L19 14.75l2.75 2.75Z" />
      <circle cx="12" cy="12" r="1.4" className="nav-icon__spark" />
    </>
  ),
  essence: (
    <>
      <path d="M16.8 18.6A7.8 7.8 0 0 1 9.2 5.1a7.7 7.7 0 1 0 7.6 13.5Z" />
      <path d="M15.5 5.25v3.5" className="nav-icon__spark" />
      <path d="M13.75 7h3.5" className="nav-icon__spark" />
      <path d="M18.75 9.5v2.5" className="nav-icon__spark" />
      <path d="M17.5 10.75H20" className="nav-icon__spark" />
    </>
  ),
  wellbeing: (
    <>
      <path d="M6.5 8.25h9.25v5.25a4.6 4.6 0 0 1-4.6 4.6 4.65 4.65 0 0 1-4.65-4.6V8.25Z" />
      <path d="M15.75 10h1.2a2.2 2.2 0 1 1 0 4.4h-1.2" />
      <path d="M7 20.25h10" />
      <path d="M8.25 5.5c.9-.8.9-1.7 0-2.5" className="nav-icon__spark" />
      <path d="M11.25 5.5c.9-.8.9-1.7 0-2.5" className="nav-icon__spark" />
      <path d="M14.25 5.5c.9-.8.9-1.7 0-2.5" className="nav-icon__spark" />
    </>
  ),
  weekly: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="m14.75 9.25-1.8 4.05-4.2 1.95 1.9-4.25 4.1-1.75Z" />
      <path d="M12 3.5v2" className="nav-icon__spark" />
      <path d="M12 18.5v2" className="nav-icon__spark" />
    </>
  ),
  rewards: (
    <>
      <path d="M8.25 5.25h7.5v3.5a3.75 3.75 0 0 1-7.5 0v-3.5Z" />
      <path d="M8.25 6.5H5.5v1.1a3 3 0 0 0 3 3" />
      <path d="M15.75 6.5h2.75v1.1a3 3 0 0 1-3 3" />
      <path d="M12 12.5v4" />
      <path d="M8.75 20h6.5" />
      <path d="M10 16.5h4" />
      <path d="m12 6.9 1 1-1 1-1-1 1-1Z" className="nav-icon__spark" />
    </>
  ),
  vision: (
    <>
      <path d="M4 15.5 8.75 9l2.75 2.75L6.75 18.25 4 15.5Z" />
      <path d="M9.5 8.25 16 4l4 4-6.5 4.25" />
      <path d="M15.25 5.25 18.75 8.75" />
      <path d="M17.5 14.25v4.5" className="nav-icon__spark" />
      <path d="M15.25 16.5h4.5" className="nav-icon__spark" />
    </>
  ),
  identity: (
    <>
      <path d="M8 4.5c3.7 1 6.3 5 8 15" />
      <path d="M16 4.5c-3.7 1-6.3 5-8 15" />
      <path d="M9.25 8h5.5" className="nav-icon__spark" />
      <path d="M8.5 12h7" className="nav-icon__spark" />
      <path d="M9.25 16h5.5" className="nav-icon__spark" />
    </>
  ),
  stats: (
    <>
      <path d="M4.5 19.5h15" />
      <path d="M6.5 16v-4" />
      <path d="M12 16V7.5" />
      <path d="M17.5 16v-7" />
      <path d="m6.5 10.5 4-3 3.3 2.25 4-4.25" className="nav-icon__spark" />
    </>
  ),
  formula: (
    <>
      <path d="M9.25 3.75h5.5" />
      <path d="M10.25 3.75v5l-4.2 7.35a2.75 2.75 0 0 0 2.4 4.15h7.1a2.75 2.75 0 0 0 2.4-4.15l-4.2-7.35v-5" />
      <path d="M8 16h8" className="nav-icon__spark" />
      <circle cx="10" cy="13" r=".55" className="nav-icon__fill" />
      <circle cx="14.5" cy="17.2" r=".55" className="nav-icon__fill" />
    </>
  ),
  training: (
    <>
      <path d="M19 12a7 7 0 1 1-3.1-5.82" />
      <path d="M16.15 6.05c-2.6-.25-5.05 1.35-5.8 3.8-.8 2.6.55 5.35 3.05 6.35" />
      <path d="M7.25 12.75c.55-3.5 4.65-5.35 7.85-3.55 2.7 1.5 3.25 5.2 1.1 7.4" className="nav-icon__spark" />
    </>
  ),
  settings: (
    <>
      <path d="M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Z" />
      <path d="m12.8 3.5.75 1.95 2.05.85 1.9-.85 1.05 1.8-1.65 1.25.25 2.2 1.6 1.35-1.05 1.8-1.95-.75-1.8 1.35-.3 2.05h-2.1l-.3-2.05-1.8-1.35-1.95.75-1.05-1.8 1.6-1.35.25-2.2-1.65-1.25 1.05-1.8 1.9.85 2.05-.85.75-1.95h2.1Z" />
    </>
  ),
  blaze: (
    <>
      <path d="M13.25 2.75 5.5 13h5.5l-1.25 8.25L18.5 10h-5.75l.5-7.25Z" />
      <path d="M16 4.75 19.5 2.5" className="nav-icon__spark" />
      <path d="M18.5 7.5h2.25" className="nav-icon__spark" />
    </>
  ),
  science: (
    <>
      <circle cx="12" cy="12" r="1.55" className="nav-icon__fill" />
      <ellipse cx="12" cy="12" rx="8.5" ry="3.4" />
      <ellipse cx="12" cy="12" rx="8.5" ry="3.4" transform="rotate(60 12 12)" />
      <ellipse cx="12" cy="12" rx="8.5" ry="3.4" transform="rotate(120 12 12)" />
    </>
  ),
  assets: (
    <>
      <path d="M4.5 5.5h15v13h-15v-13Z" />
      <path d="M7.25 15.75 10.4 12.6l2.15 2.15 1.85-1.85 2.35 2.85" className="nav-icon__spark" />
      <circle cx="15.75" cy="8.75" r="1.2" className="nav-icon__fill" />
      <path d="M7 3.5h10" />
      <path d="M7 20.5h10" />
    </>
  ),
  profile: (
    <>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5.25 20.25a6.75 6.75 0 0 1 13.5 0" />
      <path d="M8.5 18.5h7" className="nav-icon__spark" />
    </>
  ),
  more: (
    <>
      <path d="M5 7h14" />
      <path d="M5 12h14" />
      <path d="M5 17h14" />
      <circle cx="9" cy="7" r="1.35" className="nav-icon__fill" />
      <circle cx="15" cy="12" r="1.35" className="nav-icon__fill" />
      <circle cx="11" cy="17" r="1.35" className="nav-icon__fill" />
    </>
  ),
  paths: (
    <>
      <path d="M12 3.25 19.75 12 12 20.75 4.25 12 12 3.25Z" />
      <path d="M8 12h8" className="nav-icon__spark" />
      <path d="M12 7.5v9" className="nav-icon__spark" />
      <path d="m12 3.25 3.9 8.75-3.9 8.75L8.1 12 12 3.25Z" />
    </>
  )
};

const ALIASES = {
  command: "dashboard",
  map: "milestones",
  shadow: "essence",
  review: "weekly",
  reward: "rewards"
};

export default function NavIcon({ name, className = "", ...props }) {
  const key = ALIASES[name] || name;
  const icon = ICONS[key] || ICONS.dashboard;

  return (
    <svg
      className={`nav-icon ${className}`.trim()}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      {icon}
    </svg>
  );
}
