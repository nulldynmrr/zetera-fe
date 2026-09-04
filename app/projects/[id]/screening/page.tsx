"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  Upload,
  Globe,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Network,
  ArrowRight,
  RefreshCw,
  Trash2,
  FileText,
  Zap,
  Check,
  Layers,
  ExternalLink,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Cpu,
  Brain,
  Lightbulb,
} from "lucide-react";

import { Button } from "@/components/ui/Button";
import { ProjectSidebar } from "@/components/ui/ProjectSidebar";
import { PdfPreviewModal } from "@/components/ui/PdfPreviewModal";
import { useRequireAuth } from "@/lib/auth-context";
import {
  api,
  type ResearchProject,
  type Journal,
} from "@/lib/api-client";

const PSYCHOLOGY_TRIVIA = [
  "💡 Tahukah Anda? Artikel bereputasi baik umumnya memiliki 3-5 variabel terukur dan metode analisis spesifik.",
  "🔍 AI sedang membaca struktur Bab 1 s.d. Bab 4 untuk memetakan instrumen dan populasi penelitian.",
  "⚡ Mengurai korelasi antara Variabel Independen (X) dan Dependen (Y) dari paragraf temuan.",
  "📊 Mengidentifikasi Research Gap dan batasan empiris yang dapat dijawab oleh skripsi Anda.",
  "🚀 Zetera AI menggunakan Groq Llama 3.3 70B untuk mencocokkan artikel secara objektif dengan judul skripsi.",
];

export default function UnifiedScreeningPage() {
  const params = useParams();
  const projectId = params?.id as string;
  const router = useRouter();

  const { user, isLoading } = useRequireAuth();

  const [project, setProject] = useState<ResearchProject | null>(null);
  const [journals, setJournals] = useState<Journal[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedAiAnalysis, setExpandedAiAnalysis] = useState<Record<string, boolean>>({});
  const [previewJournal, setPreviewJournal] = useState<Journal | null>(null);

  // Uploading & Auto-Screening State
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [activeStep, setActiveStep] = useState<1 | 2 | 3>(1);
  const [triviaIndex, setTriviaIndex] = useState(0);

  // DOI Input State
  const [doiInput, setDoiInput] = useState("");
  const [doiLoading, setDoiLoading] = useState(false);
  const [doiError, setDoiError] = useState("");

  // Selected Journal IDs for Auto-Populating Canvas
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Auto-populating state
  const [populating, setPopulating] = useState(false);

  // Rotate trivia every 3.5 seconds when processing
  useEffect(() => {
    if (!isProcessing) return;
    const interval = setInterval(() => {
      setTriviaIndex((prev) => (prev + 1) % PSYCHOLOGY_TRIVIA.length);
    }, 3500);
    return () => clearInterval(interval);
  }, [isProcessing]);

  // Load project & journals
  const loadData = useCallback(async () => {
    if (!projectId) return;
    try {
      setLoading(true);
      const [projRes, journalsRes] = await Promise.all([
        api.projects.get(projectId),
        api.journals.list(projectId),
      ]);
      setProject(projRes.data);
      const jList = journalsRes.data || [];
      setJournals(jList);
      setSelectedIds(jList.filter((j) => j.status !== "REJECTED").map((j) => j.id));
    } catch (err) {
      console.error("Gagal memuat data project:", err);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    if (user && projectId) {
      loadData();
    }
  }, [user, projectId, loadData]);

  // ── AUTOMATED PIPELINE: BATCH UPLOAD + MINERU PARSING + AI SCREENING ──
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const remainingSlots = 10 - journals.length;
    if (remainingSlots <= 0) {
      alert("Maksimal 10 jurnal per project.");
      return;
    }

    const filesToUpload = Array.from(files).slice(0, remainingSlots);
    setIsProcessing(true);

    try {
      for (let i = 0; i < filesToUpload.length; i++) {
        const file = filesToUpload[i];
        const progressPrefix = `[${i + 1}/${filesToUpload.length}]`;

        // Step 1: Ekstraksi lokal PDF
        setActiveStep(1);
        setStatusMessage(`${progressPrefix} Mengekstrak PDF: ${file.name.slice(0, 30)}...`);
        const res = await api.journals.uploadPdf(projectId, file);
        const newJournal = res.data;
        setJournals((prev) => [newJournal, ...prev.filter((j) => j.id !== newJournal.id)]);

        // Step 2: Telaah Relevansi AI secara bertahap
        setActiveStep(3);
        setStatusMessage(`${progressPrefix} AI menelaah relevansi: "${newJournal.title?.slice(0, 30)}..."`);
        try {
          const screenRes = await api.journals.screenJournal(projectId, newJournal.id);
          setJournals((prev) =>
            prev.map((j) => (j.id === newJournal.id ? screenRes.data : j))
          );
          setExpandedAiAnalysis((prev) => ({ ...prev, [newJournal.id]: true }));
        } catch (screenErr) {
          console.warn("Screening otomatis gagal:", screenErr);
        }
      }

      // Refresh final list
      const updated = await api.journals.list(projectId);
      const updatedList = updated.data || [];
      setJournals(updatedList);
      setSelectedIds(
        updatedList
          .filter((j) => j.status === "APPROVED" || (j.relevanceScore && j.relevanceScore >= 60))
          .map((j) => j.id)
      );
    } catch (err: any) {
      alert(err.message || "Gagal memproses file PDF");
    } finally {
      setIsProcessing(false);
      setStatusMessage("");
      e.target.value = "";
    }
  };

  // Handle DOI Input with Auto-Screening
  const handleDoiLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!doiInput.trim()) return;

    if (journals.length >= 10) {
      alert("Maksimal 10 jurnal per project.");
      return;
    }

    try {
      setDoiLoading(true);
      setDoiError("");
      const res = await api.journals.lookupDoi(projectId, doiInput.trim());
      const metadata = res.data;

      // Create journal from DOI
      await api.journals.create(projectId, {
        title: metadata.title,
        authors: metadata.authors,
        year: metadata.year || undefined,
        publication: metadata.publication,
        doi: metadata.doi,
        url: metadata.url,
        abstract: metadata.abstract,
        sourceType: "DOI",
        status: "UNDER_REVIEW",
      });

      // Auto-screen
      await api.screening.evaluateBatch(projectId);

      const updated = await api.journals.list(projectId);
      setJournals(updated.data || []);
      setSelectedIds((updated.data || []).map((j) => j.id));
      setDoiInput("");
    } catch (err: any) {
      setDoiError(err.message || "DOI tidak ditemukan");
    } finally {
      setDoiLoading(false);
    }
  };

  // Toggle selection
  const toggleSelectJournal = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Delete journal
  const handleDelete = async (id: string) => {
    try {
      await api.journals.delete(projectId, id);
      setJournals((prev) => prev.filter((j) => j.id !== id));
      setSelectedIds((prev) => prev.filter((item) => item !== id));
    } catch (err: any) {
      alert(err.message || "Gagal menghapus jurnal");
    }
  };

  // ── 1-CLICK: GENERATE RESEARCH FRAMEWORK NODES & TRANSITION TO CANVAS ──
  const handleBuildFramework = async () => {
    try {
      setPopulating(true);
      await api.framework.generateFromJournals(projectId, { mode: "SYNTHESIS" });
      router.push(`/projects/${projectId}/framework`);
    } catch (err: any) {
      alert(err.message || "Gagal membangun kerangka riset otomatis");
      setPopulating(false);
    }
  };

  // Re-run Screening manually if needed
  const handleRescreen = async () => {
    try {
      setIsProcessing(true);
      setActiveStep(3);
      setStatusMessage("AI Groq sedang menelaah ulang abstrak dan temuan jurnal...");
      await api.screening.evaluateBatch(projectId);
      const updated = await api.journals.list(projectId);
      const updatedList = updated.data || [];
      setJournals(updatedList);
      const freshExpanded: Record<string, boolean> = {};
      updatedList.forEach((j) => {
        if (j.keyFindings) freshExpanded[j.id] = true;
      });
      setExpandedAiAnalysis(freshExpanded);
    } catch (err: any) {
      alert(err.message || "Gagal menelaah abstrak");
    } finally {
      setIsProcessing(false);
      setStatusMessage("");
    }
  };

  if (isLoading || loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#fefefe",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Sparkles size={24} color="#00C988" />
          <span style={{ fontSize: 15, fontWeight: 600, color: "#334155" }}>
            Menyiapkan Alur Seleksi Cepat Zetera AI...
          </span>
        </div>
      </div>
    );
  }

  const suitableCount = journals.filter((j) => (j.relevanceScore && j.relevanceScore >= 60) || j.status === "APPROVED").length;

  return (
    <div style={{ minHeight: "100vh", background: "#fefefe", display: "flex", flexDirection: "row" }}>
      <ProjectSidebar
        projectId={projectId}
        approvedJournalsCount={suitableCount}
        totalNodesCount={0}
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
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <h1
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: 16,
                    fontWeight: 700,
                    color: "#0f172a",
                    margin: 0,
                  }}
                >
                  {project?.title}
                </h1>
                {project?.field && (
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      color: "#0284c7",
                      background: "#e0f2fe",
                      padding: "2px 8px",
                      borderRadius: 6,
                    }}
                  >
                    {project.field}
                  </span>
                )}
              </div>
              <span style={{ fontSize: 12, color: "#64748b" }}>
                Alur Cepat: Upload Jurnal &rarr; Seleksi AI &rarr; Bangun Kerangka Otomatis
              </span>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12 }}>
            <span style={{ color: "#059669", fontWeight: 600 }}>1. Buat Judul &check;</span>
            <ChevronRight size={13} color="#cbd5e1" />
            <span style={{ color: "#00C988", fontWeight: 700, background: "#ecfdf5", padding: "4px 10px", borderRadius: 6 }}>
              2. Seleksi 5-10 Jurnal (Aktif)
            </span>
            <ChevronRight size={13} color="#cbd5e1" />
            <span style={{ color: "#94a3b8" }}>3. Kanvas Kerangka</span>
          </div>
        </header>

        {/* Main Screening Content */}
        <main
          style={{
            maxWidth: 1040,
            margin: "0 auto",
            padding: "28px 24px 80px",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            gap: 20,
          }}
        >
          {/* ── 1. UPLOAD BOX (MULTI-PDF & DOI) ── */}
          <div
            className="card-fluento"
            style={{
              background: "#ffffff",
              border: "1px solid #e2e8f0",
              borderRadius: 16,
              padding: "22px 26px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
              <div>
                <h2 style={{ fontSize: 15, fontWeight: 700, color: "#0f172a", margin: "0 0 4px" }}>
                  1. Masukkan File PDF Jurnal (Hingga 10 Paper)
                </h2>
                <p style={{ fontSize: 12.5, color: "#64748b", margin: 0 }}>
                  Unggah file PDF atau input DOI. Engine MinerU dan Groq AI akan mengekstrak sub-bab dan menelaah keselarasan secara otomatis.
                </p>
              </div>

              <span
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  padding: "4px 10px",
                  borderRadius: 9999,
                  background: "#f0fdf4",
                  border: "1px solid #bbf7d0",
                  color: "#166534",
                  flexShrink: 0,
                }}
              >
                {journals.length}/10 Paper
              </span>
            </div>

            {/* Upload Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 14 }}>
              {/* Multi-PDF Dropzone */}
              <label
                style={{
                  border: "2px dashed #00C988",
                  borderRadius: 12,
                  padding: "20px 18px",
                  textAlign: "center",
                  cursor: journals.length >= 10 || isProcessing ? "not-allowed" : "pointer",
                  background: "#f0fdf4",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                  transition: "all 0.15s ease",
                }}
              >
                {isProcessing ? (
                  <>
                    <RefreshCw size={24} className="animate-spin" color="#059669" />
                    <span style={{ fontSize: 13, fontWeight: 700, color: "#065f46" }}>
                      {statusMessage || "Mengekstrak dokumen..."}
                    </span>
                  </>
                ) : (
                  <>
                    <Upload size={22} color="#00C988" />
                    <span style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>
                      Tarik Sekaligus File PDF Jurnal ke Sini
                    </span>
                    <span style={{ fontSize: 11, color: "#64748b" }}>
                      Ekstraksi MinerU & evaluasi relevansi otomatis
                    </span>
                  </>
                )}
                <input
                  type="file"
                  multiple
                  accept=".pdf,application/pdf"
                  onChange={handleFileUpload}
                  disabled={journals.length >= 10 || isProcessing}
                  style={{ display: "none" }}
                />
              </label>
            </div>
          </div>

          {/* ── PSYCHOLOGICAL ENGAGING WAITING / EXTRACTION PROGRESS CARD ── */}
          {isProcessing && (
            <div
              className="card-fluento"
              style={{
                background: "linear-gradient(135deg, #ffffff 0%, #f0fdf4 100%)",
                border: "1.5px solid #86efac",
                borderRadius: 16,
                padding: "20px 24px",
                display: "flex",
                flexDirection: "column",
                gap: 14,
                boxShadow: "0 4px 20px -2px rgba(0, 201, 136, 0.12)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Cpu size={18} color="#059669" className="animate-spin" />
                  <span style={{ fontSize: 13.5, fontWeight: 700, color: "#065f46" }}>
                    {statusMessage || "Memproses Dokumen Ilmiah..."}
                  </span>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11.5, fontWeight: 700, color: "#0284c7", background: "#e0f2fe", padding: "3px 10px", borderRadius: 9999, border: "1px solid #bae6fd" }}>
                  <Brain size={13} />
                  <span>Groq Llama 3.3 70B Engine</span>
                </div>
              </div>

              {/* Multi-Stage Step Trackers */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
                <div style={{ padding: "8px 12px", borderRadius: 8, background: activeStep >= 1 ? "#ecfdf5" : "#f1f5f9", border: `1px solid ${activeStep >= 1 ? "#a7f3d0" : "#e2e8f0"}`, display: "flex", alignItems: "center", gap: 6 }}>
                  <CheckCircle2 size={14} color={activeStep >= 1 ? "#059669" : "#94a3b8"} />
                  <span style={{ fontSize: 11.5, fontWeight: 600, color: activeStep >= 1 ? "#065f46" : "#64748b" }}>1. Parsing Dokumen</span>
                </div>

                <div style={{ padding: "8px 12px", borderRadius: 8, background: activeStep >= 2 ? "#ecfdf5" : "#f1f5f9", border: `1px solid ${activeStep >= 2 ? "#a7f3d0" : "#e2e8f0"}`, display: "flex", alignItems: "center", gap: 6 }}>
                  <CheckCircle2 size={14} color={activeStep >= 2 ? "#059669" : "#94a3b8"} />
                  <span style={{ fontSize: 11.5, fontWeight: 600, color: activeStep >= 2 ? "#065f46" : "#64748b" }}>2. Ekstraksi Metodologi</span>
                </div>

                <div style={{ padding: "8px 12px", borderRadius: 8, background: activeStep >= 3 ? "#ecfdf5" : "#f1f5f9", border: `1px solid ${activeStep >= 3 ? "#a7f3d0" : "#e2e8f0"}`, display: "flex", alignItems: "center", gap: 6 }}>
                  <CheckCircle2 size={14} color={activeStep >= 3 ? "#059669" : "#94a3b8"} />
                  <span style={{ fontSize: 11.5, fontWeight: 600, color: activeStep >= 3 ? "#065f46" : "#64748b" }}>3. Evaluasi Relevansi AI</span>
                </div>
              </div>

              {/* Dynamic Rotating Trivia / Insight */}
              <div style={{ background: "#ffffff", padding: "10px 14px", borderRadius: 10, border: "1px solid #e2e8f0", display: "flex", alignItems: "center", gap: 8, minHeight: 44 }}>
                <Lightbulb size={16} color="#eab308" style={{ flexShrink: 0 }} />
                <span style={{ fontSize: 12.5, color: "#334155", fontStyle: "italic", transition: "all 0.3s ease" }}>
                  {PSYCHOLOGY_TRIVIA[triviaIndex]}
                </span>
              </div>
            </div>
          )}

          {/* ── 2. LIVE SCREENING RESULTS ── */}
          <div
            className="card-fluento"
            style={{
              background: "#ffffff",
              border: "1px solid #e2e8f0",
              borderRadius: 16,
              padding: "24px 26px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
              <div>
                <h2 style={{ fontSize: 15, fontWeight: 700, color: "#0f172a", margin: "0 0 2px" }}>
                  2. Hasil Seleksi Abstrak & Relevansi AI ({suitableCount} Paper Cocok)
                </h2>
                <span style={{ fontSize: 12, color: "#64748b" }}>
                  Paper dengan tanda centang hijau akan otomatis dijadikan sumber variabel di kanvas kerangka.
                </span>
              </div>

              {journals.length > 0 && (
                <button
                  onClick={handleRescreen}
                  disabled={isProcessing}
                  style={{
                    background: "transparent",
                    border: "1px solid #e2e8f0",
                    borderRadius: 8,
                    padding: "6px 12px",
                    fontSize: 12,
                    fontWeight: 600,
                    color: "#475569",
                    cursor: isProcessing ? "not-allowed" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 5,
                  }}
                >
                  <RefreshCw size={12} className={isProcessing ? "animate-spin" : ""} />
                  <span>Ulangi Seleksi AI</span>
                </button>
              )}
            </div>

            {journals.length === 0 ? (
              <div
                style={{
                  padding: "36px 20px",
                  textAlign: "center",
                  color: "#64748b",
                  border: "1px dashed #cbd5e1",
                  borderRadius: 12,
                }}
              >
                <BookOpen size={32} color="#cbd5e1" style={{ margin: "0 auto 8px" }} />
                <div style={{ fontSize: 14, fontWeight: 600, color: "#334155" }}>
                  Belum ada jurnal yang diunggah
                </div>
                <div style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>
                  Tarik 5 hingga 10 file PDF jurnal di atas untuk langsung disaring oleh AI Groq.
                </div>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {journals.map((journal) => {
                  const isApproved = journal.status === "APPROVED" || (journal.relevanceScore && journal.relevanceScore >= 60);
                  const isRejected = journal.status === "REJECTED" || (journal.relevanceScore && journal.relevanceScore < 40);
                  const isSelected = selectedIds.includes(journal.id);

                  return (
                    <div
                      key={journal.id}
                      style={{
                        padding: "16px 18px",
                        borderRadius: 12,
                        border: `1.5px solid ${isApproved ? "#86efac" : isRejected ? "#fca5a5" : "#e2e8f0"
                          }`,
                        background: isApproved ? "#f0fdf4" : isRejected ? "#fff1f2" : "#ffffff",
                        display: "flex",
                        flexDirection: "column",
                        gap: 8,
                        transition: "all 0.15s ease",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                        <div style={{ display: "flex", alignItems: "flex-start", gap: 10, flex: 1 }}>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelectJournal(journal.id)}
                            style={{
                              marginTop: 3,
                              accentColor: "#00C988",
                              width: 16,
                              height: 16,
                              cursor: "pointer",
                            }}
                          />

                          <div style={{ flex: 1 }}>
                            <Link
                              href={`/projects/${projectId}/journals/${journal.id}`}
                              style={{
                                fontSize: 14,
                                fontWeight: 700,
                                color: "#0f172a",
                                textDecoration: "none",
                                lineHeight: 1.4,
                                display: "block",
                              }}
                            >
                              {journal.title}
                            </Link>

                            <div style={{ fontSize: 11.5, color: "#64748b", marginTop: 4, display: "flex", flexWrap: "wrap", alignItems: "center", gap: 6 }}>
                              <span>{journal.authors || "Penulis"} &bull; {journal.publication || "Jurnal Ilmiah"} ({journal.year || "2024"})</span>
                              {journal.doi && (() => {
                                const cleanDoi = journal.doi.trim().replace(/^(https?:\/\/)?(dx\.)?doi\.org\//i, "").replace(/^doi:\s*/i, "");
                                const verifiedTargetUrl = (journal.url && journal.url.startsWith("http") && !journal.url.includes("/uploads/"))
                                  ? journal.url
                                  : `https://scholar.google.com/scholar?q=${encodeURIComponent(journal.title)}`;
                                return (
                                  <a
                                    href={verifiedTargetUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{
                                      color: "#0284c7",
                                      textDecoration: "none",
                                      display: "inline-flex",
                                      alignItems: "center",
                                      gap: 3,
                                      fontWeight: 500,
                                    }}
                                    onMouseEnter={(e) => {
                                      e.currentTarget.style.textDecoration = "underline";
                                    }}
                                    onMouseLeave={(e) => {
                                      e.currentTarget.style.textDecoration = "none";
                                    }}
                                    title={`Buka Publikasi Resmi Terverifikasi (${journal.title})`}
                                  >
                                    <span>DOI: {cleanDoi}</span>
                                    <ExternalLink size={10} />
                                  </a>
                                );
                              })()}
                            </div>
                          </div>
                        </div>

                        <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                          {/* PDF Preview Button */}
                          <button
                            type="button"
                            onClick={() => setPreviewJournal(journal)}
                            style={{
                              background: "#f1f5f9",
                              border: "1px solid #cbd5e1",
                              color: "#334155",
                              borderRadius: 6,
                              padding: "4px 8px",
                              fontSize: 11.5,
                              fontWeight: 600,
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              gap: 4,
                            }}
                          >
                            <FileText size={12} />
                            Lihat PDF
                          </button>

                          {/* Tier Selector Dropdown */}
                          <select
                            value={journal.tier || "SUPPORTING"}
                            onChange={async (e) => {
                              const newTier = e.target.value as any;
                              try {
                                const res = await api.journals.updateTier(projectId, journal.id, newTier);
                                if (res.success) {
                                  setJournals((prev) =>
                                    prev.map((j) => (j.id === journal.id ? { ...j, tier: newTier } : j))
                                  );
                                }
                              } catch (err: any) {
                                alert(err.message || "Gagal mengubah tier");
                              }
                            }}
                            style={{
                              fontSize: 11,
                              fontWeight: 700,
                              padding: "3px 6px",
                              borderRadius: 6,
                              background:
                                journal.tier === "PRIMARY"
                                  ? "#e0f2fe"
                                  : journal.tier === "EXCLUDED"
                                  ? "#fee2e2"
                                  : "#f0fdf4",
                              color:
                                journal.tier === "PRIMARY"
                                  ? "#0369a1"
                                  : journal.tier === "EXCLUDED"
                                  ? "#b91c1c"
                                  : "#15803d",
                              border: "1px solid #cbd5e1",
                              cursor: "pointer",
                            }}
                          >
                            <option value="PRIMARY">PRIMARY REF</option>
                            <option value="SUPPORTING">SUPPORTING</option>
                            <option value="EXCLUDED">EXCLUDED</option>
                          </select>

                          {/* Verify DOI button if not yet verified */}
                          {!journal.verifiedAt && journal.doi && (
                            <button
                              type="button"
                              onClick={async () => {
                                try {
                                  const res = await api.journals.verifyDoi(projectId, journal.id);
                                  if (res.success) {
                                    setJournals((prev) =>
                                      prev.map((j) => (j.id === journal.id ? { ...j, verifiedAt: new Date().toISOString() } : j))
                                    );
                                    alert("DOI berhasil diverifikasi!");
                                  }
                                } catch (err: any) {
                                  alert(err.message || "Verifikasi DOI gagal");
                                }
                              }}
                              style={{
                                background: "#faf5ff",
                                border: "1px solid #ddd6fe",
                                color: "#7c3aed",
                                borderRadius: 6,
                                padding: "4px 8px",
                                fontSize: 11,
                                fontWeight: 600,
                                cursor: "pointer",
                              }}
                            >
                              Verifikasi DOI
                            </button>
                          )}

                          {/* Relevance Score Badge */}
                          <span
                            style={{
                              fontSize: 11.5,
                              fontWeight: 700,
                              padding: "3px 8px",
                              borderRadius: 6,
                              background: isApproved ? "#dcfce7" : isRejected ? "#fee2e2" : "#f1f5f9",
                              color: isApproved ? "#15803d" : isRejected ? "#b91c1c" : "#475569",
                              border: `1px solid ${isApproved ? "#bbf7d0" : isRejected ? "#fecdd3" : "#cbd5e1"}`,
                              display: "flex",
                              alignItems: "center",
                              gap: 4,
                            }}
                          >
                            {isApproved ? <Check size={12} /> : isRejected ? <XCircle size={12} /> : null}
                            <span>{journal.relevanceScore || 70}% Cocok</span>
                          </span>

                          <button
                            onClick={() => handleDelete(journal.id)}
                            style={{
                              background: "none",
                              border: "none",
                              color: "#94a3b8",
                              cursor: "pointer",
                              padding: 4,
                            }}
                            title="Hapus Jurnal"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>

                      {journal.keyFindings && (() => {
                        const isOpen = !!expandedAiAnalysis[journal.id];
                        return (
                          <div
                            style={{
                              borderRadius: 8,
                              background: isApproved ? "#f0fdf4" : "#fef2f2",
                              border: `1px solid ${isApproved ? "#dcfce7" : "#fee2e2"}`,
                              overflow: "hidden",
                              transition: "all 0.15s ease",
                            }}
                          >
                            <button
                              type="button"
                              onClick={() =>
                                setExpandedAiAnalysis((prev) => ({
                                  ...prev,
                                  [journal.id]: !isOpen,
                                }))
                              }
                              style={{
                                width: "100%",
                                padding: "7px 12px",
                                background: "transparent",
                                border: "none",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                cursor: "pointer",
                                textAlign: "left",
                              }}
                            >
                              <div
                                style={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: 5,
                                  fontSize: 11.5,
                                  fontWeight: 700,
                                  color: isApproved ? "#047857" : "#b91c1c",
                                }}
                              >
                                <Sparkles size={13} color={isApproved ? "#059669" : "#dc2626"} />
                                <span>Analisis & Relevansi AI</span>
                              </div>

                              <div
                                style={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: 3,
                                  fontSize: 10.5,
                                  fontWeight: 600,
                                  color: isApproved ? "#059669" : "#dc2626",
                                }}
                              >
                                <span>{isOpen ? "Tutup" : "Lihat Detail"}</span>
                                {isOpen ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                              </div>
                            </button>

                            {isOpen && (
                              <div
                                style={{
                                  padding: "0 12px 10px 12px",
                                  borderTop: isApproved ? "1px dashed #bbf7d0" : "1px dashed #fca5a5",
                                  marginTop: 2,
                                  paddingTop: 6,
                                }}
                              >
                                <p
                                  style={{
                                    margin: 0,
                                    fontSize: 12,
                                    color: isApproved ? "#14532d" : "#7f1d1d",
                                    lineHeight: 1.55,
                                    wordBreak: "break-word",
                                  }}
                                >
                                  {journal.keyFindings}
                                </p>
                              </div>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ── 3. BOTTOM ACTION BAR: 1-CLICK GENERATE FRAMEWORK CANVAS ── */}
          {suitableCount > 0 && (
            <div
              style={{
                background: "#0f172a",
                borderRadius: 16,
                padding: "20px 28px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                color: "#ffffff",
                boxShadow: "0 10px 25px -5px rgba(15, 23, 42, 0.2)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    background: "rgba(0, 201, 136, 0.15)",
                    border: "1px solid rgba(0, 201, 136, 0.3)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#00C988",
                  }}
                >
                  <Network size={22} />
                </div>
                <div>
                  <h3 style={{ fontSize: 15, fontWeight: 700, margin: "0 0 2px" }}>
                    3. Bangun Kerangka Riset Otomatis ({suitableCount} Jurnal Terpilih)
                  </h3>
                  <p style={{ fontSize: 12, color: "#94a3b8", margin: 0 }}>
                    AI akan menyintesis Variabel X, Y, Metode, dan Research Gap ke dalam Kanvas Kerangka Berpikir lengkap dengan garis relasinya.
                  </p>
                </div>
              </div>

              <Button
                variant="emerald"
                size="md"
                disabled={populating}
                onClick={handleBuildFramework}
                icon={populating ? <RefreshCw size={16} className="animate-spin" /> : <Network size={16} />}
              >
                {populating ? "Menyintesis Kerangka AI..." : "Bangun Kerangka Riset &rarr;"}
              </Button>
            </div>
          )}
        </main>
      </div>

      <PdfPreviewModal
        isOpen={!!previewJournal}
        onClose={() => setPreviewJournal(null)}
        title={previewJournal?.title || ""}
        pdfUrl={
          previewJournal
            ? (previewJournal.filePath || previewJournal.openAccessPdfUrl || previewJournal.pdfStoragePath
                ? api.journals.getPdfProxyUrl(projectId, previewJournal.id)
                : null)
            : null
        }
        doi={previewJournal?.doi}
        authors={previewJournal?.authors}
        year={previewJournal?.year}
        abstract={previewJournal?.abstract}
      />
    </div>
  );
}
