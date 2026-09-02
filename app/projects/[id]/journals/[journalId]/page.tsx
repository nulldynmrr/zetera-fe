"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  Network,
  CheckCircle2,
  Sparkles,
  Quote,
  X,
  RefreshCw,
  Zap,
  Wand2,
  ExternalLink,
  Plus,
  Trash2,
  FileText,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { CitationBadge } from "@/components/CitationBadge";
import { useRequireAuth } from "@/lib/auth-context";
import {
  sanitizeAcademicText,
  formatAcademicParagraphs,
  formatBibliographyEntries,
} from "@/lib/academic-text";
import {
  api,
  type Journal,
  type FrameworkNode,
  type EvidenceType,
  type JournalStatus,
} from "@/lib/api-client";

export default function JournalReaderPage() {
  const params = useParams();
  const projectId = params?.id as string;
  const journalId = params?.journalId as string;

  const { user, isLoading } = useRequireAuth();

  const [journal, setJournal] = useState<Journal | null>(null);
  const [frameworkNodes, setFrameworkNodes] = useState<FrameworkNode[]>([]);
  const [loading, setLoading] = useState(true);

  // View PDF modal toggle (clean popup instead of distracting tabs)
  const [showPdfModal, setShowPdfModal] = useState(false);

  // AI Cross-Check Running State
  const [aiRunning, setAiRunning] = useState(false);
  const [aiProgress, setAiProgress] = useState(0);
  const [aiEstimatedSec, setAiEstimatedSec] = useState(0);
  const [aiSuccessMsg, setAiSuccessMsg] = useState("");

  // Quick Manual Mapping Drawer / Modal
  const [showMapModal, setShowMapModal] = useState(false);
  const [selectedNodeId, setSelectedNodeId] = useState("");
  const [evidenceType, setEvidenceType] = useState<EvidenceType>("SUPPORTS");
  const [quoteInput, setQuoteInput] = useState("");
  const [pageNumberInput, setPageNumberInput] = useState("");
  const [savingMapping, setSavingMapping] = useState(false);

  // Load Journal Detail & Framework Nodes
  const loadData = useCallback(async () => {
    if (!projectId || !journalId) return;
    try {
      setLoading(true);
      const [journalRes, frameworkRes] = await Promise.all([
        api.journals.get(projectId, journalId),
        api.framework.get(projectId),
      ]);
      setJournal(journalRes.data);
      setFrameworkNodes(frameworkRes.data.nodes || []);
      if (frameworkRes.data.nodes.length > 0) {
        setSelectedNodeId(frameworkRes.data.nodes[0].id);
      }
    } catch (err) {
      console.error("Gagal memuat detail jurnal:", err);
    } finally {
      setLoading(false);
    }
  }, [projectId, journalId]);

  useEffect(() => {
    if (user && projectId && journalId) {
      loadData();
    }
  }, [user, projectId, journalId, loadData]);

  // Clean title
  const cleanTitle = useMemo(() => {
    if (!journal?.title) return "Dokumen Artikel Ilmiah";
    return journal.title
      .replace(/^[a-z0-9]+\s*\+\s*/i, "")
      .replace(/[+]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }, [journal?.title]);

  // ── 1-CLICK DEDICATED GROQ AI CROSS-CHECK & AUTO-MATCH ──
  const handleRunAiCrossCheck = async () => {
    if (!projectId || !journalId) return;

    try {
      setAiRunning(true);
      setAiProgress(20);
      setAiEstimatedSec(6);
      setAiSuccessMsg("");

      const timer = setInterval(() => {
        setAiProgress((prev) => (prev < 85 ? prev + 15 : prev));
        setAiEstimatedSec((prev) => (prev > 1 ? prev - 1 : 1));
      }, 700);

      const res = await api.journals.aiCrosscheck(projectId, journalId);

      clearInterval(timer);
      setAiProgress(100);
      setAiEstimatedSec(0);
      setJournal(res.journal);
      setAiSuccessMsg(
        res.journal.status === "APPROVED"
          ? `✓ Disetujui (${res.aiAnalysis?.relevanceScore || 85}% Relevansi). Berhasil memetakan ${res.newMappings.length} bukti!`
          : res.journal.status === "REJECTED"
            ? `⚠️ Jurnal Ditolak: ${res.aiAnalysis?.recommendationReason || "Topik tidak selaras dengan skripsi."}`
            : "✓ Telaah intisari artikel berhasil diperbarui oleh AI!"
      );
      setTimeout(() => setAiSuccessMsg(""), 6000);
    } catch (err: any) {
      alert(err.message || "Gagal menjalankan AI Cross-Check");
    } finally {
      setAiRunning(false);
      setAiProgress(0);
      setAiEstimatedSec(0);
    }
  };

  // Add Manual Evidence Mapping
  const handleAddMapping = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedNodeId) return;

    try {
      setSavingMapping(true);
      const res = await api.journals.mapEvidence(projectId, journalId, {
        nodeId: selectedNodeId,
        evidenceType,
        quote: quoteInput.trim() || undefined,
        pageNumber: parseInt(pageNumberInput) || 1,
      });

      setJournal((prev) => {
        if (!prev) return null;
        const currentMappings = prev.nodeMappings || [];
        return {
          ...prev,
          nodeMappings: [res.data, ...currentMappings],
        };
      });

      setShowMapModal(false);
      setQuoteInput("");
      setPageNumberInput("");
    } catch (err: any) {
      alert(err.message || "Gagal memetakan bukti ke node framework");
    } finally {
      setSavingMapping(false);
    }
  };

  // Remove Evidence Mapping
  const handleRemoveMapping = async (mappingId: string) => {
    if (!confirm("Hapus bukti variabel ini?")) return;

    try {
      await api.journals.removeEvidence(projectId, journalId, mappingId);
      setJournal((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          nodeMappings: (prev.nodeMappings || []).filter((m) => m.id !== mappingId),
        };
      });
    } catch (err: any) {
      alert(err.message || "Gagal menghapus pemetaan");
    }
  };

  if (isLoading || loading || !journal) {
    return (
      <div
        style={{
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#fefefe",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <BookOpen size={24} color="#00C988" />
          <span style={{ fontSize: 15, fontWeight: 600, color: "#334155" }}>
            Membuka Jurnal & Bukti Variabel...
          </span>
        </div>
      </div>
    );
  }

  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
  const pdfUrl = journal.url ? (journal.url.startsWith("http") ? journal.url : `${baseUrl}${journal.url}`) : null;

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", background: "#fefefe" }}>
      {/* ── TOP HEADER (CLEAN & MINIMALIST) ── */}
      <header
        style={{
          height: 60,
          background: "#ffffff",
          borderBottom: "1px solid #e2e8f0",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 20px",
          zIndex: 20,
        }}
      >
        {/* Left: Back Link & Breadcrumb */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Link
            href={`/projects/${projectId}/journals`}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              fontSize: 13,
              fontWeight: 600,
              color: "#475569",
              textDecoration: "none",
              padding: "6px 10px",
              borderRadius: 8,
              background: "#f8fafc",
              border: "1px solid #e2e8f0",
            }}
          >
            <ArrowLeft size={15} />
            <span>Kembali ke Jurnal</span>
          </Link>

          <span style={{ fontSize: 12, color: "#cbd5e1" }}>/</span>

          <span style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", maxWidth: 460, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {cleanTitle}
          </span>
        </div>

        {/* Right: Quick Action to Framework */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {pdfUrl && (
            <button
              onClick={() => setShowPdfModal(true)}
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
                color: "#334155",
                cursor: "pointer",
              }}
            >
              <FileText size={14} color="#0284c7" />
              <span>Buka Dokumen PDF</span>
            </button>
          )}

          <Link
            href={`/projects/${projectId}/framework`}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              fontSize: 12.5,
              fontWeight: 600,
              padding: "6px 14px",
              borderRadius: 8,
              background: "#00C988",
              color: "#ffffff",
              textDecoration: "none",
            }}
          >
            <Network size={14} />
            <span>Kanvas Framework</span>
          </Link>
        </div>
      </header>

      {/* ── LIVE NOTIFICATION TOAST ── */}
      {aiSuccessMsg && (
        <div
          style={{
            background: "#f0fdf4",
            borderBottom: "1px solid #bbf7d0",
            padding: "9px 24px",
            display: "flex",
            alignItems: "center",
            gap: 8,
            fontSize: 13,
            fontWeight: 600,
            color: "#166534",
          }}
        >
          <CheckCircle2 size={16} color="#059669" />
          <span>{aiSuccessMsg}</span>
        </div>
      )}

      {/* ── 2-COLUMN STREAMLINED WORKSPACE (NO CONFUSING TABS) ── */}
      <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr 390px", overflow: "hidden" }}>
        {/* ── LEFT: ARTICLE READER (CLEAN, READABLE, ZERO-TAB STREAM) ── */}
        <main
          style={{
            borderRight: "1px solid #e2e8f0",
            background: "#ffffff",
            overflowY: "auto",
            padding: "32px 40px",
          }}
        >
          <div style={{ maxWidth: 760, margin: "0 auto" }}>
            {/* Meta Pill Badges & Citation Badge */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  padding: "3px 8px",
                  borderRadius: 6,
                  background: "#e0f2fe",
                  color: "#0369a1",
                }}
              >
                {journal.publication || "Jurnal Ilmiah"}
              </span>

              {journal.year && (
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    padding: "3px 8px",
                    borderRadius: 6,
                    background: "#f1f5f9",
                    color: "#475569",
                  }}
                >
                  Tahun {journal.year}
                </span>
              )}

              <CitationBadge doi={journal.doi} page={1} title={cleanTitle} />
            </div>

            {/* Main Article Title */}
            <h1
              style={{
                fontFamily: "var(--font-display)",
                fontSize: 22,
                fontWeight: 800,
                color: "#0f172a",
                lineHeight: 1.35,
                margin: "0 0 10px",
              }}
            >
              {cleanTitle}
            </h1>

            <div style={{ fontSize: 13, color: "#64748b", marginBottom: 24 }}>
              <strong>Penulis:</strong> {journal.authors || "Penulis Utama"}
            </div>

            {/* Abstract Section Card */}
            <div
              style={{
                background: "#f8fafc",
                border: "1px solid #e2e8f0",
                borderRadius: 14,
                padding: "20px 22px",
                marginBottom: 24,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
                <Quote size={15} color="#00C988" />
                <h3 style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", textTransform: "uppercase", letterSpacing: "0.05em", margin: 0 }}>
                  Abstrak Artikel
                </h3>
              </div>
              <p style={{ fontSize: 14, color: "#334155", lineHeight: 1.65, margin: 0 }}>
                {sanitizeAcademicText(journal.abstract) || "Abstrak artikel sedang diekstrak atau belum tersedia."}
              </p>
            </div>

            {/* AI Executive Summary Box */}
            {journal.keyFindings && (
              <div
                style={{
                  background: "linear-gradient(135deg, #ecfdf5 0%, #f0fdf4 100%)",
                  border: "1.5px solid #a7f3d0",
                  borderRadius: 14,
                  padding: "18px 22px",
                  marginBottom: 24,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 8 }}>
                  <Sparkles size={16} color="#059669" />
                  <h3 style={{ fontSize: 13, fontWeight: 700, color: "#065f46", margin: 0, textTransform: "uppercase" }}>
                    Intisari & Hasil Telaah AI (Groq)
                  </h3>
                </div>
                <div style={{ fontSize: 13.5, color: "#1e293b", lineHeight: 1.6, whiteSpace: "pre-line" }}>
                  {sanitizeAcademicText(journal.keyFindings)}
                </div>
              </div>
            )}

            {/* ── SUB-BAB & STRUKTUR DOKUMEN LENGKAP (MINERU / FULL EXTRACTION) ── */}
            {journal.rawExtraction?.sections && journal.rawExtraction.sections.length > 0 && (
              <div style={{ marginTop: 24, borderTop: "1px solid #f1f5f9", paddingTop: 20 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <BookOpen size={16} color="#00C988" />
                    <h3 style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", margin: 0, textTransform: "uppercase", letterSpacing: "0.03em" }}>
                      Struktur Sub-Bab & Konten Dokumen ({journal.rawExtraction.sections.length} Bagian)
                    </h3>
                  </div>
                  <span style={{ fontSize: 11.5, background: "#e6f9f2", color: "#059669", fontWeight: 600, padding: "2px 8px", borderRadius: 6 }}>
                    {journal.rawExtraction.method || "Tersimpan Lengkap di DB"}
                  </span>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {journal.rawExtraction.sections.map((sec: any, idx: number) => {
                    const cleanHeading = sanitizeAcademicText(sec.heading || sec.title || "Bagian");
                    const cleanContent = sanitizeAcademicText(sec.content || "");
                    const isTableSection = cleanContent.includes("[Tabel]") || cleanContent.includes("|---") || cleanContent.includes("<table>");
                    const isBibliography = /daftar\s*pustaka|references?|bibliograph/i.test(cleanHeading);

                    return (
                      <details
                        key={idx}
                        style={{
                          background: isTableSection ? "#f1fbf7" : isBibliography ? "#fafcff" : "#f8fafc",
                          border: isTableSection ? "1.5px solid #a7f3d0" : isBibliography ? "1px solid #bfdbfe" : "1px solid #e2e8f0",
                          borderRadius: 10,
                          padding: "12px 16px",
                        }}
                        open={idx === 0 || idx === 1}
                      >
                        <summary
                          style={{
                            fontWeight: 700,
                            fontSize: 13.5,
                            color: "#0f172a",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            userSelect: "none",
                          }}
                        >
                          <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            {isTableSection && <span style={{ fontSize: 11, background: "#059669", color: "#ffffff", padding: "1px 6px", borderRadius: 4, fontWeight: 600 }}>TABEL</span>}
                            {isBibliography && <span style={{ fontSize: 11, background: "#0284c7", color: "#ffffff", padding: "1px 6px", borderRadius: 4, fontWeight: 600 }}>REFERENSI</span>}
                            <span>{cleanHeading}</span>
                          </span>
                          <span style={{ fontSize: 11, color: "#64748b", fontWeight: 500, marginLeft: 8 }}>
                            Hal. {sec.page || 1}
                          </span>
                        </summary>
                        <div
                          style={{
                            marginTop: 10,
                            fontSize: 13,
                            lineHeight: 1.7,
                            color: "#334155",
                            borderTop: "1px dashed #cbd5e1",
                            paddingTop: 10,
                            fontFamily: isTableSection ? "monospace, var(--font-body)" : "inherit",
                          }}
                        >
                          {isBibliography ? (
                            /* Format Standar Daftar Pustaka (Hanging Indent) */
                            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                              {formatBibliographyEntries(cleanContent).map((entry, bIdx) => (
                                <div
                                  key={bIdx}
                                  style={{
                                    paddingLeft: 26,
                                    textIndent: -26,
                                    lineHeight: 1.65,
                                    fontSize: 12.5,
                                    color: "#334155",
                                    wordBreak: "break-word",
                                  }}
                                >
                                  {/* Linkify URLs/DOIs inside references */}
                                  {entry.split(/(https?:\/\/[^\s]+)/gi).map((part, pIdx) => {
                                    if (/^https?:\/\//i.test(part)) {
                                      return (
                                        <a
                                          key={pIdx}
                                          href={part}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          style={{
                                            color: "#0284c7",
                                            textDecoration: "underline",
                                            wordBreak: "break-all",
                                          }}
                                        >
                                          {part}
                                        </a>
                                      );
                                    }
                                    return <span key={pIdx}>{part}</span>;
                                  })}
                                </div>
                              ))}
                            </div>
                          ) : isTableSection ? (
                            /* Tabel Ekstraksi */
                            <div style={{ whiteSpace: "pre-wrap", overflowX: "auto" }}>
                              {cleanContent}
                            </div>
                          ) : (
                            /* Paragraf Mengalir Tanpa Enter Terpotong */
                            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                              {formatAcademicParagraphs(cleanContent).map((para, pIdx) => (
                                <p
                                  key={pIdx}
                                  style={{
                                    margin: 0,
                                    fontSize: 13,
                                    lineHeight: 1.75,
                                    color: "#334155",
                                    textAlign: "justify",
                                    wordBreak: "break-word",
                                  }}
                                >
                                  {para}
                                </p>
                              ))}
                            </div>
                          )}
                        </div>
                      </details>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Extracted Text Content Fallback */}
            {(!journal.rawExtraction?.sections || journal.rawExtraction.sections.length === 0) && journal.fullText && journal.fullText.length > 200 && (
              <div style={{ marginTop: 24, borderTop: "1px solid #f1f5f9", paddingTop: 20 }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: "#0f172a", marginBottom: 12 }}>
                  Isi Teks Ekstraksi
                </h3>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 12,
                    fontSize: 13.5,
                    lineHeight: 1.75,
                    color: "#334155",
                    fontFamily: "var(--font-body)",
                  }}
                >
                  {formatAcademicParagraphs(journal.fullText).map((para, pIdx) => (
                    <p
                      key={pIdx}
                      style={{
                        margin: 0,
                        textAlign: "justify",
                        wordBreak: "break-word",
                      }}
                    >
                      {para}
                    </p>
                  ))}
                </div>
              </div>
            )}
          </div>
        </main>

        {/* ── RIGHT: 1-CLICK AI SMART INSPECTOR & BUKTI VARIABEL ── */}
        <aside
          style={{
            background: "#fefefe",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: "16px 20px",
              borderBottom: "1px solid #e2e8f0",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              background: "#ffffff",
            }}
          >
            <div>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", margin: "0 0 2px" }}>
                Bukti Variabel Riset
              </h3>
              <span style={{ fontSize: 11.5, color: "#64748b" }}>
                Terhubung ke Kanvas Kerangka Berpikir
              </span>
            </div>

            <button
              onClick={() => setShowMapModal(true)}
              style={{
                background: "#f8fafc",
                border: "1px solid #e2e8f0",
                borderRadius: 6,
                padding: "4px 8px",
                fontSize: 11.5,
                fontWeight: 600,
                color: "#475569",
                cursor: "pointer",
              }}
            >
              + Manual
            </button>
          </div>

          {/* ── 1-CLICK AI TRIGGER BANNER (SUPER PROMINENT & EASY) ── */}
          <div style={{ padding: "14px 18px", background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
            <button
              onClick={handleRunAiCrossCheck}
              disabled={aiRunning}
              style={{
                width: "100%",
                padding: "10px 14px",
                borderRadius: 10,
                background: "linear-gradient(135deg, #00C988 0%, #059669 100%)",
                border: "none",
                color: "#ffffff",
                fontSize: 13,
                fontWeight: 700,
                cursor: aiRunning ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                boxShadow: "none",
              }}
            >
              {aiRunning ? (
                <>
                  <RefreshCw size={15} className="animate-spin" />
                  <span>Groq AI Sedang Menganalisis...</span>
                </>
              ) : (
                <>
                  <Wand2 size={15} />
                  <span>AI Otomatis Hubungkan ke Variabel</span>
                </>
              )}
            </button>

            {aiRunning ? (
              <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 6 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: "#065f46" }}>
                    Groq Llama 3.3 70B Turbo
                  </span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: "#0284c7" }}>
                    ⏱️ ~{aiEstimatedSec}s tersisa
                  </span>
                </div>
                <progress
                  value={aiProgress}
                  max={100}
                  style={{
                    width: "100%",
                    height: 8,
                    borderRadius: 4,
                    accentColor: "#00C988",
                  }}
                />
              </div>
            ) : (
              <span style={{ fontSize: 11, color: "#64748b", display: "block", textAlign: "center", marginTop: 6 }}>
                AI membaca abstrak & memetakan kutipan bukti secara otomatis
              </span>
            )}
          </div>

          {/* Mapped Nodes List (Evidence) */}
          <div style={{ flex: 1, overflowY: "auto", padding: "16px 18px", display: "flex", flexDirection: "column", gap: 10 }}>
            {(!journal.nodeMappings || journal.nodeMappings.length === 0) ? (
              <div
                style={{
                  padding: "36px 16px",
                  textAlign: "center",
                  background: "#ffffff",
                  border: "1px dashed #cbd5e1",
                  borderRadius: 12,
                  color: "#64748b",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                <Network size={24} color="#94a3b8" />
                <span style={{ fontSize: 12.5, lineHeight: 1.4 }}>
                  Belum ada variabel yang terhubung. Klik tombol hijau di atas untuk menghubungkan otomatis via AI.
                </span>
              </div>
            ) : (
              journal.nodeMappings.map((m) => (
                <div
                  key={m.id}
                  style={{
                    background: "#ffffff",
                    border: "1px solid #e2e8f0",
                    borderRadius: 12,
                    padding: "12px 14px",
                    display: "flex",
                    flexDirection: "column",
                    gap: 8,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <Network size={14} color="#00C988" />
                      <span style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>
                        {m.node?.label || "Variabel Framework"}
                      </span>
                    </div>

                    <button
                      onClick={() => handleRemoveMapping(m.id)}
                      title="Hapus bukti"
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        color: "#94a3b8",
                        padding: 2,
                      }}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                    <span
                      style={{
                        fontSize: 10.5,
                        fontWeight: 700,
                        padding: "2px 6px",
                        borderRadius: 4,
                        background:
                          m.evidenceType === "SUPPORTS"
                            ? "#dcfce7"
                            : m.evidenceType === "CONTRADICTS"
                              ? "#fee2e2"
                              : "#eff6ff",
                        color:
                          m.evidenceType === "SUPPORTS"
                            ? "#166534"
                            : m.evidenceType === "CONTRADICTS"
                              ? "#991b1b"
                              : "#1d4ed8",
                      }}
                    >
                      {m.evidenceType === "SUPPORTS"
                        ? "✓ MENDUKUNG HIPOTESIS"
                        : m.evidenceType === "CONTRADICTS"
                          ? "✗ KONTRADIKTIF"
                          : "• DISEBUTKAN"}
                    </span>

                    <CitationBadge
                      doi={m.sourceDoi || journal.doi}
                      page={m.sourcePage || (m as any).pageNumber || 1}
                      compact
                    />
                  </div>

                  {m.quote && (
                    <div
                      style={{
                        fontSize: 12,
                        color: "#334155",
                        background: "#f8fafc",
                        padding: "8px 10px",
                        borderRadius: 6,
                        borderLeft: "3px solid #00C988",
                        lineHeight: 1.45,
                        fontStyle: "italic",
                      }}
                    >
                      "{m.quote}"
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </aside>
      </div>

      {/* ── MODAL: VIEW FULL PDF DOCUMENT (CLEAN OVERLAY) ── */}
      {showPdfModal && pdfUrl && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 100,
            background: "rgba(15, 23, 42, 0.6)",
            display: "flex",
            flexDirection: "column",
            padding: "20px 30px",
          }}
          onClick={() => setShowPdfModal(false)}
        >
          <div
            style={{
              flex: 1,
              background: "#ffffff",
              borderRadius: 14,
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                height: 48,
                padding: "0 20px",
                borderBottom: "1px solid #e2e8f0",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                background: "#f8fafc",
              }}
            >
              <span style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>
                Dokumen PDF: {cleanTitle}
              </span>
              <button
                onClick={() => setShowPdfModal(false)}
                style={{
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  color: "#64748b",
                  padding: 4,
                }}
              >
                <X size={18} />
              </button>
            </div>
            <div style={{ flex: 1 }}>
              <iframe
                src={pdfUrl}
                style={{ width: "100%", height: "100%", border: "none" }}
                title="PDF Document Viewer"
              />
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: MANUAL EVIDENCE MAPPING ── */}
      {showMapModal && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 100,
            background: "rgba(15, 23, 42, 0.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
          }}
          onClick={() => setShowMapModal(false)}
        >
          <div
            style={{
              width: "100%",
              maxWidth: 480,
              background: "#ffffff",
              borderRadius: 14,
              border: "1px solid #e2e8f0",
              boxShadow: "none",
              padding: 24,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: "#0f172a", margin: 0 }}>
                Petakan Bukti Manual ke Variabel
              </h3>
              <button
                onClick={() => setShowMapModal(false)}
                style={{
                  background: "#f1f5f9",
                  border: "none",
                  width: 28,
                  height: 28,
                  borderRadius: 6,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <X size={14} />
              </button>
            </div>

            <form onSubmit={handleAddMapping} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: "#0f172a" }}>
                  Pilih Variabel Tujuan *
                </label>
                <select
                  value={selectedNodeId}
                  onChange={(e) => setSelectedNodeId(e.target.value)}
                  style={{
                    height: 38,
                    padding: "0 12px",
                    borderRadius: 8,
                    border: "1px solid #cbd5e1",
                    fontSize: 13,
                    color: "#0f172a",
                    outline: "none",
                    background: "#ffffff",
                  }}
                  required
                >
                  {frameworkNodes.length === 0 ? (
                    <option value="">Belum ada node di kanvas</option>
                  ) : (
                    frameworkNodes.map((n) => (
                      <option key={n.id} value={n.id}>
                        {n.label} ({n.type})
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: "#0f172a" }}>
                  Sifat Bukti Empiris
                </label>
                <select
                  value={evidenceType}
                  onChange={(e) => setEvidenceType(e.target.value as EvidenceType)}
                  style={{
                    height: 38,
                    padding: "0 12px",
                    borderRadius: 8,
                    border: "1px solid #cbd5e1",
                    fontSize: 13,
                    color: "#0f172a",
                    outline: "none",
                    background: "#ffffff",
                  }}
                >
                  <option value="SUPPORTS">Mendukung Hipotesis / Variabel (Positif)</option>
                  <option value="CONTRADICTS">Bertolak Belakang / Kontradiktif</option>
                  <option value="MENTIONS">Hanya Disebutkan / Menjadi Rujukan</option>
                </select>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: "#0f172a" }}>
                  Kutipan Kalimat Bukti (Opsional)
                </label>
                <textarea
                  rows={3}
                  placeholder="Salin kalimat bukti temuan dari artikel..."
                  value={quoteInput}
                  onChange={(e) => setQuoteInput(e.target.value)}
                  style={{
                    padding: "10px 12px",
                    borderRadius: 8,
                    border: "1px solid #cbd5e1",
                    fontSize: 13,
                    fontFamily: "var(--font-body)",
                    outline: "none",
                    resize: "vertical",
                    background: "#ffffff",
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: "#0f172a", display: "block", marginBottom: 4 }}>
                  Nomor Halaman Sumber (Wajib — Sesuai Blueprint §2.1) <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <Input
                  id="page-number-input"
                  type="number"
                  min={1}
                  placeholder="Contoh: 14"
                  value={pageNumberInput}
                  onChange={(e) => setPageNumberInput(e.target.value)}
                  required
                />
                <span style={{ fontSize: 11, color: "#64748b", marginTop: 2, display: "block" }}>
                  Setiap bukti klaim wajib merujuk nomor halaman spesifik pada PDF artikel.
                </span>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 4 }}>
                <Button variant="secondary" onClick={() => setShowMapModal(false)}>
                  Batal
                </Button>
                <Button type="submit" disabled={savingMapping || !pageNumberInput} variant="emerald">
                  {savingMapping ? "Menyimpan..." : "Hubungkan Bukti"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
