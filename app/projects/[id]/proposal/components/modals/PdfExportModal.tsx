import React from "react";
import { Printer, X } from "lucide-react";
import { PdfPageSelection } from "../../types";

interface PdfExportModalProps {
  showPdfExportModal: boolean;
  setShowPdfExportModal: (show: boolean) => void;
  pdfPageSelection: PdfPageSelection;
  setPdfPageSelection: React.Dispatch<React.SetStateAction<PdfPageSelection>>;
  marginPreset: "4333" | "4433";
  setMarginPreset: (val: "4333" | "4433") => void;
  pageNumberPos:
    | "bottom-right"
    | "bottom-center"
    | "bottom-left"
    | "top-right"
    | "top-center";
  setPageNumberPos: (pos: any) => void;
}

export function PdfExportModal({
  showPdfExportModal,
  setShowPdfExportModal,
  pdfPageSelection,
  setPdfPageSelection,
  marginPreset,
  setMarginPreset,
  pageNumberPos,
  setPageNumberPos,
}: PdfExportModalProps) {
  if (!showPdfExportModal) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(15, 23, 42, 0.55)",
        backdropFilter: "blur(4px)",
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
          borderRadius: 16,
          width: "100%",
          maxWidth: 620,
          boxShadow: "0 25px 50px -12px rgba(15, 23, 42, 0.25)",
          border: "1px solid #E2E8F0",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          maxHeight: "90vh",
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: "18px 24px",
            borderBottom: "1px solid #E2E8F0",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "#F8FAFC",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: "#FEE2E2",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Printer size={20} color="#DC2626" />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: "#0F172A" }}>
                Pengaturan Cetak &amp; Ekspor PDF (A4 Kertas Bersih)
              </h3>
              <p style={{ margin: 0, fontSize: 12, color: "#64748B" }}>
                Pilih halaman yang ingin dicetak tanpa tampilan website / tombol toolbar
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowPdfExportModal(false)}
            style={{ background: "transparent", border: "none", cursor: "pointer", color: "#94A3B8" }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div
          style={{
            padding: "20px 24px",
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            gap: 18,
          }}
        >
          {/* Quick Preset Buttons */}
          <div>
            <div
              style={{
                fontSize: 11.5,
                fontWeight: 700,
                color: "#475569",
                textTransform: "uppercase",
                marginBottom: 8,
                letterSpacing: "0.03em",
              }}
            >
              Pilihan Cepat Halaman:
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              <button
                type="button"
                onClick={() =>
                  setPdfPageSelection({
                    cover: true,
                    approval: true,
                    abstract: true,
                    bab1: true,
                    bab2: true,
                    bab3: true,
                    references: true,
                    appendix: true,
                  })
                }
                style={{
                  padding: "6px 12px",
                  borderRadius: 8,
                  border: "1px solid #CBD5E1",
                  background: "#F1F5F9",
                  fontSize: 12,
                  fontWeight: 600,
                  color: "#334155",
                  cursor: "pointer",
                }}
              >
                📄 Semua Halaman (Proposal Utuh)
              </button>
              <button
                type="button"
                onClick={() =>
                  setPdfPageSelection({
                    cover: false,
                    approval: false,
                    abstract: false,
                    bab1: true,
                    bab2: true,
                    bab3: true,
                    references: true,
                    appendix: false,
                  })
                }
                style={{
                  padding: "6px 12px",
                  borderRadius: 8,
                  border: "1px solid #CBD5E1",
                  background: "#F1F5F9",
                  fontSize: 12,
                  fontWeight: 600,
                  color: "#334155",
                  cursor: "pointer",
                }}
              >
                📖 Hanya Isi Bab (Bab 1 - 3 &amp; Daftar Pustaka)
              </button>
              <button
                type="button"
                onClick={() =>
                  setPdfPageSelection({
                    cover: true,
                    approval: true,
                    abstract: false,
                    bab1: false,
                    bab2: false,
                    bab3: false,
                    references: false,
                    appendix: false,
                  })
                }
                style={{
                  padding: "6px 12px",
                  borderRadius: 8,
                  border: "1px solid #CBD5E1",
                  background: "#F1F5F9",
                  fontSize: 12,
                  fontWeight: 600,
                  color: "#334155",
                  cursor: "pointer",
                }}
              >
                ✍️ Cover &amp; Lembar Persetujuan
              </button>
            </div>
          </div>

          {/* Checklist Selection of Pages */}
          <div>
            <div
              style={{
                fontSize: 11.5,
                fontWeight: 700,
                color: "#475569",
                textTransform: "uppercase",
                marginBottom: 8,
                letterSpacing: "0.03em",
              }}
            >
              Daftar Lembar yang Akan Dicetak ke PDF:
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {[
                { key: "cover", label: "Halaman Sampul / Judul (Cover)", tag: "Cover" },
                { key: "approval", label: "Lembar Persetujuan / Pengesahan", tag: "Hal. i" },
                { key: "abstract", label: "Abstrak & Abstract (Bilingual)", tag: "Hal. ii" },
                { key: "bab1", label: "BAB I: Pendahuluan", tag: "Hal. 1" },
                { key: "bab2", label: "BAB II: Tinjauan Pustaka & Matriks", tag: "Hal. 2" },
                { key: "bab3", label: "BAB III: Metodologi Penelitian", tag: "Hal. 3" },
                { key: "references", label: "DAFTAR PUSTAKA", tag: "Hal. 4" },
                { key: "appendix", label: "Lampiran Instrumen", tag: "Hal. 5" },
              ].map((p) => {
                const isChecked = (pdfPageSelection as any)[p.key];
                return (
                  <label
                    key={p.key}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "10px 12px",
                      borderRadius: 8,
                      border: isChecked ? "1.5px solid #4338CA" : "1px solid #E2E8F0",
                      background: isChecked ? "#EEF2FF" : "#FFFFFF",
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) =>
                          setPdfPageSelection((prev) => ({
                            ...prev,
                            [p.key]: e.target.checked,
                          }))
                        }
                        style={{ cursor: "pointer", accentColor: "#4338CA" }}
                      />
                      <span
                        style={{
                          fontSize: 12.5,
                          fontWeight: isChecked ? 700 : 500,
                          color: isChecked ? "#1E1B4B" : "#475569",
                        }}
                      >
                        {p.label}
                      </span>
                    </div>
                    <span
                      style={{
                        fontSize: 10.5,
                        fontWeight: 700,
                        padding: "2px 6px",
                        borderRadius: 4,
                        background: isChecked ? "#C7D2FE" : "#F1F5F9",
                        color: isChecked ? "#3730A3" : "#64748B",
                      }}
                    >
                      {p.tag}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Margin & Page Number Options */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 14,
              paddingTop: 10,
              borderTop: "1px dashed #E2E8F0",
            }}
          >
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: 11.5,
                  fontWeight: 700,
                  color: "#475569",
                  marginBottom: 4,
                }}
              >
                Preset Margin Kertas (A4):
              </label>
              <select
                value={marginPreset}
                onChange={(e) => setMarginPreset(e.target.value as any)}
                style={{
                  width: "100%",
                  padding: "8px 10px",
                  borderRadius: 8,
                  border: "1px solid #CBD5E1",
                  fontSize: 12,
                  background: "#FFFFFF",
                  color: "#334155",
                }}
              >
                <option value="4333">4-3-3-3 cm (Kiri 4, Atas 3, Bawah 3, Kanan 3)</option>
                <option value="4433">4-4-3-3 cm (Kiri 4, Atas 4, Bawah 3, Kanan 3)</option>
              </select>
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  fontSize: 11.5,
                  fontWeight: 700,
                  color: "#475569",
                  marginBottom: 4,
                }}
              >
                Posisi Nomor Halaman:
              </label>
              <select
                value={pageNumberPos}
                onChange={(e) => setPageNumberPos(e.target.value as any)}
                style={{
                  width: "100%",
                  padding: "8px 10px",
                  borderRadius: 8,
                  border: "1px solid #CBD5E1",
                  fontSize: 12,
                  background: "#FFFFFF",
                  color: "#334155",
                }}
              >
                <option value="bottom-right">Kanan Bawah (Standar Skripsi)</option>
                <option value="bottom-center">Tengah Bawah</option>
                <option value="top-right">Kanan Atas</option>
                <option value="bottom-left">Kiri Bawah</option>
              </select>
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div
          style={{
            padding: "14px 24px",
            borderTop: "1px solid #E2E8F0",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            background: "#F8FAFC",
          }}
        >
          <div style={{ fontSize: 11.5, color: "#64748B" }}>
            💡 Tip: Pilih printer <strong>&quot;Save as PDF&quot;</strong> pada dialog browser Anda.
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button
              type="button"
              onClick={() => setShowPdfExportModal(false)}
              style={{
                padding: "8px 16px",
                borderRadius: 8,
                border: "1px solid #CBD5E1",
                background: "#FFFFFF",
                fontSize: 12.5,
                fontWeight: 600,
                color: "#475569",
                cursor: "pointer",
              }}
            >
              Batal
            </button>
            <button
              type="button"
              onClick={() => {
                setShowPdfExportModal(false);
                setTimeout(() => {
                  window.print();
                }, 200);
              }}
              style={{
                padding: "8px 20px",
                borderRadius: 8,
                border: "none",
                background: "#DC2626",
                fontSize: 12.5,
                fontWeight: 700,
                color: "#FFFFFF",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                boxShadow: "0 4px 12px rgba(220, 38, 38, 0.25)",
              }}
            >
              <Printer size={14} />
              <span>🖨️ Cetak / Simpan PDF (A4)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
