import React from "react";
import { SlidersHorizontal, X } from "lucide-react";

interface PageSetupModalProps {
  showPageSetupModal: boolean;
  setShowPageSetupModal: (show: boolean) => void;
  marginPreset: "4333" | "4433";
  setMarginPreset: (preset: "4333" | "4433") => void;
  pageNumberPos:
    | "bottom-right"
    | "bottom-center"
    | "bottom-left"
    | "top-right"
    | "top-center";
  setPageNumberPos: (pos: any) => void;
  triggerAutoSave: () => void;
}

export function PageSetupModal({
  showPageSetupModal,
  setShowPageSetupModal,
  marginPreset,
  setMarginPreset,
  pageNumberPos,
  setPageNumberPos,
  triggerAutoSave,
}: PageSetupModalProps) {
  if (!showPageSetupModal) return null;

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
        zIndex: 150,
        padding: 20,
      }}
    >
      <div
        style={{
          background: "#FFFFFF",
          borderRadius: 16,
          maxWidth: 480,
          width: "100%",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
          border: "1px solid #E2E8F0",
          padding: 24,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 16,
            borderBottom: "1px solid #E2E8F0",
            paddingBottom: 12,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: "#EEF2FF",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <SlidersHorizontal size={18} color="#4338CA" />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: "#0F172A" }}>
                Pengaturan Lembar Kertas A4
              </h3>
              <p style={{ margin: 0, fontSize: 12, color: "#64748B" }}>
                Sesuaikan margin dan posisi nomor halaman sesuai pedoman kampus
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowPageSetupModal(false)}
            style={{ border: "none", background: "transparent", cursor: "pointer", color: "#94A3B8" }}
          >
            <X size={20} />
          </button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <label
              style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#334155", marginBottom: 4 }}
            >
              Preset Margin:
            </label>
            <select
              value={marginPreset}
              onChange={(e) => {
                setMarginPreset(e.target.value as any);
                triggerAutoSave();
              }}
              style={{
                width: "100%",
                padding: "8px 12px",
                borderRadius: 8,
                border: "1px solid #CBD5E1",
                fontSize: 13,
                background: "#FFFFFF",
              }}
            >
              <option value="4333">4-3-3-3 cm (Standar Kiri 4cm, Atas/Kanan/Bawah 3cm)</option>
              <option value="4433">4-4-3-3 cm (Kiri 4cm, Atas 4cm, Bawah 3cm, Kanan 3cm)</option>
            </select>
          </div>

          <div>
            <label
              style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#334155", marginBottom: 4 }}
            >
              Posisi Nomor Halaman:
            </label>
            <select
              value={pageNumberPos}
              onChange={(e) => {
                setPageNumberPos(e.target.value as any);
                triggerAutoSave();
              }}
              style={{
                width: "100%",
                padding: "8px 12px",
                borderRadius: 8,
                border: "1px solid #CBD5E1",
                fontSize: 13,
                background: "#FFFFFF",
              }}
            >
              <option value="bottom-right">Kanan Bawah (Standar Skripsi)</option>
              <option value="bottom-center">Tengah Bawah</option>
              <option value="top-right">Kanan Atas</option>
              <option value="bottom-left">Kiri Bawah</option>
            </select>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: 10,
            marginTop: 20,
            borderTop: "1px solid #E2E8F0",
            paddingTop: 14,
          }}
        >
          <button
            type="button"
            onClick={() => setShowPageSetupModal(false)}
            style={{
              padding: "8px 16px",
              borderRadius: 8,
              border: "none",
              background: "#4338CA",
              fontSize: 12.5,
              fontWeight: 700,
              color: "#FFFFFF",
              cursor: "pointer",
            }}
          >
            Selesai
          </button>
        </div>
      </div>
    </div>
  );
}
