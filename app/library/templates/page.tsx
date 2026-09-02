"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api, ProposalTemplate } from "@/lib/api-client";
import { Button } from "@/components/ui/Button";
import {
  FileText,
  Copy,
  Edit3,
  Plus,
  ArrowRight,
  ShieldCheck,
  ChevronRight,
  ArrowLeft,
} from "lucide-react";

export default function TemplateLibraryPage() {
  const router = useRouter();
  const [templates, setTemplates] = useState<ProposalTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [cloningId, setCloningId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const res = await api.templates.list();
      if (res.success) {
        setTemplates(res.data);
      }
    } catch (err: any) {
      setError(err.message || "Gagal memuat template proposal");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const handleClone = async (template: ProposalTemplate) => {
    try {
      setCloningId(template.id);
      const newName = prompt(
        "Masukkan nama untuk template salinan:",
        `${template.name} (Custom)`
      );
      if (!newName) {
        setCloningId(null);
        return;
      }

      const res = await api.templates.clone(template.id, newName);
      if (res.success && res.data) {
        router.push(`/library/templates/${res.data.id}`);
      }
    } catch (err: any) {
      alert("Gagal menyalin template: " + err.message);
      setCloningId(null);
    }
  };

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
            href="/dashboard"
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
            title="Kembali ke Dashboard"
          >
            <ArrowLeft size={18} />
          </Link>

          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#64748b" }}>
              <Link href="/dashboard" style={{ color: "#64748b", textDecoration: "none" }}>Dashboard</Link>
              <ChevronRight size={13} />
              <span style={{ color: "#0f172a", fontWeight: 600 }}>Library Template</span>
            </div>
            <h1
              style={{
                fontFamily: "var(--font-display)",
                fontSize: 16,
                fontWeight: 700,
                color: "#0f172a",
                margin: 0,
              }}
            >
              Proposal Templates
            </h1>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ display: "flex", background: "#f1f5f9", padding: 3, borderRadius: 8, border: "1px solid #e2e8f0" }}>
            <div
              style={{
                padding: "5px 12px",
                fontSize: 12,
                fontWeight: 700,
                color: "#0f172a",
                background: "#ffffff",
                borderRadius: 6,
                boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
              }}
            >
              Proposal Templates ({templates.length})
            </div>
            <Link
              href="/prompts"
              style={{
                padding: "5px 12px",
                fontSize: 12,
                fontWeight: 600,
                color: "#64748b",
                textDecoration: "none",
                borderRadius: 6,
              }}
            >
              AI Skill Prompts
            </Link>
          </div>

          <Button
            variant="emerald"
            size="sm"
            icon={<Plus size={14} />}
            onClick={() => {
              if (templates.length > 0) handleClone(templates[0]);
            }}
          >
            Buat Template Baru
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main
        style={{
          maxWidth: 1140,
          margin: "0 auto",
          padding: "32px 24px 80px",
          width: "100%",
        }}
      >
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <FileText size={20} color="#00C988" />
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontSize: 22,
                fontWeight: 800,
                color: "#0f172a",
                margin: 0,
              }}
            >
              Library Template Proposal Skripsi
            </h2>
          </div>
          <p style={{ fontSize: 13.5, color: "#64748b", margin: 0, lineHeight: 1.5, maxWidth: 760 }}>
            Pilih dan sesuaikan struktur bab proposal skripsi Anda. Template bawaan disusun berdasarkan panduan resmi penulisan Tugas Akhir Fakultas Informatika (FIF) Telkom University.
          </p>
        </div>

        {error && (
          <div
            style={{
              padding: "12px 16px",
              borderRadius: 10,
              background: "#fff1f2",
              border: "1px solid #fecdd3",
              color: "#be123c",
              fontSize: 13,
              marginBottom: 20,
            }}
          >
            {error}
          </div>
        )}

        {loading ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "60px 0" }}>
            <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(420px, 1fr))",
              gap: 20,
            }}
          >
            {templates.map((tpl) => {
              const isSystem = !tpl.ownerId;
              return (
                <div
                  key={tpl.id}
                  className="card-fluento"
                  style={{
                    background: "#ffffff",
                    borderRadius: 16,
                    border: "1px solid #e2e8f0",
                    padding: 24,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    gap: 18,
                  }}
                >
                  <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    {/* Top Badges */}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        {isSystem ? (
                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 4,
                              fontSize: 11,
                              fontWeight: 700,
                              padding: "3px 8px",
                              borderRadius: 6,
                              background: "#e0f2fe",
                              color: "#0369a1",
                            }}
                          >
                            <ShieldCheck size={12} />
                            <span>System Default</span>
                          </span>
                        ) : (
                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 4,
                              fontSize: 11,
                              fontWeight: 700,
                              padding: "3px 8px",
                              borderRadius: 6,
                              background: "#f3e8ff",
                              color: "#7e22ce",
                            }}
                          >
                            <Edit3 size={12} />
                            <span>Kustom Pengguna</span>
                          </span>
                        )}

                        {tpl.sourceFaculty && (
                          <span style={{ fontSize: 11, color: "#64748b", background: "#f1f5f9", padding: "3px 8px", borderRadius: 6 }}>
                            {tpl.sourceFaculty}
                          </span>
                        )}
                      </div>

                      <span style={{ fontSize: 12, fontWeight: 600, color: "#64748b", fontFamily: "monospace" }}>
                        {tpl.sections?.length || 0} Bab
                      </span>
                    </div>

                    {/* Title */}
                    <div>
                      <h3
                        style={{
                          fontFamily: "var(--font-display)",
                          fontSize: 16,
                          fontWeight: 700,
                          color: "#0f172a",
                          margin: "0 0 4px",
                          lineHeight: 1.4,
                        }}
                      >
                        {tpl.name}
                      </h3>
                      <p style={{ fontSize: 12.5, color: "#64748b", margin: 0 }}>
                        Format baku dengan instruksi panduan penulisan akademik di setiap bagian.
                      </p>
                    </div>

                    {/* Sections Preview List */}
                    <div style={{ paddingTop: 10, borderTop: "1px solid #f1f5f9" }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>
                        Susunan Bab:
                      </div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, maxHeight: 120, overflowY: "auto" }}>
                        {tpl.sections?.map((sec, idx) => (
                          <div
                            key={sec.id || idx}
                            style={{
                              fontSize: 11.5,
                              padding: "3px 8px",
                              borderRadius: 6,
                              background: sec.isOptional ? "#ffffff" : "#f8fafc",
                              border: `1px solid ${sec.isOptional ? "#cbd5e1" : "#e2e8f0"}`,
                              color: sec.isOptional ? "#64748b" : "#334155",
                              display: "flex",
                              alignItems: "center",
                              gap: 4,
                            }}
                          >
                            <span style={{ color: "#94a3b8", fontFamily: "monospace" }}>{sec.order}.</span>
                            <span>{sec.title}</span>
                            {sec.isOptional && (
                              <span style={{ fontSize: 9.5, color: "#d97706", fontWeight: 600 }}>(opsional)</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      paddingTop: 14,
                      borderTop: "1px solid #f1f5f9",
                    }}
                  >
                    <button
                      onClick={() => handleClone(tpl)}
                      disabled={cloningId === tpl.id}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                        padding: "6px 12px",
                        borderRadius: 8,
                        background: "#f8fafc",
                        border: "1px solid #e2e8f0",
                        fontSize: 12.5,
                        fontWeight: 600,
                        color: "#475569",
                        cursor: "pointer",
                      }}
                    >
                      <Copy size={13} color="#64748b" />
                      <span>{cloningId === tpl.id ? "Menyalin..." : "Clone Template"}</span>
                    </button>

                    <Link
                      href={`/library/templates/${tpl.id}`}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                        padding: "6px 14px",
                        borderRadius: 8,
                        background: "#e6f9f2",
                        border: "1px solid #a7f3d0",
                        fontSize: 12.5,
                        fontWeight: 700,
                        color: "#059669",
                        textDecoration: "none",
                      }}
                    >
                      <span>{isSystem ? "Lihat Detail" : "Edit Section"}</span>
                      <ArrowRight size={13} />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
