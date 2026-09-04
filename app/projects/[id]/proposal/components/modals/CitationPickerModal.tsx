import React from "react";
import { ReferenceItem, TabKey } from "../../types";

interface CitationPickerModalProps {
  showCitationPickerModal: boolean;
  setShowCitationPickerModal: (show: boolean) => void;
  citationStyle: string;
  activeTab: TabKey;
  references: ReferenceItem[];
  handleInsertAiDraftToDocument: (text: string) => void;
  setLastSavedTime: (msg: string | null) => void;
}

export function CitationPickerModal({
  showCitationPickerModal,
  setShowCitationPickerModal,
  citationStyle,
  activeTab,
  references,
  handleInsertAiDraftToDocument,
  setLastSavedTime,
}: CitationPickerModalProps) {
  if (!showCitationPickerModal) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(15,23,42,0.45)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 100,
        padding: 20,
      }}
    >
      <div
        style={{
          background: "#FFFFFF",
          borderRadius: 14,
          width: "100%",
          maxWidth: 560,
          padding: 22,
          border: "1px solid #CBD5E1",
          boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 12,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, margin: 0, color: "#0F172A" }}>
              Pilih Sitasi Referensi
            </h3>
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                background: "#EEF2FF",
                color: "#4338CA",
                padding: "2px 8px",
                borderRadius: 9999,
              }}
            >
              Gaya: {citationStyle}
            </span>
          </div>
          <button
            onClick={() => setShowCitationPickerModal(false)}
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
              color: "#64748B",
            }}
          >
            ✕
          </button>
        </div>
        <p style={{ fontSize: 12, color: "#64748B", margin: "0 0 14px" }}>
          Klik sitasi untuk menyalin format in-text atau langsung sisipkan ke naskah sub-bab aktif (
          {activeTab.toUpperCase()}).
        </p>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 8,
            maxHeight: 340,
            overflowY: "auto",
          }}
        >
          {references.length === 0 ? (
            <div style={{ padding: 20, textAlign: "center", color: "#64748B", fontSize: 13 }}>
              Belum ada daftar referensi/jurnal approved.
            </div>
          ) : (
            references.map((ref, idx) => {
              const normStyle = (citationStyle || "IEEE").toUpperCase();
              const rawAuthor = (ref.authors || "Penulis").split(/;|\band\b|&/gi)[0].trim();
              const primaryAuthor = rawAuthor.includes(",")
                ? rawAuthor.split(",")[0].trim()
                : rawAuthor.split(" ").pop() || rawAuthor;
              const year = ref.year || "2026";
              const inTextCitation =
                normStyle === "IEEE" || normStyle === "VANCOUVER"
                  ? `[${idx + 1}]`
                  : normStyle === "MLA"
                  ? `(${primaryAuthor})`
                  : normStyle === "CHICAGO"
                  ? `(${primaryAuthor} ${year})`
                  : `(${primaryAuthor}, ${year})`;

              return (
                <div
                  key={ref.id}
                  style={{
                    padding: "10px 14px",
                    borderRadius: 10,
                    border: "1px solid #E2E8F0",
                    background: "#F8FAFC",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 12,
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
                      <span
                        style={{
                          fontSize: 11.5,
                          fontWeight: 700,
                          background: "#E0F2FE",
                          color: "#0369A1",
                          padding: "1px 7px",
                          borderRadius: 5,
                        }}
                      >
                        {inTextCitation}
                      </span>
                      <span
                        style={{
                          fontSize: 12,
                          fontWeight: 700,
                          color: "#0F172A",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {ref.title}
                      </span>
                    </div>
                    <div style={{ fontSize: 11, color: "#64748B" }}>
                      {ref.authors} ({ref.year}) • {ref.publication}
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                    <button
                      type="button"
                      onClick={() => {
                        handleInsertAiDraftToDocument(` ${inTextCitation} `);
                        setShowCitationPickerModal(false);
                      }}
                      style={{
                        background: "#4338CA",
                        color: "#FFFFFF",
                        border: "none",
                        borderRadius: 6,
                        padding: "5px 9px",
                        fontSize: 11,
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      + Sisipkan
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(inTextCitation);
                        setLastSavedTime(`Sitasi ${inTextCitation} disalin!`);
                        setTimeout(() => setLastSavedTime(null), 2500);
                        setShowCitationPickerModal(false);
                      }}
                      style={{
                        background: "#E2E8F0",
                        color: "#334155",
                        border: "none",
                        borderRadius: 6,
                        padding: "5px 8px",
                        fontSize: 11,
                        cursor: "pointer",
                      }}
                    >
                      Salin
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
