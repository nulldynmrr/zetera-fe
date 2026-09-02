"use client";

import { forwardRef } from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  id: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, id, ...props }, ref) => {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 6, width: "100%" }}>
        {label && (
          <label
            htmlFor={id}
            style={{
              fontFamily: "var(--font-switzer)",
              fontSize: 13,
              fontWeight: 500,
              color: "var(--color-portrait-ink)",
              letterSpacing: "-0.01em",
            }}
          >
            {label}
          </label>
        )}
        <input
          id={id}
          ref={ref}
          style={{
            width: "100%",
            height: 48,
            padding: "0 16px",
            borderRadius: "var(--radius-inputs)",
            border: error
              ? "1.5px solid var(--color-cherry-red)"
              : "1px solid var(--color-ash-divider)",
            background: "var(--color-white-canvas)",
            fontFamily: "var(--font-switzer)",
            fontSize: "var(--text-body)",
            fontWeight: 400,
            color: "var(--color-portrait-ink)",
            outline: "none",
            transition: "border-color 0.15s ease, box-shadow 0.15s ease",
            boxSizing: "border-box",
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = "var(--color-portrait-ink)";
            e.currentTarget.style.boxShadow =
              "0 0 0 3px oklab(0.3 -0.03 -0.07 / 0.08)";
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = error
              ? "var(--color-cherry-red)"
              : "var(--color-ash-divider)";
            e.currentTarget.style.boxShadow = "none";
          }}
          {...props}
        />
        {error && (
          <span
            style={{
              fontFamily: "var(--font-switzer)",
              fontSize: 12,
              color: "var(--color-cherry-red)",
            }}
          >
            {error}
          </span>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
export { Input };
