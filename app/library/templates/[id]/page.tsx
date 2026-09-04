"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { api, ProposalTemplate, ProposalTemplateSection } from "@/lib/api-client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { notify } from "@/lib/notification";
import {
  FileText,
  ChevronRight,
  ArrowLeft,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Save,
  Copy,
  ShieldCheck,
  HelpCircle,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

export default function TemplateDetailPage() {
  const params = useParams();
  const router = useRouter();
  const templateId = params.id as string;

  const [template, setTemplate] = useState<ProposalTemplate | null>(null);
  const [sections, setSections] = useState<ProposalTemplateSection[]>([]);
  const [templateName, setTemplateName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!templateId) return;

    setLoading(true);
    api.templates
      .get(templateId)
      .then((res) => {
        if (res.success && res.data) {
          setTemplate(res.data);
          setTemplateName(res.data.name);
          setSections(res.data.sections || []);
        }
      })
      .catch((err) => {
        setError(err.message || "Gagal memuat detail template");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [templateId]);

  const isSystem = !template?.ownerId;

  const handleMove = (index: number, direction: "up" | "down") => {
    if (isSystem) return;
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= sections.length) return;

    const updated = [...sections];
    const temp = updated[index];
    updated[index] = updated[newIndex];
    updated[newIndex] = temp;

    const reordered = updated.map((sec, idx) => ({ ...sec, order: idx + 1 }));
    setSections(reordered);
  };

  const handleAddSection = () => {
    if (isSystem) return;
    const newSec: ProposalTemplateSection = {
      id: `new-${Date.now()}`,
      templateId,
      order: sections.length + 1,
      title: "Bagian / Bab Baru",
      isOptional: false,
      guidanceText: "Panduan instruksi penulisan untuk bagian ini...",
    };
    setSections([...sections, newSec]);
  };

  const handleDeleteSection = (index: number) => {
    if (isSystem) return;
    const updated = sections.filter((_, idx) => idx !== index);
    const reordered = updated.map((sec, idx) => ({ ...sec, order: idx + 1 }));
    setSections(reordered);
  };

  const handleSave = async () => {
    if (isSystem) return;
    try {
      setSaving(true);
      setError(null);
      setSuccessMsg(null);

      const res = await api.templates.update(templateId, {
        name: templateName,
        sections: sections.map((s, idx) => ({
          order: idx + 1,
          title: s.title,
          isOptional: s.isOptional,
          guidanceText: s.guidanceText,
        })),
      });

      if (res.success) {
        setSuccessMsg("Struktur template berhasil disimpan!");
        setTimeout(() => setSuccessMsg(null), 3000);
      }
    } catch (err: any) {
      setError(err.message || "Gagal menyimpan perubahan template");
    } finally {
      setSaving(false);
    }
  };

  const handleClone = async () => {
    if (!template) return;
    try {
      const newName = `${template.name} (Salinan ${new Date().toLocaleDateString("id-ID")})`;

      const res = await api.templates.clone(template.id, newName);
      if (res.success && res.data) {
        notify.success("Template Berhasil Diduplikasi!", `Salinan "${newName}" telah dibuat.`);
        router.push(`/library/templates/${res.data.id}`);
      }
    } catch (err: any) {
      notify.error("Gagal menyalin template: " + err.message);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "#fefefe", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#fefefe", display: "flex", flexDirection: "column" }}>
      {/* Top Header */}
      <header
        style={{
          height: 64,
          background: "#ffffff",
          borderBottom: "1px solid #e2e8f0",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 28px",
          position: "sticky",
          top: 0,
          zIndex: 30,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <Link
            href="/library/templates"
            style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              background: "#f8fafc",
              border: "1px solid #e2e8f0",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#475569",
              textDecoration: "none",
            }}
            title="Kembali ke Daftar Template"
          >
            <ArrowLeft size={18} />
          </Link>

          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#64748b" }}>
              <Link href="/library/templates" style={{ color: "#64748b", textDecoration: "none" }}>Library Template</Link>
              <ChevronRight size={13} />
              <span style={{ color: "#0f172a", fontWeight: 600, maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {template?.name}
              </span>
            </div>
            <h1 style={{ fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 700, color: "#0f172a", margin: 0 }}>
              Editor Susunan Bab
            </h1>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {isSystem ? (
            <Button
              variant="secondary"
              size="sm"
              icon={<Copy size={14} />}
              onClick={handleClone}
            >
              Clone untuk Mengedit
            </Button>
          ) : (
            <Button
              variant="emerald"
              size="sm"
              disabled={saving}
              onClick={handleSave}
              icon={<Save size={14} />}
            >
              {saving ? "Menyimpan..." : "Simpan Perubahan"}
            </Button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main
        style={{
          maxWidth: 900,
          margin: "0 auto",
          padding: "28px 24px 80px",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          gap: 20,
        }}
      >
        {isSystem && (
          <div
            style={{
              padding: "14px 18px",
              borderRadius: 12,
              background: "#e0f2fe",
              border: "1px solid #bae6fd",
              color: "#0369a1",
              fontSize: 13,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <ShieldCheck size={18} style={{ flexShrink: 0 }} />
              <span>
                Template ini adalah <strong>System Default</strong> (baku kurikulum). Untuk mengubah bab, silakan klik tombol <strong>Clone untuk Mengedit</strong>.
              </span>
            </div>
            <Button variant="secondary" size="sm" onClick={handleClone}>
              Clone
            </Button>
          </div>
        )}

        {successMsg && (
          <div
            style={{
              padding: "12px 16px",
              borderRadius: 10,
              background: "#ecfdf5",
              border: "1px solid #a7f3d0",
              color: "#065f46",
              fontSize: 13,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <CheckCircle2 size={16} color="#059669" />
            <span>{successMsg}</span>
          </div>
        )}

        {error && (
          <div
            style={{
              padding: "12px 16px",
              borderRadius: 10,
              background: "#fff1f2",
              border: "1px solid #fecdd3",
              color: "#be123c",
              fontSize: 13,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {/* Template Name Header Card */}
        <div
          className="card-fluento"
          style={{
            background: "#ffffff",
            borderRadius: 16,
            border: "1px solid #e2e8f0",
            padding: 22,
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          <label style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Nama Template Proposal
          </label>
          <input
            type="text"
            value={templateName}
            onChange={(e) => setTemplateName(e.target.value)}
            disabled={isSystem}
            style={{
              height: 42,
              padding: "0 14px",
              borderRadius: 10,
              border: "1px solid #cbd5e1",
              fontSize: 15,
              fontWeight: 700,
              color: "#0f172a",
              outline: "none",
              background: isSystem ? "#f8fafc" : "#ffffff",
            }}
          />
          {template?.sourceFaculty && (
            <span style={{ fontSize: 12, color: "#64748b" }}>
              Rujukan Fakultas: <strong style={{ color: "#0f172a" }}>{template.sourceFaculty}</strong>
            </span>
          )}
        </div>

        {/* Sections List */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <h2 style={{ fontSize: 13, fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.05em", margin: 0 }}>
              Daftar Bagian & Bab Proposal ({sections.length})
            </h2>

            {!isSystem && (
              <button
                onClick={handleAddSection}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                  fontSize: 12.5,
                  fontWeight: 600,
                  color: "#00C988",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                <Plus size={14} />
                <span>Tambah Bagian</span>
              </button>
            )}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {sections.map((sec, idx) => (
              <div
                key={sec.id || idx}
                className="card-fluento"
                style={{
                  background: "#ffffff",
                  borderRadius: 14,
                  border: "1px solid #e2e8f0",
                  padding: "16px 20px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1 }}>
                    <span
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: 8,
                        background: "#e6f9f2",
                        border: "1px solid #a7f3d0",
                        color: "#059669",
                        fontWeight: 700,
                        fontSize: 12,
                        fontFamily: "monospace",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      {idx + 1}
                    </span>

                    <input
                      type="text"
                      value={sec.title}
                      onChange={(e) => {
                        if (isSystem) return;
                        const updated = [...sections];
                        updated[idx].title = e.target.value;
                        setSections(updated);
                      }}
                      disabled={isSystem}
                      style={{
                        flex: 1,
                        height: 36,
                        padding: "0 10px",
                        borderRadius: 8,
                        border: isSystem ? "1px solid transparent" : "1px solid #cbd5e1",
                        fontSize: 13.5,
                        fontWeight: 600,
                        color: "#0f172a",
                        outline: "none",
                        background: isSystem ? "transparent" : "#ffffff",
                      }}
                    />
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <label
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        fontSize: 12,
                        color: sec.isOptional ? "#d97706" : "#64748b",
                        fontWeight: sec.isOptional ? 600 : 500,
                        background: sec.isOptional ? "#fffbeb" : "#f8fafc",
                        border: `1px solid ${sec.isOptional ? "#fde68a" : "#e2e8f0"}`,
                        padding: "4px 8px",
                        borderRadius: 6,
                        cursor: isSystem ? "default" : "pointer",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={sec.isOptional}
                        onChange={(e) => {
                          if (isSystem) return;
                          const updated = [...sections];
                          updated[idx].isOptional = e.target.checked;
                          setSections(updated);
                        }}
                        disabled={isSystem}
                      />
                      <span>Opsional</span>
                    </label>

                    {!isSystem && (
                      <div style={{ display: "flex", alignItems: "center", gap: 4, borderLeft: "1px solid #e2e8f0", paddingLeft: 8 }}>
                        <button
                          onClick={() => handleMove(idx, "up")}
                          disabled={idx === 0}
                          style={{
                            padding: 4,
                            borderRadius: 6,
                            border: "1px solid #e2e8f0",
                            background: "#ffffff",
                            cursor: idx === 0 ? "not-allowed" : "pointer",
                            color: idx === 0 ? "#cbd5e1" : "#475569",
                          }}
                          title="Geser ke Atas"
                        >
                          <ArrowUp size={14} />
                        </button>
                        <button
                          onClick={() => handleMove(idx, "down")}
                          disabled={idx === sections.length - 1}
                          style={{
                            padding: 4,
                            borderRadius: 6,
                            border: "1px solid #e2e8f0",
                            background: "#ffffff",
                            cursor: idx === sections.length - 1 ? "not-allowed" : "pointer",
                            color: idx === sections.length - 1 ? "#cbd5e1" : "#475569",
                          }}
                          title="Geser ke Bawah"
                        >
                          <ArrowDown size={14} />
                        </button>
                        <button
                          onClick={() => handleDeleteSection(idx)}
                          style={{
                            padding: 4,
                            borderRadius: 6,
                            border: "1px solid #fee2e2",
                            background: "#fff1f2",
                            cursor: "pointer",
                            color: "#e11d48",
                            marginLeft: 4,
                          }}
                          title="Hapus Bagian"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: "#64748b", display: "flex", alignItems: "center", gap: 4, marginBottom: 4 }}>
                    <HelpCircle size={12} color="#00C988" />
                    <span>Petunjuk & Panduan Penulisan Bagian Ini:</span>
                  </label>
                  <textarea
                    rows={2}
                    value={sec.guidanceText || ""}
                    onChange={(e) => {
                      if (isSystem) return;
                      const updated = [...sections];
                      updated[idx].guidanceText = e.target.value;
                      setSections(updated);
                    }}
                    disabled={isSystem}
                    placeholder="Contoh: Uraikan latar belakang masalah minimal 1 halaman..."
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      borderRadius: 8,
                      border: "1px solid #cbd5e1",
                      fontSize: 12.5,
                      color: "#334155",
                      outline: "none",
                      background: isSystem ? "#f8fafc" : "#ffffff",
                      fontFamily: "var(--font-body)",
                      resize: "vertical",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
