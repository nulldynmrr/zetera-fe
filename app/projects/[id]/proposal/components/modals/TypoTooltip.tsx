import React from "react";
import { ShieldAlert } from "lucide-react";
import { TypoSuggestion } from "../../types";

interface TypoTooltipProps {
  showTypoTooltip: TypoSuggestion | null;
  setShowTypoTooltip: (tip: TypoSuggestion | null) => void;
  handleFixTypo: (wrongWord: string, correctWord: string) => void;
}

export function TypoTooltip({
  showTypoTooltip,
  setShowTypoTooltip,
  handleFixTypo,
}: TypoTooltipProps) {
  if (!showTypoTooltip) return null;

  return (
    <div
      style={{
        position: "fixed",
        left: Math.min(
          typeof window !== "undefined" ? window.innerWidth - 320 : 300,
          Math.max(20, showTypoTooltip.position.x)
        ),
        top: showTypoTooltip.position.y,
        background: "#FFFFFF",
        borderRadius: 12,
        padding: "12px 16px",
        boxShadow: "0 10px 30px rgba(15, 23, 42, 0.2)",
        border: "1px solid #CBD5E1",
        zIndex: 100,
        width: 290,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 6,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <ShieldAlert size={14} color="#DC2626" />
          <span
            style={{
              fontSize: 11,
              fontWeight: 800,
              color: "#DC2626",
              textTransform: "uppercase",
            }}
          >
            Typo / Ejaan Terdeteksi
          </span>
        </div>
        <button
          onClick={() => setShowTypoTooltip(null)}
          style={{ border: "none", background: "transparent", cursor: "pointer", color: "#94A3B8" }}
        >
          ✕
        </button>
      </div>

      <div style={{ fontSize: 12.5, color: "#0F172A", marginBottom: 4 }}>
        Kata:{" "}
        <strong style={{ textDecoration: "line-through", color: "#DC2626" }}>
          {showTypoTooltip.word}
        </strong>{" "}
        ➔ <strong style={{ color: "#16A34A" }}>{showTypoTooltip.suggestion}</strong>
      </div>

      <div style={{ fontSize: 11, color: "#64748B", marginBottom: 10, lineHeight: 1.35 }}>
        {showTypoTooltip.reason}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <button
          type="button"
          onClick={() => handleFixTypo(showTypoTooltip.word, showTypoTooltip.suggestion)}
          style={{
            flex: 1,
            background: "#16A34A",
            color: "#FFFFFF",
            border: "none",
            borderRadius: 6,
            padding: "6px 10px",
            fontSize: 11.5,
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          ✓ Ganti &quot;{showTypoTooltip.suggestion}&quot;
        </button>
        <button
          type="button"
          onClick={() => setShowTypoTooltip(null)}
          style={{
            background: "#F1F5F9",
            color: "#64748B",
            border: "none",
            borderRadius: 6,
            padding: "6px 10px",
            fontSize: 11.5,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Abaikan
        </button>
      </div>
    </div>
  );
}
