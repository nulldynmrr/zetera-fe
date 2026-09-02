"use client";

import type { ReactNode } from "react";

interface GhostButtonProps {
  children: ReactNode;
  onClick?: () => void;
  href?: string;
  size?: "sm" | "md";
  id?: string;
}

export function GhostButton({ children, onClick, href, size = "md", id }: GhostButtonProps) {
  const style: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: 4,
    background: "none",
    border: "none",
    padding: size === "sm" ? "4px 0" : "8px 0",
    cursor: "pointer",
    fontFamily: "var(--font-switzer)",
    fontSize: size === "sm" ? "var(--text-body)" : "var(--text-body)",
    fontWeight: 500,
    color: "var(--color-portrait-ink)",
    textDecoration: "none",
    transition: "opacity 0.15s ease",
    letterSpacing: "-0.01em",
  };

  if (href) {
    return (
      <a
        id={id}
        href={href}
        style={style}
        onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.opacity = "0.6")}
        onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.opacity = "1")}
      >
        {children}
      </a>
    );
  }

  return (
    <button
      id={id}
      onClick={onClick}
      style={style}
      onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.opacity = "0.6")}
      onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.opacity = "1")}
    >
      {children}
    </button>
  );
}
