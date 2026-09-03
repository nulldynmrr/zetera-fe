"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
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
} from "lucide-react";

import { Button } from "@/components/ui/Button";
import { ProjectSidebar } from "@/components/ui/ProjectSidebar";
import { Input } from "@/components/ui/Input";
import { useRequireAuth } from "@/lib/auth-context";
import {
  api,
  type ResearchProject,
  type Journal,
  type JournalStatus,
  type JournalSourceType,
  type NormalizedPaper,
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

  // ── Journal Discovery (cari jurnal by topik) ──
  const [showDiscovery, setShowDiscovery] = useState(false);
  const [discoveryQuery, setDiscoveryQuery] = useState("");
  const [discoveryDomain, setDiscoveryDomain] = useState<"GENERAL" | "HEALTH" | "AI_CS">("GENERAL");
  const [discoveryLoading, setDiscoveryLoading] = useState(false);
  const [discoveryResults, setDiscoveryResults] = useState<NormalizedPaper[]>([]);
  const [discoveryMeta, setDiscoveryMeta] = useState<{ searchId: string; tookMs: number; expandedQuery: string; domainHint: string } | null>(null);
  const [importingId, setImportingId] = useState<string | null>(null);
  const [importedIds, setImportedIds] = useState<Set<string>>(new Set());

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
      alert("Unggah jurnal terlebih dahulu sebelum melakukan telaah AI.");
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
    } catch (err: any) {
      alert(err.message || "Gagal menjalankan telaah AI");
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
    } catch (err: any) {
      alert(err.message || "Gagal melakukan Cross-Check AI");
      setAiProcessing(false);
      setCrossCheckingId(null);
      setStatusMessage("");
    }
  };

  // Filtered journals
  const filteredJournals = useMemo(() => {
    return journals.filter((j) => {
      const matchSearch =
        j.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (j.authors && j.authors.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (j.publication && j.publication.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (j.abstract && j.abstract.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchStatus = statusFilter === "ALL" || j.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [journals, searchQuery, statusFilter]);

  // Handle PDF File Upload (Progressive Multi-Upload max 10 files)
  const [uploadStepInfo, setUploadStepInfo] = useState<string | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const pdfFiles = Array.from(files).filter(
      (f) => f.type === "application/pdf" || f.name.endsWith(".pdf")
    );

    if (pdfFiles.length === 0) {
      alert("Hanya file dokumen PDF yang dapat diunggah");
      return;
    }

    const maxFiles = pdfFiles.slice(0, 10);
    if (pdfFiles.length > 10) {
      alert("Maksimal 10 file PDF sekaligus. Memproses 10 file pertama...");
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
    } catch (err: any) {
      alert(err.message || "Gagal mengunggah dan membaca PDF");
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
      alert("✓ Ekstraksi teks PDF lokal berhasil diperbarui.");
    } catch (err: any) {
      alert(err.message || "Gagal mengekstrak PDF");
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
    } catch (err: any) {
      alert(err.message || "Gagal melakukan screening AI");
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
    } catch (err: any) {
      alert(err.message || "Gagal memperbarui status jurnal");
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
    } catch (err: any) {
      alert(err.message || "Gagal menyimpan jurnal");
    } finally {
      setSavingManual(false);
    }
  };

  // Delete Journal
  const handleDeleteJournal = async (journalId: string, title: string) => {
    if (!confirm(`Hapus jurnal "${title}" dari library project ini?`)) return;

    try {
      await api.journals.delete(projectId, journalId);
      setJournals((prev) => prev.filter((j) => j.id !== journalId));
    } catch (err: any) {
      alert(err.message || "Gagal menghapus jurnal");
    }
  };

  // Purge all rejected off-topic journals
  const handlePurgeRejected = async () => {
    if (!confirm(`Hapus semua ${stats.rejected} jurnal yang di luar topik dari project ini?`)) return;

    try {
      await api.journals.purgeRejected(projectId);
      setJournals((prev) => prev.filter((j) => j.status !== "REJECTED"));
    } catch (err: any) {
      alert(err.message || "Gagal membersihkan jurnal yang ditolak");
    }
  };

  // Update Status Quick Action
  const handleUpdateStatus = async (journalId: string, status: JournalStatus) => {
    try {
      await api.journals.update(projectId, journalId, { status });
      setJournals((prev) =>
        prev.map((j) => (j.id === journalId ? { ...j, status } : j))
      );
    } catch (err: any) {
      alert(err.message || "Gagal memperbarui status");
    }
  };

  // ── Journal Discovery Handlers ──────────────────────────
  const handleDiscoverySearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!discoveryQuery.trim()) return;

    try {
      setDiscoveryLoading(true);
      setDiscoveryResults([]);
      setDiscoveryMeta(null);

      const res = await api.journals.discovery.search(projectId, {
        query: discoveryQuery.trim(),
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
      alert(err.message || "Pencarian jurnal gagal. Coba lagi.");
    } finally {
      setDiscoveryLoading(false);
    }
  };

  const handleImportCandidate = async (candidate: NormalizedPaper) => {
    const uniqueKey = candidate.doi || candidate.externalId;
    try {
      setImportingId(uniqueKey);
      const res = await api.journals.discovery.import(projectId, candidate);

      setJournals((prev) => [res.journal, ...prev.filter((j) => j.id !== res.journal.id)]);
      setImportedIds((prev) => new Set([...prev, uniqueKey]));
    } catch (err: any) {
      alert(err.message || "Gagal mengimpor jurnal");
    } finally {
      setImportingId(null);
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
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: "100vh", overflow: "hidden" }}>
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
                    fontSize: 16,
                    fontWeight: 700,
                    color: "#0f172a",
                    margin: 0,
                  }}
                >
                  {project?.title || "Library Jurnal"}
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
                    }}
                  >
                    {project.field}
                  </span>
                )}
              </div>
              <span style={{ fontSize: 12, color: "#64748b" }}>
                Fase 2: Manajemen Literatur & Cross-Check Bukti
              </span>
            </div>
          </div>

          {/* Center: Quick Links */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Link
              href={`/projects/${projectId}/framework`}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                fontSize: 12,
                fontWeight: 600,
                padding: "6px 12px",
                borderRadius: 8,
                background: "#f8fafc",
                border: "1px solid #e2e8f0",
                color: "#334155",
                textDecoration: "none",
              }}
            >
              <Network size={14} color="#00C988" />
              <span>Kanvas Framework</span>
            </Link>
          </div>

          {/* Right: Import Actions */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {/* Discovery: Cari Jurnal by Topik */}
            <button
              id="btn-discovery-open"
              onClick={() => { setShowDiscovery(true); setDiscoveryResults([]); setDiscoveryMeta(null); }}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "7px 14px",
                borderRadius: 9999,
                background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
                color: "#ffffff",
                fontSize: 13,
                fontWeight: 700,
                cursor: "pointer",
                border: "none",
                boxShadow: "0 2px 8px rgba(99,102,241,0.35)",
              }}
            >
              <Telescope size={14} />
              <span>Cari Jurnal by Topik</span>
            </button>

            {/* Upload PDF */}
            <label
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "7px 14px",
                borderRadius: 9999,
                background: "#00C988",
                color: "#ffffff",
                fontSize: 13,
                fontWeight: 600,
                cursor: uploadingPdf ? "not-allowed" : "pointer",
                border: "none",
              }}
            >
              <Upload size={14} />
              <span>{uploadingPdf ? "Mengekstrak PDF..." : "Upload PDF Jurnal"}</span>
              <input
                type="file"
                multiple
                accept=".pdf,application/pdf"
                onChange={handleFileUpload}
                disabled={uploadingPdf}
                style={{ display: "none" }}
              />
            </label>

            {/* DOI Lookup */}
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowDoiModal(true)}
              icon={<Globe size={14} />}
            >
              Input DOI
            </Button>

            {/* Manual */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowManualModal(true)}
              icon={<Plus size={14} />}
            >
              Manual
            </Button>
          </div>
        </header>

        {/* ── JOURNAL DISCOVERY SIDE DRAWER ── */}
        {showDiscovery && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 9999,
              display: "flex",
              alignItems: "stretch",
              justifyContent: "flex-end",
            }}
          >
            <div
              onClick={() => setShowDiscovery(false)}
              style={{ position: "absolute", inset: 0, background: "rgba(15,23,42,0.5)", backdropFilter: "blur(3px)" }}
            />
            <div
              style={{
                position: "relative",
                width: "min(680px, 96vw)",
                background: "#fff",
                boxShadow: "-6px 0 36px rgba(0,0,0,0.18)",
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
              }}
            >
              {/* Header */}
              <div style={{ background: "linear-gradient(135deg,#6366f1 0%,#8b5cf6 100%)", padding: "20px 24px 16px", color: "#fff", flexShrink: 0 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <Telescope size={22} />
                    <span style={{ fontSize: 17, fontWeight: 800 }}>Cari Jurnal by Topik</span>
                  </div>
                  <button onClick={() => setShowDiscovery(false)} style={{ background: "rgba(255,255,255,0.2)", border: "none", borderRadius: 8, width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#fff" }}>
                    <X size={16} />
                  </button>
                </div>
                <p style={{ margin: 0, fontSize: 12.5, opacity: 0.9 }}>Cari ke OpenAlex · Semantic Scholar · CORE · PubMed · arXiv · Crossref secara paralel dalam &lt;3 detik.</p>
              </div>

              {/* Search Form */}
              <form onSubmit={handleDiscoverySearch} style={{ padding: "14px 24px 12px", borderBottom: "1px solid #e2e8f0", background: "#fafafa", flexShrink: 0 }}>
                <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                  <input
                    id="discovery-query-input"
                    type="text"
                    value={discoveryQuery}
                    onChange={(e) => setDiscoveryQuery(e.target.value)}
                    placeholder={project?.title ? `Cari jurnal untuk "${project.title.slice(0, 40)}"...` : "Ketik topik penelitian..."}
                    style={{ flex: 1, padding: "9px 14px", borderRadius: 10, border: "1.5px solid #c7d2fe", fontSize: 13.5, fontFamily: "inherit", outline: "none", background: "#fff", color: "#0f172a" }}
                  />
                  <button
                    type="submit"
                    disabled={discoveryLoading || !discoveryQuery.trim()}
                    style={{ padding: "9px 18px", borderRadius: 10, border: "none", background: discoveryLoading ? "#a5b4fc" : "linear-gradient(135deg,#6366f1 0%,#8b5cf6 100%)", color: "#fff", fontWeight: 700, fontSize: 13, cursor: discoveryLoading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: 6 }}
                  >
                    {discoveryLoading ? <RefreshCw size={14} /> : <Search size={14} />}
                    {discoveryLoading ? "Mencari..." : "Cari"}
                  </button>
                </div>
                <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  <span style={{ fontSize: 11.5, color: "#64748b", fontWeight: 600 }}>Domain:</span>
                  {(["GENERAL", "HEALTH", "AI_CS"] as const).map((d) => (
                    <button key={d} type="button" onClick={() => setDiscoveryDomain(d)}
                      style={{ padding: "3px 10px", borderRadius: 9999, border: `1.5px solid ${discoveryDomain === d ? "#6366f1" : "#e2e8f0"}`, background: discoveryDomain === d ? "#eef2ff" : "#fff", color: discoveryDomain === d ? "#4338ca" : "#64748b", fontWeight: discoveryDomain === d ? 700 : 500, fontSize: 11.5, cursor: "pointer" }}
                    >
                      {d === "GENERAL" ? "🔬 Umum" : d === "HEALTH" ? "🏥 Kesehatan" : "💻 AI / CS"}
                    </button>
                  ))}
                </div>
              </form>

              {/* Results */}
              <div style={{ flex: 1, overflowY: "auto", padding: "0 24px 24px" }}>
                {discoveryMeta && !discoveryLoading && (
                  <div style={{ padding: "8px 0", fontSize: 12, color: "#64748b", display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <span style={{ background: "#f1f5f9", padding: "2px 8px", borderRadius: 6 }}><Zap size={10} style={{ marginRight: 2, verticalAlign: "middle" }} />{(discoveryMeta.tookMs / 1000).toFixed(1)}s</span>
                    <span style={{ background: "#f1f5f9", padding: "2px 8px", borderRadius: 6 }}>{discoveryResults.length} hasil</span>
                    {discoveryMeta.expandedQuery !== discoveryQuery && <span style={{ color: "#8b5cf6", fontStyle: "italic", fontSize: 11 }}>Diperluas: "{discoveryMeta.expandedQuery}"</span>}
                  </div>
                )}

                {discoveryLoading && (
                  <div style={{ padding: "52px 0", textAlign: "center", color: "#6366f1" }}>
                    <Sparkles size={28} style={{ marginBottom: 10 }} />
                    <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 6 }}>Mencari di 6+ provider akademik secara paralel...</div>
                    <div style={{ fontSize: 12, color: "#94a3b8" }}>OpenAlex · Semantic Scholar · CORE · PubMed · arXiv · Crossref</div>
                  </div>
                )}

                {!discoveryLoading && discoveryMeta === null && (
                  <div style={{ padding: "60px 0", textAlign: "center" }}>
                    <Telescope size={40} style={{ color: "#c7d2fe", marginBottom: 12 }} />
                    <div style={{ fontSize: 14, fontWeight: 600, color: "#64748b", marginBottom: 6 }}>Ketikkan topik penelitian untuk mulai mencari</div>
                    <div style={{ fontSize: 12, color: "#94a3b8" }}>Bisa pakai Bahasa Indonesia — AI menerjemahkan otomatis</div>
                  </div>
                )}

                {!discoveryLoading && discoveryResults.length === 0 && discoveryMeta !== null && (
                  <div style={{ padding: "48px 0", textAlign: "center" }}>
                    <AlertCircle size={28} style={{ color: "#f59e0b", marginBottom: 8 }} />
                    <div style={{ fontSize: 13, color: "#64748b", fontWeight: 600 }}>Tidak ada hasil. Coba kata kunci Bahasa Inggris atau domain lain.</div>
                  </div>
                )}

                {!discoveryLoading && discoveryResults.map((paper, idx) => {
                  const uniqueKey = paper.doi || paper.externalId;
                  const isImported = importedIds.has(uniqueKey);
                  const isImporting = importingId === uniqueKey;
                  const providerColors: Record<string, string> = { OPENALEX: "#0284c7", SEMANTIC_SCHOLAR: "#9333ea", CORE: "#d97706", PUBMED: "#059669", ARXIV: "#dc2626", CROSSREF: "#64748b" };
                  const pColor = providerColors[paper.provider] || "#64748b";

                  return (
                    <div key={`${uniqueKey}-${idx}`} style={{ borderBottom: "1px solid #f1f5f9", padding: "14px 0", opacity: isImported ? 0.65 : 1 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 13.5, fontWeight: 700, color: "#0f172a", lineHeight: 1.4, marginBottom: 4 }}>
                            {paper.url ? (
                              <a href={paper.url} target="_blank" rel="noreferrer" style={{ color: "#0f172a", textDecoration: "none" }}>
                                {paper.title} <ExternalLink size={11} style={{ opacity: 0.4, verticalAlign: "middle" }} />
                              </a>
                            ) : paper.title}
                          </div>
                          <div style={{ fontSize: 11.5, color: "#64748b", marginBottom: 5 }}>
                            {paper.authors && <span>{paper.authors.slice(0, 80)}{paper.authors.length > 80 ? "..." : ""}</span>}
                            {paper.year && <span style={{ marginLeft: 8, fontWeight: 600, color: "#475569" }}>{paper.year}</span>}
                            {paper.publication && <span style={{ marginLeft: 8, fontStyle: "italic" }}>· {paper.publication.slice(0, 50)}</span>}
                          </div>
                          <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                            <span style={{ padding: "1px 7px", borderRadius: 9999, fontSize: 10.5, fontWeight: 700, background: pColor + "18", color: pColor, border: `1px solid ${pColor}30` }}>{paper.provider}</span>
                            {paper.citedByCount > 0 && <span style={{ padding: "1px 7px", borderRadius: 9999, fontSize: 10.5, background: "#f8fafc", color: "#64748b", border: "1px solid #e2e8f0" }}><Star size={9} style={{ marginRight: 2, verticalAlign: "middle" }} />{paper.citedByCount.toLocaleString()}</span>}
                            {paper.openAccessPdfUrl && <a href={paper.openAccessPdfUrl} target="_blank" rel="noreferrer" style={{ padding: "1px 7px", borderRadius: 9999, fontSize: 10.5, fontWeight: 600, background: "#ecfdf5", color: "#059669", border: "1px solid #a7f3d0", textDecoration: "none" }}>PDF Gratis</a>}
                            {paper.isRetracted && <span style={{ padding: "1px 7px", borderRadius: 9999, fontSize: 10.5, fontWeight: 700, background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca" }}>⚠ RETRACTED</span>}
                            {paper.isInDoaj && <span style={{ padding: "1px 7px", borderRadius: 9999, fontSize: 10.5, background: "#fffbeb", color: "#d97706", border: "1px solid #fed7aa" }}>DOAJ ✓</span>}
                          </div>
                          {paper.abstract && <div style={{ fontSize: 11.5, color: "#64748b", marginTop: 6, lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{paper.abstract}</div>}
                        </div>
                        <button
                          disabled={isImported || isImporting || paper.isRetracted}
                          onClick={() => handleImportCandidate(paper)}
                          style={{ flexShrink: 0, padding: "6px 12px", borderRadius: 8, border: "none", background: isImported ? "#f0fdf4" : isImporting ? "#e0e7ff" : "#6366f1", color: isImported ? "#059669" : isImporting ? "#6366f1" : "#fff", fontSize: 12, fontWeight: 700, cursor: (isImported || isImporting || paper.isRetracted) ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: 5, minWidth: 90, justifyContent: "center" }}
                        >
                          {isImported ? <><CheckCircle2 size={13} /> Tersimpan</> : isImporting ? <><RefreshCw size={13} /> Menyimpan...</> : <><Download size={13} /> Import</>}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

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
                boxShadow: "0 4px 12px rgba(0, 201, 136, 0.08)",
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
                    boxShadow: "0 2px 6px rgba(2, 132, 199, 0.2)",
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
                    boxShadow: "0 2px 6px rgba(225, 29, 72, 0.2)",
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
