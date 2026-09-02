"use client";

import React from "react";
import { ExternalLink, AlertTriangle, BookOpen } from "lucide-react";

interface CitationBadgeProps {
  title?: string | null;
  doi?: string | null;
  page?: number | null;
  compact?: boolean;
  className?: string;
}

export function CitationBadge({
  title,
  doi,
  page,
  compact = false,
  className = "",
}: CitationBadgeProps) {
  const cleanDoi = doi?.trim().replace(/^(https?:\/\/)?(dx\.)?doi\.org\//i, "").replace(/^doi:\s*/i, "");
  const targetHref = title
    ? `https://scholar.google.com/scholar?q=${encodeURIComponent(title)}`
    : cleanDoi
      ? `https://scholar.google.com/scholar?q=${encodeURIComponent(cleanDoi)}`
      : "#";

  if (compact) {
    return (
      <div
        className={className}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          fontSize: 11.5,
          fontFamily: "var(--font-body)",
          padding: "2px 6px",
          color: "#475569",
        }}
      >
        <BookOpen size={12} color="#059669" style={{ flexShrink: 0 }} />
        {title && (
          <>
            <span style={{ fontWeight: 600, color: "#0f172a", maxWidth: 140, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {title}
            </span>
            <span style={{ color: "#cbd5e1" }}>—</span>
          </>
        )}

        {cleanDoi ? (
          <a
            href={targetHref}
            target="_blank"
            rel="noopener noreferrer"
            title={`Buka Publikasi Resmi Terverifikasi (${title || cleanDoi})`}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 3,
              fontFamily: "monospace",
              color: "#0284c7",
              textDecoration: "none",
              fontWeight: 500,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.textDecoration = "underline")}
            onMouseLeave={(e) => (e.currentTarget.style.textDecoration = "none")}
          >
            <span>doi.org/{cleanDoi.length > 18 ? `${cleanDoi.slice(0, 18)}...` : cleanDoi}</span>
            <ExternalLink size={10} />
          </a>
        ) : (
          <span style={{ display: "inline-flex", alignItems: "center", gap: 3, color: "#94a3b8", fontWeight: 500 }}>
            <span>Tanpa DOI</span>
          </span>
        )}

        <span style={{ color: "#cbd5e1" }}>—</span>
        <span style={{ fontWeight: 600, color: "#047857", fontFamily: "monospace" }}>
          hlm. {page !== undefined && page !== null && page > 0 ? page : "1"}
        </span>
      </div>
    );
  }

  return (
    <div
      className={className}
      style={{
        display: "inline-flex",
        flexWrap: "wrap",
        alignItems: "center",
        gap: 8,
        fontSize: 12,
        padding: "4px 8px",
        color: "#334155",
      }}
    >
      {title && (
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 600, color: "#0f172a" }}>
          <BookOpen size={14} color="#00C988" />
          <span style={{ maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {title}
          </span>
          <span style={{ color: "#cbd5e1" }}>—</span>
        </div>
      )}

      {cleanDoi ? (
        <a
          href={targetHref}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
            fontFamily: "monospace",
            fontSize: 11.5,
            fontWeight: 500,
            color: "#0284c7",
            textDecoration: "none",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.textDecoration = "underline")}
          onMouseLeave={(e) => (e.currentTarget.style.textDecoration = "none")}
          title={`Buka Publikasi Resmi Terverifikasi (${title || cleanDoi})`}
        >
          <span>doi.org/{cleanDoi}</span>
          <ExternalLink size={11} />
        </a>
      ) : (
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
            fontSize: 11.5,
            fontWeight: 500,
            color: "#94a3b8",
          }}
        >
          <span>DOI tidak tersedia</span>
        </div>
      )}

      <span style={{ color: "#cbd5e1" }}>—</span>

      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          fontWeight: 600,
          fontFamily: "monospace",
          fontSize: 11.5,
          color: "#065f46",
        }}
      >
        hlm. {page !== undefined && page !== null && page > 0 ? page : "1"}
      </span>
    </div>
  );
}
