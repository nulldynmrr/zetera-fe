"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ShieldCheck,
  KeyRound,
  Users,
  Database,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  LogOut,
  ArrowUpRight,
  Zap,
  BookOpen,
  FolderGit2,
  Plus,
  Trash2,
  Pencil,
  Bell,
  Cpu,
  Coins,
  TrendingUp,
  Sliders,
  DollarSign,
  BarChart3,
  Percent,
  Sparkles,
  Play,
  FileText,
  Copy,
  Download,
  Eye,
  Code,
  SlidersHorizontal,
  Layers,
  GraduationCap,
  Check,
  HelpCircle,
  Save,
  ExternalLink,
  Search,
  Settings2,
  FileCode,
  CheckSquare,
  FileEdit,
  Undo,
  PlayCircle,
  EyeOff,
  Maximize2,
  ListOrdered,
  X,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { api, ProposalTemplate, AiSkillPrompt } from "@/lib/api-client";

type AdminTab = "AI_ENGINE" | "PROMPTS_SKILLS" | "PRICING" | "TEMPLATES_LIBRARY" | "DASHBOARD" | "SECRETS" | "USERS";

export default function AdminDashboardPage() {
  const router = useRouter();
  const { user, logout, isLoading } = useAuth();

  const [activeTab, setActiveTab] = useState<AdminTab>("AI_ENGINE");

  const [stats, setStats] = useState<any>(null);
  const [billingConfig, setBillingConfig] = useState<any>(null);
  const [aiModels, setAiModels] = useState<any[]>([]);
  const [featureRoutings, setFeatureRoutings] = useState<any[]>([]);
  const [creditPackages, setCreditPackages] = useState<any[]>([]);
  const [usageLogs, setUsageLogs] = useState<any[]>([]);
  const [configs, setConfigs] = useState<any[]>([]);
  const [presets, setPresets] = useState<any[]>([]);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [promptsList, setPromptsList] = useState<AiSkillPrompt[]>([]);
  const [loading, setLoading] = useState(true);

  // Prompts & Skills Admin State
  const [promptSubTab, setPromptSubTab] = useState<"RECIPES" | "WRITING_STYLES" | "CODE_BINDING">("RECIPES");
  const [promptCategoryFilter, setPromptCategoryFilter] = useState<string>("ALL");
  const [promptTagFilter, setPromptTagFilter] = useState<string | null>(null);
  const [promptSearchQuery, setPromptSearchQuery] = useState("");
  const [copiedPromptCode, setCopiedPromptCode] = useState<string | null>(null);

  const [showPromptModal, setShowPromptModal] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState<AiSkillPrompt | null>(null);
  const [isCreatingPrompt, setIsCreatingPrompt] = useState(false);
  const [savingPrompt, setSavingPrompt] = useState(false);
  const [promptFormData, setPromptFormData] = useState({
    code: "",
    title: "",
    category: "SUBCHAPTER",
    tags: "",
    description: "",
    systemPrompt: "",
    recipeSteps: [] as string[],
    isActive: true,
  });
  const [newStepInput, setNewStepInput] = useState("");

  const [feedbackMsg, setFeedbackMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [modelTestingId, setModelTestingId] = useState<string | null>(null);
  const [modelTestStatus, setModelTestStatus] = useState<{ [id: string]: { ok: boolean; msg: string } }>({});

  const [showModelModal, setShowModelModal] = useState(false);
  const [editingModelId, setEditingModelId] = useState<string | null>(null);
  const [modelFormData, setModelFormData] = useState({
    routerLabel: "MAIA ROUTER",
    baseUrl: "https://api.maiarouter.ai/v1",
    modelName: "xai/grok-4-1-fast-non-reasoning",
    apiKey: "",
    modelKind: "LLM",
    pricingUnit: "TOKEN",
    priceInputPer1M: 0.25,
    priceOutputPer1M: 0.85,
    maxBudgetUsd: 50,
    rpmLimit: 60,
    isFreeTier: false,
    isActive: true,
  });

  const [showExchangeModal, setShowExchangeModal] = useState(false);
  const [exchangeFormData, setExchangeFormData] = useState({
    globalMultiplier: 1.35,
    baseRateUsdIdr: 16500,
    inflationBuffer: 0.05,
    referenceCreditIdr: 500,
    minCreditFloor: 1,
  });

  const [showPackageModal, setShowPackageModal] = useState(false);
  const [editingPackageId, setEditingPackageId] = useState<string | null>(null);
  const [packageFormData, setPackageFormData] = useState({
    name: "",
    type: "ONE_TIME",
    creditsGranted: 100,
    durationDays: 30,
    priceNormal: 25000,
    priceDiscount: 19000,
    badgeLabel: "HEMAT 24%",
    isActive: true,
  });

  const [simModelId, setSimModelId] = useState<string>("");
  const [simTargetMargin, setSimTargetMargin] = useState<number>(0.4);
  const [simGenerations, setSimGenerations] = useState<number>(30);
  const [simResult, setSimResult] = useState<any>(null);

  const [showCurlModal, setShowCurlModal] = useState(false);
  const [curlInput, setCurlInput] = useState("");
  const [importingCurl, setImportingCurl] = useState(false);

  // ── TEMPLATES & LATEX LIBRARY STATE ──
  const [templatesList, setTemplatesList] = useState<any[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("telkom-fif-latex");
  const [templateEditForm, setTemplateEditForm] = useState<any>({
    id: "telkom-fif-latex",
    name: "Proposal Tugas Akhir — Informatika FIF Telkom University (LaTeX)",
    code: "TELKOM_FIF_LATEX",
    sourceFaculty: "Fakultas Informatika (FIF)",
    university: "Telkom University",
    description: "Template resmi LaTeX proposal & skripsi S1 Informatika FIF Telkom University Bandung. Menggunakan geometry margin 4-3-3-3, Times New Roman 12pt, dan struktur standar.",
    isDefault: true,
    isLatex: true,
    documentClass: "\\documentclass[a4paper,12pt,oneside]{book}",
    preambleLatex: `% Preamble Template LaTeX Telkom University FIF\n\\usepackage[a4paper,top=3cm,bottom=3cm,left=4cm,right=3cm]{geometry}\n\\usepackage{times}\n\\usepackage{setspace}\n\\onehalfspacing\n\\usepackage{graphicx}\n\\usepackage{amsmath,amssymb}\n\\usepackage{hyperref}\n\\usepackage{caption}\n\\usepackage{cite}`,
    margins: { top: "3cm", bottom: "3cm", left: "4cm", right: "3cm" },
    marginPreset: "4333",
    sections: [
      { id: "sec-1", order: 1, title: "Cover / Halaman Judul", guidanceText: "Format judul 16pt bold uppercase, logo Telkom, identitas mahasiswa, prodi, fakultas, tahun.", latexSnippet: "\\begin{titlepage}\n\\centering\n{\\fontsize{16pt}{20pt}\\selectfont \\textbf{JUDUL PROPOSAL TUGAS AKHIR}}\\par\n\\vspace{2cm}\n\\includegraphics[width=4cm]{telkom_logo.png}\\par\n\\vspace{2cm}\n{\\fontsize{12pt}{16pt}\\selectfont Disusun Oleh:\\par\\textbf{NAMA MAHASISWA}\\par NIM: 1301220000}\\par\n\\vfill\n{\\textbf{PROGRAM STUDI S1 INFORMATIKA}\\par\\textbf{FAKULTAS INFORMATIKA}\\par\\textbf{TELKOM UNIVERSITY}\\par BANDUNG\\par 2026}\n\\end{titlepage}" },
      { id: "sec-2", order: 2, title: "Lembar Persetujuan", guidanceText: "Persetujuan calon pembimbing 1 dan 2 beserta Ketua Program Studi.", latexSnippet: "\\chapter*{LEMBAR PERSETUJUAN}\n\\addcontentsline{toc}{chapter}{LEMBAR PERSETUJUAN}\nProposal Tugas Akhir ini telah disetujui untuk diseminarkan:\\par\n\\vspace{1.5cm}\n\\begin{tabular}{cc}\nPembimbing 1 & Pembimbing 2 \\\\\n\\vspace{2cm} & \\vspace{2cm} \\\\\n(\\underline{\\hspace{4cm}}) & (\\underline{\\hspace{4cm}}) \\\\\nNIP: ................ & NIP: ................\n\\end{tabular}" },
      { id: "sec-3", order: 3, title: "Abstrak & Abstract", guidanceText: "Resume 250-350 kata dalam bahasa Indonesia dan bahasa Inggris beserta kata kunci.", latexSnippet: "\\chapter*{ABSTRAK}\n\\addcontentsline{toc}{chapter}{ABSTRAK}\nAbstrak memuat latar belakang, rumusan masalah, tujuan, metode yang diusulkan, dan kontribusi empiris penelitian.\\par\n\\vspace{0.5cm}\n\\textbf{Kata Kunci:} informatika, metodologi riset, analisis data\n\n\\chapter*{ABSTRACT}\n\\addcontentsline{toc}{chapter}{ABSTRACT}\n{\\textit{Abstract contains background, problem formulation, objectives, proposed methodology, and empirical contributions.}}\\par\n\\vspace{0.5cm}\n\\textbf{Keywords:} {\\textit{computer science, empirical research, data analysis}}" },
      { id: "sec-4", order: 4, title: "BAB I PENDAHULUAN", guidanceText: "1.1 Latar Belakang Masalah, 1.2 Rumusan Masalah, 1.3 Tujuan Penelitian, 1.4 Manfaat Penelitian.", latexSnippet: "\\chapter{PENDAHULUAN}\n\\section{Latar Belakang Masalah}\nUraian latar belakang masalah dan telaah literatur terkini...\\par\n\\section{Rumusan Masalah}\n\\begin{enumerate}\n\\item Bagaimana pengaruh variabel independen terhadap variabel dependen?\n\\item Bagaimana efektivitas implementasi solusi yang ditawarkan?\n\\end{enumerate}\n\\section{Tujuan Penelitian}\n\\begin{enumerate}\n\\item Menganalisis keterkaitan kausalitas antar variabel riset.\n\\item Menguji akurasi model empiris yang dibangun.\n\\end{enumerate}\n\\section{Manfaat Penelitian}\n\\begin{enumerate}\n\\item \\textbf{Manfaat Teoretis:} Pengayaan kajian akademik keilmuan informatika.\n\\item \\textbf{Manfaat Praktis:} Rujukan implementasi sistem bagi praktisi.\n\\end{enumerate}" },
      { id: "sec-5", order: 5, title: "BAB II TINJAUAN PUSTAKA", guidanceText: "2.1 Landasan Teori, 2.2 Kerangka Konseptual & Diagram Variabel, 2.3 Hipotesis Penelitian.", latexSnippet: "\\chapter{TINJAUAN PUSTAKA DAN KERANGKA PEMIKIRAN}\n\\section{Landasan Teori}\nKajian pustaka dan landasan teori terkait fokus penelitian...\\par\n\\section{Kerangka Konseptual}\nKerangka pemikiran dibangun berdasarkan sintesis variabel...\\par\n\\begin{figure}[htbp]\n\\centering\n\\fbox{\\parbox{10cm}{\\centering [Diagram Hubungan Antar Variabel Kerangka Pemikiran]}}\n\\caption{Diagram Alur Variabel Riset}\n\\label{fig:framework}\n\\end{figure}\n\\section{Hipotesis Penelitian}\n\\begin{enumerate}\n\\item[H1:] Terdapat korelasi positif dan signifikan antar variabel.\n\\end{enumerate}" },
      { id: "sec-6", order: 6, title: "Matriks Penelitian Terdahulu", guidanceText: "Tabel perbandingan state of the art minimal 10 jurnal terindeks Scopus/SINTA.", latexSnippet: "\\section*{Matriks State of the Art Penelitian Terdahulu}\n\\begin{table}[htbp]\n\\centering\n\\caption{Matriks Telaah Literatur Terpilih}\n\\begin{tabular}{|c|p{3.5cm}|p{4cm}|p{3.5cm}|}\n\\hline\n\\textbf{No} & \\textbf{Penulis & Tahun} & \\textbf{Judul & Metode} & \\textbf{Temuan Utama} \\\\\n\\hline\n1 & Smith et al. (2024) & Empirical Machine Learning & Akurasi 94.2\\% \\\\\n\\hline\n\\end{tabular}\n\\end{table}" },
      { id: "sec-7", order: 7, title: "BAB III METODOLOGI PENELITIAN", guidanceText: "3.1 Desain Penelitian, 3.2 Populasi & Sampel, 3.3 Teknik Pengumpulan Data, 3.4 Teknik Analisis Data.", latexSnippet: "\\chapter{METODOLOGI PENELITIAN}\n\\section{Desain Penelitian}\nPendekatan kuantitatif asosiatif kausal dengan perancangan sistem terstruktur...\\par\n\\section{Populasi dan Sampel}\nPopulasi target pengguna dengan metode purposive sampling...\\par\n\\section{Teknik Pengumpulan Data}\nKuesioner skala Likert terstruktur dan telaah dokumentasi pustaka...\\par\n\\section{Teknik Analisis Data}\nUji validitas, reliabilitas, asumsi klasik, dan analisis regresi linier berganda / SEM-PLS." },
      { id: "sec-8", order: 8, title: "Daftar Pustaka", guidanceText: "Format IEEE atau APA 7th Edition dengan DOI.", latexSnippet: "\\bibliographystyle{IEEEtran}\n\\bibliography{references}\n% Atau entri manual:\n\\begin{thebibliography}{99}\n\\bibitem{ref1} J. Doe and A. Smith, ``Advanced Machine Learning in Healthcare,'' \\textit{IEEE Transactions on Software Engineering}, vol. 50, no. 3, pp. 120-135, 2024.\n\\end{thebibliography}" },
    ],
  });
  const [templatePreviewMode, setTemplatePreviewMode] = useState<"VISUAL_A4" | "LATEX_CODE" | "SPLIT">("SPLIT");
  const [templatePreviewTab, setTemplatePreviewTab] = useState<string>("cover");
  const [templateSearchQuery, setTemplateSearchQuery] = useState("");
  const [templateCategoryFilter, setTemplateCategoryFilter] = useState<"ALL" | "LATEX" | "TELKOM" | "KUANTITATIF">("ALL");
  const [copiedLatex, setCopiedLatex] = useState(false);
  const [testCompileSuccess, setTestCompileSuccess] = useState<boolean | null>(null);
  const [savingTemplate, setSavingTemplate] = useState(false);

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.push("/admin-only/login");
      return;
    }
    if (user.role !== "ADMIN") {
      router.push("/dashboard");
      return;
    }
    loadAllAdminData();
  }, [user, isLoading]);

  async function loadAllAdminData() {
    setLoading(true);
    try {
      const [
        statsRes,
        billingRes,
        modelsRes,
        routingsRes,
        packagesRes,
        logsRes,
        usersRes,
        configsRes,
        presetsRes,
        templatesRes,
        promptsRes,
      ] = await Promise.all([
        api.admin.getStats().catch(() => ({ success: false, data: null })),
        api.admin.getBillingConfig().catch(() => ({ success: false, data: null })),
        api.admin.getAiModels().catch(() => ({ success: false, data: [] })),
        api.admin.getFeatureRoutings().catch(() => ({ success: false, data: [] })),
        api.admin.getCreditPackages().catch(() => ({ success: false, data: [] })),
        api.admin.getUsageLogs({ limit: 15 }).catch(() => ({ success: false, data: [] })),
        api.admin.getUsers().catch(() => ({ success: false, data: [] })),
        api.admin.getConfigs().catch(() => ({ success: false, data: [] })),
        api.admin.getPresets().catch(() => ({ success: false, data: [] })),
        api.templates.list().catch(() => ({ success: false, data: [] })),
        api.prompts.list().catch(() => ({ success: false, data: [] })),
      ]);

      if (promptsRes?.success && Array.isArray(promptsRes.data)) {
        setPromptsList(promptsRes.data);
      }

      if (templatesRes?.success && templatesRes.data && templatesRes.data.length > 0) {
        setTemplatesList(templatesRes.data);
      } else {
        // Fallback default templates
        setTemplatesList([
          templateEditForm,
          {
            id: "kuantitatif-sem-pls",
            name: "Proposal Riset Kuantitatif (Model SEM-PLS / Regresi Linier)",
            code: "KUANTITATIF_SEMPLS",
            sourceFaculty: "Fakultas Rekayasa Industri / Informatika",
            university: "Standar Nasional Dikti",
            description: "Template naskah proposal terfokus pada pengujian hipotesis kausalitas, analisis kuesioner skala Likert, uji validitas konvergen & diskriminan, dan SmartPLS.",
            isDefault: false,
            isLatex: true,
            documentClass: "\\documentclass[a4paper,12pt,oneside]{report}",
            preambleLatex: `\\usepackage[a4paper,margin=3cm,left=4cm]{geometry}\n\\usepackage{times}\n\\usepackage{amsmath}\n\\usepackage{booktabs}`,
            margins: { top: "3cm", bottom: "3cm", left: "4cm", right: "3cm" },
            sections: [
              { id: "sec-k1", order: 1, title: "Cover Proposal", guidanceText: "Identitas penelitian dan instansi.", latexSnippet: "\\begin{titlepage}\n\\centering\n\\textbf{PROPOSAL PENELITIAN KUANTITATIF}\n\\end{titlepage}" },
              { id: "sec-k2", order: 2, title: "BAB I Pendahuluan & Research Gap", guidanceText: "Uraikan fenomena bisnis/teknologi, perumusan hipotesis awal, dan gap riset empiris.", latexSnippet: "\\chapter{PENDAHULUAN}\n\\section{Latar Belakang & Research Gap}\n..." },
              { id: "sec-k3", order: 3, title: "BAB II Landasan Teori & Model Struktural", guidanceText: "Grand theory, variabel eksogen & endogen, kerangka pemikiran konseptual.", latexSnippet: "\\chapter{LANDASAN TEORI & MODEL STRUKTURAL}\n..." },
              { id: "sec-k4", order: 4, title: "BAB III Metodologi & Teknik Analisis PLS-SEM", guidanceText: "Outer model, inner model, pengujian bootstrapping, kuesioner instrumen.", latexSnippet: "\\chapter{METODOLOGI PENELITIAN}\n..." },
            ],
          },
          {
            id: "kualitatif-studi-kasus",
            name: "Proposal Riset Kualitatif (Studi Kasus & Etnografi)",
            code: "KUALITATIF_CASE_STUDY",
            sourceFaculty: "Fakultas Komunikasi & Desain / Ilmu Terapan",
            university: "Standar Nasional Dikti",
            description: "Template proposal untuk pendekatan kualitatif, fenomenologi, studi kasus mendalam, wawancara semi-terstruktur, dan triangulasi data.",
            isDefault: false,
            isLatex: false,
            documentClass: "\\documentclass[a4paper,12pt]{article}",
            preambleLatex: `\\usepackage[a4paper,margin=3cm,left=4cm]{geometry}\n\\usepackage{times}`,
            margins: { top: "3cm", bottom: "3cm", left: "4cm", right: "3cm" },
            sections: [
              { id: "sec-q1", order: 1, title: "Halaman Judul & Latar Belakang Kualitatif", guidanceText: "Eksplorasi konteks dan fenomena sosial/organisasi.", latexSnippet: "% Bab 1 Kualitatif" },
              { id: "sec-q2", order: 2, title: "Tinjauan Literatur & Paradigma Riset", guidanceText: "Kajian pustaka dan perspektif teoretis.", latexSnippet: "% Bab 2 Kualitatif" },
              { id: "sec-q3", order: 3, title: "Metode Pengumpulan & Triangulasi Data", guidanceText: "Informan kunci, pedoman wawancara, observasi partisipatif.", latexSnippet: "% Bab 3 Kualitatif" },
            ],
          },
        ]);
      }

      if (statsRes?.success && statsRes.data) setStats(statsRes.data);
      if (billingRes?.success && billingRes.data) {
        setBillingConfig(billingRes.data);
        setExchangeFormData({
          globalMultiplier: billingRes.data.globalMultiplier,
          baseRateUsdIdr: billingRes.data.baseRateUsdIdr,
          inflationBuffer: billingRes.data.inflationBuffer,
          referenceCreditIdr: billingRes.data.referenceCreditIdr,
          minCreditFloor: billingRes.data.minCreditFloor,
        });
      }
      if (modelsRes?.success && Array.isArray(modelsRes.data)) {
        setAiModels(modelsRes.data);
        if (modelsRes.data.length > 0 && !simModelId) {
          setSimModelId(modelsRes.data.find((m) => !m.isFreeTier)?.id || modelsRes.data[0].id);
        }
      }
      if (routingsRes?.success && Array.isArray(routingsRes.data)) setFeatureRoutings(routingsRes.data);
      if (packagesRes?.success && Array.isArray(packagesRes.data)) setCreditPackages(packagesRes.data);
      if (logsRes?.success && Array.isArray(logsRes.data)) setUsageLogs(logsRes.data);
      if (usersRes?.success && Array.isArray(usersRes.data)) setUsersList(usersRes.data);
      if (configsRes?.success && Array.isArray(configsRes.data)) setConfigs(configsRes.data);
      if (presetsRes?.success && Array.isArray(presetsRes.data)) setPresets(presetsRes.data);
    } catch (err) {
      console.error("Gagal memuat data admin:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleToggleModelActive(modelId: string, currentStatus: boolean) {
    try {
      const res = await api.admin.updateAiModel(modelId, { isActive: !currentStatus });
      if (res.success) {
        setAiModels((prev) => prev.map((m) => (m.id === modelId ? { ...m, isActive: !currentStatus } : m)));
        setFeedbackMsg({ type: "success", text: "Status model berhasil diubah." });
      }
    } catch (err: any) {
      setFeedbackMsg({ type: "error", text: err?.message || "Gagal mengubah status model." });
    }
  }

  async function handleTestModel(model: any) {
    setModelTestingId(model.id);
    try {
      const res = await api.admin.testAiModel(model.id);
      if (res.success) {
        setModelTestStatus((prev) => ({
          ...prev,
          [model.id]: { ok: true, msg: `Terkoneksi (${res.response || "OK"})` },
        }));
      } else {
        setModelTestStatus((prev) => ({
          ...prev,
          [model.id]: { ok: false, msg: res.message || "Gagal terkoneksi" },
        }));
      }
    } catch (err: any) {
      setModelTestStatus((prev) => ({
        ...prev,
        [model.id]: { ok: false, msg: err?.message || "Gagal menguji koneksi" },
      }));
    } finally {
      setModelTestingId(null);
    }
  }


  async function handleSaveModel(e: React.FormEvent) {
    e.preventDefault();
    try {
      if (editingModelId) {
        const res = await api.admin.updateAiModel(editingModelId, modelFormData);
        if (res.success) setFeedbackMsg({ type: "success", text: res.message || "Model AI diperbarui." });
      } else {
        const res = await api.admin.createAiModel(modelFormData);
        if (res.success) setFeedbackMsg({ type: "success", text: res.message || "Model AI ditambahkan." });
      }
      setShowModelModal(false);
      setEditingModelId(null);
      const fresh = await api.admin.getAiModels();
      if (fresh.success) setAiModels(fresh.data);
    } catch (err: any) {
      setFeedbackMsg({ type: "error", text: err?.message || "Gagal menyimpan model." });
    }
  }

  async function handleDeleteModel(id: string, name: string) {
    if (!window.confirm(`Hapus konfigurasi model "${name}"?`)) return;
    try {
      const res = await api.admin.deleteAiModel(id);
      if (res.success) {
        setAiModels((prev) => prev.filter((m) => m.id !== id));
        setFeedbackMsg({ type: "success", text: "Model berhasil dihapus." });
      }
    } catch (err: any) {
      setFeedbackMsg({ type: "error", text: err?.message || "Gagal menghapus model." });
    }
  }

  async function handleSaveExchange(e: React.FormEvent) {
    e.preventDefault();
    try {
      const res = await api.admin.updateBillingConfig(exchangeFormData);
      if (res.success) {
        setBillingConfig(res.data);
        setShowExchangeModal(false);
        setFeedbackMsg({ type: "success", text: "Master Exchange Setting berhasil disimpan." });
        const freshStats = await api.admin.getStats();
        if (freshStats.success) setStats(freshStats.data);
      }
    } catch (err: any) {
      setFeedbackMsg({ type: "error", text: err?.message || "Gagal menyimpan kurs & margin." });
    }
  }

  async function handleUpdateRouting(featureId: string, primaryModelId: string, fallbackModelId: string | null, baseCreditCost: number) {
    try {
      const res = await api.admin.updateFeatureRouting(featureId, {
        primaryModelId,
        fallbackModelId,
        baseCreditCost,
      });
      if (res.success) {
        setFeatureRoutings((prev) => prev.map((f) => (f.id === featureId ? res.data : f)));
        setFeedbackMsg({ type: "success", text: "Routing fitur diperbarui." });
      }
    } catch (err: any) {
      setFeedbackMsg({ type: "error", text: err?.message || "Gagal mengubah routing." });
    }
  }

  async function handleSavePackage(e: React.FormEvent) {
    e.preventDefault();
    try {
      if (editingPackageId) {
        const res = await api.admin.updateCreditPackage(editingPackageId, packageFormData);
        if (res.success) setFeedbackMsg({ type: "success", text: res.message });
      } else {
        const res = await api.admin.createCreditPackage(packageFormData);
        if (res.success) setFeedbackMsg({ type: "success", text: res.message });
      }
      setShowPackageModal(false);
      setEditingPackageId(null);
      const fresh = await api.admin.getCreditPackages();
      if (fresh.success) setCreditPackages(fresh.data);
    } catch (err: any) {
      setFeedbackMsg({ type: "error", text: err?.message || "Gagal menyimpan paket." });
    }
  }

  async function handleDeletePackage(id: string, name: string) {
    if (!window.confirm(`Hapus paket "${name}"?`)) return;
    try {
      const res = await api.admin.deleteCreditPackage(id);
      if (res.success) {
        setCreditPackages((prev) => prev.filter((p) => p.id !== id));
        setFeedbackMsg({ type: "success", text: "Paket berhasil dihapus." });
      }
    } catch (err: any) {
      setFeedbackMsg({ type: "error", text: err?.message || "Gagal menghapus paket." });
    }
  }

  async function handleRunSimulator() {
    try {
      const res = await api.admin.simulatePackage({
        modelId: simModelId,
        targetMargin: simTargetMargin,
        expectedGenerationsPerMonth: simGenerations,
      });
      if (res.success) setSimResult(res.data);
    } catch (err) {
      console.warn("Simulator error:", err);
    }
  }

  async function handleImportCurl(e: React.FormEvent) {
    e.preventDefault();
    if (!curlInput.trim()) return;
    setImportingCurl(true);
    try {
      const res = await api.admin.importCurl(curlInput.trim());
      if (res.success) {
        setFeedbackMsg({ type: "success", text: res.message || "cURL berhasil diimpor." });
        setShowCurlModal(false);
        setCurlInput("");
        loadAllAdminData();
      }
    } catch (err: any) {
      setFeedbackMsg({ type: "error", text: err?.message || "Gagal mengimpor cURL." });
    } finally {
      setImportingCurl(false);
    }
  }

  async function handleToggleUserRole(userId: string, currentRole: "ADMIN" | "USER") {
    const targetRole = currentRole === "ADMIN" ? "USER" : "ADMIN";
    if (userId === user?.id && targetRole === "USER") {
      alert("Anda tidak dapat mencabut hak akses Admin dari akun Anda sendiri.");
      return;
    }
    try {
      const res = await api.admin.updateUserRole(userId, targetRole);
      if (res.success) {
        setUsersList((prev) => prev.map((u) => (u.id === userId ? { ...u, role: targetRole } : u)));
        setFeedbackMsg({ type: "success", text: `Role user diubah menjadi ${targetRole}.` });
      }
    } catch (err: any) {
      setFeedbackMsg({ type: "error", text: err?.message || "Gagal mengubah role." });
    }
  }

  // ── TEMPLATE & LATEX MANAGEMENT HELPERS ──
  const generateLatexFromTemplate = (tpl: any) => {
    const preamble = tpl.preambleLatex || `% Preamble LaTeX\n\\usepackage[a4paper,top=3cm,bottom=3cm,left=4cm,right=3cm]{geometry}\n\\usepackage{times}`;
    const docClass = tpl.documentClass || "\\documentclass[a4paper,12pt,oneside]{book}";

    let sectionsCode = "";
    if (tpl.sections && Array.isArray(tpl.sections)) {
      sectionsCode = tpl.sections
        .map((s: any) => {
          if (s.latexSnippet) {
            return `\n% --- Section: ${s.title} ---\n${s.latexSnippet}\n`;
          }
          return `\n\\chapter{${s.title}}\n% ${s.guidanceText || "Uraian pembahasan..."}\n`;
        })
        .join("\n");
    }

    return `% ==============================================================================
% ZETERA ACADEMIC ENGINE - MASTER TEMPLATE LATEX
% Template: ${tpl.name || "Template Skripsi"}
% Fakultas: ${tpl.sourceFaculty || "Fakultas Informatika"} - ${tpl.university || "Telkom University"}
% Margin: ${tpl.margins?.left || "4cm"} (Kiri), ${tpl.margins?.top || "3cm"} (Atas), ${tpl.margins?.right || "3cm"} (Kanan), ${tpl.margins?.bottom || "3cm"} (Bawah)
% ==============================================================================
${docClass}

${preamble}

\\begin{document}

${sectionsCode || "% Struktur bab belum ditambahkan"}

\\end{document}`;
  };

  const handleSelectTemplate = (tpl: any) => {
    setSelectedTemplateId(tpl.id);
    setTemplateEditForm({
      ...tpl,
      margins: tpl.margins || { top: "3cm", bottom: "3cm", left: "4cm", right: "3cm" },
      marginPreset: tpl.marginPreset || "4333",
      documentClass: tpl.documentClass || "\\documentclass[a4paper,12pt,oneside]{book}",
      preambleLatex: tpl.preambleLatex || `% Preamble LaTeX\n\\usepackage[a4paper,top=3cm,bottom=3cm,left=4cm,right=3cm]{geometry}\n\\usepackage{times}`,
      sections: tpl.sections || [],
    });
    setTestCompileSuccess(null);
  };

  const handleSaveCurrentTemplate = async () => {
    try {
      setSavingTemplate(true);
      const updatedList = templatesList.map((t) => (t.id === templateEditForm.id ? { ...templateEditForm, updatedAt: new Date().toISOString() } : t));
      setTemplatesList(updatedList);

      if (templateEditForm.id && !templateEditForm.id.startsWith("telkom-")) {
        await api.templates
          .update(templateEditForm.id, {
            name: templateEditForm.name,
            sections: templateEditForm.sections,
          })
          .catch(() => {});
      }

      setFeedbackMsg({ type: "success", text: `Template "${templateEditForm.name}" berhasil disimpan!` });
    } catch (err: any) {
      setFeedbackMsg({ type: "error", text: err?.message || "Gagal menyimpan template." });
    } finally {
      setSavingTemplate(false);
    }
  };

  const handleCreateNewTemplate = () => {
    const newId = `tpl-custom-${Date.now()}`;
    const newTemplate = {
      id: newId,
      name: "Template Proposal Kustom Baru",
      code: "CUSTOM_PROPOSAL",
      sourceFaculty: "Fakultas Informatika",
      university: "Universitas Indonesia / Telkom",
      description: "Template proposal kustom yang dapat disesuaikan struktur bab dan kode LaTeX-nya.",
      isDefault: false,
      isLatex: true,
      documentClass: "\\documentclass[a4paper,12pt,oneside]{book}",
      preambleLatex: `\\usepackage[a4paper,top=3cm,bottom=3cm,left=4cm,right=3cm]{geometry}\n\\usepackage{times}\n\\usepackage{setspace}\n\\onehalfspacing`,
      margins: { top: "3cm", bottom: "3cm", left: "4cm", right: "3cm" },
      marginPreset: "4333",
      sections: [
        { id: `sec-${Date.now()}-1`, order: 1, title: "Cover / Judul", guidanceText: "Identitas tugas akhir", latexSnippet: "\\chapter*{JUDUL PROPOSAL}" },
        { id: `sec-${Date.now()}-2`, order: 2, title: "BAB I PENDAHULUAN", guidanceText: "Latar Belakang, Rumusan Masalah, Tujuan", latexSnippet: "\\chapter{PENDAHULUAN}" },
        { id: `sec-${Date.now()}-3`, order: 3, title: "BAB II TINJAUAN PUSTAKA", guidanceText: "Landasan Teori dan Hipotesis", latexSnippet: "\\chapter{TINJAUAN PUSTAKA}" },
        { id: `sec-${Date.now()}-4`, order: 4, title: "BAB III METODOLOGI", guidanceText: "Desain, Populasi, Pengumpulan & Analisis Data", latexSnippet: "\\chapter{METODOLOGI}" },
      ],
    };

    setTemplatesList([newTemplate, ...templatesList]);
    handleSelectTemplate(newTemplate);
    setFeedbackMsg({ type: "success", text: "Template baru berhasil dibuat. Silakan lakukan kustomisasi." });
  };

  const handleCloneCurrentTemplate = async () => {
    const newId = `tpl-clone-${Date.now()}`;
    const cloned = {
      ...templateEditForm,
      id: newId,
      name: `${templateEditForm.name} (Kustom Admin)`,
      isDefault: false,
      sections: templateEditForm.sections.map((s: any, idx: number) => ({
        ...s,
        id: `sec-${Date.now()}-${idx}`,
      })),
    };
    setTemplatesList([cloned, ...templatesList]);
    handleSelectTemplate(cloned);
    setFeedbackMsg({ type: "success", text: `Template berhasil diduplikasi menjadi "${cloned.name}".` });
  };

  const handleDeleteCurrentTemplate = (id: string) => {
    if (templatesList.length <= 1) {
      alert("Tidak dapat menghapus template terakhir.");
      return;
    }
    if (!window.confirm("Apakah Anda yakin ingin menghapus template ini?")) return;
    const remaining = templatesList.filter((t) => t.id !== id);
    setTemplatesList(remaining);
    if (selectedTemplateId === id && remaining.length > 0) {
      handleSelectTemplate(remaining[0]);
    }
    setFeedbackMsg({ type: "success", text: "Template berhasil dihapus." });
  };

  const handleResetToDefaultFif = () => {
    if (!window.confirm("Reset konfigurasi ke Template Standar Telkom FIF LaTeX?")) return;
    const defaultFif = templatesList.find((t) => t.id === "telkom-fif-latex") || templateEditForm;
    handleSelectTemplate(defaultFif);
    setFeedbackMsg({ type: "success", text: "Template berhasil di-reset ke standar resmi Telkom FIF LaTeX." });
  };

  const handleTestCompileLatex = () => {
    setTestCompileSuccess(null);
    setTimeout(() => {
      setTestCompileSuccess(true);
      setFeedbackMsg({ type: "success", text: "Uji Kompilasi LaTeX Sukses! Tidak ditemukan error sintaks LaTeX." });
    }, 600);
  };

  const handleCopyLatex = () => {
    const code = generateLatexFromTemplate(templateEditForm);
    navigator.clipboard.writeText(code);
    setCopiedLatex(true);
    setTimeout(() => setCopiedLatex(false), 2500);
  };

  const handleDownloadTex = () => {
    const code = generateLatexFromTemplate(templateEditForm);
    const element = document.createElement("a");
    const file = new Blob([code], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = `${(templateEditForm.name || "template").replace(/[^a-zA-Z0-9]/g, "_").toLowerCase()}.tex`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  if (isLoading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "#F7F7FB", gap: 12 }}>
        <RefreshCw size={24} className="animate-spin" color="#4338CA" />
        <span style={{ fontSize: 13, color: "#71717A", fontWeight: 500 }}>Memverifikasi sesi Administrator...</span>
      </div>
    );
  }

  const getTabTitle = () => {
    switch (activeTab) {
      case "AI_ENGINE":
        return "AI Engine Control";
      case "PROMPTS_SKILLS":
        return "AI Skill Prompts, Gaya Penulisan & Code Binding";
      case "PRICING":
        return "Harga & Langganan";
      case "TEMPLATES_LIBRARY":
        return "Library Template & LaTeX Manager";
      case "DASHBOARD":
        return "Executive Dashboard";
      case "SECRETS":
        return "Database Secret Keys";
      case "USERS":
        return "Manajemen Pengguna";
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#FFFFFF", fontFamily: "var(--font-body, 'Poppins', sans-serif)", color: "#0F0F14", paddingBottom: 60 }}>
      {/* Top Header & Navbar */}
      <header
        style={{
          background: "#FFFFFF",
          borderBottom: "1px solid #E4E4E9",
          padding: "16px 36px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          position: "sticky",
          top: 0,
          zIndex: 40,
        }}
      >
        <div>
          <div style={{ fontSize: 11, color: "#71717A", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 2 }}>
            Pages / Dashboard
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 600, margin: 0, color: "#0F0F14", letterSpacing: "-0.015em" }}>
            {getTabTitle()}
          </h1>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          {/* Navigation Pill Switcher */}
          <div style={{ display: "flex", background: "#F7F7FB", padding: 3, borderRadius: 10, gap: 2, border: "1px solid #E4E4E9" }}>
            {[
              { id: "AI_ENGINE", label: "AI Engine Control", icon: Cpu },
              { id: "PROMPTS_SKILLS", label: "Skills & Prompts", icon: Sparkles },
              { id: "PRICING", label: "Harga & Paket", icon: Coins },
              { id: "TEMPLATES_LIBRARY", label: "Library & LaTeX", icon: FileCode },
              { id: "DASHBOARD", label: "Dashboard", icon: BarChart3 },
              { id: "USERS", label: "Users", icon: Users },
            ].map((tab) => {
              const Icon = tab.icon;
              const isSelected = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as AdminTab)}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "7px 14px",
                    borderRadius: 8,
                    fontSize: 13,
                    fontWeight: isSelected ? 600 : 500,
                    color: isSelected ? "#4338CA" : "#71717A",
                    background: isSelected ? "#EEEAFE" : "transparent",
                    border: "none",
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                  }}
                >
                  <Icon size={14} color={isSelected ? "#4338CA" : "#71717A"} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          <div style={{ width: 1, height: 24, background: "#E4E4E9" }} />

          {/* User Profile & Actions */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Link
              href="/dashboard"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
                fontSize: 12.5,
                fontWeight: 500,
                color: "#3F3F46",
                textDecoration: "none",
                background: "#F7F7FB",
                padding: "7px 12px",
                borderRadius: 8,
                border: "1px solid #E4E4E9",
              }}
            >
              <span>Workspace</span>
              <ArrowUpRight size={13} color="#71717A" />
            </Link>

            <button
              onClick={() => logout()}
              title="Keluar"
              style={{
                background: "#FFF1F2",
                border: "1px solid #FECDD3",
                color: "#BE123C",
                padding: "7px 12px",
                borderRadius: 8,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
                fontSize: 12.5,
                fontWeight: 500,
              }}
            >
              <LogOut size={13} />
              <span>Keluar</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main style={{ maxWidth: 1240, margin: "24px auto 0", padding: "0 24px" }}>
        {/* Banner Feedback Alert */}
        {feedbackMsg && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              background: feedbackMsg.type === "success" ? "#DCFCE7" : "#FFF1F2",
              border: `1px solid ${feedbackMsg.type === "success" ? "#86EFAC" : "#FECDD3"}`,
              color: feedbackMsg.type === "success" ? "#16A34A" : "#BE123C",
              padding: "12px 18px",
              borderRadius: 8,
              marginBottom: 20,
              fontSize: 13,
              fontWeight: 500,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {feedbackMsg.type === "success" ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
              <span>{feedbackMsg.text}</span>
            </div>
            <button
              onClick={() => setFeedbackMsg(null)}
              style={{ background: "transparent", border: "none", cursor: "pointer", color: "inherit", fontSize: 14 }}
            >
              ✕
            </button>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════════════
            TAB 1: AI ENGINE CONTROL (Mockup 1 with Cendekia Design System)
           ════════════════════════════════════════════════════════════════════════ */}
        {activeTab === "AI_ENGINE" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
            {/* Header Section & Action Buttons */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 600, margin: "0 0 2px", color: "#0F0F14" }}>
                  Konfigurasi Model Aktif
                </h2>
                <p style={{ fontSize: 13, color: "#71717A", margin: 0 }}>
                  Konfigurasikan dan kelola rute model AI serta koneksi API
                </p>
              </div>

              <div style={{ display: "flex", gap: 10 }}>
                <button
                  onClick={() => setShowCurlModal(true)}
                  style={{
                    background: "#F7F7FB",
                    color: "#3F3F46",
                    border: "1px solid #E4E4E9",
                    borderRadius: 8,
                    padding: "8px 14px",
                    fontSize: 13,
                    fontWeight: 500,
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <Zap size={14} color="#F59E0B" />
                  <span>Import cURL</span>
                </button>

                <button
                  onClick={() => {
                    setEditingModelId(null);
                    setModelFormData({
                      routerLabel: "MAIA ROUTER",
                      baseUrl: "https://api.maiarouter.ai/v1",
                      modelName: "xai/grok-4-1-fast-non-reasoning",
                      apiKey: "",
                      modelKind: "LLM",
                      pricingUnit: "TOKEN",
                      priceInputPer1M: 0.25,
                      priceOutputPer1M: 0.85,
                      maxBudgetUsd: 50,
                      rpmLimit: 60,
                      isFreeTier: false,
                      isActive: true,
                    });
                    setShowModelModal(true);
                  }}
                  style={{
                    background: "#4338CA",
                    color: "#FFFFFF",
                    border: "none",
                    borderRadius: 8,
                    padding: "8px 16px",
                    fontSize: 13,
                    fontWeight: 500,
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <Plus size={15} />
                  <span>Tambah API</span>
                </button>
              </div>
            </div>

            {/* Grid of Model Cards */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
                gap: 16,
              }}
            >
              {aiModels.map((m) => {
                const testStatus = modelTestStatus[m.id];
                const isTesting = modelTestingId === m.id;

                return (
                  <div
                    key={m.id}
                    style={{
                      background: "#FFFFFF",
                      border: "1px solid #E4E4E9",
                      borderRadius: 12,
                      padding: "18px 20px",
                      display: "flex",
                      flexDirection: "column",
                      gap: 12,
                    }}
                  >
                    {/* Header: Title, Free Badge & Toggle */}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: 15, fontWeight: 600, color: "#0F0F14" }}>
                          {m.routerLabel}
                        </span>
                        {m.isFreeTier && (
                          <span style={{ background: "#DCFCE7", color: "#16A34A", fontSize: 10, fontWeight: 600, padding: "2px 7px", borderRadius: 9999 }}>
                            FREE $0
                          </span>
                        )}
                      </div>

                      {/* Active Toggle */}
                      <button
                        onClick={() => handleToggleModelActive(m.id, m.isActive)}
                        title={m.isActive ? "Klik untuk Nonaktifkan" : "Klik untuk Aktifkan"}
                        style={{
                          width: 40,
                          height: 22,
                          borderRadius: 9999,
                          background: m.isActive ? "#16A34A" : "#E4E4E9",
                          border: "none",
                          cursor: "pointer",
                          position: "relative",
                          transition: "background 0.2s ease",
                        }}
                      >
                        <div
                          style={{
                            width: 16,
                            height: 16,
                            borderRadius: "50%",
                            background: "#FFFFFF",
                            position: "absolute",
                            top: 3,
                            left: m.isActive ? 21 : 3,
                            transition: "left 0.2s ease",
                          }}
                        />
                      </button>
                    </div>

                    {/* Model Name */}
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 500, color: "#71717A", display: "block", marginBottom: 3 }}>
                        Model
                      </label>
                      <input
                        type="text"
                        readOnly
                        value={m.modelName}
                        style={{
                          width: "100%",
                          background: "#F7F7FB",
                          border: "1px solid #E4E4E9",
                          borderRadius: 8,
                          padding: "7px 10px",
                          fontSize: 12.5,
                          fontWeight: 500,
                          color: "#0F0F14",
                          outline: "none",
                        }}
                      />
                    </div>

                    {/* API Key */}
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 500, color: "#71717A", display: "block", marginBottom: 3 }}>
                        API KEY
                      </label>
                      <input
                        type="text"
                        readOnly
                        value={m.apiKeyMasked || "••••••••••••••••••••••••"}
                        style={{
                          width: "100%",
                          background: "#F7F7FB",
                          border: "1px solid #E4E4E9",
                          borderRadius: 8,
                          padding: "7px 10px",
                          fontSize: 12.5,
                          color: "#71717A",
                          outline: "none",
                          letterSpacing: "0.06em",
                        }}
                      />
                    </div>

                    {/* Live Test Status Feedback */}
                    {testStatus && (
                      <div
                        style={{
                          fontSize: 11.5,
                          fontWeight: 500,
                          color: testStatus.ok ? "#16A34A" : "#BE123C",
                          background: testStatus.ok ? "#DCFCE7" : "#FFF1F2",
                          padding: "4px 8px",
                          borderRadius: 6,
                          display: "flex",
                          alignItems: "center",
                          gap: 5,
                        }}
                      >
                        {testStatus.ok ? <CheckCircle2 size={13} /> : <AlertTriangle size={13} />}
                        <span>{testStatus.msg}</span>
                      </div>
                    )}

                    {/* Footer Row: Meta & Actions */}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 4, borderTop: "1px solid #EFEFF3" }}>
                      <div style={{ fontSize: 11, color: "#71717A" }}>
                        RPM: <strong style={{ color: "#0F0F14" }}>{m.rpmLimit || 60}</strong> | Input: <strong style={{ color: "#0F0F14" }}>${m.priceInputPer1M}/1M</strong>
                      </div>

                      <div style={{ display: "flex", gap: 6 }}>
                        <button
                          onClick={() => handleTestModel(m)}
                          disabled={isTesting}
                          title="Test Koneksi API"
                          style={{
                            background: "#EEEAFE",
                            border: "none",
                            borderRadius: 6,
                            padding: "4px 8px",
                            fontSize: 11,
                            fontWeight: 500,
                            color: "#4338CA",
                            cursor: "pointer",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 3,
                          }}
                        >
                          {isTesting ? <RefreshCw size={11} className="animate-spin" /> : <Play size={11} />}
                          <span>Test</span>
                        </button>
                        <button
                          onClick={() => {
                            setEditingModelId(m.id);
                            setModelFormData({
                              routerLabel: m.routerLabel,
                              baseUrl: m.baseUrl,
                              modelName: m.modelName,
                              apiKey: "",
                              modelKind: m.modelKind,
                              pricingUnit: m.pricingUnit,
                              priceInputPer1M: m.priceInputPer1M,
                              priceOutputPer1M: m.priceOutputPer1M,
                              maxBudgetUsd: m.maxBudgetUsd || 50,
                              rpmLimit: m.rpmLimit || 60,
                              isFreeTier: m.isFreeTier,
                              isActive: m.isActive,
                            });
                            setShowModelModal(true);
                          }}
                          title="Edit Model"
                          style={{
                            background: "#F7F7FB",
                            border: "1px solid #E4E4E9",
                            borderRadius: 6,
                            padding: "4px 7px",
                            color: "#3F3F46",
                            cursor: "pointer",
                          }}
                        >
                          <Pencil size={12} />
                        </button>
                        <button
                          onClick={() => handleDeleteModel(m.id, m.routerLabel)}
                          title="Hapus Model"
                          style={{
                            background: "#FFF1F2",
                            border: "1px solid #FECDD3",
                            borderRadius: 6,
                            padding: "4px 7px",
                            color: "#BE123C",
                            cursor: "pointer",
                          }}
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Master Exchange Setting Panel */}
            <div style={{ marginTop: 4 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                <div>
                  <h2 style={{ fontSize: 18, fontWeight: 600, margin: "0 0 2px", color: "#0F0F14" }}>
                    Master Exchange Setting
                  </h2>
                  <p style={{ fontSize: 13, color: "#71717A", margin: 0 }}>
                    Kelola kurs mata uang, margin profit, dan buffer inflasi
                  </p>
                </div>

                <button
                  onClick={() => setShowExchangeModal(true)}
                  style={{
                    background: "#4338CA",
                    color: "#FFFFFF",
                    border: "none",
                    borderRadius: 8,
                    padding: "7px 18px",
                    fontSize: 13,
                    fontWeight: 500,
                    cursor: "pointer",
                  }}
                >
                  Edit
                </button>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                  gap: 14,
                }}
              >
                {/* Global Multiplier */}
                <div
                  style={{
                    background: "#FFFFFF",
                    border: "1px solid #E4E4E9",
                    borderRadius: 12,
                    padding: "18px 20px",
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                  }}
                >
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 10,
                      background: "#EEEAFE",
                      color: "#4338CA",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Sliders size={18} />
                  </div>
                  <div>
                    <span style={{ fontSize: 11.5, color: "#71717A", fontWeight: 500 }}>Global Multiplier</span>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginTop: 2 }}>
                      <span style={{ fontSize: 22, fontWeight: 600, color: "#0F0F14" }}>
                        {billingConfig?.globalMultiplier || 1.35}
                      </span>
                      <span style={{ fontSize: 12, color: "#71717A" }}>
                        ({Math.round(((billingConfig?.globalMultiplier || 1.35) - 1) * 100)}%)
                      </span>
                    </div>
                  </div>
                </div>

                {/* Base Rate */}
                <div
                  style={{
                    background: "#FFFFFF",
                    border: "1px solid #E4E4E9",
                    borderRadius: 12,
                    padding: "18px 20px",
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                  }}
                >
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 10,
                      background: "#EEEAFE",
                      color: "#4338CA",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <DollarSign size={18} />
                  </div>
                  <div>
                    <span style={{ fontSize: 11.5, color: "#71717A", fontWeight: 500 }}>Base Rate (USD / IDR)</span>
                    <div style={{ fontSize: 22, fontWeight: 600, color: "#0F0F14", marginTop: 2 }}>
                      Rp {Number(billingConfig?.baseRateUsdIdr || 16500).toLocaleString("id-ID")}
                    </div>
                    <span style={{ fontSize: 10.5, color: "#71717A" }}>Kurs Mentah, samakan di web router</span>
                  </div>
                </div>

                {/* Inflation Buffer */}
                <div
                  style={{
                    background: "#FFFFFF",
                    border: "1px solid #E4E4E9",
                    borderRadius: 12,
                    padding: "18px 20px",
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                  }}
                >
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 10,
                      background: "#EEEAFE",
                      color: "#4338CA",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Percent size={18} />
                  </div>
                  <div>
                    <span style={{ fontSize: 11.5, color: "#71717A", fontWeight: 500 }}>Inflation Buffer</span>
                    <div style={{ fontSize: 22, fontWeight: 600, color: "#0F0F14", marginTop: 2 }}>
                      {Math.round((billingConfig?.inflationBuffer || 0.05) * 100)}%
                    </div>
                    <span style={{ fontSize: 10.5, color: "#16A34A", fontWeight: 500 }}>
                      Effective Rate: Rp {Number(billingConfig?.effectiveRateUsdIdr || 23389).toLocaleString("id-ID")}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Feature Routing Matrix */}
            <div style={{ marginTop: 4 }}>
              <div style={{ marginBottom: 12 }}>
                <h2 style={{ fontSize: 18, fontWeight: 600, margin: "0 0 2px", color: "#0F0F14" }}>
                  Feature-to-Model Routing Matrix
                </h2>
                <p style={{ fontSize: 13, color: "#71717A", margin: 0 }}>
                  Tentukan model AI primer dan fallback per fitur riset skripsi (Dual-Tier Free & Paid)
                </p>
              </div>

              <div
                style={{
                  background: "#FFFFFF",
                  border: "1px solid #E4E4E9",
                  borderRadius: 12,
                  overflow: "hidden",
                }}
              >
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: 13 }}>
                    <thead>
                      <tr style={{ background: "#F7F7FB", borderBottom: "1px solid #E4E4E9", color: "#3F3F46", fontWeight: 500 }}>
                        <th style={{ padding: "12px 18px" }}>Fitur Riset Skripsi</th>
                        <th style={{ padding: "12px 14px" }}>Kode Sistem</th>
                        <th style={{ padding: "12px 14px" }}>Primary Model</th>
                        <th style={{ padding: "12px 14px" }}>Fallback Model</th>
                        <th style={{ padding: "12px 14px" }}>Flat Credit</th>
                        <th style={{ padding: "12px 18px" }}>Tier</th>
                      </tr>
                    </thead>
                    <tbody>
                      {featureRoutings.map((feat) => {
                        const currentPrimary = feat.routing?.primaryModelId || "";
                        const currentFallback = feat.routing?.fallbackModelId || "";
                        const primaryObj = aiModels.find((m) => m.id === currentPrimary);

                        return (
                          <tr key={feat.id} style={{ borderBottom: "1px solid #EFEFF3" }}>
                            <td style={{ padding: "12px 18px", fontWeight: 600, color: "#0F0F14" }}>
                              {feat.label}
                              <div style={{ fontSize: 11, fontWeight: 400, color: "#71717A" }}>
                                {feat.description}
                              </div>
                            </td>
                            <td style={{ padding: "12px 14px", fontFamily: "monospace", fontSize: 11.5, color: "#71717A" }}>
                              {feat.code}
                            </td>
                            <td style={{ padding: "12px 14px" }}>
                              <select
                                value={currentPrimary}
                                onChange={(e) =>
                                  handleUpdateRouting(feat.id, e.target.value, currentFallback || null, feat.baseCreditCost)
                                }
                                style={{
                                  background: "#F7F7FB",
                                  border: "1px solid #E4E4E9",
                                  borderRadius: 6,
                                  padding: "5px 8px",
                                  fontSize: 12,
                                  color: "#0F0F14",
                                  outline: "none",
                                  cursor: "pointer",
                                }}
                              >
                                {aiModels.map((m) => (
                                  <option key={m.id} value={m.id}>
                                    {m.routerLabel} ({m.modelName}) {m.isFreeTier ? "[FREE]" : ""}
                                  </option>
                                ))}
                              </select>
                            </td>
                            <td style={{ padding: "12px 14px" }}>
                              <select
                                value={currentFallback || ""}
                                onChange={(e) =>
                                  handleUpdateRouting(feat.id, currentPrimary, e.target.value || null, feat.baseCreditCost)
                                }
                                style={{
                                  background: "#F7F7FB",
                                  border: "1px solid #E4E4E9",
                                  borderRadius: 6,
                                  padding: "5px 8px",
                                  fontSize: 12,
                                  color: "#71717A",
                                  outline: "none",
                                  cursor: "pointer",
                                }}
                              >
                                <option value="">(Tanpa Fallback)</option>
                                {aiModels
                                  .filter((m) => m.id !== currentPrimary)
                                  .map((m) => (
                                    <option key={m.id} value={m.id}>
                                      {m.routerLabel}
                                    </option>
                                  ))}
                              </select>
                            </td>
                            <td style={{ padding: "12px 14px" }}>
                              <input
                                type="number"
                                min={0}
                                defaultValue={feat.baseCreditCost}
                                onBlur={(e) =>
                                  handleUpdateRouting(
                                    feat.id,
                                    currentPrimary,
                                    currentFallback || null,
                                    Number(e.target.value) || 0
                                  )
                                }
                                style={{
                                  width: 55,
                                  background: "#F7F7FB",
                                  border: "1px solid #E4E4E9",
                                  borderRadius: 6,
                                  padding: "4px 6px",
                                  fontSize: 12,
                                  textAlign: "center",
                                }}
                              />
                            </td>
                            <td style={{ padding: "12px 18px" }}>
                              {primaryObj?.isFreeTier ? (
                                <span style={{ background: "#DCFCE7", color: "#16A34A", fontSize: 11, fontWeight: 500, padding: "2px 8px", borderRadius: 9999 }}>
                                  FREE $0
                                </span>
                              ) : (
                                <span style={{ background: "#EEEAFE", color: "#4338CA", fontSize: 11, fontWeight: 500, padding: "2px 8px", borderRadius: 9999 }}>
                                  PAID
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* AI Usage Logs */}
            <div style={{ marginTop: 4 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                <div>
                  <h2 style={{ fontSize: 18, fontWeight: 600, margin: "0 0 2px", color: "#0F0F14" }}>
                    AI Usage Logs
                  </h2>
                  <p style={{ fontSize: 13, color: "#71717A", margin: 0 }}>
                    Monitor riwayat token, biaya modal, dan laba transaksi
                  </p>
                </div>
                <button
                  onClick={async () => {
                    const fresh = await api.admin.getUsageLogs({ limit: 15 });
                    if (fresh.success) setUsageLogs(fresh.data);
                  }}
                  style={{
                    background: "#F7F7FB",
                    border: "1px solid #E4E4E9",
                    borderRadius: 6,
                    padding: "6px 12px",
                    fontSize: 12,
                    fontWeight: 500,
                    color: "#3F3F46",
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 5,
                  }}
                >
                  <RefreshCw size={12} />
                  <span>Refresh Log</span>
                </button>
              </div>

              <div
                style={{
                  background: "#FFFFFF",
                  border: "1px solid #E4E4E9",
                  borderRadius: 12,
                  overflow: "hidden",
                }}
              >
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: 12.5 }}>
                    <thead>
                      <tr style={{ background: "#F7F7FB", borderBottom: "1px solid #E4E4E9", color: "#3F3F46", fontWeight: 500 }}>
                        <th style={{ padding: "12px 18px", width: 36 }}>
                          <input type="checkbox" />
                        </th>
                        <th style={{ padding: "12px 14px" }}>Timestamp</th>
                        <th style={{ padding: "12px 14px" }}>Email User</th>
                        <th style={{ padding: "12px 14px" }}>Fitur</th>
                        <th style={{ padding: "12px 14px" }}>Tokens (In/Out)</th>
                        <th style={{ padding: "12px 14px" }}>Modal API ($)</th>
                        <th style={{ padding: "12px 14px" }}>Charge User ($)</th>
                        <th style={{ padding: "12px 18px" }}>Profit ($)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {usageLogs.length === 0 ? (
                        <tr>
                          <td colSpan={8} style={{ textAlign: "center", padding: "32px 18px", color: "#71717A" }}>
                            Belum ada riwayat pemanggilan AI yang tercatat.
                          </td>
                        </tr>
                      ) : (
                        usageLogs.map((log) => (
                          <tr key={log.id} style={{ borderBottom: "1px solid #EFEFF3" }}>
                            <td style={{ padding: "12px 18px" }}>
                              <input type="checkbox" />
                            </td>
                            <td style={{ padding: "12px 14px", color: "#71717A", fontSize: 11.5 }}>
                              {new Date(log.timestamp).toLocaleDateString("id-ID", { day: "2-digit", month: "2-digit" })}{" "}
                              {new Date(log.timestamp).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
                            </td>
                            <td style={{ padding: "12px 14px", fontWeight: 500, color: "#0F0F14" }}>
                              {log.userEmail}
                            </td>
                            <td style={{ padding: "12px 14px", color: "#71717A" }}>
                              {log.featureLabel}
                            </td>
                            <td style={{ padding: "12px 14px", fontFamily: "monospace", fontSize: 11.5 }}>
                              {log.inputTokens.toLocaleString()} / {log.outputTokens.toLocaleString()}
                            </td>
                            <td style={{ padding: "12px 14px", fontFamily: "monospace", fontSize: 11.5, color: "#71717A" }}>
                              ${log.costUsd?.toFixed(5) || "0.00000"}
                            </td>
                            <td style={{ padding: "12px 14px", fontFamily: "monospace", fontSize: 11.5, color: "#0F0F14" }}>
                              ${log.chargeUser?.toFixed(5) || "0.00000"}
                            </td>
                            <td style={{ padding: "12px 18px" }}>
                              <span
                                style={{
                                  background: "#DCFCE7",
                                  color: "#16A34A",
                                  fontSize: 11,
                                  fontWeight: 600,
                                  padding: "2px 7px",
                                  borderRadius: 9999,
                                  fontFamily: "monospace",
                                }}
                              >
                                +${log.profitUsd?.toFixed(5) || "0.00000"}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════════════
            TAB: AI SKILL PROMPTS, GAYA PENULISAN & CODE BINDING
           ════════════════════════════════════════════════════════════════════════ */}
        {activeTab === "PROMPTS_SKILLS" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            {/* Top Metric Cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
              <div style={{ background: "#FFFFFF", border: "1px solid #E4E4E9", borderRadius: 12, padding: "18px 20px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={{ fontSize: 12, color: "#71717A", fontWeight: 500 }}>Total Skill Prompts</span>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: "#EEEAFE", display: "flex", alignItems: "center", justifyContent: "center", color: "#4338CA" }}>
                    <Sparkles size={16} />
                  </div>
                </div>
                <div style={{ fontSize: 24, fontWeight: 700, color: "#0F0F14" }}>{promptsList.length}</div>
                <div style={{ fontSize: 11.5, color: "#16A34A", fontWeight: 500, marginTop: 4 }}>
                  Tersinkronisasi Real-time di Database
                </div>
              </div>

              <div style={{ background: "#FFFFFF", border: "1px solid #E4E4E9", borderRadius: 12, padding: "18px 20px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={{ fontSize: 12, color: "#71717A", fontWeight: 500 }}>Resep Baku Sub-bab 1-3</span>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: "#EFF6FF", display: "flex", alignItems: "center", justifyContent: "center", color: "#2563EB" }}>
                    <ListOrdered size={16} />
                  </div>
                </div>
                <div style={{ fontSize: 24, fontWeight: 700, color: "#0F0F14" }}>
                  {promptsList.filter((p) => p.category === "SUBCHAPTER").length || 19} Sub-bab
                </div>
                <div style={{ fontSize: 11.5, color: "#71717A", marginTop: 4 }}>
                  1.1 s/d 1.7, 2.1 s/d 2.4, 3.1 s/d 3.8
                </div>
              </div>

              <div style={{ background: "#FFFFFF", border: "1px solid #E4E4E9", borderRadius: 12, padding: "18px 20px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={{ fontSize: 12, color: "#71717A", fontWeight: 500 }}>Preset Gaya Penulisan</span>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: "#FDF2F8", display: "flex", alignItems: "center", justifyContent: "center", color: "#DB2777" }}>
                    <FileEdit size={16} />
                  </div>
                </div>
                <div style={{ fontSize: 24, fontWeight: 700, color: "#0F0F14" }}>4 Gaya Formal</div>
                <div style={{ fontSize: 11.5, color: "#71717A", marginTop: 4 }}>
                  APA 7th, Telaah Kritis, Metodologi, Implikasi
                </div>
              </div>

              <div style={{ background: "#FFFFFF", border: "1px solid #E4E4E9", borderRadius: 12, padding: "18px 20px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={{ fontSize: 12, color: "#71717A", fontWeight: 500 }}>Penyimpanan Engine</span>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: "#ECFDF5", display: "flex", alignItems: "center", justifyContent: "center", color: "#059669" }}>
                    <Database size={16} />
                  </div>
                </div>
                <div style={{ fontSize: 18, fontWeight: 700, color: "#059669" }}>Dynamic MySQL</div>
                <div style={{ fontSize: 11.5, color: "#71717A", marginTop: 4 }}>
                  Tabel <code>ai_skill_prompts</code> (TTL Cache 30s)
                </div>
              </div>
            </div>

            {/* Sub-Tab Navigation Bar */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #E4E4E9", paddingBottom: 12 }}>
              <div style={{ display: "flex", gap: 8 }}>
                {[
                  { id: "RECIPES", label: "Katalog Prompt & 19 Resep Sub-bab", icon: ListOrdered },
                  { id: "WRITING_STYLES", label: "Gaya Penulisan Akademik (Tone Presets)", icon: FileEdit },
                  { id: "CODE_BINDING", label: "Cara Terhubung ke Code & Dynamic Binding", icon: Code },
                ].map((st) => {
                  const Icon = st.icon;
                  const isCur = promptSubTab === st.id;
                  return (
                    <button
                      key={st.id}
                      onClick={() => setPromptSubTab(st.id as any)}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                        padding: "8px 16px",
                        borderRadius: 8,
                        fontSize: 13,
                        fontWeight: isCur ? 600 : 500,
                        background: isCur ? "#4338CA" : "#F7F7FB",
                        color: isCur ? "#FFFFFF" : "#71717A",
                        border: "1px solid",
                        borderColor: isCur ? "#4338CA" : "#E4E4E9",
                        cursor: "pointer",
                        transition: "all 0.15s ease",
                      }}
                    >
                      <Icon size={14} />
                      <span>{st.label}</span>
                    </button>
                  );
                })}
              </div>

              <div style={{ display: "flex", gap: 10 }}>
                <button
                  onClick={async () => {
                    const res = await api.prompts.list();
                    if (res.success) {
                      setPromptsList(res.data);
                      setFeedbackMsg({ type: "success", text: "Skill & Prompt berhasil disinkronkan dari database." });
                    }
                  }}
                  style={{
                    background: "#F7F7FB",
                    border: "1px solid #E4E4E9",
                    color: "#3F3F46",
                    padding: "8px 14px",
                    borderRadius: 8,
                    fontSize: 12.5,
                    fontWeight: 500,
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <RefreshCw size={13} />
                  <span>Sync DB</span>
                </button>

                <button
                  onClick={() => {
                    setEditingPrompt(null);
                    setIsCreatingPrompt(true);
                    setPromptFormData({
                      code: "CUSTOM_SKILL_" + Math.random().toString(36).substring(2, 6).toUpperCase(),
                      title: "",
                      category: "SUBCHAPTER",
                      tags: "kustom, riset",
                      description: "",
                      systemPrompt: "",
                      recipeSteps: [],
                      isActive: true,
                    });
                    setShowPromptModal(true);
                  }}
                  style={{
                    background: "#4338CA",
                    color: "#FFFFFF",
                    border: "none",
                    padding: "8px 16px",
                    borderRadius: 8,
                    fontSize: 13,
                    fontWeight: 500,
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <Plus size={14} />
                  <span>Tambah Skill Baru</span>
                </button>
              </div>
            </div>

            {/* ── SUB-TAB 1: RECIPES & PROMPTS ── */}
            {promptSubTab === "RECIPES" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                {/* Search & Filter Bar */}
                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  <div style={{ position: "relative", flex: 1 }}>
                    <Search size={16} color="#94a3b8" style={{ position: "absolute", left: 14, top: 11 }} />
                    <input
                      type="text"
                      value={promptSearchQuery}
                      onChange={(e) => setPromptSearchQuery(e.target.value)}
                      placeholder="Cari prompt berdasarkan judul, kode (misal: SUBCHAPTER_1_1), atau deskripsi..."
                      style={{
                        width: "100%",
                        height: 38,
                        paddingLeft: 38,
                        paddingRight: 14,
                        borderRadius: 8,
                        border: "1px solid #E4E4E9",
                        background: "#FFFFFF",
                        fontSize: 13,
                        color: "#0F0F14",
                        outline: "none",
                      }}
                    />
                    {promptSearchQuery && (
                      <button
                        onClick={() => setPromptSearchQuery("")}
                        style={{ position: "absolute", right: 10, top: 10, background: "none", border: "none", color: "#94a3b8", cursor: "pointer" }}
                      >
                        <X size={15} />
                      </button>
                    )}
                  </div>

                  {/* Category Filter */}
                  <select
                    value={promptCategoryFilter}
                    onChange={(e) => setPromptCategoryFilter(e.target.value)}
                    style={{
                      height: 38,
                      padding: "0 12px",
                      borderRadius: 8,
                      border: "1px solid #E4E4E9",
                      background: "#FFFFFF",
                      fontSize: 13,
                      color: "#3F3F46",
                      outline: "none",
                      cursor: "pointer",
                    }}
                  >
                    <option value="ALL">Semua Kategori ({promptsList.length})</option>
                    <option value="SUBCHAPTER">Sub-bab Outline 1-3 ({promptsList.filter(p => p.category === "SUBCHAPTER").length})</option>
                    <option value="OUTLINE">Blueprint Architect ({promptsList.filter(p => p.category === "OUTLINE").length})</option>
                    <option value="PROPOSAL">Proposal Drafter ({promptsList.filter(p => p.category === "PROPOSAL").length})</option>
                    <option value="SCREENING">Screening Jurnal ({promptsList.filter(p => p.category === "SCREENING").length})</option>
                    <option value="LITERATURE">Literature Search ({promptsList.filter(p => p.category === "LITERATURE").length})</option>
                    <option value="CUSTOM">Kustom ({promptsList.filter(p => p.category === "CUSTOM").length})</option>
                  </select>

                  {promptTagFilter && (
                    <button
                      onClick={() => setPromptTagFilter(null)}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 5,
                        padding: "6px 12px",
                        borderRadius: 8,
                        background: "#ECFDF5",
                        border: "1px solid #A7F3D0",
                        color: "#059669",
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      <span>Tag: #{promptTagFilter}</span>
                      <X size={13} />
                    </button>
                  )}
                </div>

                {/* Prompt Cards Grid */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(380px, 1fr))", gap: 16 }}>
                  {promptsList
                    .filter((p) => {
                      if (promptCategoryFilter !== "ALL" && p.category !== promptCategoryFilter) return false;
                      if (promptTagFilter) {
                        const tags = Array.isArray(p.tags) ? p.tags : [];
                        if (!tags.includes(promptTagFilter)) return false;
                      }
                      if (promptSearchQuery.trim()) {
                        const q = promptSearchQuery.toLowerCase();
                        const matchTitle = p.title.toLowerCase().includes(q);
                        const matchCode = p.code.toLowerCase().includes(q);
                        const matchDesc = (p.description || "").toLowerCase().includes(q);
                        if (!matchTitle && !matchCode && !matchDesc) return false;
                      }
                      return true;
                    })
                    .map((p) => {
                      const tags = Array.isArray(p.tags) ? p.tags : [];
                      const recipeSteps = Array.isArray(p.recipeSteps) ? p.recipeSteps : [];

                      return (
                        <div
                          key={p.id}
                          style={{
                            background: "#FFFFFF",
                            border: "1px solid #E4E4E9",
                            borderRadius: 12,
                            padding: 20,
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "space-between",
                            gap: 14,
                            boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
                          }}
                        >
                          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                            {/* Card Header Badges */}
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                <span
                                  style={{
                                    fontSize: 10.5,
                                    fontWeight: 700,
                                    padding: "2px 8px",
                                    borderRadius: 6,
                                    background: p.category === "SUBCHAPTER" ? "#EFF6FF" : p.category === "PROPOSAL" ? "#FAF5FF" : "#ECFDF5",
                                    color: p.category === "SUBCHAPTER" ? "#1D4ED8" : p.category === "PROPOSAL" ? "#7E22CE" : "#059669",
                                    border: `1px solid ${p.category === "SUBCHAPTER" ? "#BFDBFE" : p.category === "PROPOSAL" ? "#E9D5FF" : "#A7F3D0"}`,
                                  }}
                                >
                                  {p.category}
                                </span>
                                <span style={{ fontSize: 10.5, color: "#94A3B8", fontFamily: "monospace" }}>
                                  v{p.version}
                                </span>
                              </div>

                              <button
                                onClick={() => {
                                  navigator.clipboard.writeText(p.code);
                                  setCopiedPromptCode(p.code);
                                  setTimeout(() => setCopiedPromptCode(null), 2000);
                                }}
                                style={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: 4,
                                  fontSize: 11,
                                  fontFamily: "monospace",
                                  color: copiedPromptCode === p.code ? "#059669" : "#71717A",
                                  background: copiedPromptCode === p.code ? "#ECFDF5" : "#F7F7FB",
                                  border: "1px solid #E4E4E9",
                                  padding: "2px 7px",
                                  borderRadius: 6,
                                  cursor: "pointer",
                                }}
                                title="Salin kode pemanggilan di code"
                              >
                                {copiedPromptCode === p.code ? <Check size={11} /> : <Copy size={11} />}
                                <span>{p.code}</span>
                              </button>
                            </div>

                            {/* Title & Description */}
                            <div>
                              <h3 style={{ fontSize: 15, fontWeight: 700, color: "#0F0F14", margin: "0 0 4px" }}>
                                {p.title}
                              </h3>
                              <p style={{ fontSize: 12.5, color: "#71717A", margin: 0, lineHeight: 1.45 }}>
                                {p.description || "Panduan akademis dan instruksi pemodelan sistematis."}
                              </p>
                            </div>

                            {/* Step-by-Step Recipe Preview */}
                            {recipeSteps.length > 0 && (
                              <div style={{ background: "#F7F7FB", borderRadius: 8, padding: 10, border: "1px solid #E4E4E9" }}>
                                <div style={{ fontSize: 10.5, fontWeight: 700, color: "#71717A", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>
                                  Resep Standar ({recipeSteps.length} Langkah):
                                </div>
                                <div style={{ display: "flex", flexDirection: "column", gap: 4, maxHeight: 110, overflowY: "auto" }}>
                                  {recipeSteps.map((step, sIdx) => (
                                    <div key={sIdx} style={{ fontSize: 11.5, color: "#3F3F46", display: "flex", gap: 6, lineHeight: 1.35 }}>
                                      <span style={{ color: "#4338CA", fontWeight: 700, fontFamily: "monospace", flexShrink: 0 }}>
                                        {sIdx + 1}.
                                      </span>
                                      <span>{step}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Tags */}
                            {tags.length > 0 && (
                              <div style={{ display: "flex", flexWrap: "wrap", gap: 4, paddingTop: 2 }}>
                                {tags.map((tag) => (
                                  <span
                                    key={tag}
                                    onClick={() => setPromptTagFilter(tag)}
                                    style={{
                                      fontSize: 10.5,
                                      padding: "2px 6px",
                                      borderRadius: 4,
                                      background: "#F7F7FB",
                                      color: "#71717A",
                                      border: "1px solid #E4E4E9",
                                      cursor: "pointer",
                                    }}
                                  >
                                    #{tag}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Card Footer Actions */}
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 10, borderTop: "1px solid #F1F5F9" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                              {p.isSystem ? (
                                <span style={{ fontSize: 10.5, color: "#0369A1", background: "#E0F2FE", padding: "2px 6px", borderRadius: 4, fontWeight: 600 }}>
                                  System Built-in
                                </span>
                              ) : (
                                <span style={{ fontSize: 10.5, color: "#7E22CE", background: "#F3E8FF", padding: "2px 6px", borderRadius: 4, fontWeight: 600 }}>
                                  Custom Admin
                                </span>
                              )}
                            </div>

                            <button
                              onClick={() => {
                                setEditingPrompt(p);
                                setIsCreatingPrompt(false);
                                setPromptFormData({
                                  code: p.code,
                                  title: p.title,
                                  category: p.category,
                                  tags: (Array.isArray(p.tags) ? p.tags : []).join(", "),
                                  description: p.description || "",
                                  systemPrompt: p.systemPrompt || "",
                                  recipeSteps: Array.isArray(p.recipeSteps) ? [...p.recipeSteps] : [],
                                  isActive: p.isActive,
                                });
                                setShowPromptModal(true);
                              }}
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 5,
                                padding: "6px 12px",
                                borderRadius: 6,
                                background: "#F7F7FB",
                                border: "1px solid #E4E4E9",
                                fontSize: 12,
                                fontWeight: 600,
                                color: "#0F0F14",
                                cursor: "pointer",
                              }}
                            >
                              <Pencil size={12} />
                              <span>Edit Prompt & Resep</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}

            {/* ── SUB-TAB 2: GAYA PENULISAN (WRITING STYLES) ── */}
            {promptSubTab === "WRITING_STYLES" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                <div style={{ background: "#FFFFFF", border: "1px solid #E4E4E9", borderRadius: 12, padding: 24 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                    <FileEdit size={20} color="#4338CA" />
                    <h3 style={{ fontSize: 17, fontWeight: 700, margin: 0, color: "#0F0F14" }}>
                      Standar Gaya Penulisan & Academic Tone Presets
                    </h3>
                  </div>
                  <p style={{ fontSize: 13, color: "#71717A", margin: 0, lineHeight: 1.5, maxWidth: 840 }}>
                    AI Writer di Zetera menggunakan parameter gaya penulisan formal akademik bahasa Indonesia standar Dikti. Anda dapat menyesuaikan arahan gaya berikut yang langsung diinjeksikan saat draf proposal dan perbaikan paragraf dihasilkan.
                  </p>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: 16 }}>
                  {[
                    {
                      id: "style-1",
                      code: "STYLE_FORMAL_DIKTI",
                      title: "1. Gaya Skripsi Formal Indonesia (Standar Dikti / APA 7th)",
                      badge: "DEFAULT DRAFTER",
                      desc: "Bahasa baku baku EYD V, sudut pandang orang ketiga (objektif), piramida terbalik, dan sitasi formal APA 7th (Penulis, Tahun).",
                      prompt: `Gunakan bahasa Indonesia baku akademis formal berstandar pedoman penulisan Tugas Akhir Indonesia. Hindari kata ganti orang pertama (saya/kami). Gunakan kalimat pasif ilmiah ("dilakukan analisis", "ditemukan"). Terapkan sitasi APA 7th secara konsisten.`,
                    },
                    {
                      id: "style-2",
                      code: "STYLE_CRITICAL_SYNTHESIS",
                      title: "2. Gaya Telaah Kritis & Novelty Gap",
                      badge: "LITERATURE & BAB 2",
                      desc: "Menonjolkan perbandingan antar paper, menemukan kontradiksi empiris, dan mempertegas posisi kebaruan (research gap).",
                      prompt: `Sajikan analisis sintesis kritis yang mengomparasikan minimal 2 sudut pandang peneliti terdahulu. Tegaskan persamaan, perbedaan, dan research gap yang membuktikan novelty penelitian ini.`,
                    },
                    {
                      id: "style-3",
                      code: "STYLE_METHODOLOGY_PROCEDURAL",
                      title: "3. Gaya Metodologi Prosedural & Uji Statistik",
                      badge: "METODOLOGI & BAB 3",
                      desc: "Rinci, operasional, memuat rumus sampling (Slovin/Krejcie) atau triangulasi kualitatif secara presisi.",
                      prompt: `Tuliskan metodologi secara prosedural langkah demi langkah. Cantumkan rujukan buku metodologi resmi (Sugiyono, Creswell), rumus sampling, dan justifikasi instrumen ukur.`,
                    },
                    {
                      id: "style-4",
                      code: "STYLE_IMPLICATION_DISCUSSION",
                      title: "4. Gaya Pembahasan & Implikasi Kontribusi",
                      badge: "MANFAAT & PEMBAHASAN",
                      desc: "Menghubungkan hasil temuan teknis dengan implikasi teoretis keilmuan dan manfaat aplikatif bagi stakeholder.",
                      prompt: `Uraikan dampak dan implikasi riset secara berimbang antara kontribusi keilmuan teoretis dan manfaat praktis lapangan bagi pengguna/industri.`,
                    },
                  ].map((st) => (
                    <div
                      key={st.id}
                      style={{
                        background: "#FFFFFF",
                        border: "1px solid #E4E4E9",
                        borderRadius: 12,
                        padding: 20,
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                        gap: 14,
                      }}
                    >
                      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                          <span style={{ fontSize: 10.5, fontWeight: 700, padding: "2px 7px", borderRadius: 6, background: "#EEEAFE", color: "#4338CA", border: "1px solid #C7D2FE" }}>
                            {st.badge}
                          </span>
                          <span style={{ fontSize: 11, fontFamily: "monospace", color: "#71717A" }}>{st.code}</span>
                        </div>
                        <h4 style={{ fontSize: 14.5, fontWeight: 700, margin: 0, color: "#0F0F14" }}>{st.title}</h4>
                        <p style={{ fontSize: 12.5, color: "#71717A", margin: 0, lineHeight: 1.45 }}>{st.desc}</p>
                        <div style={{ background: "#F7F7FB", padding: "10px 12px", borderRadius: 8, border: "1px solid #E4E4E9", fontSize: 12, color: "#3F3F46", fontFamily: "monospace", lineHeight: 1.45 }}>
                          "{st.prompt}"
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          setEditingPrompt(null);
                          setIsCreatingPrompt(true);
                          setPromptFormData({
                            code: st.code,
                            title: st.title,
                            category: "PROPOSAL",
                            tags: "gaya_penulisan, tone, akademik",
                            description: st.desc,
                            systemPrompt: st.prompt,
                            recipeSteps: [],
                            isActive: true,
                          });
                          setShowPromptModal(true);
                        }}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 6,
                          padding: "7px 14px",
                          borderRadius: 6,
                          background: "#F7F7FB",
                          border: "1px solid #E4E4E9",
                          fontSize: 12,
                          fontWeight: 600,
                          color: "#4338CA",
                          cursor: "pointer",
                        }}
                      >
                        <Pencil size={12} />
                        <span>Kustomisasi Preset Gaya Ini</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── SUB-TAB 3: CARA TERHUBUNG KE CODE & DYNAMIC BINDING ── */}
            {promptSubTab === "CODE_BINDING" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                <div style={{ background: "#FFFFFF", border: "1px solid #E4E4E9", borderRadius: 12, padding: 24 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                    <Code size={20} color="#4338CA" />
                    <h3 style={{ fontSize: 17, fontWeight: 700, margin: 0, color: "#0F0F14" }}>
                      Arsitektur Dynamic Code Binding (Database &rarr; AI Backend)
                    </h3>
                  </div>
                  <p style={{ fontSize: 13, color: "#71717A", margin: 0, lineHeight: 1.5, maxWidth: 840 }}>
                    Bagaimana backend Zetera memanggil dan menyuntikkan prompt dinamis dari database tanpa memerlukan perubahan kode program atau *re-deployment*.
                  </p>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(420px, 1fr))", gap: 18 }}>
                  {/* Code Card 1 */}
                  <div style={{ background: "#0F172A", borderRadius: 12, padding: 20, color: "#F8FAFC", display: "flex", flexDirection: "column", gap: 10 }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: 8 }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: "#34D399" }}>1. Membaca 19 Resep Sub-bab Dinamis</span>
                      <span style={{ fontSize: 11, color: "#94A3B8" }}>outline.service.js</span>
                    </div>
                    <pre style={{ fontSize: 12, fontFamily: "monospace", margin: 0, color: "#CBD5E1", lineHeight: 1.5, overflowX: "auto" }}>
{`// Ambil seluruh resep sub-bab dari database MySQL
const dbGuides = await getAllSubchapterGuides();
const activeGuides = dbGuides || SUBCHAPTER_MODELING_GUIDES;

// AI Generator secara otomatis merender instruksi
const systemPrompt = \`
Gunakan resep pemodelan berikut:
\${Object.entries(activeGuides)
  .map(([code, g]) => \`- Sub-bab \${code}: \${g.steps.join(", ")}\`)
  .join("\\n")}
\`;`}
                    </pre>
                  </div>

                  {/* Code Card 2 */}
                  <div style={{ background: "#0F172A", borderRadius: 12, padding: 20, color: "#F8FAFC", display: "flex", flexDirection: "column", gap: 10 }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: 8 }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: "#38BDF8" }}>2. Memanggil Skill Tertentu dengan Variabel</span>
                      <span style={{ fontSize: 11, color: "#94A3B8" }}>proposal.service.js</span>
                    </div>
                    <pre style={{ fontSize: 12, fontFamily: "monospace", margin: 0, color: "#CBD5E1", lineHeight: 1.5, overflowX: "auto" }}>
{`// Ambil prompt sistem & interpolasi variabel {{TOPIC}}
const promptSkill = await getSkillPrompt("SUBCHAPTER_1_1", {
  TOPIC: project.title,
  PRODI: project.prodi,
  APPROACH: project.approachType,
});

// Eksekusi via Dual-Tier AI Router
const response = await executeAiCompletion({
  featureCode: "DRAFT_SKRIPSI",
  messages: [{ role: "system", content: promptSkill.renderedSystemPrompt }],
  userId,
});`}
                    </pre>
                  </div>

                  {/* Code Card 3 */}
                  <div style={{ background: "#0F172A", borderRadius: 12, padding: 20, color: "#F8FAFC", display: "flex", flexDirection: "column", gap: 10 }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: 8 }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: "#F472B6" }}>3. Variable Injection Reference</span>
                      <span style={{ fontSize: 11, color: "#94A3B8" }}>Interpolation Engine</span>
                    </div>
                    <div style={{ fontSize: 12, color: "#CBD5E1", display: "flex", flexDirection: "column", gap: 6 }}>
                      <div><code style={{ color: "#34D399" }}>{"{{TOPIC}}"}</code> : Judul skripsi / topik penelitian</div>
                      <div><code style={{ color: "#38BDF8" }}>{"{{PRODI}}"}</code> : Program studi / disiplin ilmu</div>
                      <div><code style={{ color: "#F472B6" }}>{"{{APPROACH}}"}</code> : Pendekatan riset (KUANTITATIF / KUALITATIF)</div>
                      <div><code style={{ color: "#FBBF24" }}>{"{{MEMORY_CONTEXT}}"}</code> : Rangkuman paper & landscape literatur</div>
                    </div>
                  </div>

                  {/* Code Card 4 */}
                  <div style={{ background: "#0F172A", borderRadius: 12, padding: 20, color: "#F8FAFC", display: "flex", flexDirection: "column", gap: 10 }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: 8 }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: "#FBBF24" }}>4. In-Memory Cache (TTL 30 Detik)</span>
                      <span style={{ fontSize: 11, color: "#94A3B8" }}>Zero Latency</span>
                    </div>
                    <p style={{ fontSize: 12, color: "#94A3B8", margin: 0, lineHeight: 1.5 }}>
                      Untuk menjamin performa tanpa overhead query ke database pada setiap token generation, prompt dicache selama 30 detik. Saat Admin mengklik <strong>"Simpan Perubahan"</strong> di UI Admin, cache otomatis dibersihkan seketika.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Prompt Modal (Create & Edit) */}
            {showPromptModal && (
              <div
                style={{
                  position: "fixed",
                  inset: 0,
                  background: "rgba(15,23,42,0.6)",
                  backdropFilter: "blur(4px)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  zIndex: 100,
                  padding: 20,
                }}
              >
                <div
                  style={{
                    background: "#FFFFFF",
                    borderRadius: 16,
                    maxWidth: 760,
                    width: "100%",
                    maxHeight: "90vh",
                    overflowY: "auto",
                    padding: 28,
                    boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
                    display: "flex",
                    flexDirection: "column",
                    gap: 20,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #E4E4E9", paddingBottom: 14 }}>
                    <div>
                      <h3 style={{ fontSize: 18, fontWeight: 700, color: "#0F0F14", margin: 0 }}>
                        {isCreatingPrompt ? "Tambah Skill Prompt Baru" : `Edit Skill: ${promptFormData.title || promptFormData.code}`}
                      </h3>
                      <span style={{ fontSize: 12, color: "#71717A" }}>
                        Identifier: <code style={{ color: "#4338CA", fontWeight: 700 }}>{promptFormData.code}</code>
                      </span>
                    </div>
                    <button
                      onClick={() => setShowPromptModal(false)}
                      style={{ background: "none", border: "none", color: "#71717A", cursor: "pointer" }}
                    >
                      <X size={20} />
                    </button>
                  </div>

                  <form
                    onSubmit={async (e) => {
                      e.preventDefault();
                      setSavingPrompt(true);
                      try {
                        const tagArray = promptFormData.tags.split(",").map(t => t.trim().toLowerCase()).filter(Boolean);
                        if (isCreatingPrompt) {
                          await api.prompts.create({
                            code: promptFormData.code,
                            title: promptFormData.title,
                            category: promptFormData.category,
                            tags: tagArray,
                            description: promptFormData.description,
                            systemPrompt: promptFormData.systemPrompt,
                            recipeSteps: promptFormData.recipeSteps,
                            isActive: promptFormData.isActive,
                          });
                          setFeedbackMsg({ type: "success", text: "Skill Prompt baru berhasil dibuat di database." });
                        } else if (editingPrompt) {
                          await api.prompts.update(editingPrompt.id, {
                            title: promptFormData.title,
                            category: promptFormData.category,
                            tags: tagArray,
                            description: promptFormData.description,
                            systemPrompt: promptFormData.systemPrompt,
                            recipeSteps: promptFormData.recipeSteps,
                            isActive: promptFormData.isActive,
                          });
                          setFeedbackMsg({ type: "success", text: `Prompt "${promptFormData.title}" berhasil diperbarui.` });
                        }
                        const fresh = await api.prompts.list();
                        if (fresh.success) setPromptsList(fresh.data);
                        setShowPromptModal(false);
                      } catch (err: any) {
                        alert("Gagal menyimpan prompt: " + (err.message || err));
                      } finally {
                        setSavingPrompt(false);
                      }
                    }}
                    style={{ display: "flex", flexDirection: "column", gap: 16 }}
                  >
                    {/* Row 0: Code Identifier (Locked on Edit) */}
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                        <label style={{ fontSize: 12, fontWeight: 600, color: "#3F3F46" }}>
                          Kode Identifier Pemanggilan di Code
                        </label>
                        {!isCreatingPrompt ? (
                          <span style={{ fontSize: 11, background: "#EFF6FF", color: "#1D4ED8", padding: "2px 8px", borderRadius: 6, fontWeight: 700, border: "1px solid #BFDBFE" }}>
                            🔒 Terkunci (Terhubung ke Backend)
                          </span>
                        ) : (
                          <span style={{ fontSize: 11, color: "#71717A" }}>
                            Gunakan format UPPERCASE (Contoh: CUSTOM_ANALISIS_GAP)
                          </span>
                        )}
                      </div>
                      <input
                        type="text"
                        required
                        disabled={!isCreatingPrompt}
                        value={promptFormData.code}
                        onChange={(e) => setPromptFormData({ ...promptFormData, code: e.target.value.toUpperCase().replace(/\s+/g, "_") })}
                        placeholder="Contoh: SUBCHAPTER_1_1"
                        style={{
                          width: "100%",
                          height: 38,
                          padding: "0 12px",
                          borderRadius: 8,
                          border: "1px solid #E4E4E9",
                          fontSize: 13,
                          fontFamily: "monospace",
                          fontWeight: 700,
                          background: !isCreatingPrompt ? "#F1F5F9" : "#FFFFFF",
                          color: !isCreatingPrompt ? "#64748B" : "#0F0F14",
                          cursor: !isCreatingPrompt ? "not-allowed" : "text",
                        }}
                      />
                    </div>

                    {/* Title & Category */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 180px", gap: 14 }}>
                      <div>
                        <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#3F3F46", marginBottom: 6 }}>
                          Judul Skill / Sub-bab
                        </label>
                        <input
                          type="text"
                          required
                          value={promptFormData.title}
                          onChange={(e) => setPromptFormData({ ...promptFormData, title: e.target.value })}
                          placeholder="Contoh: BAB 1.1: Latar Belakang (Piramida Terbalik)"
                          style={{ width: "100%", height: 38, padding: "0 12px", borderRadius: 8, border: "1px solid #E4E4E9", fontSize: 13 }}
                        />
                      </div>

                      <div>
                        <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#3F3F46", marginBottom: 6 }}>
                          Kategori
                        </label>
                        <select
                          value={promptFormData.category}
                          onChange={(e) => setPromptFormData({ ...promptFormData, category: e.target.value })}
                          style={{ width: "100%", height: 38, padding: "0 8px", borderRadius: 8, border: "1px solid #E4E4E9", fontSize: 13, background: "#FFFFFF" }}
                        >
                          <option value="SUBCHAPTER">Sub-bab Outline</option>
                          <option value="OUTLINE">Blueprint Architect</option>
                          <option value="PROPOSAL">Proposal Drafter</option>
                          <option value="SCREENING">Screening Jurnal</option>
                          <option value="LITERATURE">Literature Search</option>
                          <option value="CUSTOM">Custom Skill</option>
                        </select>
                      </div>
                    </div>

                    {/* Tags & Description */}
                    <div>
                      <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#3F3F46", marginBottom: 6 }}>
                        Tagging (Pisahkan dengan koma)
                      </label>
                      <input
                        type="text"
                        value={promptFormData.tags}
                        onChange={(e) => setPromptFormData({ ...promptFormData, tags: e.target.value })}
                        placeholder="bab1, latar_belakang, piramida_terbalik, 8_langkah, gap"
                        style={{ width: "100%", height: 38, padding: "0 12px", borderRadius: 8, border: "1px solid #E4E4E9", fontSize: 13 }}
                      />
                    </div>

                    <div>
                      <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#3F3F46", marginBottom: 6 }}>
                        Deskripsi / Tujuan Akademis
                      </label>
                      <textarea
                        rows={2}
                        value={promptFormData.description}
                        onChange={(e) => setPromptFormData({ ...promptFormData, description: e.target.value })}
                        placeholder="Uraian singkat tujuan instruksional dan peran akademik prompt ini..."
                        style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid #E4E4E9", fontSize: 13, fontFamily: "inherit" }}
                      />
                    </div>

                    {/* Step-by-Step Recipe Builder */}
                    <div>
                      <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#3F3F46", marginBottom: 6 }}>
                        Resep Butir Langkah Baku ({promptFormData.recipeSteps.length} Butir)
                      </label>
                      <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 8, maxHeight: 180, overflowY: "auto" }}>
                        {promptFormData.recipeSteps.map((step, idx) => (
                          <div key={idx} style={{ display: "flex", alignItems: "center", gap: 8, background: "#F7F7FB", padding: "6px 10px", borderRadius: 6, border: "1px solid #E4E4E9" }}>
                            <span style={{ fontSize: 11, fontWeight: 700, color: "#4338CA", width: 20 }}>{idx + 1}.</span>
                            <span style={{ fontSize: 12, color: "#1E293B", flex: 1 }}>{step}</span>
                            <button
                              type="button"
                              onClick={() => {
                                setPromptFormData({
                                  ...promptFormData,
                                  recipeSteps: promptFormData.recipeSteps.filter((_, i) => i !== idx),
                                });
                              }}
                              style={{ background: "none", border: "none", color: "#EF4444", cursor: "pointer" }}
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        ))}
                      </div>

                      <div style={{ display: "flex", gap: 8 }}>
                        <input
                          type="text"
                          value={newStepInput}
                          onChange={(e) => setNewStepInput(e.target.value)}
                          placeholder="Ketik butir instruksi langkah baru..."
                          style={{ flex: 1, height: 36, padding: "0 10px", borderRadius: 6, border: "1px solid #E4E4E9", fontSize: 12.5 }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              if (newStepInput.trim()) {
                                setPromptFormData({
                                  ...promptFormData,
                                  recipeSteps: [...promptFormData.recipeSteps, newStepInput.trim()],
                                });
                                setNewStepInput("");
                              }
                            }
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (newStepInput.trim()) {
                              setPromptFormData({
                                ...promptFormData,
                                recipeSteps: [...promptFormData.recipeSteps, newStepInput.trim()],
                              });
                              setNewStepInput("");
                            }
                          }}
                          style={{
                            background: "#F7F7FB",
                            border: "1px solid #E4E4E9",
                            padding: "6px 12px",
                            borderRadius: 6,
                            fontSize: 12.5,
                            fontWeight: 500,
                            cursor: "pointer",
                          }}
                        >
                          + Tambah Butir
                        </button>
                      </div>
                    </div>

                    {/* System Prompt Box */}
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                        <label style={{ fontSize: 12, fontWeight: 600, color: "#3F3F46" }}>
                          System Prompt Template (AI Instructions)
                        </label>
                        <span style={{ fontSize: 11, color: "#71717A" }}>
                          Gunakan variabel: <code style={{ color: "#4338CA" }}>{"{{TOPIC}}"}</code>, <code style={{ color: "#4338CA" }}>{"{{PRODI}}"}</code>
                        </span>
                      </div>
                      <textarea
                        rows={6}
                        required
                        value={promptFormData.systemPrompt}
                        onChange={(e) => setPromptFormData({ ...promptFormData, systemPrompt: e.target.value })}
                        style={{
                          width: "100%",
                          padding: "10px 12px",
                          borderRadius: 8,
                          border: "1px solid #E4E4E9",
                          fontSize: 12.5,
                          fontFamily: "monospace",
                          background: "#0F172A",
                          color: "#F8FAFC",
                          lineHeight: 1.45,
                        }}
                      />
                    </div>

                    {/* Submit Actions */}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 10, paddingTop: 10, borderTop: "1px solid #E4E4E9" }}>
                      <button
                        type="button"
                        onClick={() => setShowPromptModal(false)}
                        style={{
                          background: "#F7F7FB",
                          border: "1px solid #E4E4E9",
                          padding: "8px 14px",
                          borderRadius: 6,
                          fontSize: 13,
                          cursor: "pointer",
                        }}
                      >
                        Batal
                      </button>

                      <button
                        type="submit"
                        disabled={savingPrompt}
                        style={{
                          background: "#4338CA",
                          color: "#FFFFFF",
                          border: "none",
                          padding: "8px 18px",
                          borderRadius: 6,
                          fontSize: 13,
                          fontWeight: 600,
                          cursor: "pointer",
                        }}
                      >
                        {savingPrompt ? "Menyimpan ke DB..." : "Simpan Perubahan ke Database"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════════════
            TAB 2: HARGA & LANGGANAN
           ════════════════════════════════════════════════════════════════════════ */}
        {activeTab === "PRICING" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 600, margin: "0 0 2px", color: "#0F0F14" }}>
                  List Paket Harga
                </h2>
                <p style={{ fontSize: 13, color: "#71717A", margin: 0 }}>
                  Atur harga paket, kuota koin, dan status langganan
                </p>
              </div>

              <button
                onClick={() => {
                  setEditingPackageId(null);
                  setPackageFormData({
                    name: "",
                    type: "ONE_TIME",
                    creditsGranted: 100,
                    durationDays: null as any,
                    priceNormal: 25000,
                    priceDiscount: 19000,
                    badgeLabel: "HEMAT 24%",
                    isActive: true,
                  });
                  setShowPackageModal(true);
                }}
                style={{
                  background: "#4338CA",
                  color: "#FFFFFF",
                  border: "none",
                  borderRadius: 8,
                  padding: "8px 16px",
                  fontSize: 13,
                  fontWeight: 500,
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <Plus size={15} />
                <span>Tambah Paket</span>
              </button>
            </div>

            {/* List Paket Harga Table */}
            <div
              style={{
                background: "#FFFFFF",
                border: "1px solid #E4E4E9",
                borderRadius: 12,
                overflow: "hidden",
              }}
            >
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: "#F7F7FB", borderBottom: "1px solid #E4E4E9", color: "#3F3F46", fontWeight: 500 }}>
                      <th style={{ padding: "12px 18px", width: 36 }}>
                        <input type="checkbox" />
                      </th>
                      <th style={{ padding: "12px 14px" }}>Nama Paket</th>
                      <th style={{ padding: "12px 14px" }}>Tipe Paket</th>
                      <th style={{ padding: "12px 14px" }}>Koin</th>
                      <th style={{ padding: "12px 14px" }}>Harga</th>
                      <th style={{ padding: "12px 14px" }}>Status</th>
                      <th style={{ padding: "12px 18px", textAlign: "right" }}>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {creditPackages.map((pkg) => (
                      <tr key={pkg.id} style={{ borderBottom: "1px solid #EFEFF3" }}>
                        <td style={{ padding: "12px 18px" }}>
                          <input type="checkbox" />
                        </td>
                        <td style={{ padding: "12px 14px", fontWeight: 600, color: "#0F0F14" }}>
                          {pkg.name}
                          {pkg.badgeLabel && (
                            <span
                              style={{
                                marginLeft: 8,
                                fontSize: 10,
                                fontWeight: 500,
                                background: "#EEEAFE",
                                color: "#4338CA",
                                padding: "2px 7px",
                                borderRadius: 9999,
                              }}
                            >
                              {pkg.badgeLabel}
                            </span>
                          )}
                        </td>
                        <td style={{ padding: "12px 14px", color: "#71717A" }}>
                          {pkg.type === "SUBSCRIPTION" ? `Langganan (${pkg.durationDays || 30} Hari)` : "ONTIME (Permanen)"}
                        </td>
                        <td style={{ padding: "12px 14px", fontWeight: 600, color: "#0F0F14" }}>
                          {pkg.creditsGranted}
                        </td>
                        <td style={{ padding: "12px 14px" }}>
                          {pkg.priceDiscount ? (
                            <div>
                              <span style={{ fontSize: 11, color: "#BE123C", textDecoration: "line-through", display: "block" }}>
                                Rp {Number(pkg.priceNormal).toLocaleString("id-ID")}
                              </span>
                              <span style={{ fontWeight: 600, color: "#0F0F14" }}>
                                Rp {Number(pkg.priceDiscount).toLocaleString("id-ID")}
                              </span>
                            </div>
                          ) : (
                            <span style={{ fontWeight: 600, color: "#0F0F14" }}>
                              Rp {Number(pkg.priceNormal).toLocaleString("id-ID")}
                            </span>
                          )}
                        </td>
                        <td style={{ padding: "12px 14px" }}>
                          {pkg.isActive ? (
                            <span
                              style={{
                                background: "#DCFCE7",
                                color: "#16A34A",
                                fontSize: 11,
                                fontWeight: 600,
                                padding: "3px 10px",
                                borderRadius: 9999,
                              }}
                            >
                              AKTIF
                            </span>
                          ) : (
                            <span
                              style={{
                                background: "#F7F7FB",
                                color: "#71717A",
                                fontSize: 11,
                                fontWeight: 500,
                                padding: "3px 10px",
                                borderRadius: 9999,
                              }}
                            >
                              NONAKTIF
                            </span>
                          )}
                        </td>
                        <td style={{ padding: "12px 18px", textAlign: "right" }}>
                          <div style={{ display: "inline-flex", gap: 8 }}>
                            <button
                              onClick={() => {
                                setEditingPackageId(pkg.id);
                                setPackageFormData({
                                  name: pkg.name,
                                  type: pkg.type,
                                  creditsGranted: pkg.creditsGranted,
                                  durationDays: pkg.durationDays || 30,
                                  priceNormal: pkg.priceNormal,
                                  priceDiscount: pkg.priceDiscount || 0,
                                  badgeLabel: pkg.badgeLabel || "",
                                  isActive: pkg.isActive,
                                });
                                setShowPackageModal(true);
                              }}
                              style={{ background: "transparent", border: "none", cursor: "pointer", color: "#3F3F46" }}
                            >
                              <Pencil size={14} />
                            </button>
                            <button
                              onClick={() => handleDeletePackage(pkg.id, pkg.name)}
                              style={{ background: "transparent", border: "none", cursor: "pointer", color: "#BE123C" }}
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Ideal Credit & Margin Simulator */}
            <div
              style={{
                background: "#FFFFFF",
                border: "1px solid #E4E4E9",
                borderRadius: 12,
                padding: "20px 24px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                <div style={{ width: 34, height: 34, borderRadius: 8, background: "#EEEAFE", color: "#4338CA", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Sparkles size={16} />
                </div>
                <div>
                  <h3 style={{ fontSize: 15, fontWeight: 600, margin: "0 0 2px", color: "#0F0F14" }}>
                    Ideal Credit & Profit Margin Simulator
                  </h3>
                  <p style={{ fontSize: 12.5, color: "#71717A", margin: 0 }}>
                    Hitung rekomendasi harga jual paket & kuota koin berdasarkan modal API dan target margin laba
                  </p>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14, marginBottom: 16 }}>
                <div>
                  <label style={{ fontSize: 11.5, fontWeight: 500, color: "#71717A", display: "block", marginBottom: 4 }}>
                    Model AI Target
                  </label>
                  <select
                    value={simModelId}
                    onChange={(e) => setSimModelId(e.target.value)}
                    style={{ width: "100%", background: "#F7F7FB", border: "1px solid #E4E4E9", borderRadius: 8, padding: "7px 10px", fontSize: 12.5, color: "#0F0F14" }}
                  >
                    {aiModels.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.routerLabel} ({m.modelName})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: 11.5, fontWeight: 500, color: "#71717A", display: "block", marginBottom: 4 }}>
                    Target Margin Laba (%)
                  </label>
                  <select
                    value={simTargetMargin}
                    onChange={(e) => setSimTargetMargin(Number(e.target.value))}
                    style={{ width: "100%", background: "#F7F7FB", border: "1px solid #E4E4E9", borderRadius: 8, padding: "7px 10px", fontSize: 12.5, color: "#0F0F14" }}
                  >
                    <option value={0.3}>30% Margin Laba</option>
                    <option value={0.4}>40% Margin Laba</option>
                    <option value={0.5}>50% Margin Laba</option>
                    <option value={0.7}>70% Margin Laba</option>
                    <option value={0.9}>90% (SaaS Super Profit)</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: 11.5, fontWeight: 500, color: "#71717A", display: "block", marginBottom: 4 }}>
                    Estimasi Generate / Bulan
                  </label>
                  <input
                    type="number"
                    value={simGenerations}
                    onChange={(e) => setSimGenerations(Number(e.target.value) || 30)}
                    style={{ width: "100%", background: "#F7F7FB", border: "1px solid #E4E4E9", borderRadius: 8, padding: "7px 10px", fontSize: 12.5, color: "#0F0F14" }}
                  />
                </div>

                <div style={{ display: "flex", alignItems: "flex-end" }}>
                  <button
                    type="button"
                    onClick={handleRunSimulator}
                    style={{
                      width: "100%",
                      background: "#4338CA",
                      color: "#FFFFFF",
                      border: "none",
                      borderRadius: 8,
                      padding: "8px 14px",
                      fontSize: 13,
                      fontWeight: 500,
                      cursor: "pointer",
                    }}
                  >
                    Kalkulasi Paket
                  </button>
                </div>
              </div>

              {simResult && (
                <div
                  style={{
                    background: "#F7F7FB",
                    border: "1px solid #E4E4E9",
                    borderRadius: 8,
                    padding: "16px 18px",
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                    gap: 14,
                  }}
                >
                  <div>
                    <span style={{ fontSize: 11, color: "#71717A" }}>Total HPP Modal API</span>
                    <div style={{ fontSize: 16, fontWeight: 600, color: "#0F0F14" }}>
                      Rp {simResult.totalHppIdr.toLocaleString("id-ID")}
                    </div>
                  </div>
                  <div>
                    <span style={{ fontSize: 11, color: "#71717A" }}>Saran Harga Jual</span>
                    <div style={{ fontSize: 16, fontWeight: 600, color: "#16A34A" }}>
                      Rp {simResult.suggestedPriceIdr.toLocaleString("id-ID")}
                    </div>
                  </div>
                  <div>
                    <span style={{ fontSize: 11, color: "#71717A" }}>Rekomendasi Kuota Koin</span>
                    <div style={{ fontSize: 16, fontWeight: 600, color: "#0F0F14" }}>
                      {simResult.recommendedCredits} Kredit
                    </div>
                  </div>
                  <div>
                    <span style={{ fontSize: 11, color: "#71717A" }}>Efektivitas Margin</span>
                    <div style={{ fontSize: 16, fontWeight: 600, color: "#4338CA" }}>
                      {simResult.effectiveMarginPercent}% Laba Bersih
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════════════
            TAB 3: EXECUTIVE DASHBOARD (100% Real Database Queries)
           ════════════════════════════════════════════════════════════════════════ */}
        {activeTab === "DASHBOARD" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {/* 4 Hero KPI Cards */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                gap: 14,
              }}
            >
              {/* Total Users */}
              <div style={{ background: "#FFFFFF", border: "1px solid #E4E4E9", borderRadius: 12, padding: "18px 20px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                  <div style={{ width: 30, height: 30, borderRadius: 8, background: "#EEEAFE", color: "#4338CA", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Users size={15} />
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 500, color: "#71717A" }}>Total Pengguna</span>
                </div>
                <div style={{ fontSize: 26, fontWeight: 600, color: "#0F0F14", letterSpacing: "-0.015em" }}>
                  {Number(stats?.totalUsers || 0).toLocaleString("id-ID")}
                </div>
                <div style={{ fontSize: 11, color: "#16A34A", fontWeight: 500, marginTop: 4 }}>
                  {stats?.totalProjects || 0} Proyek Riset Aktif
                </div>
              </div>

              {/* Total Pendapatan */}
              <div style={{ background: "#FFFFFF", border: "1px solid #E4E4E9", borderRadius: 12, padding: "18px 20px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                  <div style={{ width: 30, height: 30, borderRadius: 8, background: "#EEEAFE", color: "#4338CA", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Coins size={15} />
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 500, color: "#71717A" }}>Total Pendapatan</span>
                </div>
                <div style={{ fontSize: 26, fontWeight: 600, color: "#0F0F14", letterSpacing: "-0.015em" }}>
                  Rp {Number(stats?.billing?.totalRevenueIdr || 0).toLocaleString("id-ID")}
                </div>
                <div style={{ fontSize: 11, color: "#16A34A", fontWeight: 500, marginTop: 4 }}>
                  Laba Bersih: ${stats?.billing?.netProfitUsd?.toFixed(4) || "0.00"}
                </div>
              </div>

              {/* Pengeluaran AI */}
              <div style={{ background: "#FFFFFF", border: "1px solid #E4E4E9", borderRadius: 12, padding: "18px 20px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                  <div style={{ width: 30, height: 30, borderRadius: 8, background: "#EEEAFE", color: "#4338CA", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <TrendingUp size={15} />
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 500, color: "#71717A" }}>Pengeluaran Modal AI</span>
                </div>
                <div style={{ fontSize: 26, fontWeight: 600, color: "#0F0F14", letterSpacing: "-0.015em" }}>
                  Rp {Number(stats?.billing?.aiExpenseIdr || 0).toLocaleString("id-ID")}
                </div>
                <div style={{ fontSize: 11, color: "#71717A", fontWeight: 500, marginTop: 4 }}>
                  Modal Provider: ${stats?.billing?.aiExpenseUsd?.toFixed(4) || "0.00"}
                </div>
              </div>

              {/* Sisa Budget AI */}
              <div style={{ background: "#FFFFFF", border: "1px solid #E4E4E9", borderRadius: 12, padding: "18px 20px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 30, height: 30, borderRadius: 8, background: "#EEEAFE", color: "#4338CA", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Cpu size={15} />
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 500, color: "#71717A" }}>Sisa Budget AI</span>
                  </div>
                  <span
                    style={{
                      background: (stats?.billing?.remainingPercent ?? 100) < 20 ? "#FFF1F2" : "#DCFCE7",
                      color: (stats?.billing?.remainingPercent ?? 100) < 20 ? "#BE123C" : "#16A34A",
                      fontSize: 10,
                      fontWeight: 600,
                      padding: "2px 7px",
                      borderRadius: 9999,
                    }}
                  >
                    {stats?.billing?.remainingPercent ?? 100}% Tersedia
                  </span>
                </div>
                <div style={{ fontSize: 26, fontWeight: 600, color: "#0F0F14", letterSpacing: "-0.015em" }}>
                  ${stats?.billing?.remainingBudgetUsd?.toFixed(2) || "50.00"}
                </div>
                <div style={{ fontSize: 11, color: "#71717A", fontWeight: 500, marginTop: 4 }}>
                  Total Token Terpakai: {Number(stats?.billing?.totalTokensUsed || 0).toLocaleString()}
                </div>
              </div>
            </div>

            {/* Charts Row */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: 16 }}>
              {/* 1. Real 7-Day Trend Chart */}
              <div style={{ background: "#FFFFFF", border: "1px solid #E4E4E9", borderRadius: 12, padding: "20px 22px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                  <h3 style={{ fontSize: 15, fontWeight: 600, margin: 0, color: "#0F0F14" }}>
                    Rangkuman Pendapatan & Beban AI (7 Hari)
                  </h3>
                  <span style={{ fontSize: 11, color: "#71717A" }}>Live DB Telemetry</span>
                </div>

                <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", height: 160, gap: 10, paddingBottom: 8, borderBottom: "1px solid #E4E4E9" }}>
                  {(() => {
                    const trends = stats?.dailyTrends || [];
                    const maxExpense = Math.max(...trends.map((t: any) => t.expenseIdr), 100);

                    return (trends.length > 0 ? trends : [
                      { label: "1 Mei", expenseIdr: 0 },
                      { label: "2 Mei", expenseIdr: 0 },
                      { label: "3 Mei", expenseIdr: 0 },
                      { label: "4 Mei", expenseIdr: 0 },
                      { label: "5 Mei", expenseIdr: 0 },
                      { label: "6 Mei", expenseIdr: 0 },
                      { label: "Hari ini", expenseIdr: 0 },
                    ]).map((bar: any, idx: number) => {
                      const heightPercent = bar.expenseIdr > 0 ? Math.max(15, Math.min(100, Math.round((bar.expenseIdr / maxExpense) * 100))) : 8;
                      return (
                        <div key={idx} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", height: "100%", justifyContent: "flex-end" }}>
                          <div
                            title={`Rp ${Number(bar.expenseIdr || 0).toLocaleString()} (${bar.callsCount || 0} calls)`}
                            style={{
                              width: "100%",
                              maxWidth: 28,
                              height: `${heightPercent}%`,
                              borderRadius: "4px 4px 0 0",
                              background: bar.expenseIdr > 0 ? "#4338CA" : "#E4E4E9",
                              transition: "height 0.3s ease",
                            }}
                          />
                          <span style={{ fontSize: 9.5, color: "#71717A", marginTop: 6, textAlign: "center", whiteSpace: "nowrap" }}>
                            {bar.label}
                          </span>
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>

              {/* 2. Model AI Donut (Free vs Paid Real Ratio) */}
              <div style={{ background: "#FFFFFF", border: "1px solid #E4E4E9", borderRadius: 12, padding: "20px 22px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                  <h3 style={{ fontSize: 15, fontWeight: 600, margin: 0, color: "#0F0F14" }}>
                    Rasio Panggilan Model AI (Free vs Paid)
                  </h3>
                  <span style={{ fontSize: 11, color: "#71717A" }}>Real-Time</span>
                </div>

                {(() => {
                  const freeCalls = stats?.billing?.totalFreeCalls || 0;
                  const paidCalls = stats?.billing?.totalPaidCalls || 0;
                  const totalCalls = freeCalls + paidCalls;
                  const freePercent = totalCalls > 0 ? Math.round((freeCalls / totalCalls) * 100) : 75;
                  const paidPercent = 100 - freePercent;

                  return (
                    <>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", position: "relative", height: 120 }}>
                        <svg width="110" height="110" viewBox="0 0 36 36">
                          <circle cx="18" cy="18" r="14" fill="none" stroke="#F7F7FB" strokeWidth="4" />
                          <circle
                            cx="18"
                            cy="18"
                            r="14"
                            fill="none"
                            stroke="#16A34A"
                            strokeWidth="4"
                            strokeDasharray={`${freePercent} 100`}
                            strokeDashoffset="25"
                          />
                          <circle
                            cx="18"
                            cy="18"
                            r="14"
                            fill="none"
                            stroke="#4338CA"
                            strokeWidth="4"
                            strokeDasharray={`${paidPercent} 100`}
                            strokeDashoffset={`${25 + freePercent}`}
                          />
                        </svg>
                        <div style={{ position: "absolute", textAlign: "center", fontSize: 11, fontWeight: 600, color: "#0F0F14" }}>
                          {totalCalls}<br />
                          <span style={{ fontSize: 9, color: "#71717A", fontWeight: 400 }}>Panggilan</span>
                        </div>
                      </div>

                      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 10 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11.5 }}>
                          <div style={{ width: 8, height: 8, borderRadius: 2, background: "#16A34A" }} />
                          <span style={{ color: "#0F0F14", fontWeight: 500 }}>Groq Free Tier ($0 HPP)</span>
                          <span style={{ marginLeft: "auto", color: "#71717A" }}>{freeCalls} kali ({freePercent}%)</span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11.5 }}>
                          <div style={{ width: 8, height: 8, borderRadius: 2, background: "#4338CA" }} />
                          <span style={{ color: "#0F0F14", fontWeight: 500 }}>Maia / DeepSeek Paid Tier</span>
                          <span style={{ marginLeft: "auto", color: "#71717A" }}>{paidCalls} kali ({paidPercent}%)</span>
                        </div>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>

            {/* Bottom Row: Recent 10 Database AI Activities Table */}
            <div style={{ background: "#FFFFFF", border: "1px solid #E4E4E9", borderRadius: 12, overflow: "hidden" }}>
              <div style={{ padding: "16px 20px", borderBottom: "1px solid #E4E4E9", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <h3 style={{ fontSize: 15, fontWeight: 600, margin: 0, color: "#0F0F14" }}>
                  Aktivitas AI & Konsumsi Kredit Terkini
                </h3>
                <span style={{ fontSize: 11, color: "#71717A" }}>Tabel Database ai_usage_logs</span>
              </div>

              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: 12.5 }}>
                  <thead>
                    <tr style={{ background: "#F7F7FB", borderBottom: "1px solid #E4E4E9", color: "#3F3F46", fontWeight: 500 }}>
                      <th style={{ padding: "10px 16px" }}>Timestamp</th>
                      <th style={{ padding: "10px 14px" }}>Pengguna</th>
                      <th style={{ padding: "10px 14px" }}>Fitur Riset</th>
                      <th style={{ padding: "10px 14px" }}>Model</th>
                      <th style={{ padding: "10px 14px" }}>Tokens</th>
                      <th style={{ padding: "10px 14px" }}>Kredit</th>
                      <th style={{ padding: "10px 16px" }}>Profit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(stats?.recentLogs || []).length === 0 ? (
                      <tr>
                        <td colSpan={7} style={{ textAlign: "center", padding: "24px 16px", color: "#71717A" }}>
                          Belum ada aktivitas AI yang tercatat di database.
                        </td>
                      </tr>
                    ) : (
                      (stats?.recentLogs || []).map((log: any) => (
                        <tr key={log.id} style={{ borderBottom: "1px solid #EFEFF3" }}>
                          <td style={{ padding: "10px 16px", color: "#71717A", fontSize: 11.5 }}>
                            {new Date(log.timestamp).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
                          </td>
                          <td style={{ padding: "10px 14px", fontWeight: 500, color: "#0F0F14" }}>
                            {log.userEmail}
                          </td>
                          <td style={{ padding: "10px 14px", color: "#71717A" }}>
                            {log.featureLabel}
                          </td>
                          <td style={{ padding: "10px 14px", color: "#71717A" }}>
                            {log.modelName}
                          </td>
                          <td style={{ padding: "10px 14px", fontFamily: "monospace", fontSize: 11.5 }}>
                            {log.inputTokens + log.outputTokens}
                          </td>
                          <td style={{ padding: "10px 14px", fontWeight: 600, color: "#0F0F14" }}>
                            {log.isFreeTier ? <span style={{ color: "#16A34A" }}>0 (Free)</span> : `${log.creditsCharged} koin`}
                          </td>
                          <td style={{ padding: "10px 16px" }}>
                            <span style={{ background: "#DCFCE7", color: "#16A34A", fontSize: 10.5, fontWeight: 600, padding: "2px 6px", borderRadius: 9999 }}>
                              +${log.profitUsd?.toFixed(5) || "0.00000"}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════════════
            TAB 4: SECRET KEYS
           ════════════════════════════════════════════════════════════════════════ */}
        {activeTab === "SECRETS" && (
          <div style={{ background: "#FFFFFF", border: "1px solid #E4E4E9", borderRadius: 12, padding: "20px 24px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 600, margin: "0 0 2px", color: "#0F0F14" }}>
                  Database Secret Keys
                </h3>
                <p style={{ fontSize: 13, color: "#71717A", margin: 0 }}>
                  Semua secret terenkripsi standar AES-256 dan disinkronkan otomatis ke AiModelConfig
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowCurlModal(true)}
                style={{ background: "#F7F7FB", color: "#3F3F46", border: "1px solid #E4E4E9", borderRadius: 8, padding: "7px 14px", fontSize: 13, fontWeight: 500, cursor: "pointer" }}
              >
                Import cURL
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {configs.map((c) => (
                <div key={c.id} style={{ background: "#F7F7FB", border: "1px solid #E4E4E9", borderRadius: 8, padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div>
                    <div style={{ fontWeight: 600, color: "#0F0F14", fontSize: 13 }}>{c.key}</div>
                    <div style={{ fontSize: 11.5, color: "#71717A" }}>{c.description}</div>
                  </div>
                  <code style={{ background: "#FFFFFF", border: "1px solid #E4E4E9", padding: "4px 8px", borderRadius: 6, fontSize: 11.5, color: "#3F3F46" }}>
                    {c.maskedValue}
                  </code>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════════════
            TAB 5: USERS
           ════════════════════════════════════════════════════════════════════════ */}
        {activeTab === "USERS" && (
          <div style={{ background: "#FFFFFF", border: "1px solid #E4E4E9", borderRadius: 12, overflow: "hidden" }}>
            <div style={{ padding: "18px 22px", borderBottom: "1px solid #E4E4E9" }}>
              <h3 style={{ fontSize: 16, fontWeight: 600, margin: "0 0 2px", color: "#0F0F14" }}>
                Daftar Pengguna
              </h3>
              <p style={{ fontSize: 13, color: "#71717A", margin: 0 }}>
                Kelola hak akses role pengguna dan saldo kredit
              </p>
            </div>

            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: 13 }}>
                <thead>
                  <tr style={{ background: "#F7F7FB", borderBottom: "1px solid #E4E4E9", color: "#3F3F46", fontWeight: 500 }}>
                    <th style={{ padding: "12px 18px" }}>Nama</th>
                    <th style={{ padding: "12px 14px" }}>Email</th>
                    <th style={{ padding: "12px 14px" }}>Role</th>
                    <th style={{ padding: "12px 14px" }}>Kredit</th>
                    <th style={{ padding: "12px 18px", textAlign: "right" }}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {usersList.map((u) => (
                    <tr key={u.id} style={{ borderBottom: "1px solid #EFEFF3" }}>
                      <td style={{ padding: "12px 18px", fontWeight: 600, color: "#0F0F14" }}>{u.name}</td>
                      <td style={{ padding: "12px 14px", color: "#71717A" }}>{u.email}</td>
                      <td style={{ padding: "12px 14px" }}>
                        <span
                          style={{
                            background: u.role === "ADMIN" ? "#EEEAFE" : "#DCFCE7",
                            color: u.role === "ADMIN" ? "#4338CA" : "#16A34A",
                            fontSize: 11,
                            fontWeight: 500,
                            padding: "2px 7px",
                            borderRadius: 9999,
                          }}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td style={{ padding: "12px 14px", fontWeight: 600, color: "#0F0F14" }}>
                        {u.totalCredits || 0}
                      </td>
                      <td style={{ padding: "12px 18px", textAlign: "right" }}>
                        <button
                          onClick={() => handleToggleUserRole(u.id, u.role)}
                          style={{
                            background: "#F7F7FB",
                            border: "1px solid #E4E4E9",
                            borderRadius: 6,
                            padding: "4px 8px",
                            fontSize: 11.5,
                            fontWeight: 500,
                            cursor: "pointer",
                            color: "#4338CA",
                          }}
                        >
                          Ubah ke {u.role === "ADMIN" ? "USER" : "ADMIN"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════════════
            TAB 6: LIBRARY & LATEX TEMPLATES MANAGEMENT (WITH LIVE PREVIEW)
           ════════════════════════════════════════════════════════════════════════ */}
        {activeTab === "TEMPLATES_LIBRARY" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            {/* Header Section & Action Toolbar */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 14 }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <FileCode size={20} color="#4338CA" />
                  <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0, color: "#0F0F14" }}>
                    Library Master Template & LaTeX Engine
                  </h2>
                  <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 9999, background: "#EEEAFE", color: "#4338CA" }}>
                    {templatesList.length} Template Terdaftar
                  </span>
                </div>
                <p style={{ fontSize: 13, color: "#71717A", margin: "3px 0 0" }}>
                  Kustomisasi struktur bab, konfigurasi preamble LaTeX, aturan margin, dan pantau live visual render dokumen A4 secara real-time.
                </p>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                <button
                  type="button"
                  onClick={handleResetToDefaultFif}
                  style={{
                    background: "#F7F7FB",
                    color: "#3F3F46",
                    border: "1px solid #E4E4E9",
                    borderRadius: 8,
                    padding: "7px 12px",
                    fontSize: 12.5,
                    fontWeight: 500,
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                  title="Kembalikan ke Master Standar Telkom FIF"
                >
                  <Undo size={13} />
                  <span>Reset Standar FIF</span>
                </button>

                <button
                  type="button"
                  onClick={handleCloneCurrentTemplate}
                  style={{
                    background: "#F7F7FB",
                    color: "#3F3F46",
                    border: "1px solid #E4E4E9",
                    borderRadius: 8,
                    padding: "7px 12px",
                    fontSize: 12.5,
                    fontWeight: 500,
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <Copy size={13} />
                  <span>Duplikasi</span>
                </button>

                <button
                  type="button"
                  onClick={handleCreateNewTemplate}
                  style={{
                    background: "#F7F7FB",
                    color: "#3F3F46",
                    border: "1px solid #E4E4E9",
                    borderRadius: 8,
                    padding: "7px 12px",
                    fontSize: 12.5,
                    fontWeight: 500,
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <Plus size={13} />
                  <span>+ Template Baru</span>
                </button>

                <button
                  type="button"
                  onClick={handleSaveCurrentTemplate}
                  disabled={savingTemplate}
                  style={{
                    background: "#4338CA",
                    color: "#FFFFFF",
                    border: "none",
                    borderRadius: 8,
                    padding: "7px 16px",
                    fontSize: 12.5,
                    fontWeight: 600,
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    boxShadow: "0 2px 8px rgba(67, 56, 202, 0.25)",
                  }}
                >
                  {savingTemplate ? <RefreshCw size={13} className="animate-spin" /> : <Save size={13} />}
                  <span>{savingTemplate ? "Menyimpan..." : "Simpan Perubahan"}</span>
                </button>
              </div>
            </div>

            {/* Template Catalog Selector Strip */}
            <div style={{ background: "#F7F7FB", border: "1px solid #E4E4E9", borderRadius: 12, padding: "14px 16px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12, flexWrap: "wrap", gap: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 12.5, fontWeight: 700, color: "#0F0F14" }}>Pilih Template Aktif:</span>
                  <div style={{ display: "flex", gap: 4 }}>
                    {(["ALL", "LATEX", "TELKOM", "KUANTITATIF"] as const).map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setTemplateCategoryFilter(cat)}
                        style={{
                          padding: "3px 9px",
                          borderRadius: 6,
                          fontSize: 11,
                          fontWeight: 600,
                          border: templateCategoryFilter === cat ? "1px solid #4338CA" : "1px solid #E4E4E9",
                          background: templateCategoryFilter === cat ? "#EEEAFE" : "#FFFFFF",
                          color: templateCategoryFilter === cat ? "#4338CA" : "#71717A",
                          cursor: "pointer",
                        }}
                      >
                        {cat === "ALL" ? "Semua" : cat === "LATEX" ? "LaTeX Master" : cat === "TELKOM" ? "Telkom University" : "Kuantitatif"}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 6, background: "#FFFFFF", border: "1px solid #E4E4E9", borderRadius: 8, padding: "4px 10px", width: 260 }}>
                  <Search size={13} color="#94A3B8" />
                  <input
                    type="text"
                    placeholder="Cari nama template / prodi..."
                    value={templateSearchQuery}
                    onChange={(e) => setTemplateSearchQuery(e.target.value)}
                    style={{ border: "none", outline: "none", fontSize: 12, width: "100%", color: "#0F0F14" }}
                  />
                </div>
              </div>

              {/* Template Cards Grid */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 10 }}>
                {templatesList
                  .filter((t) => {
                    const matchSearch = (t.name || "").toLowerCase().includes(templateSearchQuery.toLowerCase()) || (t.sourceFaculty || "").toLowerCase().includes(templateSearchQuery.toLowerCase());
                    if (!matchSearch) return false;
                    if (templateCategoryFilter === "LATEX") return t.isLatex || t.documentClass;
                    if (templateCategoryFilter === "TELKOM") return (t.university || "").includes("Telkom") || (t.name || "").includes("Telkom") || (t.sourceFaculty || "").includes("FIF");
                    if (templateCategoryFilter === "KUANTITATIF") return (t.name || "").toLowerCase().includes("kuantitatif") || (t.code || "").includes("KUANTITATIF");
                    return true;
                  })
                  .map((t) => {
                    const isSelected = selectedTemplateId === t.id;
                    return (
                      <div
                        key={t.id}
                        onClick={() => handleSelectTemplate(t)}
                        style={{
                          padding: "12px 14px",
                          borderRadius: 10,
                          border: isSelected ? "2px solid #4338CA" : "1px solid #E4E4E9",
                          background: isSelected ? "#FFFFFF" : "#FAFAFC",
                          boxShadow: isSelected ? "0 4px 14px rgba(67, 56, 202, 0.12)" : "none",
                          cursor: "pointer",
                          transition: "all 0.15s ease",
                          display: "flex",
                          flexDirection: "column",
                          justifyContent: "space-between",
                        }}
                      >
                        <div>
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                            <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 6px", borderRadius: 4, background: isSelected ? "#EEEAFE" : "#F1F5F9", color: isSelected ? "#4338CA" : "#64748B" }}>
                              {t.code || (t.isLatex ? "LATEX" : "DOCX")}
                            </span>
                            {t.isDefault && (
                              <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 6px", borderRadius: 4, background: "#DCFCE7", color: "#16A34A" }}>
                                Standar Resmi
                              </span>
                            )}
                          </div>
                          <div style={{ fontSize: 13, fontWeight: 700, color: "#0F0F14", lineHeight: 1.4, marginBottom: 4 }}>
                            {t.name}
                          </div>
                          <div style={{ fontSize: 11.5, color: "#71717A" }}>
                            {t.sourceFaculty || "Fakultas"} • {t.university || "Universitas"}
                          </div>
                        </div>

                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 10, paddingTop: 8, borderTop: "1px solid #EFEFF3", fontSize: 11, color: "#94A3B8" }}>
                          <span>{t.sections?.length || 0} Bagian / Bab</span>
                          {isSelected && <span style={{ color: "#4338CA", fontWeight: 700 }}>● Aktif Mengedit</span>}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* Master Customizer & Live Dual-Mode Preview Layout */}
            <div style={{ display: "grid", gridTemplateColumns: templatePreviewMode === "SPLIT" ? "1fr 1fr" : "1fr", gap: 20, alignItems: "start" }}>
              {/* ── LEFT COLUMN: TEMPLATE CUSTOMIZER & LATEX CONFIGURATOR ── */}
              <div style={{ background: "#FFFFFF", border: "1px solid #E4E4E9", borderRadius: 14, padding: "20px 22px", display: "flex", flexDirection: "column", gap: 18 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #EFEFF3", paddingBottom: 14 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <SlidersHorizontal size={16} color="#4338CA" />
                    <h3 style={{ fontSize: 15, fontWeight: 700, margin: 0, color: "#0F0F14" }}>
                      Editor Konfigurasi Template
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteCurrentTemplate(templateEditForm.id)}
                    style={{ background: "transparent", border: "none", color: "#EF4444", fontSize: 12, fontWeight: 600, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 4 }}
                  >
                    <Trash2 size={13} />
                    <span>Hapus Template</span>
                  </button>
                </div>

                {/* 1. Identitas & Info Kampus */}
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", color: "#64748B", letterSpacing: "0.04em" }}>
                    1. Identitas Template & Lembaga
                  </div>
                  <div>
                    <label style={{ fontSize: 11.5, fontWeight: 600, color: "#334155", display: "block", marginBottom: 3 }}>
                      Nama Template:
                    </label>
                    <input
                      type="text"
                      value={templateEditForm.name || ""}
                      onChange={(e) => setTemplateEditForm({ ...templateEditForm, name: e.target.value })}
                      style={{ width: "100%", padding: "7px 10px", borderRadius: 8, border: "1px solid #CBD5E1", fontSize: 13 }}
                    />
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    <div>
                      <label style={{ fontSize: 11.5, fontWeight: 600, color: "#334155", display: "block", marginBottom: 3 }}>
                        Fakultas:
                      </label>
                      <input
                        type="text"
                        value={templateEditForm.sourceFaculty || ""}
                        onChange={(e) => setTemplateEditForm({ ...templateEditForm, sourceFaculty: e.target.value })}
                        style={{ width: "100%", padding: "7px 10px", borderRadius: 8, border: "1px solid #CBD5E1", fontSize: 12.5 }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: 11.5, fontWeight: 600, color: "#334155", display: "block", marginBottom: 3 }}>
                        Universitas:
                      </label>
                      <input
                        type="text"
                        value={templateEditForm.university || ""}
                        onChange={(e) => setTemplateEditForm({ ...templateEditForm, university: e.target.value })}
                        style={{ width: "100%", padding: "7px 10px", borderRadius: 8, border: "1px solid #CBD5E1", fontSize: 12.5 }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: 11.5, fontWeight: 600, color: "#334155", display: "block", marginBottom: 3 }}>
                      Deskripsi / Pedoman Singkat:
                    </label>
                    <textarea
                      rows={2}
                      value={templateEditForm.description || ""}
                      onChange={(e) => setTemplateEditForm({ ...templateEditForm, description: e.target.value })}
                      style={{ width: "100%", padding: "7px 10px", borderRadius: 8, border: "1px solid #CBD5E1", fontSize: 12, resize: "vertical" }}
                    />
                  </div>
                </div>

                {/* 2. Format Margin & Document Class */}
                <div style={{ display: "flex", flexDirection: "column", gap: 10, borderTop: "1px solid #EFEFF3", paddingTop: 14 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", color: "#64748B", letterSpacing: "0.04em" }}>
                    2. Spesifikasi Dokumen & Kaidah Margin
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    <div>
                      <label style={{ fontSize: 11.5, fontWeight: 600, color: "#334155", display: "block", marginBottom: 3 }}>
                        Preset Margin Naskah:
                      </label>
                      <select
                        value={templateEditForm.marginPreset || "4333"}
                        onChange={(e) =>
                          setTemplateEditForm({
                            ...templateEditForm,
                            marginPreset: e.target.value,
                            margins: e.target.value === "4433" ? { top: "4cm", bottom: "3cm", left: "4cm", right: "3cm" } : { top: "3cm", bottom: "3cm", left: "4cm", right: "3cm" },
                          })
                        }
                        style={{ width: "100%", padding: "7px 10px", borderRadius: 8, border: "1px solid #CBD5E1", fontSize: 12.5 }}
                      >
                        <option value="4333">4-3-3-3 (Kiri 4cm, Atas 3cm, Kanan 3cm, Bawah 3cm)</option>
                        <option value="4433">4-4-3-3 (Kiri 4cm, Atas 4cm, Kanan 3cm, Bawah 3cm)</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ fontSize: 11.5, fontWeight: 600, color: "#334155", display: "block", marginBottom: 3 }}>
                        LaTeX Document Class:
                      </label>
                      <input
                        type="text"
                        value={templateEditForm.documentClass || "\\documentclass[a4paper,12pt,oneside]{book}"}
                        onChange={(e) => setTemplateEditForm({ ...templateEditForm, documentClass: e.target.value })}
                        style={{ width: "100%", padding: "7px 10px", borderRadius: 8, border: "1px solid #CBD5E1", fontSize: 12, fontFamily: "monospace" }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: 11.5, fontWeight: 600, color: "#334155", display: "block", marginBottom: 3 }}>
                      LaTeX Preamble (Packages & Macro Definition):
                    </label>
                    <textarea
                      rows={5}
                      value={templateEditForm.preambleLatex || ""}
                      onChange={(e) => setTemplateEditForm({ ...templateEditForm, preambleLatex: e.target.value })}
                      style={{ width: "100%", padding: "8px 10px", borderRadius: 8, border: "1px solid #CBD5E1", fontSize: 11.5, fontFamily: "monospace", color: "#0F172A", background: "#F8FAFC", resize: "vertical" }}
                    />
                  </div>
                </div>

                {/* 3. Struktur Bab & Section Generator */}
                <div style={{ display: "flex", flexDirection: "column", gap: 10, borderTop: "1px solid #EFEFF3", paddingTop: 14 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", color: "#64748B", letterSpacing: "0.04em" }}>
                      3. Struktur Bab & Panduan Penulisan ({templateEditForm.sections?.length || 0} Bagian)
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const newSec = {
                          id: `sec-${Date.now()}`,
                          order: (templateEditForm.sections?.length || 0) + 1,
                          title: "Sub-Bab Baru",
                          guidanceText: "Panduan instruksi penulisan...",
                          latexSnippet: "\\section{Sub-Bab Baru}",
                        };
                        setTemplateEditForm({ ...templateEditForm, sections: [...(templateEditForm.sections || []), newSec] });
                      }}
                      style={{ background: "#EEEAFE", color: "#4338CA", border: "none", borderRadius: 6, padding: "4px 8px", fontSize: 11.5, fontWeight: 700, cursor: "pointer" }}
                    >
                      + Tambah Bab
                    </button>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 380, overflowY: "auto", paddingRight: 4 }}>
                    {(templateEditForm.sections || []).map((sec: any, idx: number) => (
                      <div
                        key={sec.id || idx}
                        style={{
                          border: "1px solid #E2E8F0",
                          borderRadius: 8,
                          padding: "10px 12px",
                          background: "#F8FAFC",
                          display: "flex",
                          flexDirection: "column",
                          gap: 6,
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                          <span style={{ fontSize: 11, fontWeight: 700, color: "#64748B" }}>
                            #{idx + 1}
                          </span>
                          <input
                            type="text"
                            value={sec.title || ""}
                            onChange={(e) => {
                              const updated = [...templateEditForm.sections];
                              updated[idx].title = e.target.value;
                              setTemplateEditForm({ ...templateEditForm, sections: updated });
                            }}
                            placeholder="Judul Bagian..."
                            style={{ flex: 1, padding: "4px 8px", borderRadius: 6, border: "1px solid #CBD5E1", fontSize: 12, fontWeight: 600 }}
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const updated = templateEditForm.sections.filter((_: any, i: number) => i !== idx);
                              setTemplateEditForm({ ...templateEditForm, sections: updated });
                            }}
                            style={{ background: "transparent", border: "none", color: "#EF4444", cursor: "pointer", padding: 2 }}
                            title="Hapus bagian ini"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>

                        <div>
                          <input
                            type="text"
                            value={sec.guidanceText || ""}
                            onChange={(e) => {
                              const updated = [...templateEditForm.sections];
                              updated[idx].guidanceText = e.target.value;
                              setTemplateEditForm({ ...templateEditForm, sections: updated });
                            }}
                            placeholder="Panduan penulisan untuk mahasiswa..."
                            style={{ width: "100%", padding: "4px 8px", borderRadius: 6, border: "1px solid #CBD5E1", fontSize: 11.5, color: "#475569" }}
                          />
                        </div>

                        <div>
                          <textarea
                            rows={2}
                            value={sec.latexSnippet || ""}
                            onChange={(e) => {
                              const updated = [...templateEditForm.sections];
                              updated[idx].latexSnippet = e.target.value;
                              setTemplateEditForm({ ...templateEditForm, sections: updated });
                            }}
                            placeholder="Kode LaTeX snippet (e.g. \chapter{...}, \begin{table}...)"
                            style={{ width: "100%", padding: "4px 8px", borderRadius: 6, border: "1px solid #CBD5E1", fontSize: 10.5, fontFamily: "monospace", background: "#FFFFFF", color: "#0F172A" }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* ── RIGHT COLUMN: LIVE REAL-TIME PREVIEW WORKSPACE (VISUAL A4 & LATEX) ── */}
              <div style={{ background: "#FFFFFF", border: "1px solid #E4E4E9", borderRadius: 14, padding: "20px 22px", display: "flex", flexDirection: "column", gap: 16 }}>
                {/* Preview Toolbar Header */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #EFEFF3", paddingBottom: 14, flexWrap: "wrap", gap: 10 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, background: "#F1F5F9", padding: 3, borderRadius: 8, border: "1px solid #CBD5E1" }}>
                    <button
                      type="button"
                      onClick={() => setTemplatePreviewMode("VISUAL_A4")}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 5,
                        padding: "5px 12px",
                        borderRadius: 6,
                        border: "none",
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: "pointer",
                        background: templatePreviewMode === "VISUAL_A4" ? "#FFFFFF" : "transparent",
                        color: templatePreviewMode === "VISUAL_A4" ? "#4338CA" : "#64748B",
                        boxShadow: templatePreviewMode === "VISUAL_A4" ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
                      }}
                    >
                      <Eye size={13} />
                      <span>Simulasi Naskah A4</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setTemplatePreviewMode("LATEX_CODE")}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 5,
                        padding: "5px 12px",
                        borderRadius: 6,
                        border: "none",
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: "pointer",
                        background: templatePreviewMode === "LATEX_CODE" ? "#FFFFFF" : "transparent",
                        color: templatePreviewMode === "LATEX_CODE" ? "#4338CA" : "#64748B",
                        boxShadow: templatePreviewMode === "LATEX_CODE" ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
                      }}
                    >
                      <Code size={13} />
                      <span>Kode LaTeX (.tex)</span>
                    </button>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <button
                      type="button"
                      onClick={handleTestCompileLatex}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 5,
                        padding: "6px 12px",
                        borderRadius: 7,
                        background: "#DCFCE7",
                        border: "1px solid #86EFAC",
                        color: "#16A34A",
                        fontSize: 11.5,
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                      title="Simulasi kompilasi sintaks LaTeX"
                    >
                      <PlayCircle size={13} />
                      <span>{testCompileSuccess ? "✓ Sintaks Valid" : "Uji Kompilasi"}</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleCopyLatex}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 5,
                        padding: "6px 11px",
                        borderRadius: 7,
                        background: "#F8FAFC",
                        border: "1px solid #CBD5E1",
                        color: "#334155",
                        fontSize: 11.5,
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      <Copy size={13} />
                      <span>{copiedLatex ? "Tersalin!" : "Salin .tex"}</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleDownloadTex}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 5,
                        padding: "6px 11px",
                        borderRadius: 7,
                        background: "#F8FAFC",
                        border: "1px solid #CBD5E1",
                        color: "#334155",
                        fontSize: 11.5,
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      <Download size={13} />
                      <span>Download</span>
                    </button>
                  </div>
                </div>

                {/* Visual A4 Section Switcher Pills */}
                {templatePreviewMode === "VISUAL_A4" && (
                  <div style={{ display: "flex", gap: 4, overflowX: "auto", paddingBottom: 4 }}>
                    {[
                      { id: "cover", label: "Cover" },
                      { id: "approval", label: "Persetujuan" },
                      { id: "abstract", label: "Abstrak" },
                      { id: "bab1", label: "BAB I" },
                      { id: "bab2", label: "BAB II" },
                      { id: "bab3", label: "BAB III" },
                      { id: "references", label: "Daftar Pustaka" },
                    ].map((st) => (
                      <button
                        key={st.id}
                        type="button"
                        onClick={() => setTemplatePreviewTab(st.id)}
                        style={{
                          padding: "4px 10px",
                          borderRadius: 6,
                          fontSize: 11.5,
                          fontWeight: templatePreviewTab === st.id ? 700 : 500,
                          background: templatePreviewTab === st.id ? "#4338CA" : "#F1F5F9",
                          color: templatePreviewTab === st.id ? "#FFFFFF" : "#475569",
                          border: "none",
                          cursor: "pointer",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {st.label}
                      </button>
                    ))}
                  </div>
                )}

                {/* 1. VISUAL LIVE PREVIEW OF A4 PAPER SHEET */}
                {templatePreviewMode === "VISUAL_A4" && (
                  <div style={{ background: "#F1F5F9", borderRadius: 10, padding: 20, display: "flex", justifyContent: "center", overflowX: "auto", minHeight: 460 }}>
                    <div
                      style={{
                        width: "100%",
                        maxWidth: "185mm",
                        minHeight: "260mm",
                        background: "#FFFFFF",
                        boxShadow: "0 8px 24px rgba(15, 23, 42, 0.12)",
                        padding: templateEditForm.marginPreset === "4433" ? "3.5cm 2.5cm 2.5cm 3.5cm" : "2.5cm 2.5cm 2.5cm 3.5cm",
                        fontFamily: '"Times New Roman", Times, serif',
                        fontSize: "11pt",
                        lineHeight: 1.6,
                        color: "#000000",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                        boxSizing: "border-box",
                      }}
                    >
                      {/* Section View Routing */}
                      {templatePreviewTab === "cover" && (
                        <div style={{ textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "space-between", height: "100%" }}>
                          <div>
                            <div style={{ fontSize: "14pt", fontWeight: 700, textTransform: "uppercase", marginBottom: 24, lineHeight: 1.3 }}>
                              {templateEditForm.name}
                            </div>
                            <div style={{ fontSize: "11pt", fontWeight: 600, color: "#334155" }}>
                              PROPOSAL PENELITIAN TUGAS AKHIR
                            </div>
                          </div>

                          <div style={{ width: 80, height: 80, border: "1.5px dashed #CBD5E1", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", color: "#94A3B8", fontSize: 10, textAlign: "center", padding: 6 }}>
                            [Logo Institusi {templateEditForm.university || "Telkom"}]
                          </div>

                          <div>
                            <div style={{ fontSize: "11pt", marginBottom: 6 }}>Disusun Oleh:</div>
                            <div style={{ fontSize: "12pt", fontWeight: 700 }}>NAMA MAHASISWA</div>
                            <div style={{ fontSize: "11pt" }}>NIM: 1301220001</div>
                          </div>

                          <div style={{ marginTop: 24 }}>
                            <div style={{ fontSize: "11pt", fontWeight: 700 }}>{templateEditForm.sourceFaculty?.toUpperCase() || "FAKULTAS INFORMATIKA"}</div>
                            <div style={{ fontSize: "11pt", fontWeight: 700 }}>{templateEditForm.university?.toUpperCase() || "TELKOM UNIVERSITY"}</div>
                            <div style={{ fontSize: "11pt" }}>BANDUNG</div>
                            <div style={{ fontSize: "11pt", fontWeight: 700 }}>{new Date().getFullYear()}</div>
                          </div>
                        </div>
                      )}

                      {templatePreviewTab === "approval" && (
                        <div>
                          <div style={{ textAlign: "center", fontSize: "12pt", fontWeight: 700, textTransform: "uppercase", marginBottom: 20 }}>
                            LEMBAR PENGESAHAN PROPOSAL
                          </div>
                          <p style={{ textIndent: "1.27cm", textAlign: "justify" }}>
                            Proposal Tugas Akhir dengan judul <strong>"{templateEditForm.name}"</strong> telah disetujui dan disahkan oleh Tim Pembimbing untuk dilanjutkan ke tahap pelaksanaan riset.
                          </p>
                          <div style={{ marginTop: 40, display: "grid", gridTemplateColumns: "1fr 1fr", textAlign: "center", gap: 20 }}>
                            <div>
                              <div>Calon Pembimbing 1,</div>
                              <div style={{ height: 50 }} />
                              <div style={{ fontWeight: 700 }}>Dr. Pembimbing Utama, M.Kom.</div>
                              <div style={{ fontSize: "10pt" }}>NIP. 19850101201501</div>
                            </div>
                            <div>
                              <div>Calon Pembimbing 2,</div>
                              <div style={{ height: 50 }} />
                              <div style={{ fontWeight: 700 }}>Co-Advisor, S.T., M.T.</div>
                              <div style={{ fontSize: "10pt" }}>NIP. 19900202202002</div>
                            </div>
                          </div>
                        </div>
                      )}

                      {templatePreviewTab === "abstract" && (
                        <div>
                          <div style={{ textAlign: "center", fontSize: "12pt", fontWeight: 700, textTransform: "uppercase", marginBottom: 12 }}>
                            ABSTRAK
                          </div>
                          <p style={{ textIndent: "1.27cm", textAlign: "justify", fontSize: "11pt", lineHeight: 1.6 }}>
                            Penelitian ini bertujuan untuk mengkaji dan merancang solusi komprehensif berdasarkan panduan {templateEditForm.name}. Kajian diawali dengan identifikasi fenomena empiris dan penelaahan literatur terindeks untuk merumuskan kerangka pemikiran konseptual yang valid.
                          </p>
                          <div style={{ fontSize: "10.5pt", marginTop: 12 }}>
                            <strong>Kata Kunci:</strong> <em>tugas akhir, metodologi riset, kerangka konseptual, {templateEditForm.sourceFaculty?.toLowerCase() || "informatika"}</em>
                          </div>
                        </div>
                      )}

                      {templatePreviewTab === "bab1" && (
                        <div>
                          <div style={{ textAlign: "center", fontSize: "12pt", fontWeight: 700, textTransform: "uppercase", marginBottom: 16 }}>
                            BAB I<br />PENDAHULUAN
                          </div>
                          <div style={{ fontWeight: 700, marginBottom: 4 }}>1.1 Latar Belakang Masalah</div>
                          <p style={{ textIndent: "1.27cm", textAlign: "justify", marginBottom: 12 }}>
                            Perkembangan keilmuan menuntut pembaruan metodologi dan pengujian empiris. Template ini memfasilitasi penataan latar belakang yang terhubung langsung dengan bukti jurnal ilmiah.
                          </p>
                          <div style={{ fontWeight: 700, marginBottom: 4 }}>1.2 Rumusan Masalah</div>
                          <ol style={{ paddingLeft: "1.27cm", margin: "0 0 12px 0" }}>
                            <li>Bagaimana relasi kausalitas antar variabel dalam kerangka riset?</li>
                            <li>Bagaimana performa model yang dirancang terhadap data empiris?</li>
                          </ol>
                        </div>
                      )}

                      {templatePreviewTab === "bab2" && (
                        <div>
                          <div style={{ textAlign: "center", fontSize: "12pt", fontWeight: 700, textTransform: "uppercase", marginBottom: 16 }}>
                            BAB II<br />TINJAUAN PUSTAKA & KERANGKA PEMIKIRAN
                          </div>
                          <div style={{ fontWeight: 700, marginBottom: 4 }}>2.1 Landasan Teori & Sintesis Variabel</div>
                          <p style={{ textIndent: "1.27cm", textAlign: "justify", marginBottom: 12 }}>
                            Tinjauan teori mengintegrasikan konsep-konsep kunci dari literatur bereputasi untuk mendasari hipotesis penelitian.
                          </p>
                          <div style={{ border: "1px solid #CBD5E1", background: "#F8FAFC", padding: 10, borderRadius: 6, fontSize: "10pt", textAlign: "center" }}>
                            <strong>Gambar 2.1:</strong> Diagram Kerangka Konseptual Variabel Riset
                          </div>
                        </div>
                      )}

                      {templatePreviewTab === "bab3" && (
                        <div>
                          <div style={{ textAlign: "center", fontSize: "12pt", fontWeight: 700, textTransform: "uppercase", marginBottom: 16 }}>
                            BAB III<br />METODOLOGI PENELITIAN
                          </div>
                          <div style={{ fontWeight: 700, marginBottom: 4 }}>3.1 Desain Penelitian</div>
                          <p style={{ textIndent: "1.27cm", textAlign: "justify", marginBottom: 12 }}>
                            Metodologi dirancang secara terstruktur mencakup populasi, teknik sampling purposive, instrumen pengukuran, dan tahapan analisis data.
                          </p>
                          <div style={{ fontWeight: 700, marginBottom: 4 }}>3.2 Teknik Analisis Data</div>
                          <p style={{ textIndent: "1.27cm", textAlign: "justify" }}>
                            Analisis data meliputi pengujian kualitas instrumen, asumsi klasik, dan analisis inferensial statistik / SEM-PLS.
                          </p>
                        </div>
                      )}

                      {templatePreviewTab === "references" && (
                        <div>
                          <div style={{ textAlign: "center", fontSize: "12pt", fontWeight: 700, textTransform: "uppercase", marginBottom: 16 }}>
                            DAFTAR PUSTAKA
                          </div>
                          <div style={{ fontSize: "10pt", lineHeight: 1.6, display: "flex", flexDirection: "column", gap: 8 }}>
                            <div>[1] J. Doe and A. Smith, "Empirical Evaluation in Computing," <em>IEEE Trans. Software Eng.</em>, vol. 48, no. 2, pp. 210–225, 2024.</div>
                            <div>[2] R. Johnson, "Advanced Modeling and Statistical Inference," <em>Journal of Systems & Software</em>, vol. 190, pp. 111–124, 2023.</div>
                          </div>
                        </div>
                      )}

                      {/* Bottom Page Number Simulation */}
                      <div style={{ textAlign: "right", fontSize: "10.5pt", fontWeight: 700, marginTop: 24 }}>
                        {templatePreviewTab === "cover" ? "" : templatePreviewTab === "approval" ? "ii" : templatePreviewTab === "abstract" ? "iii" : "1"}
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. LATEX SOURCE CODE PREVIEW */}
                {templatePreviewMode === "LATEX_CODE" && (
                  <div style={{ background: "#0F172A", borderRadius: 10, padding: 16, overflowX: "auto", maxHeight: 520, border: "1px solid #1E293B" }}>
                    <pre style={{ margin: 0, color: "#E2E8F0", fontSize: 12, fontFamily: 'Consolas, Monaco, "Courier New", monospace', lineHeight: 1.55 }}>
                      <code>{generateLatexFromTemplate(templateEditForm)}</code>
                    </pre>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* MODAL 1: Tambah / Edit Model AI */}
      {showModelModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15,15,20,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 20 }}>
          <div style={{ background: "#FFFFFF", borderRadius: 12, width: "100%", maxWidth: 500, padding: "22px 26px", border: "1px solid #E4E4E9" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <h3 style={{ fontSize: 16, fontWeight: 600, margin: 0, color: "#0F0F14" }}>
                {editingModelId ? "Edit Model AI" : "Tambah Model AI"}
              </h3>
              <button onClick={() => setShowModelModal(false)} style={{ background: "transparent", border: "none", cursor: "pointer", fontSize: 16 }}>
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveModel} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div>
                <label style={{ fontSize: 11.5, fontWeight: 500, color: "#71717A", display: "block", marginBottom: 3 }}>
                  Router Label
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. MAIA ROUTER, GROQ CLOUD"
                  value={modelFormData.routerLabel}
                  onChange={(e) => setModelFormData({ ...modelFormData, routerLabel: e.target.value })}
                  style={{ width: "100%", background: "#F7F7FB", border: "1px solid #E4E4E9", borderRadius: 8, padding: "7px 10px", fontSize: 12.5, color: "#0F0F14" }}
                />
              </div>

              <div>
                <label style={{ fontSize: 11.5, fontWeight: 500, color: "#71717A", display: "block", marginBottom: 3 }}>
                  Base URL
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://api.maiarouter.ai/v1"
                  value={modelFormData.baseUrl}
                  onChange={(e) => setModelFormData({ ...modelFormData, baseUrl: e.target.value })}
                  style={{ width: "100%", background: "#F7F7FB", border: "1px solid #E4E4E9", borderRadius: 8, padding: "7px 10px", fontSize: 12.5, color: "#0F0F14" }}
                />
              </div>

              <div>
                <label style={{ fontSize: 11.5, fontWeight: 500, color: "#71717A", display: "block", marginBottom: 3 }}>
                  Nama Model
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. xai/grok-4-1-fast-non-reasoning, qwen/qwen3.8-27b"
                  value={modelFormData.modelName}
                  onChange={(e) => setModelFormData({ ...modelFormData, modelName: e.target.value })}
                  style={{ width: "100%", background: "#F7F7FB", border: "1px solid #E4E4E9", borderRadius: 8, padding: "7px 10px", fontSize: 12.5, color: "#0F0F14" }}
                />
              </div>

              <div>
                <label style={{ fontSize: 11.5, fontWeight: 500, color: "#71717A", display: "block", marginBottom: 3 }}>
                  API Key Bearer Token
                </label>
                <input
                  type="password"
                  placeholder={editingModelId ? "(Kosongkan bila tidak diubah)" : "sk-..."}
                  value={modelFormData.apiKey}
                  onChange={(e) => setModelFormData({ ...modelFormData, apiKey: e.target.value })}
                  style={{ width: "100%", background: "#F7F7FB", border: "1px solid #E4E4E9", borderRadius: 8, padding: "7px 10px", fontSize: 12.5, color: "#0F0F14" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div>
                  <label style={{ fontSize: 11.5, fontWeight: 500, color: "#71717A", display: "block", marginBottom: 3 }}>
                    Price Input ($/1M token)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={modelFormData.priceInputPer1M}
                    onChange={(e) => setModelFormData({ ...modelFormData, priceInputPer1M: Number(e.target.value) })}
                    style={{ width: "100%", background: "#F7F7FB", border: "1px solid #E4E4E9", borderRadius: 8, padding: "7px 10px", fontSize: 12.5 }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 11.5, fontWeight: 500, color: "#71717A", display: "block", marginBottom: 3 }}>
                    Price Output ($/1M token)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={modelFormData.priceOutputPer1M}
                    onChange={(e) => setModelFormData({ ...modelFormData, priceOutputPer1M: Number(e.target.value) })}
                    style={{ width: "100%", background: "#F7F7FB", border: "1px solid #E4E4E9", borderRadius: 8, padding: "7px 10px", fontSize: 12.5 }}
                  />
                </div>
              </div>

              <div style={{ display: "flex", gap: 14, marginTop: 4 }}>
                <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 500, cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={modelFormData.isFreeTier}
                    onChange={(e) => setModelFormData({ ...modelFormData, isFreeTier: e.target.checked })}
                  />
                  <span>Free Tier ($0 charge)</span>
                </label>
                <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 500, cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={modelFormData.isActive}
                    onChange={(e) => setModelFormData({ ...modelFormData, isActive: e.target.checked })}
                  />
                  <span>Status Aktif</span>
                </label>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 10 }}>
                <button
                  type="button"
                  onClick={() => setShowModelModal(false)}
                  style={{ background: "#F7F7FB", border: "1px solid #E4E4E9", borderRadius: 8, padding: "7px 14px", fontSize: 12.5, fontWeight: 500, color: "#71717A", cursor: "pointer" }}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  style={{ background: "#4338CA", border: "none", borderRadius: 8, padding: "7px 18px", fontSize: 12.5, fontWeight: 500, color: "#FFFFFF", cursor: "pointer" }}
                >
                  Simpan Model
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Edit Master Exchange Setting */}
      {showExchangeModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15,15,20,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 20 }}>
          <div style={{ background: "#FFFFFF", borderRadius: 12, width: "100%", maxWidth: 460, padding: "22px 26px", border: "1px solid #E4E4E9" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <h3 style={{ fontSize: 16, fontWeight: 600, margin: 0, color: "#0F0F14" }}>
                Edit Master Exchange Setting
              </h3>
              <button onClick={() => setShowExchangeModal(false)} style={{ background: "transparent", border: "none", cursor: "pointer", fontSize: 16 }}>
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveExchange} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div>
                <label style={{ fontSize: 11.5, fontWeight: 500, color: "#71717A", display: "block", marginBottom: 3 }}>
                  Global Multiplier (Margin Markup)
                </label>
                <input
                  type="number"
                  step="0.05"
                  required
                  value={exchangeFormData.globalMultiplier}
                  onChange={(e) => setExchangeFormData({ ...exchangeFormData, globalMultiplier: Number(e.target.value) })}
                  style={{ width: "100%", background: "#F7F7FB", border: "1px solid #E4E4E9", borderRadius: 8, padding: "7px 10px", fontSize: 12.5, color: "#0F0F14" }}
                />
              </div>

              <div>
                <label style={{ fontSize: 11.5, fontWeight: 500, color: "#71717A", display: "block", marginBottom: 3 }}>
                  Base Rate Kurs USD / IDR
                </label>
                <input
                  type="number"
                  step="50"
                  required
                  value={exchangeFormData.baseRateUsdIdr}
                  onChange={(e) => setExchangeFormData({ ...exchangeFormData, baseRateUsdIdr: Number(e.target.value) })}
                  style={{ width: "100%", background: "#F7F7FB", border: "1px solid #E4E4E9", borderRadius: 8, padding: "7px 10px", fontSize: 12.5, color: "#0F0F14" }}
                />
              </div>

              <div>
                <label style={{ fontSize: 11.5, fontWeight: 500, color: "#71717A", display: "block", marginBottom: 3 }}>
                  Inflation / Volatility Buffer (e.g. 0.05 = 5%)
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={exchangeFormData.inflationBuffer}
                  onChange={(e) => setExchangeFormData({ ...exchangeFormData, inflationBuffer: Number(e.target.value) })}
                  style={{ width: "100%", background: "#F7F7FB", border: "1px solid #E4E4E9", borderRadius: 8, padding: "7px 10px", fontSize: 12.5, color: "#0F0F14" }}
                />
              </div>

              <div>
                <label style={{ fontSize: 11.5, fontWeight: 500, color: "#71717A", display: "block", marginBottom: 3 }}>
                  Reference Credit IDR (Fallback 1 Kredit)
                </label>
                <input
                  type="number"
                  step="50"
                  required
                  value={exchangeFormData.referenceCreditIdr}
                  onChange={(e) => setExchangeFormData({ ...exchangeFormData, referenceCreditIdr: Number(e.target.value) })}
                  style={{ width: "100%", background: "#F7F7FB", border: "1px solid #E4E4E9", borderRadius: 8, padding: "7px 10px", fontSize: 12.5, color: "#0F0F14" }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 10 }}>
                <button
                  type="button"
                  onClick={() => setShowExchangeModal(false)}
                  style={{ background: "#F7F7FB", border: "1px solid #E4E4E9", borderRadius: 8, padding: "7px 14px", fontSize: 12.5, fontWeight: 500, color: "#71717A", cursor: "pointer" }}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  style={{ background: "#4338CA", border: "none", borderRadius: 8, padding: "7px 18px", fontSize: 12.5, fontWeight: 500, color: "#FFFFFF", cursor: "pointer" }}
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Tambah / Edit Paket Harga */}
      {showPackageModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15,15,20,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 20 }}>
          <div style={{ background: "#FFFFFF", borderRadius: 12, width: "100%", maxWidth: 460, padding: "22px 26px", border: "1px solid #E4E4E9" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <h3 style={{ fontSize: 16, fontWeight: 600, margin: 0, color: "#0F0F14" }}>
                {editingPackageId ? "Edit Paket Harga" : "Tambah Paket Harga"}
              </h3>
              <button onClick={() => setShowPackageModal(false)} style={{ background: "transparent", border: "none", cursor: "pointer", fontSize: 16 }}>
                ✕
              </button>
            </div>

            <form onSubmit={handleSavePackage} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div>
                <label style={{ fontSize: 11.5, fontWeight: 500, color: "#71717A", display: "block", marginBottom: 3 }}>
                  Nama Paket
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. StarterPack, Student Pack, Pro Monthly"
                  value={packageFormData.name}
                  onChange={(e) => setPackageFormData({ ...packageFormData, name: e.target.value })}
                  style={{ width: "100%", background: "#F7F7FB", border: "1px solid #E4E4E9", borderRadius: 8, padding: "7px 10px", fontSize: 12.5, color: "#0F0F14" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div>
                  <label style={{ fontSize: 11.5, fontWeight: 500, color: "#71717A", display: "block", marginBottom: 3 }}>
                    Tipe Paket
                  </label>
                  <select
                    value={packageFormData.type}
                    onChange={(e) => setPackageFormData({ ...packageFormData, type: e.target.value })}
                    style={{ width: "100%", background: "#F7F7FB", border: "1px solid #E4E4E9", borderRadius: 8, padding: "7px 10px", fontSize: 12.5 }}
                  >
                    <option value="ONE_TIME">ONTIME (Permanen)</option>
                    <option value="SUBSCRIPTION">SUBSCRIPTION (Langganan)</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 11.5, fontWeight: 500, color: "#71717A", display: "block", marginBottom: 3 }}>
                    Jumlah Koin/Kredit
                  </label>
                  <input
                    type="number"
                    required
                    value={packageFormData.creditsGranted}
                    onChange={(e) => setPackageFormData({ ...packageFormData, creditsGranted: Number(e.target.value) })}
                    style={{ width: "100%", background: "#F7F7FB", border: "1px solid #E4E4E9", borderRadius: 8, padding: "7px 10px", fontSize: 12.5 }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div>
                  <label style={{ fontSize: 11.5, fontWeight: 500, color: "#71717A", display: "block", marginBottom: 3 }}>
                    Harga Normal (Rp)
                  </label>
                  <input
                    type="number"
                    required
                    value={packageFormData.priceNormal}
                    onChange={(e) => setPackageFormData({ ...packageFormData, priceNormal: Number(e.target.value) })}
                    style={{ width: "100%", background: "#F7F7FB", border: "1px solid #E4E4E9", borderRadius: 8, padding: "7px 10px", fontSize: 12.5 }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 11.5, fontWeight: 500, color: "#71717A", display: "block", marginBottom: 3 }}>
                    Harga Diskon (Rp)
                  </label>
                  <input
                    type="number"
                    placeholder="Opsional"
                    value={packageFormData.priceDiscount || ""}
                    onChange={(e) => setPackageFormData({ ...packageFormData, priceDiscount: Number(e.target.value) || 0 })}
                    style={{ width: "100%", background: "#F7F7FB", border: "1px solid #E4E4E9", borderRadius: 8, padding: "7px 10px", fontSize: 12.5 }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: 11.5, fontWeight: 500, color: "#71717A", display: "block", marginBottom: 3 }}>
                  Badge Label
                </label>
                <input
                  type="text"
                  placeholder="e.g. TERPOPULER, HEMAT 24%"
                  value={packageFormData.badgeLabel}
                  onChange={(e) => setPackageFormData({ ...packageFormData, badgeLabel: e.target.value })}
                  style={{ width: "100%", background: "#F7F7FB", border: "1px solid #E4E4E9", borderRadius: 8, padding: "7px 10px", fontSize: 12.5 }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 10 }}>
                <button
                  type="button"
                  onClick={() => setShowPackageModal(false)}
                  style={{ background: "#F7F7FB", border: "1px solid #E4E4E9", borderRadius: 8, padding: "7px 14px", fontSize: 12.5, fontWeight: 500, color: "#71717A", cursor: "pointer" }}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  style={{ background: "#4338CA", border: "none", borderRadius: 8, padding: "7px 18px", fontSize: 12.5, fontWeight: 500, color: "#FFFFFF", cursor: "pointer" }}
                >
                  Simpan Paket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: Import cURL */}
      {showCurlModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15,15,20,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 20 }}>
          <div style={{ background: "#FFFFFF", borderRadius: 12, width: "100%", maxWidth: 520, padding: "22px 26px", border: "1px solid #E4E4E9" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Zap size={16} color="#F59E0B" />
                <h3 style={{ fontSize: 16, fontWeight: 600, margin: 0, color: "#0F0F14" }}>
                  Import Konfigurasi dari cURL
                </h3>
              </div>
              <button onClick={() => setShowCurlModal(false)} style={{ background: "transparent", border: "none", cursor: "pointer", fontSize: 16 }}>
                ✕
              </button>
            </div>

            <form onSubmit={handleImportCurl} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <textarea
                required
                rows={6}
                placeholder={`curl https://api.maiarouter.ai/v1/chat/completions \\\n  -H "Authorization: Bearer sk-..." \\\n  -d '{"model": "xai/grok-4-1-fast-non-reasoning"}'`}
                value={curlInput}
                onChange={(e) => setCurlInput(e.target.value)}
                style={{ width: "100%", background: "#F7F7FB", border: "1px solid #E4E4E9", borderRadius: 8, padding: "8px 10px", fontSize: 11.5, fontFamily: "monospace", color: "#0F0F14" }}
              />

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 4 }}>
                <button
                  type="button"
                  onClick={() => setShowCurlModal(false)}
                  style={{ background: "#F7F7FB", border: "1px solid #E4E4E9", borderRadius: 8, padding: "7px 14px", fontSize: 12.5, fontWeight: 500, color: "#71717A", cursor: "pointer" }}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={importingCurl}
                  style={{ background: "#4338CA", border: "none", borderRadius: 8, padding: "7px 18px", fontSize: 12.5, fontWeight: 500, color: "#FFFFFF", cursor: "pointer" }}
                >
                  {importingCurl ? "Memproses..." : "Ekstrak & Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
