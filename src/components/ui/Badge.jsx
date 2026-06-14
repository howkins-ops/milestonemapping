import React from "react";

export default function Badge({ tone = "", className = "", children }) {
  return <span className={`badge ${tone ? `badge--${tone}` : ""} ${className}`}>{children}</span>;
}

export const PRIORITY_TONES = {
  low: "",
  medium: "cyan",
  high: "pink",
  mission_critical: "red"
};

export const PRIORITY_LABELS = {
  low: "Low",
  medium: "Medium",
  high: "High",
  mission_critical: "Mission Critical"
};

export const STATUS_TONES = {
  not_started: "",
  active: "cyan",
  paused: "gold",
  completed: "green"
};

export const STATUS_LABELS = {
  not_started: "Not Started",
  active: "Active",
  paused: "Paused",
  completed: "Completed"
};
