"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { api, ProposalTemplate, ProposalTemplateSection, ResearchProject } from "@/lib/api-client";
import { Button } from "@/components/ui/Button";
import { ProjectSidebar } from "@/components/ui/ProjectSidebar";
import { notify } from "@/lib/notification";
import {
  FileText,
  ChevronRight,
  ArrowRight,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  CheckCircle2,
  Sparkles,
  HelpCircle,
  BookOpen,
  GraduationCap,
  FlaskConical,
  Stethoscope,
  Scale,
  Landmark,
} from "lucide-react";

const CITATION_STYLES = [
  {
    code: "IEEE",
    name: "IEEE",
    desc: "Teknik, Informatika, Sains",
    icon: FlaskConical,
    inTextExample: "[1]",
    bibExample: "[1] A. Penulis, \"Judul Artikel,\" Nama Jurnal, vol. 10, pp. 1–8, 2023.",
    color: "#1d4ed8",
    bg: "#eff6ff",
    border: "#bfdbfe",
  },
  {
    code: "APA",
    name: "APA 7th",
    desc: "Psikologi, Pendidikan, Sosial",
    icon: GraduationCap,
    inTextExample: "(Penulis, 2023)",
    bibExample: "Penulis, A. (2023). Judul artikel. Nama Jurnal, 10(2), 1–8. https://doi.org/...",
    color: "#0369a1",
    bg: "#f0f9ff",
    border: "#bae6fd",
  },
  {
    code: "MLA",
    name: "MLA 9th",
    desc: "Sastra, Humaniora",
    icon: BookOpen,
    inTextExample: "(Penulis 45)",
    bibExample: "Penulis, Nama. \"Judul Artikel.\" Nama Jurnal, vol. 10, no. 2, 2023, pp. 1–8.",
    color: "#7c3aed",
    bg: "#faf5ff",
    border: "#ddd6fe",
  },
  {
    code: "HARVARD",
    name: "Harvard",
    desc: "Bisnis, Ekonomi, Manajemen",
    icon: Landmark,
    inTextExample: "(Penulis, 2023)",
    bibExample: "Penulis, A. (2023) 'Judul artikel', Nama Jurnal, 10(2), pp. 1–8.",
    color: "#b45309",
    bg: "#fffbeb",
    border: "#fde68a",
  },
  {
    code: "VANCOUVER",
    name: "Vancouver",
    desc: "Kedokteran, Farmasi, Kesehatan",
    icon: Stethoscope,
    inTextExample: "[1]",
    bibExample: "1. Penulis A. Judul artikel. Nama Jurnal. 2023;10(2):1–8.",
    color: "#065f46",
    bg: "#ecfdf5",
    border: "#a7f3d0",
  },
  {
    code: "CHICAGO",
    name: "Chicago",
    desc: "Hukum, Sejarah, Humaniora",
    icon: Scale,
    inTextExample: "(Penulis 2023)",
    bibExample: "Penulis, Nama. \"Judul Artikel.\" Nama Jurnal 10, no. 2 (2023): 1–8.",
    color: "#9f1239",
    bg: "#fff1f2",
    border: "#fecdd3",
  },
];

export default function ProjectTemplatePage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params?.id as string;

  const [project, setProject] = useState<ResearchProject | null>(null);
  const [templates, setTemplates] = useState<ProposalTemplate[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");
  const [sections, setSections] = useState<ProposalTemplateSection[]>([]);
  const [selectedCitationStyle, setSelectedCitationStyle] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<"citation" | "structure">("citation");

  useEffect(() => {
    if (!projectId) return;
    Promise.all([api.projects.get(projectId), api.templates.list()])
      .then(([projRes, tplRes]) => {
        if (projRes.success && projRes.data) {
          setProject(projRes.data);
          // Restore saved citation style jika ada
          const styleFromDb = (projRes.data as any).citationStyle;
          if (styleFromDb && typeof styleFromDb === "string") {
            setSelectedCitationStyle(styleFromDb.toUpperCase().trim());
          }
        }
        if (tplRes.success && tplRes.data.length > 0) {
          setTemplates(tplRes.data);
          const defaultTpl = tplRes.data.find((t) => t.isDefault) || tplRes.data[0];
          setSelectedTemplateId(defaultTpl.id);
          setSections(defaultTpl.sections || []);
        }
      })
      .catch((err) => console.error("Gagal load project template:", err))
      .finally(() => setLoading(false));
  }, [projectId]);

  const handleTemplateSelect = (tplId: string) => {
    setSelectedTemplateId(tplId);
    const chosen = templates.find((t) => t.id === tplId);
    if (chosen) setSections(chosen.sections || []);
  };

  const handleMove = (index: number, direction: "up" | "down") => {
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= sections.length) return;
    const updated = [...sections];
    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
    setSections(updated.map((sec, idx) => ({ ...sec, order: idx + 1 })));
  };

  const handleAddSection = () => {
    const newSec: ProposalTemplateSection = {
      id: `sec-${Date.now()}`,
      templateId: selectedTemplateId,
      order: sections.length + 1,
      title: "Bagian / Subbab Baru",
      isOptional: false,
      guidanceText: "Panduan instruksi penulisan untuk bagian ini...",
    };
    setSections([...sections, newSec]);
  };

  const handleDeleteSection = (index: number) => {
    const updated = sections.filter((_, idx) => idx !== index);
    setSections(updated.map((sec, idx) => ({ ...sec, order: idx + 1 })));
  };

  const handleSelectCitationStyle = async (styleCode: string) => {
    const upperCode = styleCode.toUpperCase().trim();
    setSelectedCitationStyle(upperCode);
    try {
      const res = await api.projects.update(projectId, { citationStyle: upperCode } as any);
      if (res.success && res.data) {
        setProject(res.data);
      } else {
        setProject((prev) => (prev ? { ...prev, citationStyle: upperCode } : null));
      }
      notify.success("Gaya Sitasi Dipilih", `Format sitasi diset ke ${upperCode}`);
    } catch (err) {
      console.error("Gagal auto-save citation style:", err);
      notify.error("Gagal Menyimpan", "Gaya sitasi gagal disimpan ke server.");
    }
  };

  const handleSaveAndProceed = async () => {
    setSaving(true);
    try {
      const upperCode = (selectedCitationStyle || "IEEE").toUpperCase().trim();
      const res = await api.projects.update(projectId, { citationStyle: upperCode } as any);
      if (res.success && res.data) {
        setProject(res.data);
      }
      setSavedSuccess(true);
      notify.success("Berhasil Disimpan", "Gaya sitasi tersimpan. Menuju Telaah Jurnal (F3)...");
      setTimeout(() => {
        router.push(`/projects/${projectId}/journals`);
      }, 500);
    } catch (err) {
      console.error("Gagal simpan citation style:", err);
      setSavedSuccess(true);
      setTimeout(() => {
        router.push(`/projects/${projectId}/journals`);
      }, 500);
    } finally {
      setSaving(false);
    }
  };

  const selectedStyle =
    CITATION_STYLES.find(
      (s) => s.code.toUpperCase() === selectedCitationStyle.toUpperCase().trim()
    ) || CITATION_STYLES[0];

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "#fefefe", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#fefefe", display: "flex", flexDirection: "row" }}>
      <ProjectSidebar
        projectId={projectId}
        approvedJournalsCount={0}
        totalNodesCount={0}
        citationStyleSelected={Boolean(project?.citationStyle || selectedCitationStyle)}
      />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: "100vh" }}>
        {/* Header */}
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
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#64748b" }}>
              <Link href="/dashboard" style={{ color: "#64748b", textDecoration: "none" }}>Dashboard</Link>
              <ChevronRight size={13} />
              <span style={{ color: "#0f172a", fontWeight: 600 }}>{project?.title}</span>
              <ChevronRight size={13} />
              <span style={{ color: "#00C988", fontWeight: 600 }}>Template & Sitasi</span>
            </div>
            <h1 style={{ fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 700, color: "#0f172a", margin: 0 }}>
              Pilih Gaya Sitasi & Struktur Proposal
            </h1>
          </div>

          <Button
            variant="emerald"
            size="sm"
            disabled={saving}
            onClick={handleSaveAndProceed}
            icon={savedSuccess ? <CheckCircle2 size={15} /> : <ArrowRight size={15} />}
          >
            {savedSuccess ? "Tersimpan! Ke Telaah Jurnal..." : "Simpan & Lanjut ke Telaah Jurnal →"}
          </Button>
        </header>

        {/* Tab Navigation */}
        <div
          style={{
            background: "#ffffff",
            borderBottom: "1px solid #e2e8f0",
            padding: "0 28px",
            display: "flex",
            gap: 0,
          }}
        >
          {[
            { id: "citation", label: "📚 Gaya Sitasi (Daftar Pustaka)" },
            { id: "structure", label: "📋 Struktur Bab Proposal" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              style={{
                padding: "12px 20px",
                background: "none",
                border: "none",
                borderBottom: activeTab === tab.id ? "2px solid #00C988" : "2px solid transparent",
                fontSize: 13,
                fontWeight: activeTab === tab.id ? 700 : 500,
                color: activeTab === tab.id ? "#00C988" : "#64748b",
                cursor: "pointer",
                transition: "all 0.15s",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Main Content */}
        <main style={{ maxWidth: 960, margin: "0 auto", padding: "32px 24px 80px", width: "100%", display: "flex", flexDirection: "column", gap: 20 }}>

          {/* TAB: Citation Style */}
          {activeTab === "citation" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {/* Intro */}
              <div
                style={{
                  padding: "16px 20px",
                  borderRadius: 12,
                  background: "linear-gradient(135deg, #f0fdf4, #ecfdf5)",
                  border: "1px solid #bbf7d0",
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 12,
                }}
              >
                <Sparkles size={18} color="#059669" style={{ flexShrink: 0, marginTop: 2 }} />
                <div>
                  <div style={{ fontSize: 13.5, fontWeight: 700, color: "#065f46", marginBottom: 3 }}>
                    Pilih gaya sitasi yang sesuai dengan panduan kampus/prodi kamu
                  </div>
                  <div style={{ fontSize: 12.5, color: "#047857", lineHeight: 1.5 }}>
                    Gaya sitasi ini akan digunakan di seluruh naskah proposal — in-text citation dan daftar pustaka. Bisa diubah kapan saja dari halaman ini.
                  </div>
                </div>
              </div>

              {/* Citation Style Grid */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
                {CITATION_STYLES.map((style) => {
                  const isSelected = style.code.toUpperCase() === selectedCitationStyle.toUpperCase().trim();
                  const Icon = style.icon;
                  return (
                    <div
                      key={style.code}
                      onClick={() => handleSelectCitationStyle(style.code)}
                      style={{
                        padding: 16,
                        borderRadius: 12,
                        border: isSelected ? `2.5px solid ${style.color}` : "1.5px solid #e2e8f0",
                        background: isSelected ? style.bg : "#ffffff",
                        cursor: "pointer",
                        transition: "all 0.15s",
                        position: "relative",
                        overflow: "hidden",
                      }}
                    >
                      {isSelected ? (
                        <div
                          style={{
                            position: "absolute",
                            top: 10,
                            right: 10,
                            display: "flex",
                            alignItems: "center",
                            gap: 4,
                            padding: "3px 8px",
                            borderRadius: 999,
                            background: style.color,
                            color: "#ffffff",
                            fontSize: 11,
                            fontWeight: 700,
                          }}
                        >
                          <CheckCircle2 size={13} color="#fff" />
                          <span>Terpilih</span>
                        </div>
                      ) : (
                        <div
                          style={{
                            position: "absolute",
                            top: 12,
                            right: 12,
                            width: 18,
                            height: 18,
                            borderRadius: "50%",
                            border: "2px solid #cbd5e1",
                            background: "#ffffff",
                          }}
                        />
                      )}

                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                        <div
                          style={{
                            width: 36,
                            height: 36,
                            borderRadius: 8,
                            background: isSelected ? style.color : "#f1f5f9",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                          }}
                        >
                          <Icon size={18} color={isSelected ? "#fff" : "#64748b"} />
                        </div>
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 800, color: isSelected ? style.color : "#0f172a" }}>
                            {style.name}
                          </div>
                          <div style={{ fontSize: 11, color: "#64748b" }}>{style.desc}</div>
                        </div>
                      </div>

                      <div
                        style={{
                          padding: "8px 10px",
                          borderRadius: 8,
                          background: isSelected ? `${style.color}15` : "#f8fafc",
                          border: `1px solid ${isSelected ? style.border : "#e2e8f0"}`,
                          fontSize: 11,
                          color: "#334155",
                          lineHeight: 1.5,
                        }}
                      >
                        <span style={{ fontWeight: 700, color: isSelected ? style.color : "#64748b" }}>
                          In-text:
                        </span>{" "}
                        <code style={{ fontFamily: "monospace", fontSize: 11 }}>{style.inTextExample}</code>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Preview Panel */}
              <div
                style={{
                  padding: "20px 24px",
                  borderRadius: 14,
                  background: "#ffffff",
                  border: `1.5px solid ${selectedStyle.border}`,
                  display: "flex",
                  flexDirection: "column",
                  gap: 14,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: selectedStyle.color,
                    }}
                  />
                  <span style={{ fontSize: 12, fontWeight: 700, color: "#334155", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    Preview — Gaya {selectedStyle.name}
                  </span>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "#64748b", marginBottom: 6, textTransform: "uppercase" }}>
                      In-Text Citation
                    </div>
                    <div
                      style={{
                        padding: "10px 14px",
                        borderRadius: 8,
                        background: selectedStyle.bg,
                        border: `1px solid ${selectedStyle.border}`,
                        fontSize: 12.5,
                        color: "#1e293b",
                        lineHeight: 1.6,
                        fontFamily: "Georgia, serif",
                      }}
                    >
                      Berdasarkan penelitian sebelumnya{" "}
                      <span style={{ color: selectedStyle.color, fontWeight: 700, cursor: "pointer", borderBottom: `1px solid ${selectedStyle.color}` }}>
                        {selectedStyle.inTextExample}
                      </span>
                      , ditemukan bahwa...
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "#64748b", marginBottom: 6, textTransform: "uppercase" }}>
                      Entri Daftar Pustaka
                    </div>
                    <div
                      style={{
                        padding: "10px 14px",
                        borderRadius: 8,
                        background: "#f8fafc",
                        border: "1px solid #e2e8f0",
                        fontSize: 11.5,
                        color: "#334155",
                        lineHeight: 1.6,
                        fontFamily: "Georgia, serif",
                      }}
                    >
                      {selectedStyle.bibExample}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: Structure */}
          {activeTab === "structure" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {/* Template selector */}
              <div
                style={{
                  background: "#ffffff",
                  borderRadius: 16,
                  border: "1px solid #e2e8f0",
                  padding: 20,
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                }}
              >
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 6 }}>
                    Rujukan Template Proposal
                  </label>
                  <select
                    value={selectedTemplateId}
                    onChange={(e) => handleTemplateSelect(e.target.value)}
                    style={{
                      width: "100%",
                      height: 42,
                      padding: "0 14px",
                      borderRadius: 10,
                      border: "1px solid #cbd5e1",
                      fontSize: 14,
                      fontWeight: 600,
                      color: "#0f172a",
                      outline: "none",
                      background: "#ffffff",
                    }}
                  >
                    {templates.map((tpl) => (
                      <option key={tpl.id} value={tpl.id}>
                        {tpl.name} {tpl.isDefault ? "(Default Institusi)" : "(Kustom)"}
                      </option>
                    ))}
                  </select>
                </div>

                <div
                  style={{
                    padding: "10px 14px",
                    borderRadius: 10,
                    background: "#f0fdf4",
                    border: "1px solid #bbf7d0",
                    color: "#166534",
                    fontSize: 12.5,
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <Sparkles size={16} color="#059669" style={{ flexShrink: 0 }} />
                  <span>
                    Perubahan struktur bab di bawah <strong>hanya berlaku untuk proyek ini</strong> dan tidak akan mengubah template default.
                  </span>
                </div>
              </div>

              {/* Sections List */}
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <h2 style={{ fontSize: 13, fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.05em", margin: 0 }}>
                    Susunan Bab ({sections.length})
                  </h2>
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
                </div>

                {sections.map((sec, idx) => (
                  <div
                    key={sec.id || idx}
                    style={{
                      background: "#ffffff",
                      borderRadius: 14,
                      border: "1px solid #e2e8f0",
                      padding: "16px 20px",
                      display: "flex",
                      flexDirection: "column",
                      gap: 10,
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
                            const updated = [...sections];
                            updated[idx] = { ...updated[idx], title: e.target.value };
                            setSections(updated);
                          }}
                          style={{
                            flex: 1,
                            height: 36,
                            padding: "0 10px",
                            borderRadius: 8,
                            border: "1px solid #cbd5e1",
                            fontSize: 13.5,
                            fontWeight: 600,
                            color: "#0f172a",
                            outline: "none",
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
                            cursor: "pointer",
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={sec.isOptional}
                            onChange={(e) => {
                              const updated = [...sections];
                              updated[idx] = { ...updated[idx], isOptional: e.target.checked };
                              setSections(updated);
                            }}
                          />
                          <span>Opsional</span>
                        </label>

                        <div style={{ display: "flex", alignItems: "center", gap: 4, borderLeft: "1px solid #e2e8f0", paddingLeft: 8 }}>
                          <button
                            onClick={() => handleMove(idx, "up")}
                            disabled={idx === 0}
                            style={{ padding: 4, borderRadius: 6, border: "1px solid #e2e8f0", background: "#fff", cursor: idx === 0 ? "not-allowed" : "pointer", color: idx === 0 ? "#cbd5e1" : "#475569" }}
                          >
                            <ArrowUp size={14} />
                          </button>
                          <button
                            onClick={() => handleMove(idx, "down")}
                            disabled={idx === sections.length - 1}
                            style={{ padding: 4, borderRadius: 6, border: "1px solid #e2e8f0", background: "#fff", cursor: idx === sections.length - 1 ? "not-allowed" : "pointer", color: idx === sections.length - 1 ? "#cbd5e1" : "#475569" }}
                          >
                            <ArrowDown size={14} />
                          </button>
                          <button
                            onClick={() => handleDeleteSection(idx)}
                            style={{ padding: 4, borderRadius: 6, border: "1px solid #fee2e2", background: "#fff1f2", cursor: "pointer", color: "#e11d48", marginLeft: 4 }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>

                    {sec.guidanceText && (
                      <div
                        style={{
                          fontSize: 12,
                          color: "#475569",
                          background: "#f8fafc",
                          padding: "8px 12px",
                          borderRadius: 8,
                          border: "1px solid #e2e8f0",
                          display: "flex",
                          alignItems: "flex-start",
                          gap: 6,
                          lineHeight: 1.45,
                        }}
                      >
                        <HelpCircle size={14} color="#00C988" style={{ flexShrink: 0, marginTop: 2 }} />
                        <span>{sec.guidanceText}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
