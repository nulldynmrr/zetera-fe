"use client";

import { useState } from "react";
import { X, ExternalLink, Download, Copy, Check, FileText, ZoomIn, ZoomOut, AlertCircle } from "lucide-react";

interface PdfPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  pdfUrl?: string | null;
  doi?: string | null;
  authors?: string | null;
  year?: number | null;
  abstract?: string | null;
}

export function PdfPreviewModal({
  isOpen,
  onClose,
  title,
  pdfUrl,
  doi,
  authors,
  year,
  abstract,
}: PdfPreviewModalProps) {
  const [copiedDoi, setCopiedDoi] = useState(false);
  const [zoom, setZoom] = useState(100);

  if (!isOpen) return null;

  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
  const fullPdfUrl = pdfUrl
    ? pdfUrl.startsWith("http") || pdfUrl.startsWith("blob:")
      ? pdfUrl
      : `${baseUrl}${pdfUrl.startsWith("/") ? "" : "/"}${pdfUrl}`
    : null;

  const handleCopyDoi = () => {
    if (doi) {
      navigator.clipboard.writeText(doi);
      setCopiedDoi(true);
      setTimeout(() => setCopiedDoi(false), 2000);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "rgba(15, 23, 42, 0.75)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          background: "#ffffff",
          width: "100%",
          maxWidth: "1100px",
          height: "90vh",
          borderRadius: 16,
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Header Bar */}
        <div
          style={{
            padding: "16px 20px",
            borderBottom: "1px solid #e2e8f0",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "#f8fafc",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 4, flex: 1, marginRight: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  background: "#e0f2fe",
                  color: "#0369a1",
                  padding: "2px 8px",
                  borderRadius: 4,
                }}
              >
                PDF PREVIEW
              </span>
              {year && (
                <span style={{ fontSize: 11, fontWeight: 600, color: "#64748b" }}>
                  ({year})
                </span>
              )}
            </div>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", margin: 0, lineHeight: 1.3 }}>
              {title}
            </h3>
            {authors && <span style={{ fontSize: 12, color: "#64748b" }}>{authors}</span>}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {doi && (
              <button
                onClick={handleCopyDoi}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                  fontSize: 12,
                  fontWeight: 600,
                  background: "#ffffff",
                  border: "1px solid #cbd5e1",
                  padding: "6px 10px",
                  borderRadius: 6,
                  cursor: "pointer",
                  color: "#334155",
                }}
              >
                {copiedDoi ? <Check size={13} color="#059669" /> : <Copy size={13} />}
                {copiedDoi ? "DOI Tersalin" : "Salin DOI"}
              </button>
            )}

            {fullPdfUrl && (
              <a
                href={fullPdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                  fontSize: 12,
                  fontWeight: 600,
                  background: "#059669",
                  color: "#ffffff",
                  padding: "6px 12px",
                  borderRadius: 6,
                  textDecoration: "none",
                }}
              >
                <Download size={13} />
                Unduh PDF
              </a>
            )}

            <button
              onClick={onClose}
              style={{
                background: "#f1f5f9",
                border: "none",
                padding: 6,
                borderRadius: 8,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#64748b",
              }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Content Viewer */}
        <div style={{ flex: 1, display: "flex", position: "relative", overflow: "hidden", background: "#e2e8f0" }}>
          {fullPdfUrl ? (
            <iframe
              src={`${fullPdfUrl}#toolbar=1&navpanes=1`}
              title={title}
              style={{
                width: "100%",
                height: "100%",
                border: "none",
              }}
            />
          ) : (
            <div
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: 30,
                background: "#ffffff",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  width: 54,
                  height: 54,
                  borderRadius: 27,
                  background: "#fef2f2",
                  color: "#ef4444",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 16,
                }}
              >
                <FileText size={28} />
              </div>
              <h4 style={{ fontSize: 16, fontWeight: 700, color: "#0f172a", margin: "0 0 8px" }}>
                File PDF Tidak Tersedia Secara Fisik
              </h4>
              <p style={{ fontSize: 13, color: "#64748b", maxWidth: 500, margin: "0 0 20px", lineHeight: 1.5 }}>
                Jurnal ini dimasukkan via metadata DOI atau manual tanpa upload berkas PDF utuh.
              </p>

              {abstract && (
                <div
                  style={{
                    maxWidth: 700,
                    textAlign: "left",
                    background: "#f8fafc",
                    border: "1px solid #e2e8f0",
                    borderRadius: 10,
                    padding: "16px 20px",
                  }}
                >
                  <span style={{ fontSize: 11, fontWeight: 700, color: "#475569", textTransform: "uppercase" }}>
                    Abstrak / Ringkasan Naskah:
                  </span>
                  <p style={{ fontSize: 13, color: "#334155", margin: "8px 0 0", lineHeight: 1.6 }}>
                    {abstract}
                  </p>
                </div>
              )}

              <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 20, flexWrap: "wrap", justifyContent: "center" }}>
                <a
                  href={`https://scholar.google.com/scholar?q=${encodeURIComponent(title)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    fontSize: 13,
                    background: "#0284c7",
                    color: "#ffffff",
                    padding: "8px 16px",
                    borderRadius: 8,
                    textDecoration: "none",
                    fontWeight: 600,
                  }}
                >
                  🔎 Cari &amp; Buka di Google Scholar <ExternalLink size={14} />
                </a>

                {doi && (
                  <a
                    href={`https://doi.org/${doi.replace(/^https?:\/\/doi\.org\//i, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      fontSize: 13,
                      color: "#475569",
                      background: "#f1f5f9",
                      border: "1px solid #cbd5e1",
                      padding: "8px 14px",
                      borderRadius: 8,
                      textDecoration: "none",
                      fontWeight: 600,
                    }}
                  >
                    Buka DOI ({doi}) <ExternalLink size={14} />
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
