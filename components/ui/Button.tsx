"use client";

import type { ReactNode } from "react";
import { BookOpen } from "lucide-react";

// Modern Academic Logo Mark with Lucide BookOpen
export function AcademicMark({ size = 20 }: { size?: number }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: size + 12,
        height: size + 12,
        borderRadius: 10,
        background: "linear-gradient(135deg, #00C988 0%, #059669 100%)",
        color: "#ffffff",
        boxShadow: "0 2px 8px rgba(0, 201, 136, 0.25)",
        flexShrink: 0,
      }}
    >
      <BookOpen size={size} strokeWidth={2.2} />
    </span>
  );
}

interface ButtonProps {
  children: ReactNode;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  type?: "button" | "submit" | "reset";
  variant?: "emerald" | "amber" | "primary" | "secondary" | "ghost" | "outline" | "danger";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
  id?: string;
  disabled?: boolean;
  icon?: ReactNode;
  style?: React.CSSProperties;
  className?: string;
}

export function Button({
  children,
  onClick,
  type = "button",
  variant = "emerald",
  size = "md",
  fullWidth = false,
  id,
  disabled = false,
  icon,
  style,
  className,
}: ButtonProps) {
  const sizeStyles = {
    sm: { padding: "6px 14px", fontSize: 13, height: 36 },
    md: { padding: "9px 18px", fontSize: 14, height: 40 },
    lg: { padding: "12px 24px", fontSize: 15, height: 46 },
  }[size];

  const variantStyles = {
    emerald: {
      background: "#00C988",
      color: "#ffffff",
      border: "none",
      boxShadow: "0 2px 6px rgba(0, 201, 136, 0.2)",
      hoverBg: "#05b377",
    },
    amber: {
      background: "#f59e0b",
      color: "#ffffff",
      border: "none",
      boxShadow: "0 2px 6px rgba(245, 158, 11, 0.2)",
      hoverBg: "#d97706",
    },
    primary: {
      background: "#0f172a",
      color: "#ffffff",
      border: "none",
      boxShadow: "0 2px 6px rgba(15, 23, 42, 0.12)",
      hoverBg: "#1e293b",
    },
    secondary: {
      background: "#f8fafc",
      color: "#334155",
      border: "1px solid #e2e8f0",
      boxShadow: "none",
      hoverBg: "#f1f5f9",
    },
    outline: {
      background: "transparent",
      color: "#0f172a",
      border: "1.5px solid #e2e8f0",
      boxShadow: "none",
      hoverBg: "#f8fafc",
    },
    danger: {
      background: "#fee2e2",
      color: "#991b1b",
      border: "1px solid #fecaca",
      boxShadow: "none",
      hoverBg: "#fca5a5",
    },
    ghost: {
      background: "transparent",
      color: "#64748b",
      border: "none",
      boxShadow: "none",
      hoverBg: "#f1f5f9",
    },
  }[variant];

  return (
    <button
      id={id}
      type={type}
      disabled={disabled}
      onClick={onClick}
      style={{
        display: fullWidth ? "flex" : "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        width: fullWidth ? "100%" : "auto",
        borderRadius: "var(--radius-buttons)",
        fontFamily: "var(--font-body)",
        fontWeight: 600,
        letterSpacing: "-0.01em",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.6 : 1,
        transition: "all 0.15s ease",
        whiteSpace: "nowrap",
        boxSizing: "border-box",
        ...sizeStyles,
        ...variantStyles,
        ...style,
      }}
      className={className}
      onMouseEnter={(e) => {
        if (!disabled) {
          e.currentTarget.style.background = variantStyles.hoverBg;
          e.currentTarget.style.transform = "translateY(-1px)";
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled) {
          e.currentTarget.style.background = variantStyles.background;
          e.currentTarget.style.transform = "none";
        }
      }}
    >
      {icon && <span style={{ display: "inline-flex" }}>{icon}</span>}
      {children}
    </button>
  );
}

export const PrimaryButton = Button;
export const RainbowButton = Button;
export const RainbowSquare = AcademicMark;
export const GraduationCapIcon = AcademicMark;
