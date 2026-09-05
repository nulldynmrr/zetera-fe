"use client";

import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  Plus,
  Search,
  Upload,
  Globe,
  FileText,
  Trash2,
  ExternalLink,
  CheckCircle2,
  Clock,
  Layers,
  Sparkles,
  Network,
  X,
  Filter,
  Eye,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Telescope,
  Download,
  Zap,
  Star,
  RefreshCw,
  ArrowRight,
  Quote,
  Copy,
  Check,
} from "lucide-react";

import { Button } from "@/components/ui/Button";
import { ProjectSidebar } from "@/components/ui/ProjectSidebar";
import { Input } from "@/components/ui/Input";
import { notify } from "@/lib/notification";
import { useRequireAuth } from "@/lib/auth-context";
import {
  api,
  type ResearchProject,
  type Journal,
  type JournalStatus,
  type JournalSourceType,
  type NormalizedPaper,
  type JournalCitationEvidence,
} from "@/lib/api-client";

export default function JournalsPage() {
  const params = useParams();
  const projectId = params?.id as string;

  const { user, isLoading } = useRequireAuth();

  const [project, setProject] = useState<ResearchProject | null>(null);
  const [journals, setJournals] = useState<Journal[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [activeVariableFilter, setActiveVariableFilter] = useState<string | null>(null);

  // AI Screening & Cross-check progress states
  const [aiProcessing, setAiProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [estimatedSeconds, setEstimatedSeconds] = useState(0);
  const [statusMessage, setStatusMessage] = useState("");
  const [crossCheckingId, setCrossCheckingId] = useState<string | null>(null);

  // Upload PDF state
  const [uploadingPdf, setUploadingPdf] = useState(false);

  // DOI Lookup modal state
  const [showDoiModal, setShowDoiModal] = useState(false);
  const [doiInput, setDoiInput] = useState("");
  const [doiLoading, setDoiLoading] = useState(false);
  const [doiError, setDoiError] = useState("");

  // Manual Entry modal state
  const [showManualModal, setShowManualModal] = useState(false);
  const [manualTitle, setManualTitle] = useState("");
  const [manualAuthors, setManualAuthors] = useState("");
  const [manualYear, setManualYear] = useState("");
  const [manualPublication, setManualPublication] = useState("");
  const [manualDoi, setManualDoi] = useState("");
  const [manualAbstract, setManualAbstract] = useState("");
  const [savingManual, setSavingManual] = useState(false);

  // Auto-check state (silent cross-check triggered post upload)
  const [autoCheckingId, setAutoCheckingId] = useState<string | null>(null);
  const [expandedNodeJournals, setExpandedNodeJournals] = useState<Record<string, boolean>>({});
  const [expandedAiAnalysis, setExpandedAiAnalysis] = useState<Record<string, boolean>>({});

  // ── Journal Discovery & View Mode (Fase 3) ──
  const [viewMode, setViewMode] = useState<"DISCOVERY" | "WORKSPACE">("DISCOVERY");
  const [discoveryTab, setDiscoveryTab] = useState<"SEARCH" | "UPLOAD" | "DOI">("SEARCH");
  const [hasAutoSearched, setHasAutoSearched] = useState(false);
  const [showDiscovery, setShowDiscovery] = useState(false);
  const [discoveryQuery, setDiscoveryQuery] = useState("");
  const [discoveryDomain, setDiscoveryDomain] = useState<"GENERAL" | "HEALTH" | "AI_CS">("GENERAL");
  const [discoveryLoading, setDiscoveryLoading] = useState(false);
  const [discoveryResults, setDiscoveryResults] = useState<NormalizedPaper[]>([]);
  const [discoveryMeta, setDiscoveryMeta] = useState<{ searchId: string; tookMs: number; expandedQuery: string; domainHint: string } | null>(null);
  const [importingId, setImportingId] = useState<string | null>(null);
  const [importedIds, setImportedIds] = useState<Set<string>>(new Set());
  const [pendingImports, setPendingImports] = useState<Set<string>>(new Set());
  const [selectedCandidateKeys, setSelectedCandidateKeys] = useState<Set<string>>(new Set());

  // Split-screen Preview (Unified for direct PDF & Academic Abstract Reader)
  interface ActivePreviewState {
    title: string;
    authors?: string | null;
    year?: number | string | null;
    publication?: string | null;
    abstract?: string | null;
    url?: string | null;
    doi?: string | null;
    provider?: string | null;
    pdfUrl?: string | null;
    uniqueKey?: string;
    isCandidate?: boolean;
    rawCandidate?: NormalizedPaper;
    viewMode?: "PDF" | "ABSTRACT";
  }
  const [activePreview, setActivePreview] = useState<ActivePreviewState | null>(null);

  // Helper cerdas untuk mendeteksi berkas PDF langsung (bukan web landing page / html)
  const getDirectPdfUrl = (paperOrJournal: {
    openAccessPdfUrl?: string | null;
    url?: string | null;
    filePath?: string | null;
    pdfStoragePath?: string | null;
  } | null | undefined): string | null => {
    if (!paperOrJournal) return null;

    // 1. Berkas upload lokal di backend Zetera
    const rawPath = paperOrJournal.filePath || paperOrJournal.pdfStoragePath || (paperOrJournal as any).pdfPath;
    if (rawPath) {
      if (typeof rawPath === "string" && rawPath.startsWith("http")) return rawPath;
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      return `${baseUrl}${rawPath.startsWith("/") ? "" : "/"}${rawPath.replace(/^\//, "")}`;
    }

    // 2. OpenAccess PDF URL eksplisit (hindari URL yang jelas-jelas laman web HTML)
    const oa = paperOrJournal.openAccessPdfUrl;
    if (oa && typeof oa === "string" && oa.trim()) {
      const lowerOa = oa.toLowerCase();
      if (!lowerOa.includes("theconversation.com")) {
        if (
          lowerOa.endsWith(".pdf") ||
          lowerOa.includes(".pdf?") ||
          lowerOa.includes("/pdf/") ||
          lowerOa.includes("arxiv.org") ||
          lowerOa.includes("core.ac.uk") ||
          lowerOa.includes("ncbi.nlm.nih.gov/pmc")
        ) {
          return oa.trim();
        }
      }
    }

    // 3. Periksa apakah URL publikasi merupakan berkas PDF langsung
    const url = paperOrJournal.url;
    if (url && typeof url === "string") {
      const lowerUrl = url.toLowerCase();
      if (
        lowerUrl.endsWith(".pdf") ||
        lowerUrl.includes(".pdf?") ||
        lowerUrl.includes("/pdf/") ||
        lowerUrl.includes("core.ac.uk/download/pdf/") ||
        (lowerUrl.includes("ncbi.nlm.nih.gov/pmc/articles/pmc") && lowerUrl.includes("/pdf"))
      ) {
        return url.trim();
      }
      // Khusus ArXiv: convert /abs/ ke direct /pdf/
      if (url.includes("arxiv.org/abs/")) {
        const arxivId = url.split("arxiv.org/abs/")[1]?.split(/[?#]/)[0];
        if (arxivId) return `https://arxiv.org/pdf/${arxivId}.pdf`;
      }
    }

    return null;
  };

  const getJournalPdfUrl = (j: Journal) => {
    return getDirectPdfUrl(j);
  };

  // Backward compatibility alias for any lingering references
  const activePdfUrl = activePreview?.pdfUrl || null;
  const activePdfTitle = activePreview?.title || null;
  const setActivePdfUrl = (url: string | null) => {
    if (!url) setActivePreview(null);
    else setActivePreview((prev) => prev ? { ...prev, pdfUrl: url, viewMode: "PDF" } : { title: "Pratinjau PDF", pdfUrl: url, viewMode: "PDF" });
  };
  const setActivePdfTitle = (title: string | null) => {
    if (title) setActivePreview((prev) => prev ? { ...prev, title } : null);
  };

  const getEmbeddablePdfUrl = (url: string | null) => {
    if (!url) return "";
    if (url.startsWith("blob:") || url.startsWith("data:")) return url;

    // Upload lokal: gunakan langsung URL backend
    if (url.includes("/uploads/")) {
      if (url.startsWith("http")) return url;
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      return `${baseUrl}${url.startsWith("/") ? "" : "/"}${url.replace(/^\//, "")}`;
    }

    // Dokumen PDF publik: gunakan Google Docs Viewer
    return `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`;
  };

  // ── Verified Citation Evidences State & Handlers (Strict Provenance) ──
  const [journalCitations, setJournalCitations] = useState<Record<string, JournalCitationEvidence[]>>({});
  const [extractingCitationsId, setExtractingCitationsId] = useState<string | null>(null);
  const [expandedCitations, setExpandedCitations] = useState<Record<string, boolean>>({});
  const [copiedCitationId, setCopiedCitationId] = useState<string | null>(null);

  const handleExtractCitations = async (journalId: string) => {
    if (!projectId) return;
    try {
      setExtractingCitationsId(journalId);
      const res = await api.journals.extractCitations(projectId, journalId);
      setJournalCitations((prev) => ({ ...prev, [journalId]: res.data }));
    } catch (err: any) {
      console.warn("Gagal mengekstrak kutipan dari jurnal:", err.message);
    } finally {
      setExtractingCitationsId(null);
    }
  };

  const handleToggleCitations = async (journalId: string) => {
    const isCurrentlyOpen = !!expandedCitations[journalId];
    if (isCurrentlyOpen) {
      setExpandedCitations((prev) => ({ ...prev, [journalId]: false }));
      return;
    }

    setExpandedCitations((prev) => ({ ...prev, [journalId]: true }));
    if (!journalCitations[journalId] && projectId) {
      try {
        const res = await api.journals.getCitations(projectId, journalId);
        setJournalCitations((prev) => ({ ...prev, [journalId]: res.data }));
      } catch (err) {
        console.warn("Gagal memuat kutipan jurnal:", err);
      }
    }
  };

  const handleCopyQuote = (citId: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCitationId(citId);
    setTimeout(() => setCopiedCitationId(null), 2500);
  };

  // ── Auto-Extract Citations in Background for Approved/Under Review Journals ──
  const autoExtractQueueRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!projectId || journals.length === 0) return;

    const targetJournals = journals.filter(
      (j) => (j.status === "APPROVED" || j.status === "UNDER_REVIEW") && !j.id.startsWith("temp-")
    );

    targetJournals.forEach(async (j) => {
      // If already fetched or currently queued
      if (journalCitations[j.id] !== undefined || autoExtractQueueRef.current.has(j.id)) {
        return;
      }

      autoExtractQueueRef.current.add(j.id);

      try {
        // 1. Cek apakah di database sudah ada kutipannya
        const res = await api.journals.getCitations(projectId, j.id);
        if (res.data && res.data.length > 0) {
          setJournalCitations((prev) => ({ ...prev, [j.id]: res.data }));
          return;
        }

        // 2. Jika belum ada, otomatis ekstrak di latar belakang
        setExtractingCitationsId(j.id);
        const extractRes = await api.journals.extractCitations(projectId, j.id);
        setJournalCitations((prev) => ({ ...prev, [j.id]: extractRes.data }));
      } catch (err) {
        console.warn(`[AutoExtract] Gagal ekstrak kutipan untuk jurnal ${j.id}:`, err);
        setJournalCitations((prev) => ({ ...prev, [j.id]: [] }));
      } finally {
        setExtractingCitationsId((curr) => (curr === j.id ? null : curr));
      }
    });
  }, [projectId, journals, journalCitations]);

  const renderCitationBank = (journal: Journal) => {
    const citations = journalCitations[journal.id];
    const isExtracting = extractingCitationsId === journal.id;
    const isOpen = !!expandedCitations[journal.id];
    const pdfUrl = getJournalPdfUrl(journal);

    return (
      <div
        style={{
          marginTop: 8,
          borderRadius: 8,
          border: "1px solid #f1f5f9",
          background: "#fafafa",
          overflow: "hidden",
          textAlign: "left",
        }}
      >
        {/* Header Bar (Clickable, no extra buttons needed) */}
        <div
          onClick={() => handleToggleCitations(journal.id)}
          style={{
            padding: "8px 12px",
            background: "#ffffff",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 10,
            cursor: "pointer",
            borderBottom: isOpen ? "1px solid #f1f5f9" : "none",
            userSelect: "none",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 6, minWidth: 0 }}>
            <Quote size={13} color="#6366f1" />
            <span style={{ fontSize: 11.5, fontWeight: 600, color: "#1e293b" }}>
              Bank Kutipan Terverifikasi
            </span>

            {/* Bulatan Loader / Progress Indicator atau Status Badge */}
            {isExtracting ? (
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 5,
                  padding: "2px 8px",
                  borderRadius: 999,
                  background: "#eef2ff",
                  color: "#4f46e5",
                  fontSize: 10.5,
                  fontWeight: 600,
                }}
              >
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    border: "1.5px solid #6366f1",
                    borderTopColor: "transparent",
                    display: "inline-block",
                    animation: "spin 0.8s linear infinite",
                  }}
                />
                <span>Mengekstrak AI...</span>
              </span>
            ) : citations && citations.length > 0 ? (
              <span
                style={{
                  padding: "1px 7px",
                  borderRadius: 999,
                  background: "#ecfdf5",
                  color: "#065f46",
                  fontSize: 10.5,
                  fontWeight: 600,
                }}
              >
                ✓ {citations.length} Kutipan
              </span>
            ) : (
              <span
                style={{
                  padding: "1px 7px",
                  borderRadius: 999,
                  background: "#f1f5f9",
                  color: "#64748b",
                  fontSize: 10.5,
                  fontWeight: 500,
                }}
              >
                Memuat...
              </span>
            )}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 4, color: "#64748b", fontSize: 11, fontWeight: 500 }}>
            <span>{isOpen ? "Tutup" : "Lihat Detail"}</span>
            {isOpen ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          </div>
        </div>

        {/* Content Body */}
        {isOpen && (
          <div style={{ padding: "10px", display: "flex", flexDirection: "column", gap: 8 }}>
            {isExtracting ? (
              <div
                style={{
                  padding: "16px 0",
                  textAlign: "center",
                  color: "#6366f1",
                  fontSize: 12,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                }}
              >
                <RefreshCw size={14} className="animate-spin" />
                <span>Mengekstrak naskah PDF per halaman dan memparafrase kutipan...</span>
              </div>
            ) : !citations || citations.length === 0 ? (
              <div
                style={{
                  padding: "14px",
                  textAlign: "center",
                  color: "#64748b",
                  fontSize: 11.5,
                  background: "#ffffff",
                  borderRadius: 6,
                  border: "1px dashed #e2e8f0",
                }}
              >
                Belum ada kutipan terverifikasi. Sistem akan mengekstrak otomatis saat naskah PDF tersedia.
              </div>
            ) : (
              citations.map((cit, cIdx) => (
                <div
                  key={cit.id || cIdx}
                  style={{
                    background: "#ffffff",
                    borderRadius: 6,
                    border: "1px solid #f1f5f9",
                    padding: "10px 12px",
                    display: "flex",
                    flexDirection: "column",
                    gap: 6,
                  }}
                >
                  {/* Row 1: Badges & Open in PDF */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 6 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                      <span
                        style={{
                          padding: "1px 6px",
                          borderRadius: 4,
                          background: "#ecfdf5",
                          color: "#065f46",
                          fontSize: 10.5,
                          fontWeight: 600,
                        }}
                      >
                        📍 Hal. {cit.pageNumber}
                      </span>
                      <span
                        style={{
                          padding: "1px 6px",
                          borderRadius: 4,
                          background: "#f1f5f9",
                          color: "#475569",
                          fontSize: 10.5,
                          fontWeight: 500,
                        }}
                      >
                        {cit.citationCategory}
                      </span>
                      {cit.sectionHeading && (
                        <span style={{ fontSize: 10.5, color: "#94a3b8", fontStyle: "italic" }}>
                          ({cit.sectionHeading})
                        </span>
                      )}
                    </div>

                    {pdfUrl && (
                      <button
                        type="button"
                        onClick={() => {
                          const targetPageUrl = pdfUrl.includes("#")
                            ? pdfUrl.replace(/#page=\d+/, `#page=${cit.pageNumber}`)
                            : `${pdfUrl}#page=${cit.pageNumber}`;
                          setActivePdfUrl(targetPageUrl);
                          setActivePdfTitle(`${journal.title} (Hal. ${cit.pageNumber})`);
                        }}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 4,
                          padding: "2px 7px",
                          borderRadius: 4,
                          background: "#f8fafc",
                          border: "none",
                          color: "#059669",
                          fontSize: 10.5,
                          fontWeight: 600,
                          cursor: "pointer",
                        }}
                        title={`Buka Split View dan tuju halaman ${cit.pageNumber}`}
                      >
                        <Eye size={11} />
                        <span>Buka Hal. {cit.pageNumber} di PDF</span>
                      </button>
                    )}
                  </div>

                  {/* Row 2: Kutipan Asli (Verbatim) */}
                  <div
                    style={{
                      background: "#f8fafc",
                      borderLeft: "3px solid #059669",
                      padding: "6px 10px",
                      borderRadius: "0 6px 6px 0",
                      fontSize: 11.5,
                      color: "#334155",
                      lineHeight: 1.5,
                    }}
                  >
                    <div style={{ fontSize: 10, fontWeight: 700, color: "#059669", textTransform: "uppercase", marginBottom: 2 }}>
                      Kutipan Asli (Kata demi Kata):
                    </div>
                    "{cit.verbatimQuote}"
                  </div>

                  {/* Row 3: Kutipan Parafrase */}
                  <div
                    style={{
                      background: "#fdf4ff",
                      borderLeft: "3px solid #a855f7",
                      padding: "6px 10px",
                      borderRadius: "0 6px 6px 0",
                      fontSize: 11.5,
                      color: "#581c87",
                      lineHeight: 1.5,
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 2 }}>
                      <span style={{ fontSize: 10, fontWeight: 700, color: "#9333ea", textTransform: "uppercase" }}>
                        Kutipan Parafrase (Gaya Akademis Baku):
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopyQuote(cit.id, cit.paraphrasedQuote)}
                        style={{
                          background: "transparent",
                          border: "none",
                          cursor: "pointer",
                          color: copiedCitationId === cit.id ? "#059669" : "#9333ea",
                          fontSize: 10.5,
                          fontWeight: 600,
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 3,
                          padding: "1px 4px",
                        }}
                        title="Salin kutipan parafrase ke clipboard"
                      >
                        {copiedCitationId === cit.id ? <Check size={11} /> : <Copy size={11} />}
                        <span>{copiedCitationId === cit.id ? "Tersalin!" : "Salin"}</span>
                      </button>
                    </div>
                    {cit.paraphrasedQuote}
                  </div>

                  {/* Row 4: Relevansi Topik & Metadata Publikasi */}
                  <div
                    style={{
                      fontSize: 11,
                      color: "#64748b",
                      display: "flex",
                      flexWrap: "wrap",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 6,
                      paddingTop: 4,
                      borderTop: "1px dashed #e2e8f0",
                    }}
                  >
                    <div>
                      <strong style={{ color: "#475569" }}>Relevansi:</strong> {cit.topicRelevance}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      {cit.journalName && <span>{cit.journalName}</span>}
                      {cit.doi && (
                        <a
                          href={`https://doi.org/${cit.doi.replace(/^(https?:\/\/)?(dx\.)?doi\.org\//i, "").replace(/^doi:\s*/i, "")}`}
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            color: "#2563eb",
                            textDecoration: "none",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 2,
                          }}
                        >
                          <span>DOI: {cit.doi}</span>
                          <ExternalLink size={10} />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    );
  };

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
      setJournals(journalsRes.data || []);
    } catch (err) {
      console.error("Gagal memuat data jurnal:", err);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    if (user && projectId) {
      loadData();
    }
  }, [user, projectId, loadData]);

  // Computed metrics
  const stats = useMemo(() => {
    const total = journals.length;
    const underReview = journals.filter((j) => j.status === "UNDER_REVIEW").length;
    const approved = journals.filter((j) => j.status === "APPROVED").length;
    const rejected = journals.filter((j) => j.status === "REJECTED").length;
    const totalMappings = journals.reduce((acc, curr) => acc + (curr.nodeMappings?.length || 0), 0);
    return { total, underReview, approved, rejected, totalMappings };
  }, [journals]);

  // ── RUN BATCH AI FAST SCREENING WITH REAL-TIME PROGRESS & ESTIMATION ──
  const handleBatchScreening = async () => {
    if (!projectId || journals.length === 0) {
      notify.warning("Unggah jurnal terlebih dahulu sebelum melakukan telaah AI.");
      return;
    }

    try {
      setAiProcessing(true);
      setProcessingProgress(15);
      const initialEstimate = Math.max(5, journals.length * 4);
      setEstimatedSeconds(initialEstimate);
      setStatusMessage(`Menghubungkan ke Groq AI (Llama 3.3 70B)... [Total: ${journals.length} Jurnal]`);

      // Progress interval simulation for smooth UX
      const progressTimer = setInterval(() => {
        setProcessingProgress((prev) => (prev < 85 ? prev + 12 : prev));
        setEstimatedSeconds((prev) => (prev > 1 ? prev - 1 : 1));
      }, 1000);

      setStatusMessage("Groq AI sedang membaca abstrak, mendeteksi disiplin ilmu & memverifikasi relevansi...");
      await api.screening.evaluateBatch(projectId);

      clearInterval(progressTimer);
      setProcessingProgress(100);
      setEstimatedSeconds(0);
      setStatusMessage("✓ Telaah selesai! Hasil verifikasi relevansi telah diperbarui.");

      // Refresh list
      const updated = await api.journals.list(projectId);
      const updatedList = updated.data || [];
      setJournals(updatedList);

      // Auto-expand AI analysis for freshly screened journals
      const freshExpanded: Record<string, boolean> = {};
      updatedList.forEach((j) => {
        if (j.keyFindings) freshExpanded[j.id] = true;
      });
      setExpandedAiAnalysis(freshExpanded);

      setTimeout(() => {
        setAiProcessing(false);
        setStatusMessage("");
      }, 2500);
      notify.success("Telaah AI batch selesai!");
    } catch (err: any) {
      notify.error(err.message || "Gagal menjalankan telaah AI");
      setAiProcessing(false);
      setStatusMessage("");
    }
  };

  // ── RUN SINGLE JOURNAL CROSS-CHECK (GROQ AI) ──
  const handleSingleCrossCheck = async (journalId: string, journalTitle: string) => {
    try {
      setCrossCheckingId(journalId);
      setAiProcessing(true);
      setProcessingProgress(20);
      setEstimatedSeconds(6);
      setStatusMessage(`Groq AI sedang mencocokkan artikel "${journalTitle.slice(0, 40)}..." dengan variabel skripsi...`);

      const progressTimer = setInterval(() => {
        setProcessingProgress((prev) => (prev < 88 ? prev + 15 : prev));
        setEstimatedSeconds((prev) => (prev > 1 ? prev - 1 : 1));
      }, 800);

      const res = await api.journals.aiCrosscheck(projectId, journalId);

      clearInterval(progressTimer);
      setProcessingProgress(100);
      setEstimatedSeconds(0);
      setStatusMessage(
        res.journal.status === "APPROVED"
          ? `✓ Jurnal Disetujui! (${res.aiAnalysis?.relevanceScore || 85}% Relevansi)`
          : res.journal.status === "REJECTED"
            ? `⚠️ Jurnal Ditolak: ${res.aiAnalysis?.recommendationReason || "Topik tidak relevan dengan skripsi."}`
            : "✓ Telaah intisari artikel berhasil diperbarui!"
      );

      // Update in state
      setJournals((prev) =>
        prev.map((j) => (j.id === journalId ? res.journal : j))
      );

      setTimeout(() => {
        setAiProcessing(false);
        setCrossCheckingId(null);
        setStatusMessage("");
      }, 3000);
      notify.success(`Cross-check selesai untuk "${journalTitle.slice(0, 35)}..."`);
    } catch (err: any) {
      notify.error(err.message || "Gagal melakukan Cross-Check AI");
      setAiProcessing(false);
      setCrossCheckingId(null);
      setStatusMessage("");
    }
  };

  // Ekstrak data pendekatan & narasi umum untuk penapisan jurnal terarah
  const approachConfig = (project?.approachConfig as any) || {};
  const commonNarrative = (project?.commonNarrative as any) || {};

  const varX = approachConfig.variableX || approachConfig.quantitative?.variableX || "";
  const varY = approachConfig.variableY || approachConfig.quantitative?.variableY || "";
  const focusIssue = approachConfig.focusIssue || approachConfig.qualitative?.focus || "";
  const scope = commonNarrative.scope || "";
  const masalah =
    approachConfig.masalah ||
    approachConfig.focusIssue ||
    commonNarrative.scope ||
    commonNarrative.background ||
    "";

  // Auto-search rekomendasi AI awal berdasarkan judul / masalah yang ditemukan
  useEffect(() => {
    if (project?.title && !hasAutoSearched && discoveryResults.length === 0 && !discoveryLoading) {
      setHasAutoSearched(true);
      const q = (masalah || project.title).slice(0, 90);
      setDiscoveryQuery(q);
      handleDiscoverySearch(undefined, q);
    }
  }, [project?.id, masalah, hasAutoSearched, discoveryResults.length, discoveryLoading]);

  // Filtered journals
  const filteredJournals = useMemo(() => {
    return journals.filter((j) => {
      const matchSearch =
        j.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (j.authors && j.authors.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (j.publication && j.publication.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (j.abstract && j.abstract.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (j.keyFindings && j.keyFindings.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchStatus = statusFilter === "ALL" || j.status === statusFilter;

      let matchVariable = true;
      if (activeVariableFilter) {
        const keywords = activeVariableFilter
          .toLowerCase()
          .split(/[^a-zA-Z0-9]+/)
          .filter((w) => w.length > 2);
        const jContent = `${j.title} ${j.abstract || ""} ${j.keyFindings || ""}`.toLowerCase();
        matchVariable = keywords.some((k) => jContent.includes(k));
      }

      return matchSearch && matchStatus && matchVariable;
    });
  }, [journals, searchQuery, statusFilter, activeVariableFilter]);

  // Handle PDF File Upload (Progressive Multi-Upload max 10 files)
  const [uploadStepInfo, setUploadStepInfo] = useState<string | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const pdfFiles = Array.from(files).filter(
      (f) => f.type === "application/pdf" || f.name.endsWith(".pdf")
    );

    if (pdfFiles.length === 0) {
      notify.warning("Hanya file dokumen PDF yang dapat diunggah");
      return;
    }

    const maxFiles = pdfFiles.slice(0, 10);
    if (pdfFiles.length > 10) {
      notify.info("Maksimal 10 file PDF sekaligus. Memproses 10 file pertama...");
    }

    try {
      setUploadingPdf(true);

      for (let i = 0; i < maxFiles.length; i++) {
        const file = maxFiles[i];
        const progressPrefix = `[${i + 1}/${maxFiles.length}]`;

        // ── Step 1: Ekstraksi Teks & Struktur Lokal (Library Lokal, Tanpa AI) ──
        setUploadStepInfo(`${progressPrefix} Mengekstrak PDF: ${file.name.slice(0, 35)}...`);
        const res = await api.journals.uploadPdf(projectId, file);
        const newJournal = res.data;
        setJournals((prev) => [newJournal, ...prev.filter((j) => j.id !== newJournal.id)]);

        // ── Step 2: AI Tier 1 Screening Bertahap (Groq AI) ──
        setUploadStepInfo(`${progressPrefix} Menilai relevansi AI: ${newJournal.title?.slice(0, 35)}...`);
        setAutoCheckingId(newJournal.id);
        try {
          const screenRes = await api.journals.screenJournal(projectId, newJournal.id);
          setJournals((prev) =>
            prev.map((j) => (j.id === newJournal.id ? screenRes.data : j))
          );
          // Auto-expand newly uploaded & screened journal
          setExpandedAiAnalysis((prev) => ({ ...prev, [newJournal.id]: true }));
        } catch (screenErr) {
          console.warn("Screening otomatis gagal:", screenErr);
        } finally {
          setAutoCheckingId(null);
        }
      }
      notify.success(`Berhasil mengunggah & memproses ${maxFiles.length} file PDF`);
    } catch (err: any) {
      notify.error(err.message || "Gagal mengunggah dan membaca PDF");
    } finally {
      setUploadingPdf(false);
      setUploadStepInfo(null);
      e.target.value = "";
    }
  };

  // Manual Re-Extract PDF (Lokal)
  const handleExtractJournal = async (journalId: string) => {
    try {
      setAutoCheckingId(journalId);
      const res = await api.journals.extractPdf(projectId, journalId);
      setJournals((prev) =>
        prev.map((j) => (j.id === journalId ? res.data : j))
      );
      notify.success("✓ Ekstraksi teks PDF lokal berhasil diperbarui.");
    } catch (err: any) {
      notify.error(err.message || "Gagal mengekstrak PDF");
    } finally {
      setAutoCheckingId(null);
    }
  };

  // Manual Re-Screen AI Tier 1
  const handleScreenJournal = async (journalId: string) => {
    try {
      setAutoCheckingId(journalId);
      const res = await api.journals.screenJournal(projectId, journalId);
      setJournals((prev) =>
        prev.map((j) => (j.id === journalId ? res.data : j))
      );
      // Auto-expand freshly screened journal
      setExpandedAiAnalysis((prev) => ({ ...prev, [journalId]: true }));
      notify.success("Screening AI berhasil!");
    } catch (err: any) {
      notify.error(err.message || "Gagal melakukan screening AI");
    } finally {
      setAutoCheckingId(null);
    }
  };

  // Screen all journals in batch with updated AI
  const handleScreenAll = async () => {
    await handleBatchScreening();
  };

  // Manual Status Override (e.g. Setujui Manual)
  const handleStatusChange = async (journalId: string, newStatus: string) => {
    try {
      const res = await api.journals.update(projectId, journalId, { status: newStatus as any, relevanceScore: newStatus === "APPROVED" ? 85 : 50 });
      setJournals((prev) =>
        prev.map((j) => (j.id === journalId ? { ...j, status: newStatus as any, relevanceScore: newStatus === "APPROVED" ? (j.relevanceScore && j.relevanceScore > 60 ? j.relevanceScore : 85) : j.relevanceScore } : j))
      );
      notify.success(`Status jurnal berhasil diubah ke ${newStatus}`);
    } catch (err: any) {
      notify.error(err.message || "Gagal memperbarui status jurnal");
    }
  };

  // Handle DOI Lookup
  const handleDoiLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!doiInput.trim()) return;

    try {
      setDoiLoading(true);
      setDoiError("");
      const res = await api.journals.lookupDoi(projectId, doiInput.trim());
      const metadata = res.data;

      // Auto create journal with fetched metadata
      const created = await api.journals.create(projectId, {
        title: metadata.title,
        authors: metadata.authors,
        year: metadata.year || undefined,
        publication: metadata.publication,
        doi: metadata.doi,
        url: metadata.url,
        abstract: metadata.abstract,
        sourceType: "DOI",
        status: "UNDER_REVIEW",
        relevanceScore: 80.0,
      });

      setJournals((prev) => [created.data, ...prev]);
      setShowDoiModal(false);
      setDoiInput("");
    } catch (err: any) {
      setDoiError(err.message || "DOI tidak ditemukan di database publik");
    } finally {
      setDoiLoading(false);
    }
  };

  // Handle Manual Journal Create
  const handleCreateManual = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualTitle.trim()) return;

    try {
      setSavingManual(true);
      const res = await api.journals.create(projectId, {
        title: manualTitle.trim(),
        authors: manualAuthors.trim() || undefined,
        year: manualYear ? parseInt(manualYear) : undefined,
        publication: manualPublication.trim() || undefined,
        doi: manualDoi.trim() || undefined,
        abstract: manualAbstract.trim() || undefined,
        sourceType: "MANUAL",
        status: "UNDER_REVIEW",
        relevanceScore: 70.0,
      });

      setJournals((prev) => [res.data, ...prev]);
      setShowManualModal(false);
      setManualTitle("");
      setManualAuthors("");
      setManualYear("");
      setManualPublication("");
      setManualDoi("");
      setManualAbstract("");
      notify.success("Jurnal berhasil ditambahkan secara manual!");
    } catch (err: any) {
      notify.error(err.message || "Gagal menyimpan jurnal");
    } finally {
      setSavingManual(false);
    }
  };

  // Delete Journal
  const handleDeleteJournal = async (journalId: string, title: string) => {
    const confirmed = await notify.confirm({
      title: "Hapus Jurnal",
      description: `Hapus jurnal "${title}" dari library project ini? Tindakan ini tidak dapat dibatalkan.`,
      confirmLabel: "Hapus",
      cancelLabel: "Batal",
      isDestructive: true,
    });
    if (!confirmed) return;

    try {
      await api.journals.delete(projectId, journalId);
      setJournals((prev) => prev.filter((j) => j.id !== journalId));
      notify.success("Jurnal berhasil dihapus");
    } catch (err: any) {
      notify.error(err.message || "Gagal menghapus jurnal");
    }
  };

  // Purge all rejected off-topic journals
  const handlePurgeRejected = async () => {
    const confirmed = await notify.confirm({
      title: "Bersihkan Jurnal Ditolak",
      description: `Hapus semua ${stats.rejected} jurnal yang di luar topik dari project ini?`,
      confirmLabel: "Hapus Semua",
      cancelLabel: "Batal",
      isDestructive: true,
    });
    if (!confirmed) return;

    try {
      await api.journals.purgeRejected(projectId);
      setJournals((prev) => prev.filter((j) => j.status !== "REJECTED"));
      notify.success("Jurnal yang ditolak berhasil dibersihkan");
    } catch (err: any) {
      notify.error(err.message || "Gagal membersihkan jurnal yang ditolak");
    }
  };

  // Update Status Quick Action
  const handleUpdateStatus = async (journalId: string, status: JournalStatus) => {
    try {
      await api.journals.update(projectId, journalId, { status });
      setJournals((prev) =>
        prev.map((j) => (j.id === journalId ? { ...j, status } : j))
      );
      notify.success(`Status jurnal berhasil diperbarui menjadi ${status}`);
    } catch (err: any) {
      notify.error(err.message || "Gagal memperbarui status");
    }
  };

  // ── Journal Discovery Handlers ──────────────────────────
  const handleDiscoverySearch = async (e?: React.FormEvent, overrideQuery?: string) => {
    if (e) e.preventDefault();
    const q = (overrideQuery ?? discoveryQuery).trim();
    if (!q) return;

    if (overrideQuery) setDiscoveryQuery(overrideQuery);

    try {
      setDiscoveryLoading(true);
      setDiscoveryResults([]);
      setDiscoveryMeta(null);

      const res = await api.journals.discovery.search(projectId, {
        query: q,
        domainHint: discoveryDomain,
        limitPerProvider: 8,
      });

      setDiscoveryResults(res.candidates || []);
      setDiscoveryMeta({
        searchId: res.searchId,
        tookMs: res.tookMs,
        expandedQuery: res.expandedQuery,
        domainHint: res.domainHint,
      });
    } catch (err: any) {
      notify.error(err.message || "Pencarian jurnal gagal. Coba lagi.");
    } finally {
      setDiscoveryLoading(false);
    }
  };

  const handleImportCandidate = async (candidate: NormalizedPaper) => {
    const uniqueKey = candidate.doi || candidate.externalId;
    if (
      importedIds.has(uniqueKey) ||
      pendingImports.has(uniqueKey) ||
      journals.some((j) => (j.doi && j.doi === candidate.doi) || j.title.toLowerCase() === candidate.title.toLowerCase())
    ) {
      return;
    }

    // 1. Optimistic update (waiting list / queue) - instantaneous, allowing button spam!
    setImportedIds((prev) => new Set([...prev, uniqueKey]));
    setPendingImports((prev) => new Set([...prev, uniqueKey]));

    const tempId = `temp-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const tempJournal: Journal = {
      id: tempId,
      projectId,
      title: candidate.title,
      authors: candidate.authors || "",
      year: candidate.year || new Date().getFullYear(),
      doi: candidate.doi || null,
      url: candidate.url || null,
      openAccessPdfUrl: candidate.openAccessPdfUrl || null,
      status: "APPROVED" as JournalStatus,
      sourceType: (candidate.provider === "UPLOAD" ? "MANUAL_UPLOAD" : "ONLINE_SEARCH") as JournalSourceType,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setJournals((prev) => [tempJournal, ...prev]);

    // 2. Background API call
    try {
      const res = await api.journals.discovery.import(projectId, candidate);
      setJournals((prev) => [res.journal, ...prev.filter((j) => j.id !== tempId && j.id !== res.journal.id)]);
      notify.success(`Jurnal "${candidate.title.slice(0, 35)}..." berhasil ditambahkan sebagai acuan!`);
    } catch (err: any) {
      // Rollback on error
      setImportedIds((prev) => {
        const next = new Set(prev);
        next.delete(uniqueKey);
        return next;
      });
      setJournals((prev) => prev.filter((j) => j.id !== tempId));
      notify.error(err.message || "Gagal mengimpor jurnal");
    } finally {
      setPendingImports((prev) => {
        const next = new Set(prev);
        next.delete(uniqueKey);
        return next;
      });
    }
  };

  const handleToggleCandidateSelect = (uniqueKey: string) => {
    setSelectedCandidateKeys((prev) => {
      const next = new Set(prev);
      if (next.has(uniqueKey)) next.delete(uniqueKey);
      else next.add(uniqueKey);
      return next;
    });
  };

  const handleSelectAllCandidates = () => {
    if (selectedCandidateKeys.size === discoveryResults.length) {
      setSelectedCandidateKeys(new Set());
    } else {
      setSelectedCandidateKeys(new Set(discoveryResults.map((p) => p.doi || p.externalId)));
    }
  };

  const handleBatchImportSelected = async () => {
    const toImport = discoveryResults.filter((p) => {
      const k = p.doi || p.externalId;
      return (
        selectedCandidateKeys.has(k) &&
        !importedIds.has(k) &&
        !journals.some((j) => (j.doi && j.doi === p.doi) || j.title.toLowerCase() === p.title.toLowerCase())
      );
    });

    if (toImport.length === 0) {
      notify.error("Tidak ada jurnal baru yang dipilih untuk diimpor");
      return;
    }

    notify.success(`Memproses antrean ${toImport.length} jurnal terpilih...`);
    setSelectedCandidateKeys(new Set());
    await Promise.all(toImport.map((p) => handleImportCandidate(p)));
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
          <BookOpen size={24} color="#00C988" />
          <span style={{ fontSize: 15, fontWeight: 600, color: "#334155" }}>
            Memuat Library Jurnal & Literatur...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "row", background: "#fefefe" }}>
      {/* ── LEFT ICON SIDEBAR ── */}
      <ProjectSidebar
        projectId={projectId}
        approvedJournalsCount={stats.approved}
        totalNodesCount={stats.totalMappings}
      />

      {/* ── RIGHT MAIN CONTENT ── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: "100vh", minWidth: 0 }}>
        {/* ── TOP TOOLBAR HEADER ── */}
        <header
          style={{
            height: 64,
            background: "#ffffff",
            borderBottom: "1px solid #e2e8f0",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 24px",
            position: "sticky",
            top: 0,
            zIndex: 30,
          }}
        >
          {/* Left: Back + Title */}
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
                    fontSize: 15,
                    fontWeight: 700,
                    color: "#0f172a",
                    margin: 0,
                    maxWidth: 440,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                  title={project?.title || "Eksplorasi Jurnal Acuan"}
                >
                  {project?.title || "Eksplorasi Jurnal Acuan"}
                </h1>
                {project?.field && (
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      padding: "2px 8px",
                      borderRadius: 6,
                      background: "#e0f2fe",
                      color: "#0369a1",
                      whiteSpace: "nowrap",
                      flexShrink: 0,
                    }}
                  >
                    {project.field}
                  </span>
                )}
              </div>
              <span style={{ fontSize: 12, color: "#64748b" }}>
                Fase 3: Eksplorasi & Pemilihan Jurnal Bahan Acuan
              </span>
            </div>
          </div>

          {/* Center / Right: Quick Switch & Actions */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {viewMode === "DISCOVERY" ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setViewMode("WORKSPACE")}
                icon={<Layers size={14} />}
              >
                Detail Telaah & Metrik ({journals.length})
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setViewMode("DISCOVERY")}
                icon={<Search size={14} />}
              >
                Kembali ke Pencarian Acuan
              </Button>
            )}

            <Link href={`/projects/${projectId}/outline`} style={{ textDecoration: "none" }}>
              <Button
                variant="emerald"
                size="sm"
                icon={<ArrowRight size={14} />}
              >
                Lanjut ke Blueprint (F4) →
              </Button>
            </Link>
          </div>
        </header>

        {/* ── SEPARATE EXTRACTION & SCREENING PROGRESS BANNER (MASALAH 1) ── */}
        {uploadStepInfo && (
          <div
            style={{
              background: "linear-gradient(135deg, #ecfdf5 0%, #f0fdf4 100%)",
              borderBottom: "1.5px solid #a7f3d0",
              padding: "10px 24px",
              display: "flex",
              alignItems: "center",
              gap: 10,
              fontSize: 13,
              fontWeight: 600,
              color: "#065f46",
            }}
          >
            <div className="w-4 h-4 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin shrink-0" />
            <span>{uploadStepInfo}</span>
          </div>
        )}

        {/* ── MAIN BODY ── */}
        <main
          style={{
            maxWidth: 1380,
            margin: "0 auto",
            padding: "24px 24px 60px",
            width: "100%",
            boxSizing: "border-box",
          }}
        >
          {viewMode === "DISCOVERY" ? (
            /* ──── TAMPILAN AWAL MINIMALIS: PENCARIAN & PEMILIHAN JURNAL ACUAN ──── */
            <div
              style={{
                display: "grid",
                gridTemplateColumns: activePreview ? "minmax(0, 1.15fr) minmax(0, 0.85fr)" : "1fr",
                gap: 20,
                alignItems: "start",
              }}
            >
              {/* Kolom Kiri: Kontrol Pencarian, Hasil Rekomendasi, & Acuan Terpilih */}
              <div style={{ display: "flex", flexDirection: "column", gap: 20, minWidth: 0 }}>
                {/* Card 1: Sticky Pencarian & Input Acuan (Tetap di atas & tidak bergeser saat di-scroll) */}
                <div
                  style={{
                    position: "sticky",
                    top: 74,
                    zIndex: 20,
                    background: "#ffffff",
                    border: "1px solid #e2e8f0",
                    borderRadius: 16,
                    padding: "18px 22px",
                    display: "flex",
                    flexDirection: "column",
                    gap: 12,
                  }}
                >
                  {/* Header Card with Mode Switch */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
                        <Sparkles size={16} color="#059669" />
                        <h2 style={{ fontSize: 15, fontWeight: 700, color: "#0f172a", margin: 0, letterSpacing: "-0.01em" }}>
                          Pilih Jurnal Sebagai Bahan Acuan Riset
                        </h2>
                      </div>
                      <p style={{ fontSize: 12, color: "#64748b", margin: 0, lineHeight: 1.4 }}>
                        Cari literatur bereputasi dari 6 penyedia global (OpenAlex, Semantic Scholar, CORE, PubMed, arXiv, Crossref) atau unggah PDF jurnal lokal.
                      </p>
                    </div>

                    {/* Mode Tab Switcher */}
                    <div style={{ display: "flex", gap: 3, background: "#f8fafc", padding: 3, borderRadius: 999, border: "1px solid #f1f5f9" }}>
                      <button
                        type="button"
                        onClick={() => setDiscoveryTab("SEARCH")}
                        style={{
                          padding: "5px 14px",
                          borderRadius: 999,
                          border: discoveryTab === "SEARCH" ? "1px solid #e2e8f0" : "none",
                          background: discoveryTab === "SEARCH" ? "#ffffff" : "transparent",
                          color: discoveryTab === "SEARCH" ? "#0f172a" : "#64748b",
                          fontWeight: discoveryTab === "SEARCH" ? 600 : 500,
                          fontSize: 12,
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                        }}
                      >
                        <Globe size={13} color={discoveryTab === "SEARCH" ? "#059669" : "#64748b"} />
                        <span>Cari Online</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setDiscoveryTab("UPLOAD")}
                        style={{
                          padding: "5px 14px",
                          borderRadius: 999,
                          border: discoveryTab === "UPLOAD" ? "1px solid #e2e8f0" : "none",
                          background: discoveryTab === "UPLOAD" ? "#ffffff" : "transparent",
                          color: discoveryTab === "UPLOAD" ? "#0f172a" : "#64748b",
                          fontWeight: discoveryTab === "UPLOAD" ? 600 : 500,
                          fontSize: 12,
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                        }}
                      >
                        <Upload size={13} color={discoveryTab === "UPLOAD" ? "#059669" : "#64748b"} />
                        <span>Upload PDF Lokal</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setDiscoveryTab("DOI")}
                        style={{
                          padding: "5px 14px",
                          borderRadius: 999,
                          border: discoveryTab === "DOI" ? "1px solid #e2e8f0" : "none",
                          background: discoveryTab === "DOI" ? "#ffffff" : "transparent",
                          color: discoveryTab === "DOI" ? "#0f172a" : "#64748b",
                          fontWeight: discoveryTab === "DOI" ? 600 : 500,
                          fontSize: 12,
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                        }}
                      >
                        <FileText size={13} color={discoveryTab === "DOI" ? "#0284c7" : "#64748b"} />
                        <span>Input DOI</span>
                      </button>
                    </div>
                  </div>

                  {/* Tab 1: Cari Online */}
                  {discoveryTab === "SEARCH" && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      {/* Rekomendasi AI berdasarkan Topik & Masalah Penelitian */}
                      <div
                        style={{
                          background: "#fafafa",
                          border: "1px solid #f1f5f9",
                          borderRadius: 10,
                          padding: "10px 14px",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11.5, fontWeight: 600, color: "#475569", marginBottom: 7 }}>
                          <Sparkles size={12} color="#059669" />
                          <span>Rekomendasi Pencarian Cerdas (Berdasarkan Topik & Masalah):</span>
                        </div>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, maxHeight: 68, overflowY: "auto" }}>
                          {project?.title && (
                            <button
                              type="button"
                              onClick={() => {
                                setDiscoveryQuery(project.title);
                                handleDiscoverySearch(undefined, project.title);
                              }}
                              style={{
                                padding: "4px 12px",
                                borderRadius: 999,
                                background: discoveryQuery === project.title ? "#f1f5f9" : "#ffffff",
                                border: `1px solid ${discoveryQuery === project.title ? "#cbd5e1" : "#e2e8f0"}`,
                                color: discoveryQuery === project.title ? "#0f172a" : "#475569",
                                fontSize: 11,
                                fontWeight: discoveryQuery === project.title ? 600 : 500,
                                cursor: "pointer",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 5,
                              }}
                            >
                              <span>💡 Topik:</span>
                              <span style={{ fontWeight: 600 }}>{project.title.slice(0, 45)}{project.title.length > 45 ? "..." : ""}</span>
                            </button>
                          )}
                          {masalah && masalah !== project?.title && (
                            <button
                              type="button"
                              onClick={() => {
                                setDiscoveryQuery(masalah);
                                handleDiscoverySearch(undefined, masalah);
                              }}
                              style={{
                                padding: "4px 12px",
                                borderRadius: 999,
                                background: discoveryQuery === masalah ? "#f1f5f9" : "#ffffff",
                                border: `1px solid ${discoveryQuery === masalah ? "#cbd5e1" : "#e2e8f0"}`,
                                color: discoveryQuery === masalah ? "#0f172a" : "#475569",
                                fontSize: 11,
                                fontWeight: discoveryQuery === masalah ? 600 : 500,
                                cursor: "pointer",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 5,
                              }}
                            >
                              <span>⚡ Masalah:</span>
                              <span style={{ fontWeight: 600 }}>{masalah.slice(0, 40)}{masalah.length > 40 ? "..." : ""}</span>
                            </button>
                          )}
                          {varX && (
                            <button
                              type="button"
                              onClick={() => {
                                const q = `${varX} ${varY || ""}`.trim();
                                setDiscoveryQuery(q);
                                handleDiscoverySearch(undefined, q);
                              }}
                              style={{
                                padding: "4px 12px",
                                borderRadius: 999,
                                background: "#ffffff",
                                border: "1px solid #e2e8f0",
                                color: "#475569",
                                fontSize: 11,
                                fontWeight: 500,
                                cursor: "pointer",
                              }}
                            >
                              🎯 Variabel: {varX} {varY ? `& ${varY}` : ""}
                            </button>
                          )}
                          {focusIssue && focusIssue !== masalah && (
                            <button
                              type="button"
                              onClick={() => {
                                setDiscoveryQuery(focusIssue);
                                handleDiscoverySearch(undefined, focusIssue);
                              }}
                              style={{
                                padding: "4px 12px",
                                borderRadius: 999,
                                background: "#ffffff",
                                border: "1px solid #e2e8f0",
                                color: "#475569",
                                fontSize: 11,
                                fontWeight: 500,
                                cursor: "pointer",
                              }}
                            >
                              🔬 Fokus: {focusIssue.slice(0, 35)}
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Search Input Bar */}
                      <form onSubmit={(e) => handleDiscoverySearch(e)} style={{ display: "flex", gap: 10 }}>
                        <div style={{ position: "relative", flex: 1 }}>
                          <input
                            type="text"
                            value={discoveryQuery}
                            onChange={(e) => setDiscoveryQuery(e.target.value)}
                            placeholder="Ketik kata kunci topik, masalah, atau metode riset..."
                            style={{
                              width: "100%",
                              padding: "10px 36px 10px 14px",
                              borderRadius: 10,
                              border: "1px solid #e2e8f0",
                              fontSize: 13,
                              outline: "none",
                              background: "#f8fafc",
                              color: "#0f172a",
                              boxSizing: "border-box",
                              transition: "all 0.15s ease",
                            }}
                            onFocus={(e) => {
                              e.currentTarget.style.borderColor = "#00C988";
                              e.currentTarget.style.background = "#ffffff";
                            }}
                            onBlur={(e) => {
                              e.currentTarget.style.borderColor = "#e2e8f0";
                              e.currentTarget.style.background = "#f8fafc";
                            }}
                          />
                          {discoveryQuery && (
                            <button
                              type="button"
                              onClick={() => setDiscoveryQuery("")}
                              style={{
                                position: "absolute",
                                right: 10,
                                top: "50%",
                                transform: "translateY(-50%)",
                                background: "transparent",
                                border: "none",
                                borderRadius: "50%",
                                width: 20,
                                height: 20,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                cursor: "pointer",
                                color: "#94a3b8",
                              }}
                            >
                              <X size={13} />
                            </button>
                          )}
                        </div>

                        <button
                          type="submit"
                          disabled={discoveryLoading || !discoveryQuery.trim()}
                          style={{
                            padding: "10px 20px",
                            borderRadius: 10,
                            border: "none",
                            background: discoveryLoading ? "#94a3b8" : "#0f172a",
                            color: "#ffffff",
                            fontWeight: 600,
                            fontSize: 12.5,
                            cursor: discoveryLoading ? "not-allowed" : "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                            flexShrink: 0,
                          }}
                        >
                          {discoveryLoading ? <RefreshCw size={13} className="animate-spin" /> : <Search size={13} />}
                          <span>{discoveryLoading ? "Mencari..." : "Cari Jurnal"}</span>
                        </button>
                      </form>

                      {/* Domain Pills */}
                      <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
                        <span style={{ fontSize: 11, color: "#94a3b8", fontWeight: 500 }}>Filter Disiplin:</span>
                        {(["GENERAL", "HEALTH", "AI_CS"] as const).map((d) => (
                          <button
                            key={d}
                            type="button"
                            onClick={() => setDiscoveryDomain(d)}
                            style={{
                              padding: "3px 10px",
                              borderRadius: 999,
                              border: discoveryDomain === d ? "1px solid #0f172a" : "1px solid #f1f5f9",
                              background: discoveryDomain === d ? "#0f172a" : "#f8fafc",
                              color: discoveryDomain === d ? "#ffffff" : "#64748b",
                              fontWeight: discoveryDomain === d ? 600 : 500,
                              fontSize: 11,
                              cursor: "pointer",
                            }}
                          >
                            {d === "GENERAL" ? "Semua Disiplin" : d === "HEALTH" ? "Kesehatan" : "Komputer & AI"}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Tab 2: Upload PDF Lokal */}
                  {discoveryTab === "UPLOAD" && (
                    <div
                      style={{
                        border: "1px dashed #cbd5e1",
                        borderRadius: 12,
                        padding: "24px 20px",
                        textAlign: "center",
                        background: "#fafafa",
                      }}
                    >
                      <Upload size={24} color="#059669" style={{ margin: "0 auto 8px" }} />
                      <h3 style={{ fontSize: 13.5, fontWeight: 600, color: "#0f172a", margin: "0 0 4px" }}>
                        Upload File PDF Jurnal Lokal (Maks. 10 Dokumen)
                      </h3>
                      <p style={{ fontSize: 11.5, color: "#64748b", margin: "0 0 12px" }}>
                        Sistem akan mengekstrak judul, penulis, tahun, dan abstrak dari naskah PDF secara otomatis.
                      </p>
                      <label
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 6,
                          padding: "7px 18px",
                          borderRadius: 8,
                          background: "#00C988",
                          color: "#ffffff",
                          fontSize: 12.5,
                          fontWeight: 600,
                          cursor: uploadingPdf ? "not-allowed" : "pointer",
                        }}
                      >
                        <Upload size={13} />
                        <span>{uploadingPdf ? "Sedang Memproses PDF..." : "Pilih File PDF"}</span>
                        <input
                          type="file"
                          multiple
                          accept=".pdf,application/pdf"
                          onChange={handleFileUpload}
                          disabled={uploadingPdf}
                          style={{ display: "none" }}
                        />
                      </label>
                    </div>
                  )}

                  {/* Tab 3: Input DOI */}
                  {discoveryTab === "DOI" && (
                    <form onSubmit={handleDoiLookup} style={{ display: "flex", gap: 10 }}>
                      <input
                        type="text"
                        placeholder="Contoh: 10.1016/j.compedu.2023.104780"
                        value={doiInput}
                        onChange={(e) => setDoiInput(e.target.value)}
                        required
                        style={{
                          flex: 1,
                          padding: "10px 14px",
                          borderRadius: 10,
                          border: "1px solid #e2e8f0",
                          fontSize: 13,
                          outline: "none",
                          background: "#f8fafc",
                          color: "#0f172a",
                        }}
                      />
                      <button
                        type="submit"
                        disabled={doiLoading}
                        style={{
                          padding: "10px 20px",
                          borderRadius: 10,
                          border: "none",
                          background: "#0f172a",
                          color: "#ffffff",
                          fontSize: 12.5,
                          fontWeight: 600,
                          cursor: doiLoading ? "not-allowed" : "pointer",
                        }}
                      >
                        {doiLoading ? "Mencari..." : "Ambil Metadata"}
                      </button>
                    </form>
                  )}
                </div>

                {/* Discovery Results List (Scrollable underneath the sticky search bar) */}
                {discoveryLoading && (
                  <div
                    style={{
                      background: "#ffffff",
                      border: "1px solid #e2e8f0",
                      borderRadius: 16,
                      padding: "36px 20px",
                      textAlign: "center",
                    }}
                  >
                    <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                    <div style={{ fontSize: 13, color: "#64748b", fontWeight: 500 }}>
                      Mencari artikel ilmiah di OpenAlex, Semantic Scholar, CORE, PubMed, arXiv...
                    </div>
                  </div>
                )}

                {!discoveryLoading && discoveryResults.length > 0 && (
                  <div
                    style={{
                      background: "#ffffff",
                      border: "1px solid #e2e8f0",
                      borderRadius: 16,
                      padding: "18px 22px",
                      display: "flex",
                      flexDirection: "column",
                      gap: 12,
                    }}
                  >
                    {/* Multiselect Bar & Meta */}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10, paddingBottom: 10, borderBottom: "1px solid #f1f5f9" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                        <label style={{ display: "inline-flex", alignItems: "center", gap: 6, cursor: "pointer", fontSize: 12, fontWeight: 600, color: "#334155" }}>
                          <input
                            type="checkbox"
                            checked={discoveryResults.length > 0 && selectedCandidateKeys.size === discoveryResults.length}
                            onChange={handleSelectAllCandidates}
                            style={{ width: 15, height: 15, accentColor: "#00C988", cursor: "pointer" }}
                          />
                          <span>Pilih Semua ({discoveryResults.length})</span>
                        </label>

                        {selectedCandidateKeys.size > 0 && (
                          <button
                            type="button"
                            onClick={handleBatchImportSelected}
                            style={{
                              padding: "5px 12px",
                              borderRadius: 8,
                              border: "none",
                              background: "#00C988",
                              color: "#ffffff",
                              fontSize: 12,
                              fontWeight: 600,
                              cursor: "pointer",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 6,
                            }}
                          >
                            <Download size={13} />
                            <span>+ Jadikan Acuan ({selectedCandidateKeys.size} Terpilih)</span>
                          </button>
                        )}
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        {pendingImports.size > 0 && (
                          <span style={{ fontSize: 11, color: "#059669", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 4 }}>
                            <RefreshCw size={11} className="animate-spin" />
                            Menyimpan {pendingImports.size} antrean...
                          </span>
                        )}
                        {discoveryMeta && (
                          <span style={{ fontSize: 11, color: "#94a3b8" }}>
                            {discoveryMeta.tookMs}ms
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Candidate Cards */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {discoveryResults.map((paper, idx) => {
                        const uniqueKey = paper.doi || paper.externalId;
                        const isImported =
                          importedIds.has(uniqueKey) ||
                          journals.some((j) => (j.doi && j.doi === paper.doi) || j.title.toLowerCase() === paper.title.toLowerCase());
                        const isPending = pendingImports.has(uniqueKey);
                        const isSelected = selectedCandidateKeys.has(uniqueKey);
                        const providerColors: Record<string, string> = {
                          OPENALEX: "#0284c7",
                          SEMANTIC_SCHOLAR: "#7c3aed",
                          CORE: "#d97706",
                          PUBMED: "#059669",
                          ARXIV: "#dc2626",
                          CROSSREF: "#475569",
                        };
                        const pColor = providerColors[paper.provider] || "#64748b";

                        return (
                          <div
                            key={`${uniqueKey}-${idx}`}
                            style={{
                              padding: "14px 16px",
                              borderRadius: 12,
                              border: isImported ? "1px solid #bbf7d0" : isSelected ? "1px solid #c7d2fe" : "1px solid #f1f5f9",
                              background: isImported ? "#fbfdfc" : isSelected ? "#fafafe" : "#ffffff",
                              display: "flex",
                              gap: 12,
                              alignItems: "flex-start",
                              transition: "border-color 0.15s ease",
                            }}
                          >
                            {/* Checkbox multiselect */}
                            <div style={{ paddingTop: 3, flexShrink: 0 }}>
                              <input
                                type="checkbox"
                                checked={isSelected || isImported}
                                disabled={isImported}
                                onChange={() => handleToggleCandidateSelect(uniqueKey)}
                                style={{ width: 15, height: 15, accentColor: "#00C988", cursor: isImported ? "default" : "pointer" }}
                                title={isImported ? "Sudah menjadi acuan" : "Centang untuk pilih multi"}
                              />
                            </div>

                            {/* Main Content Column */}
                            <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 5 }}>
                              {/* 1. Judul Makalah */}
                              <div style={{ fontSize: 13.5, fontWeight: 600, color: "#0f172a", lineHeight: 1.4 }}>
                                {paper.title}
                              </div>

                              {/* 2. Penulis, Tahun, Jurnal */}
                              <div style={{ fontSize: 12, color: "#64748b" }}>
                                {paper.authors && <span>{paper.authors.slice(0, 85)}{paper.authors.length > 85 ? "..." : ""}</span>}
                                {paper.year && <span style={{ marginLeft: 6, fontWeight: 500, color: "#475569" }}>• {paper.year}</span>}
                                {paper.publication && <span style={{ marginLeft: 6, fontStyle: "italic" }}>• {paper.publication.slice(0, 50)}</span>}
                              </div>

                              {/* 3. Abstrak Makalah */}
                              {paper.abstract && (
                                <div style={{ fontSize: 11.5, color: "#64748b", lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                                  {paper.abstract}
                                </div>
                              )}

                              {/* 4. FOOTER BARIS PALING BAWAH: Badges, View PDF, Link Sumber, & Tombol Pilih */}
                              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10, marginTop: 4, paddingTop: 8, borderTop: "1px solid #f8fafc" }}>
                                {/* Sisi Kiri: Badges & View PDF */}
                                <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                                  {/* Provider badge */}
                                  <span style={{ padding: "2px 7px", borderRadius: 4, fontSize: 10.5, fontWeight: 600, background: `${pColor}12`, color: pColor, whiteSpace: "nowrap" }}>
                                    {paper.provider}
                                  </span>

                                  {/* Single line Citation Count */}
                                  {paper.citedByCount > 0 && (
                                    <span
                                      style={{
                                        display: "inline-flex",
                                        alignItems: "center",
                                        gap: 4,
                                        padding: "2px 7px",
                                        borderRadius: 4,
                                        fontSize: 10.5,
                                        fontWeight: 500,
                                        background: "#f8fafc",
                                        color: "#64748b",
                                        whiteSpace: "nowrap",
                                      }}
                                    >
                                      <Star size={10} color="#f59e0b" fill="#f59e0b" />
                                      <span>{paper.citedByCount.toLocaleString()} sitasi</span>
                                    </span>
                                  )}

                                  {/* View PDF or Read Abstract (Split-Screen) Button */}
                                  {(() => {
                                    const directPdf = getDirectPdfUrl(paper);
                                    const candidateKey = paper.doi || paper.url || paper.title;
                                    const isCurrentActive = activePreview?.uniqueKey === candidateKey;

                                    if (directPdf) {
                                      return (
                                        <button
                                          type="button"
                                          onClick={() => {
                                            if (isCurrentActive) {
                                              setActivePreview(null);
                                            } else {
                                              setActivePreview({
                                                title: paper.title,
                                                authors: paper.authors || "",
                                                year: paper.year,
                                                publication: paper.publication,
                                                abstract: paper.abstract,
                                                url: paper.url,
                                                doi: paper.doi,
                                                provider: paper.provider,
                                                pdfUrl: directPdf,
                                                uniqueKey: candidateKey,
                                                isCandidate: true,
                                                rawCandidate: paper,
                                                viewMode: "PDF",
                                              });
                                            }
                                          }}
                                          style={{
                                            padding: "3px 9px",
                                            borderRadius: 4,
                                            fontSize: 11,
                                            fontWeight: 600,
                                            background: isCurrentActive ? "#059669" : "#f1f5f9",
                                            color: isCurrentActive ? "#ffffff" : "#059669",
                                            border: "none",
                                            cursor: "pointer",
                                            display: "inline-flex",
                                            alignItems: "center",
                                            gap: 5,
                                            whiteSpace: "nowrap",
                                          }}
                                          title="Buka naskah PDF lengkap secara berdampingan"
                                        >
                                          <Eye size={12} />
                                          <span>{isCurrentActive ? "Tutup PDF" : "View PDF"}</span>
                                        </button>
                                      );
                                    }

                                    // Jika bukan PDF langsung (artikel Crossref/web penerbit): buka pembaca Abstrak & Info
                                    return (
                                      <button
                                        type="button"
                                        onClick={() => {
                                          if (isCurrentActive) {
                                            setActivePreview(null);
                                          } else {
                                            setActivePreview({
                                              title: paper.title,
                                              authors: paper.authors || "",
                                              year: paper.year,
                                              publication: paper.publication,
                                              abstract: paper.abstract,
                                              url: paper.url,
                                              doi: paper.doi,
                                              provider: paper.provider,
                                              pdfUrl: null,
                                              uniqueKey: candidateKey,
                                              isCandidate: true,
                                              rawCandidate: paper,
                                              viewMode: "ABSTRACT",
                                            });
                                          }
                                        }}
                                        style={{
                                          padding: "3px 9px",
                                          borderRadius: 4,
                                          fontSize: 11,
                                          fontWeight: 600,
                                          background: isCurrentActive ? "#6366f1" : "#f1f5f9",
                                          color: isCurrentActive ? "#ffffff" : "#4f46e5",
                                          border: "none",
                                          cursor: "pointer",
                                          display: "inline-flex",
                                          alignItems: "center",
                                          gap: 5,
                                          whiteSpace: "nowrap",
                                        }}
                                        title="Buka ringkasan & abstrak penelitian secara berdampingan"
                                      >
                                        <BookOpen size={12} />
                                        <span>{isCurrentActive ? "Tutup Abstrak" : "Baca Abstrak"}</span>
                                      </button>
                                    );
                                  })()}

                                  {/* Link Sumber Button */}
                                  {paper.url && (
                                    <a
                                      href={paper.url}
                                      target="_blank"
                                      rel="noreferrer"
                                      style={{
                                        display: "inline-flex",
                                        alignItems: "center",
                                        gap: 4,
                                        padding: "3px 9px",
                                        borderRadius: 4,
                                        fontSize: 11,
                                        fontWeight: 500,
                                        background: "#f8fafc",
                                        color: "#64748b",
                                        textDecoration: "none",
                                        whiteSpace: "nowrap",
                                      }}
                                      title="Buka laman asli publikasi / DOI"
                                    >
                                      <ExternalLink size={11} />
                                      <span>Sumber</span>
                                    </a>
                                  )}
                                </div>

                                {/* Sisi Kanan: Action Button */}
                                <div style={{ flexShrink: 0 }}>
                                  {isImported ? (
                                    <button
                                      disabled
                                      style={{
                                        padding: "5px 12px",
                                        borderRadius: 6,
                                        border: "none",
                                        background: "#f0fdf4",
                                        color: "#166534",
                                        fontSize: 11.5,
                                        fontWeight: 600,
                                        display: "inline-flex",
                                        alignItems: "center",
                                        gap: 5,
                                      }}
                                    >
                                      <CheckCircle2 size={13} color="#16a34a" />
                                      <span>{isPending ? "Menyimpan..." : "Terpilih"}</span>
                                    </button>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() => handleImportCandidate(paper)}
                                      style={{
                                        padding: "5px 14px",
                                        borderRadius: 6,
                                        border: "none",
                                        background: "#00C988",
                                        color: "#ffffff",
                                        fontSize: 11.5,
                                        fontWeight: 600,
                                        cursor: "pointer",
                                        display: "inline-flex",
                                        alignItems: "center",
                                        gap: 5,
                                        whiteSpace: "nowrap",
                                      }}
                                    >
                                      <Download size={13} />
                                      <span>+ Pilih Acuan</span>
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Card 2: Jurnal Acuan Terpilih */}
                <div
                  style={{
                    background: "#ffffff",
                    border: "1px solid #e2e8f0",
                    borderRadius: 16,
                    padding: "20px 24px",
                    display: "flex",
                    flexDirection: "column",
                    gap: 14,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <BookOpen size={18} color="#059669" />
                      <h3 style={{ fontSize: 15, fontWeight: 700, color: "#0f172a", margin: 0, letterSpacing: "-0.01em" }}>
                        Daftar Jurnal Bahan Acuan ({journals.length})
                      </h3>
                    </div>
                    {journals.length > 0 && (
                      <Link href={`/projects/${projectId}/outline`} style={{ textDecoration: "none" }}>
                        <Button variant="emerald" size="sm" icon={<ArrowRight size={14} />}>
                          Lanjut ke F4: Research Blueprint →
                        </Button>
                      </Link>
                    )}
                  </div>

                  {journals.length === 0 ? (
                    <div style={{ padding: "24px 0", textAlign: "center", color: "#64748b", fontSize: 13 }}>
                      Belum ada jurnal yang dipilih. Pilih salah satu jurnal dari hasil pencarian AI di atas atau unggah file PDF lokal.
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {journals.map((j) => {
                        const pdfUrl = getJournalPdfUrl(j);
                        const isPdfActive = activePdfUrl === pdfUrl;
                        return (
                          <div
                            key={j.id}
                            style={{
                              padding: "12px 16px",
                              borderRadius: 10,
                              border: isPdfActive ? "1px solid #86efac" : "1px solid #f1f5f9",
                              background: isPdfActive ? "#fbfdfc" : "#ffffff",
                              display: "flex",
                              flexDirection: "column",
                              gap: 8,
                            }}
                          >
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14 }}>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontSize: 13.5, fontWeight: 600, color: "#0f172a", marginBottom: 2 }}>
                                  {j.title}
                                </div>
                                <div style={{ fontSize: 11.5, color: "#64748b" }}>
                                  {j.authors && <span>{j.authors.slice(0, 60)}</span>}
                                  {j.year && <span style={{ marginLeft: 6 }}>({j.year})</span>}
                                  {j.sourceType && (
                                    <span style={{ marginLeft: 8, padding: "1px 6px", borderRadius: 4, background: "#f1f5f9", fontSize: 10.5, color: "#475569" }}>
                                      {j.sourceType}
                                    </span>
                                  )}
                                </div>
                              </div>

                              <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                                {(() => {
                                  const jPdf = getDirectPdfUrl(j);
                                  const jKey = j.id || j.doi || j.title;
                                  const isJActive = activePreview?.uniqueKey === jKey;

                                  if (jPdf) {
                                    return (
                                      <button
                                        type="button"
                                        onClick={() => {
                                          if (isJActive) {
                                            setActivePreview(null);
                                          } else {
                                            setActivePreview({
                                              title: j.title,
                                              authors: j.authors || "",
                                              year: j.year,
                                              publication: j.publication || (j as any).journalName,
                                              abstract: j.abstract,
                                              url: j.url,
                                              doi: j.doi,
                                              provider: j.sourceType,
                                              pdfUrl: jPdf,
                                              uniqueKey: jKey,
                                              isCandidate: false,
                                              viewMode: "PDF",
                                            });
                                          }
                                        }}
                                        style={{
                                          display: "inline-flex",
                                          alignItems: "center",
                                          gap: 4,
                                          padding: "4px 10px",
                                          borderRadius: 6,
                                          background: isJActive ? "#059669" : "#f1f5f9",
                                          color: isJActive ? "#ffffff" : "#059669",
                                          border: "none",
                                          fontSize: 11.5,
                                          fontWeight: 600,
                                          cursor: "pointer",
                                        }}
                                      >
                                        <Eye size={12} />
                                        <span>{isJActive ? "Tutup PDF" : "Lihat PDF"}</span>
                                      </button>
                                    );
                                  }

                                  return (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        if (isJActive) {
                                          setActivePreview(null);
                                        } else {
                                          setActivePreview({
                                            title: j.title,
                                            authors: j.authors || "",
                                            year: j.year,
                                            publication: j.publication || (j as any).journalName,
                                            abstract: j.abstract,
                                            url: j.url,
                                            doi: j.doi,
                                            provider: j.sourceType,
                                            pdfUrl: null,
                                            uniqueKey: jKey,
                                            isCandidate: false,
                                            viewMode: "ABSTRACT",
                                          });
                                        }
                                      }}
                                      style={{
                                        display: "inline-flex",
                                        alignItems: "center",
                                        gap: 4,
                                        padding: "4px 10px",
                                        borderRadius: 6,
                                        background: isJActive ? "#6366f1" : "#f1f5f9",
                                        color: isJActive ? "#ffffff" : "#4f46e5",
                                        border: "none",
                                        fontSize: 11.5,
                                        fontWeight: 600,
                                        cursor: "pointer",
                                      }}
                                    >
                                      <BookOpen size={12} />
                                      <span>{isJActive ? "Tutup Info" : "Baca Abstrak"}</span>
                                    </button>
                                  );
                                })()}
                                <button
                                  onClick={() => handleDeleteJournal(j.id, j.title)}
                                  title="Hapus Jurnal"
                                  style={{
                                    background: "transparent",
                                    border: "none",
                                    padding: 6,
                                    borderRadius: 6,
                                    cursor: "pointer",
                                    color: "#94a3b8",
                                  }}
                                  onMouseEnter={(e) => (e.currentTarget.style.color = "#ef4444")}
                                  onMouseLeave={(e) => (e.currentTarget.style.color = "#94a3b8")}
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </div>

                            {/* Bank Kutipan Terverifikasi */}
                            {renderCitationBank(j)}
                          </div>
                        );
                      })}

                      <div
                        style={{
                          marginTop: 8,
                          padding: "12px 16px",
                          borderRadius: 10,
                          background: "#f0fdf4",
                          border: "1px solid #dcfce7",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          flexWrap: "wrap",
                          gap: 10,
                        }}
                      >
                        <div style={{ fontSize: 12.5, fontWeight: 600, color: "#166534" }}>
                          ✓ {journals.length} Jurnal bahan acuan telah siap digunakan.
                        </div>
                        <Link href={`/projects/${projectId}/outline`} style={{ textDecoration: "none" }}>
                          <Button variant="emerald" size="sm" icon={<ArrowRight size={14} />}>
                            Lanjut ke F4: Research Blueprint →
                          </Button>
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Kolom Kanan: Split Screen Viewer (PDF Lengkap / Pembaca Abstrak Akademik) */}
              {activePreview && (
                <div
                  style={{
                    position: "sticky",
                    top: 74,
                    height: "calc(100vh - 100px)",
                    background: "#ffffff",
                    border: "1px solid #e2e8f0",
                    borderRadius: 16,
                    overflow: "hidden",
                    display: "flex",
                    flexDirection: "column",
                    zIndex: 25,
                    boxShadow: "0 4px 20px -2px rgba(0, 0, 0, 0.05)",
                  }}
                >
                  {/* Split Viewer Header */}
                  <div
                    style={{
                      padding: "10px 16px",
                      borderBottom: "1px solid #f1f5f9",
                      background: "#ffffff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 12,
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0, flex: 1 }}>
                      {activePreview.viewMode === "PDF" && activePreview.pdfUrl ? (
                        <FileText size={16} color="#059669" style={{ flexShrink: 0 }} />
                      ) : (
                        <BookOpen size={16} color="#4f46e5" style={{ flexShrink: 0 }} />
                      )}
                      <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
                        <span
                          style={{
                            fontSize: 12.5,
                            fontWeight: 700,
                            color: "#0f172a",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                          title={activePreview.title}
                        >
                          {activePreview.title}
                        </span>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 1 }}>
                          {activePreview.provider && (
                            <span
                              style={{
                                fontSize: 10,
                                fontWeight: 700,
                                padding: "0.5px 5px",
                                borderRadius: 3,
                                background: "#f1f5f9",
                                color: "#475569",
                                textTransform: "uppercase",
                              }}
                            >
                              {activePreview.provider}
                            </span>
                          )}
                          {activePreview.year && (
                            <span style={{ fontSize: 11, color: "#64748b" }}>• {activePreview.year}</span>
                          )}
                          {activePreview.viewMode === "PDF" && activePreview.pdfUrl ? (
                            <span style={{ fontSize: 10, fontWeight: 600, color: "#059669", background: "#ecfdf5", padding: "0.5px 5px", borderRadius: 3 }}>
                              PDF Lengkap
                            </span>
                          ) : (
                            <span style={{ fontSize: 10, fontWeight: 600, color: "#4f46e5", background: "#eef2ff", padding: "0.5px 5px", borderRadius: 3 }}>
                              Abstrak & Metadata
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Header Actions */}
                    <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                      {/* Toggle tabs if direct PDF is available */}
                      {activePreview.pdfUrl && (
                        <div style={{ display: "flex", background: "#f1f5f9", padding: 2, borderRadius: 6, gap: 2 }}>
                          <button
                            type="button"
                            onClick={() => setActivePreview({ ...activePreview, viewMode: "PDF" })}
                            style={{
                              border: "none",
                              background: activePreview.viewMode === "PDF" ? "#ffffff" : "transparent",
                              color: activePreview.viewMode === "PDF" ? "#0f172a" : "#64748b",
                              fontWeight: activePreview.viewMode === "PDF" ? 700 : 500,
                              fontSize: 11,
                              padding: "3px 7px",
                              borderRadius: 4,
                              cursor: "pointer",
                              boxShadow: activePreview.viewMode === "PDF" ? "0 1px 2px rgba(0,0,0,0.05)" : "none",
                            }}
                          >
                            PDF
                          </button>
                          <button
                            type="button"
                            onClick={() => setActivePreview({ ...activePreview, viewMode: "ABSTRACT" })}
                            style={{
                              border: "none",
                              background: activePreview.viewMode === "ABSTRACT" ? "#ffffff" : "transparent",
                              color: activePreview.viewMode === "ABSTRACT" ? "#0f172a" : "#64748b",
                              fontWeight: activePreview.viewMode === "ABSTRACT" ? 700 : 500,
                              fontSize: 11,
                              padding: "3px 7px",
                              borderRadius: 4,
                              cursor: "pointer",
                              boxShadow: activePreview.viewMode === "ABSTRACT" ? "0 1px 2px rgba(0,0,0,0.05)" : "none",
                            }}
                          >
                            Abstrak
                          </button>
                        </div>
                      )}

                      {/* Action: Open source / publisher URL */}
                      {(activePreview.pdfUrl || activePreview.url || activePreview.doi) && (
                        <a
                          href={
                            activePreview.viewMode === "PDF" && activePreview.pdfUrl
                              ? activePreview.pdfUrl
                              : (activePreview.url || (activePreview.doi ? `https://doi.org/${activePreview.doi.replace(/^(https?:\/\/)?(dx\.)?doi\.org\//i, "").replace(/^doi:\s*/i, "")}` : "#"))
                          }
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            padding: "4px 9px",
                            borderRadius: 6,
                            background: "#f8fafc",
                            border: "1px solid #e2e8f0",
                            color: "#334155",
                            fontSize: 11,
                            fontWeight: 500,
                            textDecoration: "none",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 4,
                          }}
                          title="Buka berkas naskah / artikel asli di tab baru browser"
                        >
                          <ExternalLink size={12} />
                          <span>Tab Baru</span>
                        </a>
                      )}

                      {/* Action: Select candidate directly from split panel */}
                      {activePreview.isCandidate && activePreview.rawCandidate && (
                        (() => {
                          const paper = activePreview.rawCandidate;
                          const paperKey = paper.doi || paper.externalId;
                          const isImported =
                            importedIds.has(paperKey) ||
                            journals.some(
                              (j) =>
                                (paper.doi && j.doi && j.doi.toLowerCase() === paper.doi.toLowerCase()) ||
                                j.title.toLowerCase().trim() === paper.title.toLowerCase().trim()
                            );
                          const isQueued = pendingImports.has(paperKey);

                          if (isImported) {
                            return (
                              <span
                                style={{
                                  padding: "3px 8px",
                                  borderRadius: 6,
                                  fontSize: 11,
                                  fontWeight: 700,
                                  color: "#059669",
                                  background: "#ecfdf5",
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: 3,
                                }}
                              >
                                <Check size={12} /> Terpilih
                              </span>
                            );
                          }
                          if (isQueued) {
                            return (
                              <span
                                style={{
                                  padding: "3px 8px",
                                  borderRadius: 6,
                                  fontSize: 11,
                                  fontWeight: 600,
                                  color: "#d97706",
                                  background: "#fffbeb",
                                }}
                              >
                                Menyimpan...
                              </span>
                            );
                          }
                          return (
                            <button
                              type="button"
                              onClick={() => handleImportCandidate(paper)}
                              style={{
                                padding: "4px 10px",
                                borderRadius: 6,
                                fontSize: 11,
                                fontWeight: 700,
                                background: "#4f46e5",
                                color: "#ffffff",
                                border: "none",
                                cursor: "pointer",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 4,
                              }}
                            >
                              <Plus size={12} />
                              <span>Pilih Acuan</span>
                            </button>
                          );
                        })()
                      )}

                      {/* Close Button */}
                      <button
                        type="button"
                        onClick={() => setActivePreview(null)}
                        style={{
                          background: "transparent",
                          border: "none",
                          cursor: "pointer",
                          padding: "4px 7px",
                          borderRadius: 6,
                          color: "#64748b",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 3,
                          fontSize: 11.5,
                          fontWeight: 500,
                        }}
                        title="Tutup View"
                      >
                        <X size={15} />
                        <span>Tutup</span>
                      </button>
                    </div>
                  </div>

                  {/* Split Viewer Body */}
                  <div style={{ flex: 1, position: "relative", overflow: "hidden", background: "#f8fafc" }}>
                    {activePreview.viewMode === "PDF" && activePreview.pdfUrl ? (
                      <iframe
                        key={activePreview.pdfUrl}
                        src={getEmbeddablePdfUrl(activePreview.pdfUrl)}
                        title="Pratinjau Dokumen Jurnal"
                        style={{ width: "100%", height: "100%", border: "none", background: "#ffffff" }}
                      />
                    ) : (
                      /* Academic Abstract & Metadata Reader */
                      <div
                        style={{
                          height: "100%",
                          overflowY: "auto",
                          padding: "24px 22px",
                          background: "#ffffff",
                          display: "flex",
                          flexDirection: "column",
                          gap: 18,
                        }}
                      >
                        {/* Title, Authors & Meta */}
                        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                          <h3
                            style={{
                              fontSize: 16.5,
                              fontWeight: 800,
                              color: "#0f172a",
                              lineHeight: 1.4,
                              margin: 0,
                            }}
                          >
                            {activePreview.title}
                          </h3>

                          {activePreview.authors && (
                            <div style={{ fontSize: 13, color: "#475569", fontWeight: 500, lineHeight: 1.4 }}>
                              <span style={{ fontWeight: 600, color: "#334155" }}>Penulis: </span>
                              {activePreview.authors}
                            </div>
                          )}

                          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center", fontSize: 12, color: "#64748b" }}>
                            {activePreview.publication && (
                              <span style={{ background: "#f1f5f9", padding: "2px 8px", borderRadius: 6, fontWeight: 500 }}>
                                🏛️ {activePreview.publication}
                              </span>
                            )}
                            {activePreview.year && (
                              <span style={{ background: "#f1f5f9", padding: "2px 8px", borderRadius: 6, fontWeight: 500 }}>
                                📅 {activePreview.year}
                              </span>
                            )}
                            {activePreview.doi && (
                              <a
                                href={`https://doi.org/${activePreview.doi.replace(/^(https?:\/\/)?(dx\.)?doi\.org\//i, "").replace(/^doi:\s*/i, "")}`}
                                target="_blank"
                                rel="noreferrer"
                                style={{
                                  background: "#e0f2fe",
                                  color: "#0369a1",
                                  padding: "2px 8px",
                                  borderRadius: 6,
                                  fontWeight: 600,
                                  textDecoration: "none",
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: 4,
                                }}
                              >
                                DOI: {activePreview.doi}
                                <ExternalLink size={10} />
                              </a>
                            )}
                          </div>
                        </div>

                        {/* Academic Notice Banner */}
                        <div
                          style={{
                            padding: "12px 14px",
                            background: "#f8fafc",
                            border: "1px solid #e2e8f0",
                            borderRadius: 10,
                            fontSize: 12,
                            color: "#475569",
                            lineHeight: 1.5,
                            display: "flex",
                            alignItems: "flex-start",
                            gap: 8,
                          }}
                        >
                          <Sparkles size={16} color="#6366f1" style={{ flexShrink: 0, marginTop: 2 }} />
                          <div>
                            Artikel ini diindeks dari <strong>{activePreview.provider || "Indeks Akademik Global"}</strong>.
                            {activePreview.pdfUrl ? (
                              <span> Klik tab <strong>PDF</strong> di pojok kanan atas untuk melihat pratinjau dokumen.</span>
                            ) : (
                              <span> Naskah lengkap PDF berada di repositori penerbit/institusi terkait. Anda dapat mempelajari abstrak riset di bawah atau membuka situs resmi melalui tombol <strong>Tab Baru</strong>.</span>
                            )}
                          </div>
                        </div>

                        {/* Abstract Section */}
                        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                          <div style={{ fontSize: 13, fontWeight: 700, color: "#1e293b", textTransform: "uppercase", letterSpacing: 0.5 }}>
                            Abstrak / Ringkasan Penelitian
                          </div>
                          {activePreview.abstract ? (
                            <div
                              style={{
                                fontSize: 13.5,
                                lineHeight: 1.7,
                                color: "#334155",
                                background: "#fcfcfd",
                                padding: "16px 18px",
                                borderRadius: 10,
                                border: "1px solid #f1f5f9",
                                whiteSpace: "pre-wrap",
                              }}
                            >
                              {activePreview.abstract}
                            </div>
                          ) : (
                            <div
                              style={{
                                padding: "24px 16px",
                                textAlign: "center",
                                background: "#f8fafc",
                                borderRadius: 10,
                                border: "1px dashed #cbd5e1",
                                fontSize: 13,
                                color: "#64748b",
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                gap: 8,
                              }}
                            >
                              <BookOpen size={24} color="#94a3b8" />
                              <span>Ringkasan teks lengkap tidak disediakan langsung oleh penyedia metadata API.</span>
                              {(activePreview.url || activePreview.doi) && (
                                <a
                                  href={activePreview.url || (activePreview.doi ? `https://doi.org/${activePreview.doi.replace(/^(https?:\/\/)?(dx\.)?doi\.org\//i, "").replace(/^doi:\s*/i, "")}` : "#")}
                                  target="_blank"
                                  rel="noreferrer"
                                  style={{
                                    marginTop: 4,
                                    fontSize: 12,
                                    fontWeight: 600,
                                    color: "#4f46e5",
                                    textDecoration: "none",
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: 4,
                                  }}
                                >
                                  Buka artikel lengkap di situs penerbit <ExternalLink size={12} />
                                </a>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Bottom Candidate Action Bar if candidate */}
                        {activePreview.isCandidate && activePreview.rawCandidate && (
                          <div
                            style={{
                              marginTop: "auto",
                              paddingTop: 16,
                              borderTop: "1px solid #f1f5f9",
                              display: "flex",
                              justifyContent: "flex-end",
                            }}
                          >
                            {(() => {
                              const paper = activePreview.rawCandidate;
                              const paperKey = paper.doi || paper.externalId;
                              const isImported =
                                importedIds.has(paperKey) ||
                                journals.some(
                                  (j) =>
                                    (paper.doi && j.doi && j.doi.toLowerCase() === paper.doi.toLowerCase()) ||
                                    j.title.toLowerCase().trim() === paper.title.toLowerCase().trim()
                                );
                              const isQueued = pendingImports.has(paperKey);

                              if (isImported) {
                                return (
                                  <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#059669", fontWeight: 700, fontSize: 13 }}>
                                    <CheckCircle2 size={16} /> Jurnal ini sudah dipilih sebagai acuan riset
                                  </div>
                                );
                              }
                              return (
                                <Button
                                  size="sm"
                                  variant="primary"
                                  disabled={isQueued}
                                  onClick={() => handleImportCandidate(paper)}
                                  style={{ gap: 6 }}
                                >
                                  <Plus size={14} />
                                  <span>{isQueued ? "Sedang Menyimpan..." : "Jadikan Acuan Riset Ini"}</span>
                                </Button>
                              );
                            })()}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {/* ── METRIC STATS STRIP ── */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                  gap: 14,
                  marginBottom: 20,
                }}
              >
                <div
                  style={{
                    background: "var(--mesh-cyan)",
                    border: "1px solid #bae6fd",
                    borderRadius: 14,
                    padding: "14px 18px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <div>
                    <span style={{ fontSize: 12, fontWeight: 600, color: "#64748b" }}>Total Jurnal</span>
                    <div style={{ fontSize: 24, fontWeight: 800, color: "#0f172a", marginTop: 2 }}>
                      {stats.total}
                    </div>
                  </div>
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 8,
                      background: "#0284c7",
                      color: "#ffffff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <BookOpen size={18} />
                  </div>
                </div>

                <div
                  style={{
                    background: "var(--mesh-mint)",
                    border: "1px solid #bbf7d0",
                    borderRadius: 14,
                    padding: "14px 18px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <div>
                    <span style={{ fontSize: 12, fontWeight: 600, color: "#64748b" }}>Jurnal Disetujui</span>
                    <div style={{ fontSize: 24, fontWeight: 800, color: "#0f172a", marginTop: 2 }}>
                      {stats.approved}
                    </div>
                  </div>
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 8,
                      background: "#059669",
                      color: "#ffffff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <CheckCircle2 size={18} />
                  </div>
                </div>

                <div
                  style={{
                    background: "#fff1f2",
                    border: "1px solid #fecdd3",
                    borderRadius: 14,
                    padding: "14px 18px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <div>
                    <span style={{ fontSize: 12, fontWeight: 600, color: "#9f1239" }}>Ditolak / Di Luar Topik</span>
                    <div style={{ fontSize: 24, fontWeight: 800, color: "#881337", marginTop: 2 }}>
                      {stats.rejected}
                    </div>
                  </div>
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 8,
                      background: "#e11d48",
                      color: "#ffffff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <X size={18} />
                  </div>
                </div>

                <div
                  style={{
                    background: "var(--mesh-purple)",
                    border: "1px solid #e9d5ff",
                    borderRadius: 14,
                    padding: "14px 18px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <div>
                    <span style={{ fontSize: 12, fontWeight: 600, color: "#64748b" }}>Cross-Check Terpetakan</span>
                    <div style={{ fontSize: 24, fontWeight: 800, color: "#0f172a", marginTop: 2 }}>
                      {stats.totalMappings} Node
                    </div>
                  </div>
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 8,
                      background: "#7c3aed",
                      color: "#ffffff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Layers size={18} />
                  </div>
                </div>
              </div>

              {/* ── LIVE PROGRESS BAR & ESTIMASI WAKTU TEMPUH (GROQ AI) ── */}
              {aiProcessing && (
                <div
                  style={{
                    background: "linear-gradient(135deg, #f0fdf4 0%, #ecfeff 100%)",
                    border: "1px solid #a7f3d0",
                    borderRadius: 14,
                    padding: "16px 20px",
                    marginBottom: 20,
                    display: "flex",
                    flexDirection: "column",
                    gap: 10,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <Sparkles size={18} color="#059669" className="animate-spin" />
                      <span style={{ fontSize: 13, fontWeight: 700, color: "#065f46" }}>
                        {statusMessage || "Sedang menelaah artikel dengan Groq AI..."}
                      </span>
                    </div>
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 700,
                        color: "#0284c7",
                        background: "#e0f2fe",
                        padding: "3px 10px",
                        borderRadius: 9999,
                        border: "1px solid #bae6fd",
                      }}
                    >
                      ⏱️ Estimasi Waktu Tempuh: ~{estimatedSeconds}s (Groq Llama 3.3 70B Turbo)
                    </span>
                  </div>

                  {/* Native HTML <progress> Bar */}
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <progress
                      value={processingProgress}
                      max={100}
                      style={{
                        width: "100%",
                        height: 10,
                        borderRadius: 6,
                        accentColor: "#00C988",
                        overflow: "hidden",
                      }}
                    />
                    <span style={{ fontSize: 12, fontWeight: 700, color: "#059669", minWidth: 40 }}>
                      {processingProgress}%
                    </span>
                  </div>

                  <div style={{ fontSize: 11, color: "#047857" }}>
                    💡 Sistem memverifikasi keselarasan disiplin ilmu (Topik AI vs Disiplin Lain) agar artikel tidak relevan otomatis ditolak (Rejected).
                  </div>
                </div>
              )}

              {/* ── PURGE OFF-TOPIC REJECTED JOURNALS BANNER ── */}
              {stats.rejected > 0 && (
                <div
                  style={{
                    background: "#fff1f2",
                    border: "1px solid #fecdd3",
                    borderRadius: 12,
                    padding: "12px 18px",
                    marginBottom: 16,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    gap: 10,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <AlertCircle size={18} color="#e11d48" />
                    <span style={{ fontSize: 13, fontWeight: 700, color: "#881337" }}>
                      Ditemukan {stats.rejected} artikel jurnal yang di luar fokus topik skripsi (Ditolak AI).
                    </span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <button
                      onClick={handleScreenAll}
                      disabled={aiProcessing}
                      style={{
                        padding: "6px 14px",
                        borderRadius: 8,
                        background: "#0284c7",
                        border: "none",
                        color: "#ffffff",
                        fontSize: 12,
                        fontWeight: 700,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: 5,
                      }}
                    >
                      <Sparkles size={13} />
                      <span>{aiProcessing ? "Menelaah..." : "Telaah Ulang Semua AI"}</span>
                    </button>

                    <button
                      onClick={handlePurgeRejected}
                      style={{
                        padding: "6px 14px",
                        borderRadius: 8,
                        background: "#e11d48",
                        border: "none",
                        color: "#ffffff",
                        fontSize: 12,
                        fontWeight: 700,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: 5,
                      }}
                    >
                      <Trash2 size={13} />
                      <span>Hapus ({stats.rejected})</span>
                    </button>
                  </div>
                </div>
              )}

              {/* ── SEARCH & FILTER CONTROLS (SEAMLESS BORDERLESS) ── */}
              <div
                style={{
                  marginBottom: 16,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: 12,
                }}
              >
                <div style={{ position: "relative", flex: 1, minWidth: 260 }}>
                  <Search size={16} style={{ position: "absolute", left: 12, top: 11, color: "#94a3b8" }} />
                  <input
                    type="text"
                    placeholder="Cari judul, penulis, jurnal, atau abstrak..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{
                      width: "100%",
                      height: 38,
                      padding: "0 12px 0 36px",
                      borderRadius: 8,
                      border: "1px solid #e2e8f0",
                      background: "#f8fafc",
                      fontSize: 13,
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                  />
                </div>

                {/* Status Tabs */}
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  {[
                    { id: "ALL", label: "Semua" },
                    { id: "APPROVED", label: "Disetujui" },
                    { id: "UNDER_REVIEW", label: "Ditelaah" },
                    { id: "REJECTED", label: "Ditolak" },
                    { id: "CANDIDATE", label: "Kandidat" },
                  ].map((f) => (
                    <button
                      key={f.id}
                      onClick={() => setStatusFilter(f.id)}
                      style={{
                        padding: "6px 12px",
                        borderRadius: 6,
                        border: "1px solid",
                        borderColor: statusFilter === f.id ? "#0f172a" : "#e2e8f0",
                        background: statusFilter === f.id ? "#0f172a" : "#ffffff",
                        color: statusFilter === f.id ? "#ffffff" : "#475569",
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* ── FILTER VARIABEL & BATASAN RISET ── */}
              {(varX || varY || focusIssue || scope) && (
                <div
                  style={{
                    marginBottom: 16,
                    padding: "8px 12px",
                    background: "#fdfcff",
                    border: "1px solid #ede9fe",
                    borderRadius: 8,
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    flexWrap: "wrap",
                    fontFamily: "var(--font-poppins, 'Poppins', sans-serif)",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11.5, fontWeight: 600, color: "#6d28d9" }}>
                    <Filter size={13} />
                    <span>Filter Variabel & Batasan:</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setActiveVariableFilter(null)}
                    style={{
                      padding: "3px 10px",
                      borderRadius: 6,
                      border: "1px solid",
                      borderColor: !activeVariableFilter ? "#7c3aed" : "#e2e8f0",
                      background: !activeVariableFilter ? "#7c3aed" : "#ffffff",
                      color: !activeVariableFilter ? "#ffffff" : "#475569",
                      fontSize: 11,
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    Semua
                  </button>

                  {varX && (
                    <button
                      type="button"
                      onClick={() => setActiveVariableFilter(activeVariableFilter === varX ? null : varX)}
                      style={{
                        padding: "3px 10px",
                        borderRadius: 6,
                        border: "1px solid",
                        borderColor: activeVariableFilter === varX ? "#7c3aed" : "#d8b4fe",
                        background: activeVariableFilter === varX ? "#f3e8ff" : "#ffffff",
                        color: activeVariableFilter === varX ? "#6d28d9" : "#475569",
                        fontSize: 11,
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      Variabel X: {varX}
                    </button>
                  )}

                  {varY && (
                    <button
                      type="button"
                      onClick={() => setActiveVariableFilter(activeVariableFilter === varY ? null : varY)}
                      style={{
                        padding: "3px 10px",
                        borderRadius: 6,
                        border: "1px solid",
                        borderColor: activeVariableFilter === varY ? "#7c3aed" : "#d8b4fe",
                        background: activeVariableFilter === varY ? "#f3e8ff" : "#ffffff",
                        color: activeVariableFilter === varY ? "#6d28d9" : "#475569",
                        fontSize: 11,
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      Variabel Y: {varY}
                    </button>
                  )}

                  {focusIssue && (
                    <button
                      type="button"
                      onClick={() => setActiveVariableFilter(activeVariableFilter === focusIssue ? null : focusIssue)}
                      style={{
                        padding: "3px 10px",
                        borderRadius: 6,
                        border: "1px solid",
                        borderColor: activeVariableFilter === focusIssue ? "#7c3aed" : "#d8b4fe",
                        background: activeVariableFilter === focusIssue ? "#f3e8ff" : "#ffffff",
                        color: activeVariableFilter === focusIssue ? "#6d28d9" : "#475569",
                        fontSize: 11,
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      Fokus: {focusIssue}
                    </button>
                  )}

                  {scope && (
                    <button
                      type="button"
                      onClick={() => setActiveVariableFilter(activeVariableFilter === scope ? null : scope)}
                      style={{
                        padding: "3px 10px",
                        borderRadius: 6,
                        border: "1px solid",
                        borderColor: activeVariableFilter === scope ? "#7c3aed" : "#d8b4fe",
                        background: activeVariableFilter === scope ? "#f3e8ff" : "#ffffff",
                        color: activeVariableFilter === scope ? "#6d28d9" : "#475569",
                        fontSize: 11,
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                      title={scope}
                    >
                      Batasan: {scope.slice(0, 32)}...
                    </button>
                  )}

                  {activeVariableFilter && (
                    <button
                      type="button"
                      onClick={() => setActiveVariableFilter(null)}
                      style={{
                        background: "none",
                        border: "none",
                        color: "#94a3b8",
                        fontSize: 11,
                        display: "flex",
                        alignItems: "center",
                        gap: 3,
                        cursor: "pointer",
                        marginLeft: 4,
                      }}
                    >
                      <X size={12} />
                      <span>Reset Filter</span>
                    </button>
                  )}
                </div>
              )}

              {/* ── JOURNALS TABLE / EMPTY STATE ── */}
              {filteredJournals.length === 0 ? (
                <div
                  style={{
                    background: "#ffffff",
                    border: "1px solid #e2e8f0",
                    borderRadius: 14,
                    padding: "60px 24px",
                    textAlign: "center",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 14,
                  }}
                >
                  <div
                    style={{
                      width: 54,
                      height: 54,
                      borderRadius: 12,
                      background: "#f0fdf4",
                      border: "1px solid #dcfce7",
                      color: "#059669",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <BookOpen size={26} />
                  </div>

                  <div>
                    <h3 style={{ fontSize: 17, fontWeight: 700, color: "#0f172a", margin: "0 0 6px" }}>
                      {searchQuery ? "Tidak ada jurnal yang sesuai" : "Belum Ada Jurnal yang Diunggah"}
                    </h3>
                    <p style={{ fontSize: 13, color: "#64748b", margin: 0, maxWidth: 420 }}>
                      {searchQuery
                        ? "Coba gunakan kata kunci pencarian lain."
                        : "Unggah file PDF artikel ilmiah atau masukkan nomor DOI untuk memulai ekstraksi metadata & cross-check variabel secara otomatis."}
                    </p>
                  </div>

                  {!searchQuery && (
                    <div style={{ display: "flex", gap: 10, marginTop: 6 }}>
                      <label
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 6,
                          padding: "8px 16px",
                          borderRadius: 9999,
                          background: "#00C988",
                          color: "#ffffff",
                          fontSize: 13,
                          fontWeight: 600,
                          cursor: "pointer",
                        }}
                      >
                        <Upload size={14} />
                        <span>Upload PDF Pertama</span>
                        <input
                          type="file"
                          multiple
                          accept=".pdf,application/pdf"
                          onChange={handleFileUpload}
                          style={{ display: "none" }}
                        />
                      </label>
                      <Button variant="secondary" onClick={() => setShowDoiModal(true)}>
                        Lookup DOI
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div
                  style={{
                    background: "#ffffff",
                    border: "1px solid #e2e8f0",
                    borderRadius: 14,
                    overflow: "hidden",
                  }}
                >
                  <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: 13 }}>
                    <thead>
                      <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0", color: "#475569" }}>
                        <th style={{ padding: "12px 18px", fontWeight: 600 }}>Judul & Penulis</th>
                        <th style={{ padding: "12px 14px", fontWeight: 600, width: 130 }}>Publikasi / Tahun</th>
                        <th style={{ padding: "12px 14px", fontWeight: 600, width: 90 }}>Sumber</th>
                        <th style={{ padding: "12px 14px", fontWeight: 600, width: 140 }}>Status & Relevansi</th>
                        <th style={{ padding: "12px 14px", fontWeight: 600, width: 180 }}>Cross-Check Node</th>
                        <th style={{ padding: "12px 18px", fontWeight: 600, width: 170, textAlign: "right" }}>Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredJournals.map((journal) => {
                        const isRowProcessing = crossCheckingId === journal.id;
                        const isAutoChecking = autoCheckingId === journal.id;
                        const score = journal.relevanceScore ? Math.round(journal.relevanceScore) : null;

                        return (
                          <tr
                            key={journal.id}
                            style={{
                              borderBottom: "1px solid #f1f5f9",
                              verticalAlign: "top",
                              background: isAutoChecking
                                ? "#f0fdf4"
                                : journal.status === "REJECTED"
                                  ? "#fffdfd"
                                  : "#ffffff",
                              transition: "background 0.15s ease",
                            }}
                            onMouseEnter={(e) =>
                              (e.currentTarget.style.background = journal.status === "REJECTED" ? "#fef2f2" : "#fafafa")
                            }
                            onMouseLeave={(e) =>
                            (e.currentTarget.style.background = isAutoChecking
                              ? "#f0fdf4"
                              : journal.status === "REJECTED"
                                ? "#fffdfd"
                                : "#ffffff")
                            }
                          >
                            {/* Title & Authors */}
                            <td style={{ padding: "10px 16px", verticalAlign: "top" }}>
                              <Link
                                href={`/projects/${projectId}/journals/${journal.id}`}
                                style={{
                                  fontSize: 13.5,
                                  fontWeight: 700,
                                  color: journal.status === "REJECTED" ? "#64748b" : "#0f172a",
                                  textDecoration: "none",
                                  display: "block",
                                  lineHeight: 1.3,
                                  marginBottom: 3,
                                }}
                              >
                                {journal.title}
                              </Link>
                              <div style={{ fontSize: 11.5, color: "#64748b", display: "flex", flexWrap: "wrap", alignItems: "center", gap: 6 }}>
                                <span>{journal.authors || "Penulis tidak tertera"}</span>
                                {journal.doi && (() => {
                                  const cleanDoi = journal.doi.trim().replace(/^(https?:\/\/)?(dx\.)?doi\.org\//i, "").replace(/^doi:\s*/i, "");
                                  // Smart fallback: Jika ada URL asli publisher gunakan itu, jika tidak gunakan Google Scholar agar tidak pernah kena "DOI NOT FOUND"
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

                              {/* AI Explanation / Findings Box (Collapsible Dropdown Accordion) */}
                              {journal.keyFindings && (() => {
                                const isOpen = !!expandedAiAnalysis[journal.id];
                                return (
                                  <div
                                    style={{
                                      marginTop: 7,
                                      borderRadius: 8,
                                      background: journal.status === "REJECTED" ? "#fef2f2" : "#f0fdf4",
                                      border: journal.status === "REJECTED" ? "1px solid #fee2e2" : "1px solid #dcfce7",
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
                                        padding: "6px 10px",
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
                                          color: journal.status === "REJECTED" ? "#b91c1c" : "#047857",
                                        }}
                                      >
                                        <Sparkles size={13} color={journal.status === "REJECTED" ? "#dc2626" : "#059669"} />
                                        <span>Analisis & Relevansi AI</span>
                                      </div>

                                      <div
                                        style={{
                                          display: "inline-flex",
                                          alignItems: "center",
                                          gap: 3,
                                          fontSize: 10.5,
                                          fontWeight: 600,
                                          color: journal.status === "REJECTED" ? "#dc2626" : "#059669",
                                        }}
                                      >
                                        <span>{isOpen ? "Tutup" : "Lihat Detail"}</span>
                                        {isOpen ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                                      </div>
                                    </button>

                                    {isOpen && (
                                      <div
                                        style={{
                                          padding: "0 10px 8px 10px",
                                          borderTop: journal.status === "REJECTED" ? "1px dashed #fca5a5" : "1px dashed #bbf7d0",
                                          marginTop: 2,
                                          paddingTop: 6,
                                        }}
                                      >
                                        <p
                                          style={{
                                            margin: 0,
                                            fontSize: 12,
                                            color: journal.status === "REJECTED" ? "#7f1d1d" : "#14532d",
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

                              {/* Bank Kutipan Terverifikasi (Strict Provenance) */}
                              {journal.status !== "REJECTED" && renderCitationBank(journal)}
                            </td>

                            {/* Publication & Year */}
                            <td style={{ padding: "10px 12px", color: "#475569", verticalAlign: "top" }}>
                              <div style={{ fontWeight: 600, fontSize: 12.5 }}>{journal.publication || "-"}</div>
                              <div style={{ fontSize: 11.5, color: "#94a3b8" }}>{journal.year || "-"}</div>
                            </td>

                            {/* Source Type */}
                            <td style={{ padding: "10px 12px", verticalAlign: "top" }}>
                              <span
                                style={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: 3,
                                  fontSize: 10.5,
                                  fontWeight: 600,
                                  padding: "2px 6px",
                                  borderRadius: 6,
                                  background: journal.sourceType === "PDF" ? "#f0fdf4" : "#eff6ff",
                                  border: journal.sourceType === "PDF" ? "1px solid #bbf7d0" : "1px solid #bfdbfe",
                                  color: journal.sourceType === "PDF" ? "#166534" : "#1d4ed8",
                                }}
                              >
                                {journal.sourceType === "PDF" ? <FileText size={10} /> : <Globe size={10} />}
                                {journal.sourceType}
                              </span>
                            </td>

                            {/* Status & Relevansi Badge + Subtle Override */}
                            <td style={{ padding: "10px 12px", verticalAlign: "top" }}>
                              <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                                {/* AI auto-check in progress */}
                                {isAutoChecking && (
                                  <span
                                    style={{
                                      display: "inline-flex",
                                      alignItems: "center",
                                      gap: 4,
                                      padding: "2px 6px",
                                      borderRadius: 6,
                                      background: "#f0fdf4",
                                      border: "1px solid #86efac",
                                      color: "#059669",
                                      fontSize: 10.5,
                                      fontWeight: 700,
                                      animation: "pulse 1.4s ease-in-out infinite",
                                    }}
                                  >
                                    <Sparkles size={10} />
                                    AI Menelaah...
                                  </span>
                                )}
                                {journal.status === "APPROVED" && (
                                  <span
                                    style={{
                                      display: "inline-flex",
                                      alignItems: "center",
                                      gap: 3,
                                      padding: "2px 7px",
                                      borderRadius: 6,
                                      background: "#dcfce7",
                                      border: "1px solid #86efac",
                                      color: "#15803d",
                                      fontSize: 11,
                                      fontWeight: 700,
                                      width: "fit-content",
                                    }}
                                  >
                                    <CheckCircle2 size={11} />
                                    Disetujui {score ? `• ${score}%` : ""}
                                  </span>
                                )}

                                {journal.status === "REJECTED" && (
                                  <span
                                    style={{
                                      display: "inline-flex",
                                      alignItems: "center",
                                      gap: 3,
                                      padding: "2px 7px",
                                      borderRadius: 6,
                                      background: "#fee2e2",
                                      border: "1px solid #fca5a5",
                                      color: "#b91c1c",
                                      fontSize: 11,
                                      fontWeight: 700,
                                      width: "fit-content",
                                    }}
                                  >
                                    <X size={11} />
                                    Ditolak {score ? `• ${score}%` : ""}
                                  </span>
                                )}

                                {journal.status === "UNDER_REVIEW" && (
                                  <span
                                    style={{
                                      display: "inline-flex",
                                      alignItems: "center",
                                      gap: 3,
                                      padding: "2px 7px",
                                      borderRadius: 6,
                                      background: "#fef3c7",
                                      border: "1px solid #fde68a",
                                      color: "#b45309",
                                      fontSize: 11,
                                      fontWeight: 700,
                                      width: "fit-content",
                                    }}
                                  >
                                    <Clock size={11} />
                                    Ditelaah
                                  </span>
                                )}

                                {journal.status === "CANDIDATE" && (
                                  <span
                                    style={{
                                      display: "inline-flex",
                                      alignItems: "center",
                                      gap: 3,
                                      padding: "2px 7px",
                                      borderRadius: 6,
                                      background: "#f1f5f9",
                                      border: "1px solid #cbd5e1",
                                      color: "#475569",
                                      fontSize: 11,
                                      fontWeight: 700,
                                      width: "fit-content",
                                    }}
                                  >
                                    Kandidat
                                  </span>
                                )}
                              </div>
                            </td>

                            {/* Cross-Check Mapped Nodes (Compact & Collapsible) */}
                            <td style={{ padding: "10px 12px", verticalAlign: "top", maxWidth: 210 }}>
                              {journal.nodeMappings && journal.nodeMappings.length > 0 ? (
                                (() => {
                                  const isExpanded = !!expandedNodeJournals[journal.id];
                                  const displayList = isExpanded
                                    ? journal.nodeMappings
                                    : journal.nodeMappings.slice(0, 2);
                                  const remainingCount = journal.nodeMappings.length - 2;

                                  return (
                                    <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                                      <div style={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
                                        {displayList.map((m) => (
                                          <span
                                            key={m.id}
                                            style={{
                                              display: "inline-flex",
                                              alignItems: "center",
                                              gap: 3,
                                              fontSize: 10.5,
                                              fontWeight: 600,
                                              padding: "1.5px 6px",
                                              borderRadius: 4,
                                              background: m.evidenceType === "SUPPORTS" ? "#dcfce7" : "#fee2e2",
                                              color: m.evidenceType === "SUPPORTS" ? "#166534" : "#991b1b",
                                              maxWidth: 190,
                                              whiteSpace: "nowrap",
                                              overflow: "hidden",
                                              textOverflow: "ellipsis",
                                            }}
                                            title={m.node?.label}
                                          >
                                            <Network size={9} style={{ flexShrink: 0 }} />
                                            <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>
                                              {m.node?.label || "Node"}
                                            </span>
                                          </span>
                                        ))}
                                      </div>
                                      {remainingCount > 0 && (
                                        <button
                                          type="button"
                                          onClick={() =>
                                            setExpandedNodeJournals((prev) => ({
                                              ...prev,
                                              [journal.id]: !isExpanded,
                                            }))
                                          }
                                          style={{
                                            background: "none",
                                            border: "none",
                                            padding: 0,
                                            fontSize: 10.5,
                                            fontWeight: 700,
                                            color: "#0284c7",
                                            cursor: "pointer",
                                            textAlign: "left",
                                            width: "fit-content",
                                            marginTop: 1,
                                          }}
                                        >
                                          {isExpanded ? "▲ Ciutkan" : `+${remainingCount} node lainnya...`}
                                        </button>
                                      )}
                                    </div>
                                  );
                                })()
                              ) : (
                                <span style={{ fontSize: 11.5, color: "#94a3b8" }}>
                                  {journal.status === "REJECTED" ? "Tidak dipetakan" : "Belum dipetakan"}
                                </span>
                              )}
                            </td>

                            {/* Actions: Baca, Re-Screen AI, Setujui & Hapus */}
                            <td style={{ padding: "10px 16px", textAlign: "right", verticalAlign: "top" }}>
                              <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 5, flexWrap: "wrap" }}>
                                {/* Re-Screen Button */}
                                <button
                                  onClick={() => handleScreenJournal(journal.id)}
                                  title="Telaah Ulang dengan AI"
                                  disabled={isAutoChecking}
                                  style={{
                                    padding: "4px 8px",
                                    borderRadius: 6,
                                    background: "#f0fdf4",
                                    border: "1px solid #86efac",
                                    color: "#166534",
                                    fontSize: 11,
                                    fontWeight: 600,
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: 3,
                                    cursor: "pointer",
                                  }}
                                >
                                  <Sparkles size={11} />
                                  <span>Telaah AI</span>
                                </button>

                                {/* Manual Approve button if Rejected */}
                                {journal.status === "REJECTED" && (
                                  <button
                                    onClick={() => handleStatusChange(journal.id, "APPROVED")}
                                    title="Setujui Secara Manual"
                                    style={{
                                      padding: "4px 8px",
                                      borderRadius: 6,
                                      background: "#ecfeff",
                                      border: "1px solid #a5f3fc",
                                      color: "#0e7490",
                                      fontSize: 11,
                                      fontWeight: 600,
                                      display: "inline-flex",
                                      alignItems: "center",
                                      gap: 3,
                                      cursor: "pointer",
                                    }}
                                  >
                                    <CheckCircle2 size={11} />
                                    <span>Setujui</span>
                                  </button>
                                )}

                                {/* Baca */}
                                <Link
                                  href={`/projects/${projectId}/journals/${journal.id}`}
                                  style={{
                                    padding: "4px 8px",
                                    borderRadius: 6,
                                    background: "#f8fafc",
                                    border: "1px solid #e2e8f0",
                                    color: "#334155",
                                    fontSize: 11,
                                    fontWeight: 600,
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: 3,
                                    textDecoration: "none",
                                  }}
                                >
                                  <Eye size={11} />
                                  <span>Baca</span>
                                </Link>

                                {/* Hapus */}
                                <button
                                  onClick={() => handleDeleteJournal(journal.id, journal.title)}
                                  title="Hapus Jurnal"
                                  style={{
                                    background: "transparent",
                                    border: "none",
                                    padding: "4px 5px",
                                    borderRadius: 6,
                                    cursor: "pointer",
                                    color: "#94a3b8",
                                    display: "inline-flex",
                                    alignItems: "center",
                                  }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.color = "#ef4444";
                                    e.currentTarget.style.background = "#fee2e2";
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.color = "#94a3b8";
                                    e.currentTarget.style.background = "transparent";
                                  }}
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </main>

        {/* ── MODAL: LOOKUP DOI ── */}
        {showDoiModal && (
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
            onClick={() => setShowDoiModal(false)}
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
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Globe size={18} color="#00C988" />
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: "#0f172a", margin: 0 }}>
                    Lookup Metadata via DOI
                  </h3>
                </div>
                <button
                  onClick={() => setShowDoiModal(false)}
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

              <p style={{ fontSize: 13, color: "#64748b", margin: "0 0 14px", lineHeight: 1.4 }}>
                Masukkan Digital Object Identifier (DOI) jurnal. Sistem akan otomatis menarik judul, penulis, tahun, dan abstrak dari basis data CrossRef.
              </p>

              {doiError && (
                <div
                  style={{
                    padding: "8px 12px",
                    borderRadius: 8,
                    background: "#fef2f2",
                    border: "1px solid #fecaca",
                    color: "#991b1b",
                    fontSize: 12,
                    marginBottom: 12,
                  }}
                >
                  {doiError}
                </div>
              )}

              <form onSubmit={handleDoiLookup} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <Input
                  id="doi-input"
                  label="Nomor DOI *"
                  placeholder="Contoh: 10.1016/j.compedu.2023.104780"
                  value={doiInput}
                  onChange={(e) => setDoiInput(e.target.value)}
                  required
                />

                <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 4 }}>
                  <Button variant="secondary" onClick={() => setShowDoiModal(false)}>
                    Batal
                  </Button>
                  <Button type="submit" disabled={doiLoading} variant="emerald">
                    {doiLoading ? "Mencari Metadata..." : "Cari & Tambahkan"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ── MODAL: MANUAL ENTRY ── */}
        {showManualModal && (
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
            onClick={() => setShowManualModal(false)}
          >
            <div
              style={{
                width: "100%",
                maxWidth: 520,
                maxHeight: "90vh",
                overflowY: "auto",
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
                  Tambah Jurnal Manual
                </h3>
                <button
                  onClick={() => setShowManualModal(false)}
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

              <form onSubmit={handleCreateManual} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <Input
                  id="manual-title"
                  label="Judul Artikel Jurnal *"
                  placeholder="Contoh: The Impact of Artificial Intelligence in Higher Education"
                  value={manualTitle}
                  onChange={(e) => setManualTitle(e.target.value)}
                  required
                />

                <Input
                  id="manual-authors"
                  label="Penulis / Authors"
                  placeholder="Contoh: John Doe, Jane Smith"
                  value={manualAuthors}
                  onChange={(e) => setManualAuthors(e.target.value)}
                />

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <Input
                    id="manual-year"
                    label="Tahun Terbit"
                    placeholder="Contoh: 2024"
                    value={manualYear}
                    onChange={(e) => setManualYear(e.target.value)}
                  />
                  <Input
                    id="manual-pub"
                    label="Nama Jurnal / Prosiding"
                    placeholder="Contoh: Computers & Education"
                    value={manualPublication}
                    onChange={(e) => setManualPublication(e.target.value)}
                  />
                </div>

                <Input
                  id="manual-doi"
                  label="DOI (Opsional)"
                  placeholder="Contoh: 10.1016/j.compedu.2023.104780"
                  value={manualDoi}
                  onChange={(e) => setManualDoi(e.target.value)}
                />

                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: "#0f172a" }}>
                    Abstrak Artikel
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Salin teks abstrak jurnal di sini..."
                    value={manualAbstract}
                    onChange={(e) => setManualAbstract(e.target.value)}
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

                <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 4 }}>
                  <Button variant="secondary" onClick={() => setShowManualModal(false)}>
                    Batal
                  </Button>
                  <Button type="submit" disabled={savingManual} variant="emerald">
                    {savingManual ? "Menyimpan..." : "Simpan Jurnal"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>{/* end right main content */}
    </div>
  );
}
