"use client";

import React, { useState, useEffect } from "react";
import { api, ProposalTemplate } from "@/lib/api-client";
import { notify } from "@/lib/notification";
import {
  FileText,
  FileCode,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  X,
  Layers,
  Sparkles,
} from "lucide-react";

interface SwitchTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  activeTemplate: ProposalTemplate | null;
  onTemplateSwitched: (newTemplate: ProposalTemplate) => void;
}

export const SwitchTemplateModal: React.FC<SwitchTemplateModalProps> = ({
  isOpen,
  onClose,
  projectId,
  activeTemplate,
  onTemplateSwitched,
}) => {
  const [templates, setTemplates] = useState<ProposalTemplate[]>([]);
  const [selectedTargetId, setSelectedTargetId] = useState<string>("");
  const [loadingList, setLoadingList] = useState(false);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [previewData, setPreviewData] = useState<any | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setLoadingList(true);
    setErrorMsg(null);
    setPreviewData(null);
    setSelectedTargetId("");

    api.templates
      .list()
      .then((res) => {
        if (res.success && res.data) {
          setTemplates(res.data);
          // Set default target to first other template if available
          const other = res.data.find((t) => t.id !== activeTemplate?.id);
          if (other) {
            handleSelectTarget(other.id);
          }
        }
      })
      .catch((err) => {
        setErrorMsg(err.message || "Gagal mengambil daftar template");
      })
      .finally(() => setLoadingList(false));
  }, [isOpen, activeTemplate?.id]);

  const handleSelectTarget = async (targetId: string) => {
    setSelectedTargetId(targetId);
    if (!targetId || targetId === activeTemplate?.id) {
      setPreviewData(null);
      return;
    }

    setLoadingPreview(true);
    setErrorMsg(null);
    try {
      const res = await api.projects.previewSwitchTemplate(projectId, targetId);
      if (res.success) {
        setPreviewData(res.data);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Gagal menghitung pratinjau migrasi");
    } finally {
      setLoadingPreview(false);
    }
  };

  const handleCommitSwitch = async () => {
    if (!selectedTargetId) return;
    setSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await api.projects.switchTemplate(projectId, selectedTargetId);
      if (res.success && res.data?.template) {
        onTemplateSwitched(res.data.template);
        onClose();
        notify.success("Template Proposal Berhasil Diperbarui!", "Seluruh konten tersimpan aman dan seksi telah diselaraskan.");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Gagal menerapkan perubahan template");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(15, 23, 42, 0.65)",
        backdropFilter: "blur(4px)",
        padding: 16,
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: "#FFFFFF",
          borderRadius: 16,
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
          width: "100%",
          maxWidth: 780,
          maxHeight: "90vh",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          border: "1px solid #E2E8F0",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: "20px 24px",
            borderBottom: "1px solid #E2E8F0",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            backgroundColor: "#F8FAFC",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                backgroundColor: "#EEF2FF",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#4F46E5",
              }}
            >
              <RefreshCw size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: "#0F172A", margin: 0 }}>
                Ganti Format Template Proposal
              </h3>
              <p style={{ fontSize: 12.5, color: "#64748B", margin: "2px 0 0 0" }}>
                Pilih format template akademik baru tanpa kehilangan draf naskah yang sudah ditulis (Non-Destructive)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              border: "none",
              background: "transparent",
              cursor: "pointer",
              color: "#94A3B8",
              padding: 6,
              borderRadius: 8,
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div style={{ padding: "20px 24px", overflowY: "auto", display: "flex", flexDirection: "column", gap: 20 }}>
          {errorMsg && (
            <div
              style={{
                padding: "12px 16px",
                backgroundColor: "#FEF2F2",
                border: "1px solid #FCA5A5",
                borderRadius: 10,
                color: "#991B1B",
                fontSize: 13,
                display: "flex",
                alignItems: "center",
                gap: 10,
              }}
            >
              <AlertCircle size={16} />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Current Template Banner */}
          <div
            style={{
              padding: "12px 16px",
              borderRadius: 10,
              backgroundColor: "#F1F5F9",
              border: "1px solid #E2E8F0",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div>
              <span style={{ fontSize: 11, fontWeight: 600, color: "#64748B", textTransform: "uppercase" }}>
                Template Aktif Saat Ini
              </span>
              <div style={{ fontSize: 13.5, fontWeight: 600, color: "#1E293B", marginTop: 2 }}>
                {activeTemplate?.name || "Proposal Tugas Akhir — Informatika FIF Telkom University"}
              </div>
            </div>
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                padding: "4px 10px",
                borderRadius: 20,
                backgroundColor: activeTemplate?.formatType === "DOCX" ? "#DBEAFE" : "#EDE9FE",
                color: activeTemplate?.formatType === "DOCX" ? "#1E40AF" : "#5B21B6",
              }}
            >
              {activeTemplate?.formatType || "LATEX"}
            </span>
          </div>

          {/* Template Selection Cards */}
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: "#334155", display: "block", marginBottom: 10 }}>
              Pilih Template Tujuan:
            </label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {templates.map((tpl) => {
                const isCurrent = tpl.id === activeTemplate?.id;
                const isSelected = tpl.id === selectedTargetId;

                return (
                  <div
                    key={tpl.id}
                    onClick={() => {
                      if (!isCurrent) handleSelectTarget(tpl.id);
                    }}
                    style={{
                      padding: 14,
                      borderRadius: 12,
                      border: isSelected ? "2px solid #4F46E5" : "1px solid #E2E8F0",
                      backgroundColor: isSelected ? "#F5F3FF" : isCurrent ? "#F8FAFC" : "#FFFFFF",
                      cursor: isCurrent ? "not-allowed" : "pointer",
                      opacity: isCurrent ? 0.65 : 1,
                      transition: "all 0.2s ease",
                      position: "relative",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 700,
                          padding: "2px 8px",
                          borderRadius: 6,
                          backgroundColor: tpl.formatType === "DOCX" ? "#DBEAFE" : "#EDE9FE",
                          color: tpl.formatType === "DOCX" ? "#1E40AF" : "#6D28D9",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 4,
                        }}
                      >
                        {tpl.formatType === "DOCX" ? <FileText size={11} /> : <FileCode size={11} />}
                        {tpl.formatType || "LATEX"}
                      </span>
                      {isCurrent && (
                        <span style={{ fontSize: 10, fontWeight: 600, color: "#64748B" }}>(Aktif)</span>
                      )}
                      {isSelected && !isCurrent && (
                        <CheckCircle2 size={16} color="#4F46E5" />
                      )}
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#0F172A", lineHeight: 1.35 }}>
                      {tpl.name}
                    </div>
                    <div style={{ fontSize: 11.5, color: "#64748B", marginTop: 4 }}>
                      {tpl.sourceFaculty ? `${tpl.sourceFaculty} • ` : ""}
                      {tpl.sections?.length || 8} Bagian • {tpl.variables?.length || 0} Variabel
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Migration Preview Diff */}
          {loadingPreview && (
            <div style={{ padding: "30px 20px", textAlign: "center", color: "#64748B", fontSize: 13 }}>
              <RefreshCw size={24} className="animate-spin" style={{ margin: "0 auto 10px auto", color: "#4F46E5" }} />
              <span>Menganalisis kecocokan bab dan struktur naskah...</span>
            </div>
          )}

          {previewData && !loadingPreview && (
            <div
              style={{
                backgroundColor: "#FAFAFA",
                border: "1px solid #E2E8F0",
                borderRadius: 12,
                padding: 16,
                display: "flex",
                flexDirection: "column",
                gap: 14,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Sparkles size={16} color="#4F46E5" />
                <span style={{ fontSize: 13, fontWeight: 700, color: "#1E293B" }}>
                  Pratinjau Pemetaan Bab (Fuzzy Content Matching)
                </span>
              </div>

              {/* Matched Sections List */}
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {previewData.matchedSections?.map((m: any, idx: number) => (
                  <div
                    key={idx}
                    style={{
                      padding: "8px 12px",
                      borderRadius: 8,
                      backgroundColor: m.targetTitle ? "#FFFFFF" : "#FFFBEB",
                      border: m.targetTitle ? "1px solid #E2E8F0" : "1px solid #FDE68A",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      fontSize: 12,
                    }}
                  >
                    <div style={{ fontWeight: 600, color: "#334155", flex: 1 }}>{m.sourceTitle}</div>
                    <ArrowRight size={13} style={{ margin: "0 10px", color: "#94A3B8" }} />
                    <div style={{ fontWeight: 600, color: m.targetTitle ? "#4F46E5" : "#B45309", flex: 1 }}>
                      {m.targetTitle || "Disimpan ke Draf Cadangan (Aman)"}
                    </div>
                    {m.confidence > 0 && (
                      <span
                        style={{
                          fontSize: 10.5,
                          fontWeight: 700,
                          padding: "2px 6px",
                          borderRadius: 4,
                          backgroundColor: m.confidence >= 0.8 ? "#DCFCE7" : "#FEF3C7",
                          color: m.confidence >= 0.8 ? "#166534" : "#92400E",
                          marginLeft: 8,
                        }}
                      >
                        {Math.round(m.confidence * 100)}%
                      </span>
                    )}
                  </div>
                ))}
              </div>

              {/* Safe Guarantee Note */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  fontSize: 11.5,
                  color: "#059669",
                  backgroundColor: "#ECFDF5",
                  padding: "8px 12px",
                  borderRadius: 8,
                }}
              >
                <ShieldCheck size={16} />
                <span>
                  <strong>Jaminan Keamanan:</strong> Draf teks bab, sitasi jurnal, dan matriks literatur Anda 100% aman dan tidak akan terhapus.
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div
          style={{
            padding: "16px 24px",
            borderTop: "1px solid #E2E8F0",
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            gap: 12,
            backgroundColor: "#F8FAFC",
          }}
        >
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: "9px 18px",
              borderRadius: 8,
              border: "1px solid #CBD5E1",
              backgroundColor: "#FFFFFF",
              color: "#475569",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleCommitSwitch}
            disabled={!selectedTargetId || selectedTargetId === activeTemplate?.id || submitting}
            style={{
              padding: "9px 20px",
              borderRadius: 8,
              border: "none",
              backgroundColor:
                !selectedTargetId || selectedTargetId === activeTemplate?.id || submitting
                  ? "#94A3B8"
                  : "#4F46E5",
              color: "#FFFFFF",
              fontSize: 13,
              fontWeight: 600,
              cursor:
                !selectedTargetId || selectedTargetId === activeTemplate?.id || submitting
                  ? "not-allowed"
                  : "pointer",
              display: "flex",
              alignItems: "center",
              gap: 8,
              boxShadow: "0 4px 12px rgba(79, 70, 229, 0.25)",
            }}
          >
            {submitting ? (
              <>
                <RefreshCw size={14} className="animate-spin" />
                <span>Menerapkan Template...</span>
              </>
            ) : (
              <>
                <CheckCircle2 size={15} />
                <span>Terapkan Template Ini</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
