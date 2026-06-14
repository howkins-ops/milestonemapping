import React from "react";

const VARIANT_CLASS = {
  default: "",
  glass: "card--glass",
  neon: "card--neon",
  gold: "card--gold",
  danger: "card--danger",
  pink: "card--pink",
  completed: "card--completed"
};

export default function Card({ variant = "default", hoverable = false, className = "", children, ...rest }) {
  return (
    <div
      className={`card ${VARIANT_CLASS[variant] || ""} ${hoverable ? "card--hoverable" : ""} ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
}
