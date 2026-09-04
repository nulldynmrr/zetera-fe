import React from "react";
import { Building, X, Image as ImageIcon } from "lucide-react";
import { CoverData, ApprovalData } from "../../types";
import { api, ProposalTemplate } from "@/lib/api-client";

interface IdentityModalProps {
  showIdentityModal: boolean;
  setShowIdentityModal: (show: boolean) => void;
  coverData: CoverData;
  setCoverData: React.Dispatch<React.SetStateAction<CoverData>>;
  approvalData: ApprovalData;
  setApprovalData: React.Dispatch<React.SetStateAction<ApprovalData>>;
  triggerAutoSave: () => void;
  activeTemplate?: ProposalTemplate | null;
  variableValues?: Record<string, any>;
  onSaveVariableValues?: (newValues: Record<string, any>) => void;
}

export function IdentityModal({
  showIdentityModal,
  setShowIdentityModal,
  coverData,
  setCoverData,
  approvalData,
  setApprovalData,
  triggerAutoSave,
  activeTemplate,
  variableValues,
  onSaveVariableValues,
}: IdentityModalProps) {
  if (!showIdentityModal) return null;

  const handleSave = () => {
    setShowIdentityModal(false);
    triggerAutoSave();
    if (coverData.author) {
      api.profile
        .upsert({
          namaLengkap: coverData.author,
          nim: coverData.nim || "12345678",
          universitas: coverData.universitas || "Universitas",
          fakultas: coverData.fakultas || "Fakultas",
          programStudi: coverData.prodi || "Program Studi",
          kota: coverData.kota || "Bandung",
          logoUrl: coverData.logoUrl || variableValues?.LOGO || null,
        })
        .catch(() => {});
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(15, 23, 42, 0.6)",
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
          maxWidth: 680,
          width: "100%",
          maxHeight: "90vh",
          overflowY: "auto",
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
            marginBottom: 18,
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
              <Building size={20} color="#4338CA" />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: "#0F172A" }}>
                Data Identitas Peneliti &amp; Kampus
              </h3>
              <p style={{ margin: 0, fontSize: 12, color: "#64748B" }}>
                Data ini akan otomatis disinkronkan ke Halaman Sampul, Lembar Pengesahan, dan Ekspor
                Dokumen
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowIdentityModal(false)}
            style={{ border: "none", background: "transparent", cursor: "pointer", color: "#94A3B8" }}
          >
            <X size={20} />
          </button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <div style={{ gridColumn: "span 2" }}>
            <label
              style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#334155", marginBottom: 4 }}
            >
              Judul Proposal / Skripsi
            </label>
            <input
              type="text"
              value={coverData.title}
              onChange={(e) => setCoverData({ ...coverData, title: e.target.value })}
              style={{
                width: "100%",
                padding: "8px 12px",
                borderRadius: 8,
                border: "1px solid #CBD5E1",
                fontSize: 13,
              }}
            />
          </div>

          <div style={{ gridColumn: "span 2" }}>
            <label
              style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#334155", marginBottom: 4 }}
            >
              Logo Kampus / Institusi (URL atau Path Gambar)
            </label>
            <input
              type="text"
              value={coverData.logoUrl || variableValues?.LOGO || ""}
              onChange={(e) => {
                const val = e.target.value;
                setCoverData({ ...coverData, logoUrl: val });
                if (onSaveVariableValues) {
                  onSaveVariableValues({ LOGO: val });
                }
              }}
              style={{
                width: "100%",
                padding: "8px 12px",
                borderRadius: 8,
                border: "1px solid #CBD5E1",
                fontSize: 13,
              }}
              placeholder="https://... atau /uploads/... (Otomatis men-swap logo Tel-U pada ekspor LaTeX & Word)"
            />
            <p style={{ margin: "4px 0 0 0", fontSize: 11, color: "#64748B" }}>
              Jika diisi, logo ini otomatis menggantikan logo Tel-U bawaan template saat ekspor LaTeX (.zip) maupun Word (.docx).
            </p>
          </div>

          <div>
            <label
              style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#334155", marginBottom: 4 }}
            >
              Nama Lengkap Mahasiswa
            </label>
            <input
              type="text"
              value={coverData.author}
              onChange={(e) => setCoverData({ ...coverData, author: e.target.value })}
              style={{
                width: "100%",
                padding: "8px 12px",
                borderRadius: 8,
                border: "1px solid #CBD5E1",
                fontSize: 13,
              }}
              placeholder="Contoh: Dinar Rahmawati"
            />
          </div>

          <div>
            <label
              style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#334155", marginBottom: 4 }}
            >
              Nomor Induk Mahasiswa (NIM)
            </label>
            <input
              type="text"
              value={coverData.nim}
              onChange={(e) => setCoverData({ ...coverData, nim: e.target.value })}
              style={{
                width: "100%",
                padding: "8px 12px",
                borderRadius: 8,
                border: "1px solid #CBD5E1",
                fontSize: 13,
              }}
              placeholder="Contoh: 1301213000"
            />
          </div>

          <div>
            <label
              style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#334155", marginBottom: 4 }}
            >
              Perguruan Tinggi / Universitas
            </label>
            <input
              type="text"
              value={coverData.universitas}
              onChange={(e) => setCoverData({ ...coverData, universitas: e.target.value })}
              style={{
                width: "100%",
                padding: "8px 12px",
                borderRadius: 8,
                border: "1px solid #CBD5E1",
                fontSize: 13,
              }}
              placeholder="Contoh: Universitas Telkom"
            />
          </div>

          <div>
            <label
              style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#334155", marginBottom: 4 }}
            >
              Fakultas
            </label>
            <input
              type="text"
              value={coverData.fakultas}
              onChange={(e) => setCoverData({ ...coverData, fakultas: e.target.value })}
              style={{
                width: "100%",
                padding: "8px 12px",
                borderRadius: 8,
                border: "1px solid #CBD5E1",
                fontSize: 13,
              }}
              placeholder="Contoh: Fakultas Informatika"
            />
          </div>

          <div>
            <label
              style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#334155", marginBottom: 4 }}
            >
              Program Studi
            </label>
            <input
              type="text"
              value={coverData.prodi}
              onChange={(e) => setCoverData({ ...coverData, prodi: e.target.value })}
              style={{
                width: "100%",
                padding: "8px 12px",
                borderRadius: 8,
                border: "1px solid #CBD5E1",
                fontSize: 13,
              }}
              placeholder="Contoh: S1 Informatika"
            />
          </div>

          <div>
            <label
              style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#334155", marginBottom: 4 }}
            >
              Kota Institusi / Kampus
            </label>
            <input
              type="text"
              value={coverData.kota || ""}
              onChange={(e) => setCoverData({ ...coverData, kota: e.target.value })}
              style={{
                width: "100%",
                padding: "8px 12px",
                borderRadius: 8,
                border: "1px solid #CBD5E1",
                fontSize: 13,
              }}
              placeholder="Contoh: Bandung"
            />
          </div>

          <div>
            <label
              style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#334155", marginBottom: 4 }}
            >
              Tahun Akademik
            </label>
            <input
              type="text"
              value={coverData.year}
              onChange={(e) => setCoverData({ ...coverData, year: e.target.value })}
              style={{
                width: "100%",
                padding: "8px 12px",
                borderRadius: 8,
                border: "1px solid #CBD5E1",
                fontSize: 13,
              }}
            />
          </div>

          <div
            style={{
              gridColumn: "span 2",
              borderTop: "1px dashed #E2E8F0",
              paddingTop: 12,
              marginTop: 6,
            }}
          >
            <div style={{ fontSize: 12.5, fontWeight: 800, color: "#4338CA", marginBottom: 8 }}>
              Tempat &amp; Tanggal Persetujuan (Lembar Pengesahan)
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1.5fr 1fr", gap: 8 }}>
              <div>
                <label
                  style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#475569", marginBottom: 2 }}
                >
                  Kota / Tempat
                </label>
                <input
                  type="text"
                  value={approvalData.kota || coverData.kota || ""}
                  onChange={(e) => setApprovalData({ ...approvalData, kota: e.target.value })}
                  placeholder="Bandung"
                  style={{
                    width: "100%",
                    padding: "6px 10px",
                    borderRadius: 6,
                    border: "1px solid #CBD5E1",
                    fontSize: 12,
                  }}
                />
              </div>
              <div>
                <label
                  style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#475569", marginBottom: 2 }}
                >
                  Tanggal
                </label>
                <input
                  type="text"
                  value={approvalData.dateDay}
                  onChange={(e) => setApprovalData({ ...approvalData, dateDay: e.target.value })}
                  placeholder="2"
                  style={{
                    width: "100%",
                    padding: "6px 10px",
                    borderRadius: 6,
                    border: "1px solid #CBD5E1",
                    fontSize: 12,
                  }}
                />
              </div>
              <div>
                <label
                  style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#475569", marginBottom: 2 }}
                >
                  Bulan
                </label>
                <input
                  type="text"
                  value={approvalData.dateMonth}
                  onChange={(e) => setApprovalData({ ...approvalData, dateMonth: e.target.value })}
                  placeholder="Oktober"
                  style={{
                    width: "100%",
                    padding: "6px 10px",
                    borderRadius: 6,
                    border: "1px solid #CBD5E1",
                    fontSize: 12,
                  }}
                />
              </div>
              <div>
                <label
                  style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#475569", marginBottom: 2 }}
                >
                  Tahun
                </label>
                <input
                  type="text"
                  value={approvalData.dateYear}
                  onChange={(e) => setApprovalData({ ...approvalData, dateYear: e.target.value })}
                  placeholder="2026"
                  style={{
                    width: "100%",
                    padding: "6px 10px",
                    borderRadius: 6,
                    border: "1px solid #CBD5E1",
                    fontSize: 12,
                  }}
                />
              </div>
            </div>
          </div>

          <div
            style={{
              gridColumn: "span 2",
              borderTop: "1px dashed #E2E8F0",
              paddingTop: 12,
              marginTop: 6,
            }}
          >
            <div style={{ fontSize: 12.5, fontWeight: 800, color: "#4338CA", marginBottom: 8 }}>
              Dewan Pembimbing &amp; Kaprodi (Lembar Pengesahan)
            </div>
          </div>

          <div>
            <label
              style={{ display: "block", fontSize: 11.5, fontWeight: 700, color: "#475569", marginBottom: 3 }}
            >
              Dosen Pembimbing 1
            </label>
            <input
              type="text"
              value={approvalData.pembimbing1}
              onChange={(e) => setApprovalData({ ...approvalData, pembimbing1: e.target.value })}
              style={{
                width: "100%",
                padding: "6px 10px",
                borderRadius: 6,
                border: "1px solid #CBD5E1",
                fontSize: 12,
              }}
            />
            <input
              type="text"
              value={approvalData.nipPembimbing1}
              onChange={(e) => setApprovalData({ ...approvalData, nipPembimbing1: e.target.value })}
              placeholder="NIP / NIDN"
              style={{
                width: "100%",
                padding: "5px 10px",
                borderRadius: 6,
                border: "1px solid #CBD5E1",
                fontSize: 11.5,
                marginTop: 4,
              }}
            />
          </div>

          <div>
            <label
              style={{ display: "block", fontSize: 11.5, fontWeight: 700, color: "#475569", marginBottom: 3 }}
            >
              Dosen Pembimbing 2
            </label>
            <input
              type="text"
              value={approvalData.pembimbing2}
              onChange={(e) => setApprovalData({ ...approvalData, pembimbing2: e.target.value })}
              style={{
                width: "100%",
                padding: "6px 10px",
                borderRadius: 6,
                border: "1px solid #CBD5E1",
                fontSize: 12,
              }}
            />
            <input
              type="text"
              value={approvalData.nipPembimbing2}
              onChange={(e) => setApprovalData({ ...approvalData, nipPembimbing2: e.target.value })}
              placeholder="NIP / NIDN"
              style={{
                width: "100%",
                padding: "5px 10px",
                borderRadius: 6,
                border: "1px solid #CBD5E1",
                fontSize: 11.5,
                marginTop: 4,
              }}
            />
          </div>

          <div style={{ gridColumn: "span 2" }}>
            <label
              style={{ display: "block", fontSize: 11.5, fontWeight: 700, color: "#475569", marginBottom: 3 }}
            >
              Ketua Program Studi (Kaprodi)
            </label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              <input
                type="text"
                value={approvalData.kaprodi}
                onChange={(e) => setApprovalData({ ...approvalData, kaprodi: e.target.value })}
                style={{
                  width: "100%",
                  padding: "6px 10px",
                  borderRadius: 6,
                  border: "1px solid #CBD5E1",
                  fontSize: 12,
                }}
                placeholder="Nama Kaprodi & Gelar"
              />
              <input
                type="text"
                value={approvalData.nipKaprodi}
                onChange={(e) => setApprovalData({ ...approvalData, nipKaprodi: e.target.value })}
                style={{
                  width: "100%",
                  padding: "6px 10px",
                  borderRadius: 6,
                  border: "1px solid #CBD5E1",
                  fontSize: 12,
                }}
                placeholder="NIP Kaprodi"
              />
            </div>
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
            onClick={() => setShowIdentityModal(false)}
            style={{
              padding: "8px 16px",
              borderRadius: 8,
              border: "1px solid #CBD5E1",
              background: "#F8FAFC",
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
            onClick={handleSave}
            style={{
              padding: "8px 20px",
              borderRadius: 8,
              border: "none",
              background: "#4338CA",
              fontSize: 12.5,
              fontWeight: 700,
              color: "#FFFFFF",
              cursor: "pointer",
            }}
          >
            ✓ Simpan Identitas &amp; Update Cover
          </button>
        </div>
      </div>
    </div>
  );
}
